'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './callback.module.css';

export default function AuthCallbackPage() {
    const [status, setStatus] = useState('Vérification de la connexion...');
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        handleCallback();
    }, []);

    async function handleCallback() {
        try {
            // Get the session from URL (Supabase handles this)
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) throw sessionError;

            if (!session?.user) {
                throw new Error('Aucune session trouvée');
            }

            setStatus('Connexion réussie! Configuration de votre compte...');

            const authUser = session.user;
            const email = authUser.email;
            const name = authUser.user_metadata?.full_name ||
                authUser.user_metadata?.name ||
                authUser.user_metadata?.user_name ||
                email.split('@')[0];

            // Check if user exists in database
            const { data: existingUser, error: userError } = await supabase
                .from('User')
                .select('*')
                .eq('email', email)
                .single();

            if (userError && userError.code !== 'PGRST116') {
                // PGRST116 = no rows returned (user doesn't exist)
                throw userError;
            }

            if (!existingUser) {
                setStatus('Création de votre profil...');

                // Create new user in database with default role
                const { error: createError } = await supabase
                    .from('User')
                    .insert({
                        id: crypto.randomUUID(),
                        email: email,
                        name: name,
                        role: 'CONTRIBUTEUR', // Default role for new GitHub users
                        lot: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });

                if (createError) throw createError;

                setStatus('Profil créé! Redirection...');
            } else {
                setStatus('Bienvenue! Redirection...');
            }

            // Redirect to projects page
            setTimeout(() => {
                router.push('/projects');
            }, 1000);

        } catch (error) {
            console.error('Callback error:', error);
            setError(error.message || 'Une erreur est survenue');
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.icon}>
                    {error ? '❌' : '🔄'}
                </div>
                <h1 className={styles.title}>
                    {error ? 'Erreur de connexion' : 'Connexion en cours'}
                </h1>
                <p className={styles.status}>
                    {error || status}
                </p>
                {error && (
                    <button
                        className={styles.retryBtn}
                        onClick={() => router.push('/auth/login')}
                    >
                        ← Retour à la connexion
                    </button>
                )}
                {!error && (
                    <div className={styles.spinner}></div>
                )}
            </div>
        </div>
    );
}
