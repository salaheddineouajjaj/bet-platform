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
    const initialized = useRef(false);
    const loadingPromise = useRef(null);

    // Hard timeout safety: ensure loading is never stuck forever
    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                console.warn('[AUTH] ⚠️ Loading safety timeout triggered');
                setLoading(false);
            }
        }, 6000);
        return () => clearTimeout(timer);
    }, [loading]);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        async function handleUserSession(sessionUser) {
            if (!sessionUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            // Reuse existing loading promise if one exists
            if (loadingPromise.current) return loadingPromise.current;

            loadingPromise.current = (async () => {
                try {
                    console.log('[AUTH] Syncing user:', sessionUser.email);

                    // Direct query to database
                    const { data, error } = await supabase
                        .from('User')
                        .select('id, email, name, role, lot')
                        .eq('email', sessionUser.email)
                        .single();

                    if (error && error.code === 'PGRST116') {
                        // User doesn't exist, create it
                        console.log('[AUTH] Creating new user record...');
                        const { data: newUser, error: createError } = await supabase
                            .from('User')
                            .insert({
                                email: sessionUser.email,
                                name: sessionUser.user_metadata?.full_name || sessionUser.email.split('@')[0],
                                role: 'CONTRIBUTEUR',
                            })
                            .select()
                            .single();

                        if (!createError) setUser(newUser);
                    } else if (!error && data) {
                        setUser(data);
                    }
                } catch (err) {
                    console.error('[AUTH] Load error:', err);
                } finally {
                    setLoading(false);
                    loadingPromise.current = null;
                }
            })();

            return loadingPromise.current;
        }

        // 1. Check current session immediately
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                handleUserSession(session.user);
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[AUTH] Event:', event);
            if (session?.user) {
                handleUserSession(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setLoading(false);
                if (!pathname?.startsWith('/auth/login')) {
                    router.push('/auth/login');
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [pathname, router]);

    const value = {
        user,
        loading,
        signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
        signOut: async () => {
            await supabase.auth.signOut();
            setUser(null);
            router.push('/auth/login');
        },
        signInWithGitHub: () => supabase.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: `${window.location.origin}/auth/callback` }
        }),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
