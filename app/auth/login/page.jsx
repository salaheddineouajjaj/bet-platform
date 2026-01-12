'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const testUsers = [
        { email: 'chef@bet-platform.com', role: 'Chef de Projet', password: 'demo123' },
        { email: 'structure@bet-platform.com', role: 'Référent Lot Structure', password: 'demo123' },
        { email: 'cvc@bet-platform.com', role: 'Référent Lot CVC', password: 'demo123' },
        { email: 'contrib@bet-platform.com', role: 'Contributeur Électricité', password: 'demo123' },
        { email: 'moa@bet-platform.com', role: 'Externe (MOA)', password: 'demo123' },
    ];

    const handleLogin = (testEmail) => {
        setEmail(testEmail);
        setLoading(true);

        // Simulate login
        setTimeout(() => {
            localStorage.setItem('userEmail', testEmail);
            router.push('/projects');
        }, 500);
    };

    return (
        <div className={styles.page}>
            <div className={styles.loginBox}>
                <div className={styles.header}>
                    <h1 className={styles.title}>BET Platform</h1>
                    <p className={styles.subtitle}>Connexion</p>
                </div>

                {error && (
                    <div className={styles.error}>{error}</div>
                )}

                <div className={styles.testAccounts}>
                    <p className={styles.testTitle}>🧪 Comptes de test disponibles:</p>
                    <p className={styles.testSubtitle}>Cliquez sur un compte pour vous connecter</p>

                    <div className={styles.accountsList}>
                        {testUsers.map((user) => (
                            <button
                                key={user.email}
                                onClick={() => handleLogin(user.email)}
                                className={styles.accountBtn}
                                disabled={loading}
                            >
                                <div className={styles.accountRole}>{user.role}</div>
                                <div className={styles.accountEmail}>{user.email}</div>
                                <div className={styles.accountPassword}>Mot de passe: {user.password}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.manualLogin}>
                    <p className={styles.orDivider}>ou connexion manuelle</p>
                    <form onSubmit={(e) => { e.preventDefault(); handleLogin(email); }}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Mot de passe"
                            className={styles.input}
                            defaultValue="demo123"
                        />
                        <button
                            type="submit"
                            className={styles.loginBtn}
                            disabled={loading}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>
                </div>

                <div className={styles.footer}>
                    <a href="/" className={styles.backLink}>← Retour à l'accueil</a>
                </div>
            </div>
        </div>
    );
}
