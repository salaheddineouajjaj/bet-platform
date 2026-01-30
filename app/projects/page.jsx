'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation/Navigation';
import NewProjectModal from '@/components/NewProjectModal/NewProjectModal';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import styles from './projects.module.css';

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // Project to delete
    const [deleting, setDeleting] = useState(false);
    const { user } = useAuth(); // Get real user from auth context

    useEffect(() => {
        if (user) {
            fetchProjects();
        }
    }, [user]);

    const fetchProjects = async () => {
        try {
            setLoading(true);

            // REAL API CALL with Auth Header
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch('/api/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (!response.ok) {
                console.error('[PROJECTS] API Error:', data);
                throw new Error(data.error || 'Erreur de chargement');
            }

            setProjects(data.projects || []);
        } catch (error) {
            console.error('[PROJECTS] Fetch error:', error);
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (e, project) => {
        e.preventDefault(); // Prevent navigation to project page
        e.stopPropagation();
        setDeleteConfirm(project);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/projects?id=${deleteConfirm.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la suppression');
            }

            // Remove project from state
            setProjects(projects.filter(p => p.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Erreur: ' + error.message);
        } finally {
            setDeleting(false);
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


    if (loading) {
        return <LoadingSpinner fullScreen message="Vérification de l'authentification..." />;
    }

    if (!user) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '2rem',
                textAlign: 'center',
            }}>
                <h2 style={{ marginBottom: '1rem' }}>❌ Erreur d'authentification</h2>
                <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                    Votre compte n'a pas pu être chargé. Veuillez contacter un administrateur.
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => window.location.href = '/auth/login'}
                >
                    Retour à la connexion
                </button>
            </div>
        );
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
                            <div key={project.id} className={styles.projectCardWrapper}>
                                <Link
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
                                {hasPermission(user?.role, 'DELETE_PROJECT') && (
                                    <button
                                        className={styles.deleteButton}
                                        onClick={(e) => handleDeleteClick(e, project)}
                                        title="Supprimer le projet"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
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

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>⚠️ Supprimer le projet</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Êtes-vous sûr de vouloir supprimer le projet <strong>"{deleteConfirm.name}"</strong> ?</p>
                            <p className={styles.warningText}>
                                Cette action est irréversible. Tous les livrables, documents, réunions, remarques et autres données associées seront également supprimés.
                            </p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                            >
                                Annuler
                            </button>
                            <button
                                className={styles.deleteConfirmButton}
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? '⏳ Suppression...' : '🗑️ Supprimer définitivement'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
