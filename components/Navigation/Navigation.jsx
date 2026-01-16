'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

const ONGLETS = [
    { number: 1, name: 'Vue d\'Ensemble', path: '' },
    { number: 2, name: 'Planning des Livrables', path: '/deliverables' },
    { number: 3, name: 'Plans & Documents', path: '/documents' },
    { number: 4, name: 'Remarques & Visa', path: '/remarks' },
    { number: 5, name: 'Réunions & CR', path: '/meetings' },
    { number: 6, name: 'Décisions', path: '/decisions' },
    { number: 7, name: 'Risques & Retards', path: '/risks' },
];

export default function Navigation({ projectId, user }) {
    const pathname = usePathname();

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getRoleBadge = (role) => {
        const badges = {
            CHEF_DE_PROJET: { label: 'Chef de Projet', color: 'purple' },
            REFERENT_LOT: { label: 'Référent Lot', color: 'blue' },
            CONTRIBUTEUR: { label: 'Contributeur', color: 'green' },
            EXTERNE: { label: 'Externe', color: 'orange' },
        };
        return badges[role] || { label: role, color: 'gray' };
    };

    return (
        <>
            {/* Main Header */}
            <header className={styles.header}>
                <div className={styles.container}>
                    <div className={styles.headerContent}>
                        <Link href="/projects" className={styles.logo}>
                            <div className={styles.logoIcon}>BET</div>
                            <span className={styles.logoText}>BET Platform</span>
                        </Link>

                        <div className={styles.userInfo}>
                            {user && (
                                <>
                                    <div className={styles.userBadge}>
                                        <div className={styles.userAvatar}>
                                            {getInitials(user.name)}
                                        </div>
                                        <div>
                                            <div className={styles.userName}>{user.name}</div>
                                            <div className={`badge badge-${getRoleBadge(user.role).color}`} style={{ fontSize: '0.7rem' }}>
                                                {getRoleBadge(user.role).label}
                                            </div>
                                        </div>
                                    </div>
                                    {user.role === 'CHEF_DE_PROJET' && (
                                        <Link href="/admin/users" className={styles.adminLink} title="Gestion des utilisateurs">
                                            👥 Admin
                                        </Link>
                                    )}
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={async () => {
                                            try {
                                                const { signOut } = await import('@/contexts/AuthContext');
                                                await signOut();
                                            } catch (err) {
                                                window.location.href = '/auth/login';
                                            }
                                        }}
                                    >
                                        Déconnexion
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ONGLET Navigation (only show on project pages) */}
            {projectId && (
                <nav className={styles.ongletNav}>
                    <div className={styles.container}>
                        <ul className={styles.ongletTabs}>
                            {ONGLETS.map((onglet) => {
                                const fullPath = `/projects/${projectId}${onglet.path}`;
                                const isActive = pathname === fullPath;

                                return (
                                    <li key={onglet.number}>
                                        <Link
                                            href={fullPath}
                                            className={`${styles.ongletTab} ${isActive ? styles.ongletTabActive : ''}`}
                                        >
                                            <span className={styles.ongletNumber}>{onglet.number}</span>
                                            {onglet.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </nav>
            )}
        </>
    );
}
