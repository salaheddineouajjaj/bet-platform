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
        // Handle auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AUTH] Auth event:', event, session?.user?.email);

            if (session?.user) {
                await loadUserData(session.user);
            } else {
                setUser(null);
                cachedUserEmail.current = null;
                setLoading(false);

                // Redirect if not on login/auth pages
                if (!pathname?.startsWith('/auth/login') && !pathname?.startsWith('/auth/callback')) {
                    router.push('/auth/login');
                }
            }
        });

        // Check session immediately on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [pathname, router]);

    async function loadUserData(authUser) {
        // Prevent multiple simultaneous calls for the same user
        if (isLoadingUser.current && cachedUserEmail.current === authUser.email) {
            console.log('[AUTH] Already loading same user, skipping...');
            return;
        }

        try {
            isLoadingUser.current = true;
            cachedUserEmail.current = authUser.email;
            console.log('[AUTH] Loading user data for:', authUser.email);

            const { data, error } = await supabase
                .from('User')
                .select('id, email, name, role, lot, createdAt, updatedAt')
                .eq('email', authUser.email)
                .single();

            // If user doesn't exist, create them automatically
            if (error && error.code === 'PGRST116') {
                console.log('[AUTH] User not found in database, creating:', authUser.email);

                const { data: newUser, error: createError } = await supabase
                    .from('User')
                    .insert({
                        email: authUser.email,
                        name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
                        role: 'CONTRIBUTEUR',
                        lot: null,
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('[AUTH] Error creating user:', createError);
                    await supabase.auth.signOut();
                    setUser(null);
                } else {
                    console.log('[AUTH] User created successfully:', newUser.email, newUser.role);
                    setUser(newUser);
                }
            } else if (error) {
                console.error('[AUTH] Error loading user data:', error.message);
                setUser(null);
            } else {
                console.log('[AUTH] User loaded successfully:', data.email, data.role);
                setUser(data);
            }
        } catch (error) {
            console.error('[AUTH] Exception in loadUserData:', error);
            setUser(null);
        } finally {
            isLoadingUser.current = false;
            setLoading(false);
        }
    }

    const value = {
        user,
        loading,
        signIn: async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return data;
        },
        signOut: async () => {
            await supabase.auth.signOut();
            setUser(null);
            cachedUserEmail.current = null;
            router.push('/auth/login');
        },
        signInWithGitHub: async () => {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
            return data;
        },
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
