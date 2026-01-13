'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation/Navigation';
import NewProjectModal from '@/components/NewProjectModal/NewProjectModal';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import styles from './projects.module.css';

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const { user } = useAuth(); // Get real user from auth context

    useEffect(() => {
        if (user) {
            fetchProjects();
        }
    }, [user]);

    const fetchProjects = async () => {
        try {
            setLoading(true);

            // REAL API CALL to database
            const response = await fetch('/api/projects');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur de chargement');
            }

            setProjects(data.projects || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const getPhaseLabel = (phase) => {
        const phases = {
            APS: 'APS - Avant-Projet Sommaire',
            APD: 'APD - Avant-Projet Définitif',
            PRO: 'PRO - Projet',
            DCE: 'DCE - Dossier Consultation Entreprises',
            ACT: 'ACT - Assistance Contrats Travaux',
        };
        return phases[phase] || phase;
    };

    const getPhaseColor = (phase) => {
        const colors = {
            APS: 'blue',
            APD: 'purple',
            PRO: 'orange',
            DCE: 'green',
            ACT: 'gray',
        };
        return colors[phase] || 'blue';
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.page}>
            <Navigation user={user} />

            <div className={styles.pageHeader}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <h1 className={styles.pageTitle}>Mes Projets</h1>
                        {hasPermission(user?.role, 'CREATE_PROJECT') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowNewModal(true)}
                            >
                                ➕ Nouveau Projet
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <p>Chargement des projets...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                            Aucun projet
                        </p>
                        {hasPermission(user?.role, 'CREATE_PROJECT') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowNewModal(true)}
                            >
                                ➕ Créer votre premier projet
                            </button>
                        )}
                    </div>
                ) : (
                    <div className={styles.projectsGrid}>
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className={styles.projectCard}
                            >
                                <div className={styles.projectHeader}>
                                    <h3 className={styles.projectName}>{project.name}</h3>
                                    <span className={`badge badge-${getPhaseColor(project.phase)}`}>
                                        {project.phase}
                                    </span>
                                </div>

                                <div className={styles.projectInfo}>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>MOA:</span>
                                        <span className={styles.infoValue}>{project.moa}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>Architecte:</span>
                                        <span className={styles.infoValue}>{project.architecte}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.infoLabel}>📍</span>
                                        <span className={styles.infoValue}>{project.adresse}</span>
                                    </div>
                                </div>

                                <div className={styles.projectStats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{project._count?.deliverables || 0}</span>
                                        <span className={styles.statLabel}>Livrables</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{project._count?.documents || 0}</span>
                                        <span className={styles.statLabel}>Documents</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{project._count?.remarks || 0}</span>
                                        <span className={styles.statLabel}>Remarques</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <NewProjectModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                onSuccess={(newProject) => {
                    setProjects([newProject, ...projects]);
                    setShowNewModal(false);
                }}
            />
        </div>
    );
}
