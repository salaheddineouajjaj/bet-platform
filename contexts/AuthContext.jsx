'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

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
        try {
            // Get user from database
            const { data, error } = await supabase
                .from('User')
                .select('*')
                .eq('email', authUser.email)
                .single();

            if (error) {
                console.error('Error loading user data:', error);
                // If user doesn't exist in DB, sign out
                await supabase.auth.signOut();
                setUser(null);
                return;
            }

            setUser(data);
            console.log('User loaded:', data.email, data.role);
        } catch (error) {
            console.error('Error in loadUserData:', error);
            setUser(null);
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
