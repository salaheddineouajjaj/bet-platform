'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import styles from './login.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('demo123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const router = useRouter();
    const { signIn, signInWithGitHub } = useAuth();

    const testAccounts = [
        {
            email: 'chef@bet-platform.com',
            name: 'Marie Dupont',
            role: 'Chef de Projet',
            description: 'Accès complet · Tous lots',
        },
        {
            email: 'structure@bet-platform.com',
            name: 'Pierre Martin',
            role: 'Référent Lot Structure',
            description: 'Gestion lot Structure',
        },
        {
            email: 'cvc@bet-platform.com',
            name: 'Sophie Bernard',
            role: 'Référente Lot CVC',
            description: 'Gestion lot CVC',
        },
        {
            email: 'contrib@bet-platform.com',
            name: 'Lucas Électricité',
            role: 'Contributeur',
            description: 'Consultation · Édition assignée',
        },
        {
            email: 'moa@bet-platform.com',
            name: 'Jean Architecte',
            role: 'Externe (MOA)',
            description: 'Lecture seule · Validations',
        },
    ];

    const handleQuickLogin = async (testEmail) => {
        setEmail(testEmail);
        setError('');
        setLoading(true);

        try {
            await signIn(testEmail, 'demo123');
            router.push('/projects');
        } catch (err) {
            setError(err.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(email, password);
            router.push('/projects');
        } catch (err) {
            setError(err.message || 'Email ou mot de passe incorrect');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.loginBox}>
                <div className={styles.header}>
                    <h1 className={styles.title}>🏗️ BET Platform</h1>
                    <p className={styles.subtitle}>Plateforme Collaborative de Gestion de Projets</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        ⚠️ {error}
                    </div>
                )}

                <div className={styles.testAccounts}>
                    <h3 className={styles.testTitle}>🧪 Comptes de Test</h3>
                    <p className={styles.testSubtitle}>Cliquez sur un rôle pour vous connecter</p>

                    <div className={styles.accountsList}>
                        {testAccounts.map((account) => (
                            <button
                                key={account.email}
                                onClick={() => handleQuickLogin(account.email)}
                                className={styles.accountBtn}
                                disabled={loading}
                            >
                                <div className={styles.accountRole}>{account.role}</div>
                                <div className={styles.accountEmail}>{account.name}</div>
                                <div className={styles.accountPassword}>{account.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* GitHub Login */}
                <div className={styles.socialLogin}>
                    <p className={styles.orDivider}>OU CONNECTEZ-VOUS AVEC</p>
                    <button
                        className={styles.githubBtn}
                        onClick={async () => {
                            setGithubLoading(true);
                            setError('');
                            try {
                                await signInWithGitHub();
                            } catch (err) {
                                setError(err.message || 'Erreur de connexion GitHub');
                                setGithubLoading(false);
                            }
                        }}
                        disabled={githubLoading || loading}
                    >
                        <svg className={styles.githubIcon} viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        {githubLoading ? 'Connexion...' : 'Continuer avec GitHub'}
                    </button>
                </div>

                <div className={styles.manualLogin}>
                    <p className={styles.orDivider}>OU AVEC EMAIL</p>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            disabled={loading}
                        />

                        <input
                            type="password"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mot de passe"
                            required
                            disabled={loading}
                        />

                        <button type="submit" className={styles.loginBtn} disabled={loading}>
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            💡 Tous les comptes utilisent: <code>demo123</code>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
