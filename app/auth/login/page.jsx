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
    const router = useRouter();
    const { signIn } = useAuth();

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

                <div className={styles.manualLogin}>
                    <p className={styles.orDivider}>OU</p>

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
