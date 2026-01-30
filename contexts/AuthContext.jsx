'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const isLoadingUser = useRef(false);
    const cachedUserEmail = useRef(null);

    useEffect(() => {
        // Check active session
        checkSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event, session?.user?.email);

            if (session?.user) {
                await loadUserData(session.user);
            } else {
                setUser(null);
                // Only redirect to login if not already there
                if (!pathname?.startsWith('/auth/login')) {
                    router.push('/auth/login');
                }
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function checkSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) throw error;

            if (session?.user) {
                await loadUserData(session.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Session error:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }



    async function loadUserData(authUser) {
        // Prevent multiple simultaneous calls
        if (isLoadingUser.current) {
            console.log('[AUTH] Already loading user, skipping...');
            return;
        }

        // Check if we already loaded this user
        if (cachedUserEmail.current === authUser.email && user) {
            console.log('[AUTH] User already loaded from cache:', authUser.email);
            return;
        }

        // Safety timeout: reset loading flag after 10 seconds
        const timeoutId = setTimeout(() => {
            console.warn('[AUTH] Loading timeout - resetting loading flag');
            isLoadingUser.current = false;
        }, 10000);

        try {
            isLoadingUser.current = true;
            console.log('[AUTH] Loading user data for:', authUser.email);

            // Single optimized query to User table
            const { data, error } = await supabase
                .from('User')
                .select('id, email, name, role, lot, createdAt, updatedAt')
                .eq('email', authUser.email)
                .single();

            // If user doesn't exist, create them automatically
            if (error && error.code === 'PGRST116') {
                console.log('[AUTH] User not found in database, creating:', authUser.email);

                try {
                    const { data: newUser, error: createError } = await supabase
                        .from('User')
                        .insert({
                            email: authUser.email,
                            name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
                            role: 'CONTRIBUTEUR', // Default role
                            lot: null,
                        })
                        .select()
                        .single();

                    if (createError) {
                        console.error('[AUTH] Error creating user:', createError);
                        await supabase.auth.signOut();
                        setUser(null);
                        cachedUserEmail.current = null;
                        return;
                    }

                    console.log('[AUTH] User created successfully:', newUser.email, newUser.role);
                    setUser(newUser);
                    cachedUserEmail.current = newUser.email;
                    return;
                } catch (createErr) {
                    console.error('[AUTH] Exception creating user:', createErr);
                    await supabase.auth.signOut();
                    setUser(null);
                    cachedUserEmail.current = null;
                    return;
                }
            }

            if (error) {
                console.error('[AUTH] Error loading user data:', error.message, error);
                await supabase.auth.signOut();
                setUser(null);
                cachedUserEmail.current = null;
                return;
            }

            if (!data) {
                console.error('[AUTH] No user found for email:', authUser.email);
                await supabase.auth.signOut();
                setUser(null);
                cachedUserEmail.current = null;
                return;
            }


            console.log('[AUTH] User loaded successfully:', data.email, data.role);
            setUser(data);
            cachedUserEmail.current = data.email;
        } catch (error) {
            console.error('[AUTH] Exception in loadUserData:', error);
            setUser(null);
            cachedUserEmail.current = null;
        } finally {
            clearTimeout(timeoutId);
            isLoadingUser.current = false;
        }
    }

    const value = {
        user,
        loading,
        signIn: async (email, password) => {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                await loadUserData(data.user);
                return data;
            } catch (error) {
                console.error('Sign in error:', error);
                throw error;
            }
        },
        signOut: async () => {
            await supabase.auth.signOut();
            setUser(null);
            router.push('/auth/login');
        },
        signInWithGitHub: async () => {
            try {
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'github',
                    options: {
                        redirectTo: `${window.location.origin}/auth/callback`,
                    },
                });

                if (error) throw error;
                return data;
            } catch (error) {
                console.error('GitHub sign in error:', error);
                throw error;
            }
        },
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
