'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation/Navigation';
import NewProjectModal from '@/components/NewProjectModal/NewProjectModal';
import { hasPermission } from '@/lib/permissions';
import styles from './projects.module.css';

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);

    useEffect(() => {
        fetchProjects();
        // Simulate getting current user (will be implemented with auth)
        setUser({
            name: 'Marie Dupont',
            role: 'CHEF_DE_PROJET',
        });
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            // For now, use mock data
            // Later: const res = await fetch('/api/projects');
            // const data = await res.json();

            // Mock data
            setTimeout(() => {
                setProjects([
                    {
                        id: '1',
                        name: 'Construction Complexe Résidentiel Les Jardins',
                        moa: 'Ville de Paris',
                        architecte: 'Cabinet Architectes Associés',
                        adresse: '45 Avenue de la République, 75011 Paris',
                        phase: 'APD',
                        _count: {
                            deliverables: 5,
                            documents: 3,
                            remarks: 2,
                        },
                    },
                ]);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setLoading(false);
        }
    };

    const getPhaseLabel = (phase) => {
        const phases = {
            APS: 'APS - Avant-Projet Sommaire',
            APD: 'APD - Avant-Projet Définitif',
            PRO: 'PRO - Projet',
            DCE: 'DCE - Dossier de Consultation',
            ACT: 'ACT - Assistance aux Contrats',
        };
        return phases[phase] || phase;
    };

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
                    <div className={styles.projectsGrid}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={styles.loadingSkeleton}></div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📁</div>
                        <h2 className={styles.emptyTitle}>Aucun projet</h2>
                        <p className={styles.emptyText}>
                            Commencez par créer votre premier projet pour gérer vos livrables et documents.
                        </p>
                        <button className="btn btn-primary btn-lg">
                            ➕ Créer mon premier projet
                        </button>
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
                                    <span className={`badge badge-${project.phase === 'APD' ? 'blue' : 'purple'}`}>
                                        {getPhaseLabel(project.phase)}
                                    </span>
                                </div>

                                <div className={styles.projectMeta}>
                                    <div className={styles.metaRow}>
                                        <span className={styles.metaLabel}>MOA:</span>
                                        <span className={styles.metaValue}>{project.moa}</span>
                                    </div>
                                    <div className={styles.metaRow}>
                                        <span className={styles.metaLabel}>Architecte:</span>
                                        <span className={styles.metaValue}>{project.architecte}</span>
                                    </div>
                                    <div className={styles.metaRow}>
                                        <span className={styles.metaLabel}>Adresse:</span>
                                        <span className={styles.metaValue}>{project.adresse}</span>
                                    </div>
                                </div>

                                <div className={styles.projectStats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{project._count.deliverables}</span>
                                        <span className={styles.statLabel}>Livrables</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{project._count.documents}</span>
                                        <span className={styles.statLabel}>Documents</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{project._count.remarks}</span>
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
                    setProjects([...projects, newProject]);
                }}
            />
        </div>
    );
}
