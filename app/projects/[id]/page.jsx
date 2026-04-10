'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation/Navigation';
import AssignUserModal from '@/components/AssignUserModal/AssignUserModal';
import PhaseChangeModal from '@/components/PhaseChangeModal/PhaseChangeModal';
import { hasPermission } from '@/lib/permissions';
import styles from './overview.module.css';

export default function ProjectOverviewPage({ params }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showPhaseModal, setShowPhaseModal] = useState(false);
    const [phaseChangeLoading, setPhaseChangeLoading] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProject();
        }
    }, [id]);

    const fetchProject = async () => {
        try {
            setLoading(true);

            // REAL API CALL
            const response = await fetch(`/api/projects/${id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur de chargement');
            }

            // Set the REAL project data
            setProject(data.project);

            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setProject(null);
            setLoading(false);
        }
    };

    const getPhaseLabel = (phase) => {
        const phases = {
            ESQUISSE: 'ESQ - Esquisse',
            APS: 'APS - Avant-Projet Sommaire',
            APD: 'APD - Avant-Projet Définitif',
            PRO: 'PRO - Projet',
            DCE: 'DCE - Dossier de Consultation',
            ACT: 'ACT - Assistance Contrats',
            DET: 'DET - Direction Execution',
            AOR: 'AOR - Assistance Operations Reception',
        };
        return phases[phase] || phase;
    };

    const handleAdvancePhase = () => {
        const phasesOrder = ['ESQUISSE', 'APS', 'APD', 'PRO', 'DCE', 'ACT', 'DET', 'AOR'];
        const currentIndex = phasesOrder.indexOf(project.phase);

        if (currentIndex === -1 || currentIndex >= phasesOrder.length - 1) {
            alert('Le projet est déjà à la dernière phase');
            return;
        }

        // Open modal instead of confirm dialog
        setShowPhaseModal(true);
    };

    const confirmPhaseChange = async () => {
        const phasesOrder = ['ESQUISSE', 'APS', 'APD', 'PRO', 'DCE', 'ACT', 'DET', 'AOR'];
        const currentIndex = phasesOrder.indexOf(project.phase);
        const nextPhase = phasesOrder[currentIndex + 1];

        setPhaseChangeLoading(true);

        try {
            const response = await fetch(`/api/projects/${id}/phase`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phase: nextPhase }),
            });

            const data = await response.json();

            if (response.ok) {
                setShowPhaseModal(false);
                await fetchProject(); // Refresh project data

                // Show success notification (you can replace with toast later)
                setTimeout(() => {
                    alert(`✅ ${data.message}`);
                }, 300);
            } else {
                alert(`❌ Erreur: ${data.error}`);
                setPhaseChangeLoading(false);
            }
        } catch (error) {
            console.error('Phase change error:', error);
            alert('❌ Erreur lors du changement de phase');
            setPhaseChangeLoading(false);
        }
    };



    if (loading) {
        return (
            <div className={styles.page}>
                <Navigation projectId={id} user={user} />
                <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                    Chargement...
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className={styles.page}>
                <Navigation projectId={id} user={user} />
                <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                    Projet non trouvé
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Navigation projectId={id} user={user} />

            <div className="container">
                <div className={styles.pageContent}>

                    {/* Phase Indicator */}
                    <div className={styles.phaseIndicator}>
                        <div className={styles.phaseIcon}>
                            {project.phase}
                        </div>
                        <div className={styles.phaseInfo}>
                            <div className={styles.phaseLabel}>Phase actuelle</div>
                            <div className={styles.phaseName}>{getPhaseLabel(project.phase)}</div>
                        </div>
                    </div>

                    <div className={styles.grid}>
                        {/* Left Column */}
                        <div>
                            {/* Project Summary */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>📋 Synthèse du Projet</h2>
                                </div>
                                <div className={styles.summaryGrid}>
                                    <div className={styles.summaryRow}>
                                        <div className={styles.summaryLabel}>Projet</div>
                                        <div className={styles.summaryValue}><strong>{project.name}</strong></div>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <div className={styles.summaryLabel}>Maître d'Ouvrage</div>
                                        <div className={styles.summaryValue}>{project.moa}</div>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <div className={styles.summaryLabel}>Architecte</div>
                                        <div className={styles.summaryValue}>{project.architecte}</div>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <div className={styles.summaryLabel}>Adresse</div>
                                        <div className={styles.summaryValue}>{project.adresse}</div>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <div className={styles.summaryLabel}>Type</div>
                                        <div className={styles.summaryValue}>{project.type}</div>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <div className={styles.summaryLabel}>Enjeux</div>
                                        <div className={styles.summaryValue}>{project.enjeux}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Contacts & Rôles - Assigned Users */}
                            <div className={styles.section} style={{ marginTop: 'var(--spacing-xl)' }}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>👥 Équipe du Projet</h2>
                                    {hasPermission(user?.role, 'CREATE_PROJECT') && (
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => setShowAssignModal(true)}
                                        >
                                            ⚙️ Gérer l'équipe
                                        </button>
                                    )}
                                </div>
                                <table className={styles.contactsTable}>
                                    <thead>
                                        <tr>
                                            <th>Nom</th>
                                            <th>Rôle</th>
                                            <th>Lot</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Project Creator */}
                                        <tr style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
                                            <td><strong>{project.createdBy?.name || 'Administrateur'}</strong></td>
                                            <td>
                                                <span className="badge badge-purple">
                                                    👑 Créateur du Projet
                                                </span>
                                            </td>
                                            <td>-</td>
                                            <td>{project.createdBy?.email}</td>
                                        </tr>

                                        {/* Assigned Users */}
                                        {project.assignedUsers && project.assignedUsers.length > 0 ? (
                                            project.assignedUsers.map((assignedUser) => {
                                                const getRoleBadge = (role) => {
                                                    const badges = {
                                                        CHEF_DE_PROJET: { label: 'Chef de Projet', color: 'purple' },
                                                        REFERENT_LOT: { label: 'Référent Lot', color: 'blue' },
                                                        CONTRIBUTEUR: { label: 'Contributeur', color: 'green' },
                                                        EXTERNE: { label: 'Externe', color: 'gray' },
                                                    };
                                                    return badges[role] || { label: role, color: 'gray' };
                                                };

                                                const roleBadge = getRoleBadge(assignedUser.role);

                                                return (
                                                    <tr key={assignedUser.id}>
                                                        <td><strong>{assignedUser.name}</strong></td>
                                                        <td>
                                                            <span className={`badge badge-${roleBadge.color}`}>
                                                                {roleBadge.label}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {assignedUser.lot ? (
                                                                <span className="badge badge-blue">{assignedUser.lot}</span>
                                                            ) : (
                                                                <span style={{ color: 'var(--color-gray-400)' }}>-</span>
                                                            )}
                                                        </td>
                                                        <td>{assignedUser.email}</td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--color-gray-400)', fontStyle: 'italic', padding: '2rem' }}>
                                                    Aucun utilisateur assigné. L'admin peut assigner des utilisateurs via l'interface de gestion.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.section} style={{ marginTop: 'var(--spacing-xl)' }}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>⚠️ Points Bloquants Actifs</h2>
                                </div>

                                {project.risks?.map(risk => (
                                    <div key={risk.id} className={styles.alertCard} style={{ marginBottom: '0.5rem', borderLeft: '4px solid orange' }}>
                                        <div className={styles.alertTitle} style={{ color: 'orange' }}>
                                            🟠 Risque: {risk.title}
                                        </div>
                                        <div className={styles.alertText}>
                                            {risk.impactValue} - {risk.description}
                                        </div>
                                    </div>
                                ))}

                                {project.deliverables?.map(del => (
                                    <div key={del.id} className={styles.alertCard} style={{ marginBottom: '0.5rem' }}>
                                        <div className={styles.alertTitle}>
                                            🔴 Retard Livrable: {del.name}
                                        </div>
                                        <div className={styles.alertText}>
                                            Devait être rendu le {new Date(del.dueDate).toLocaleDateString('fr-FR')} ({del.lot})
                                        </div>
                                    </div>
                                ))}

                                {(!project.risks?.length && !project.deliverables?.length) && (
                                    <div style={{ color: 'gray', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>Aucun point bloquant identifié.</div>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            {/* Key Dates */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>📅 Dates Clés</h2>
                                </div>
                                <div className={styles.datesList}>
                                    {project.startDate ? (
                                        <div className={styles.dateItem}>
                                            <div className={styles.datePhase}>Début du Projet</div>
                                            <div className={styles.datePeriod}>
                                                {new Date(project.startDate).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.dateItem}><span style={{ color: 'gray', fontStyle: 'italic' }}>Date de début non définie</span></div>
                                    )}

                                    {project.endDate && (
                                        <div className={styles.dateItem}>
                                            <div className={styles.datePhase}>Fin Estimée</div>
                                            <div className={styles.datePeriod}>
                                                {new Date(project.endDate).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                    )}

                                    {project.startDate && project.endDate && (
                                        <div className={styles.dateItem}>
                                            <div className={styles.datePhase}>Durée</div>
                                            <div className={styles.datePeriod}>
                                                {Math.ceil((new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24))} jours
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Latest Decisions */}
                        <div className={styles.section} style={{ marginTop: 'var(--spacing-xl)' }}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>✅ Dernières Décisions</h2>
                                <a href={`/projects/${id}/decisions`} className="btn btn-sm btn-ghost">Voir tout</a>
                            </div>
                            <div className={styles.decisionsList}>
                                {project.decisions && project.decisions.length > 0 ? (
                                    project.decisions.map(decision => (
                                        <div key={decision.id} className={styles.decisionCard}>
                                            <div className={styles.decisionTitle}>{decision.title}</div>
                                            <div className={styles.decisionMeta}>
                                                {new Date(decision.createdAt).toLocaleDateString('fr-FR')} • {decision.type}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ color: 'gray', fontStyle: 'italic', padding: '1rem' }}>Aucune décision actée.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual Timeline */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>📊 Timeline du Projet</h2>
                        {hasPermission(user?.role, 'CREATE_PROJECT') && project.phase !== 'AOR' && (
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={handleAdvancePhase}
                            >
                                ➡️ Phase suivante
                            </button>
                        )}
                    </div>
                    <div className={styles.timeline}>
                        {['ESQUISSE', 'APS', 'APD', 'PRO', 'DCE', 'ACT', 'DET', 'AOR'].map((phaseCode) => {
                            const phasesOrder = ['ESQUISSE', 'APS', 'APD', 'PRO', 'DCE', 'ACT', 'DET', 'AOR'];
                            const currentIndex = phasesOrder.indexOf(project.phase);
                            const phaseIndex = phasesOrder.indexOf(phaseCode);

                            let statusClass = styles.timelineItem;
                            let statusText = 'À venir';
                            let icon = '⏳';

                            if (phaseIndex < currentIndex) {
                                statusClass = `${styles.timelineItem} ${styles.timelineItemComplete}`;
                                statusText = 'Terminé';
                                icon = '✅';
                            } else if (phaseIndex === currentIndex) {
                                statusClass = `${styles.timelineItem} ${styles.timelineItemActive}`;
                                statusText = 'En cours';
                                icon = '🔵';
                            }

                            return (
                                <div key={phaseCode} className={statusClass}>
                                    <div className={styles.timelineTitle}>{getPhaseLabel(phaseCode)}</div>
                                    <div className={styles.timelineDate}>
                                        {icon} {statusText}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Assign User Modal */}
            <AssignUserModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                projectId={id}
                currentAssignedUsers={project?.assignedUsers || []}
                onSuccess={async () => {
                    // Refresh project data without closing modal
                    // This allows users to see immediate feedback
                    await fetchProject();
                }}
            />

            {/* Phase Change Modal */}
            {project && (
                <PhaseChangeModal
                    isOpen={showPhaseModal}
                    onClose={() => {
                        setShowPhaseModal(false);
                        setPhaseChangeLoading(false);
                    }}
                    currentPhase={project.phase}
                    nextPhase={(() => {
                        const phasesOrder = ['ESQUISSE', 'APS', 'APD', 'PRO', 'DCE', 'ACT', 'DET', 'AOR'];
                        const currentIndex = phasesOrder.indexOf(project.phase);
                        return phasesOrder[currentIndex + 1] || project.phase;
                    })()}
                    onConfirm={confirmPhaseChange}
                    loading={phaseChangeLoading}
                />
            )}
        </div>
    );
}
