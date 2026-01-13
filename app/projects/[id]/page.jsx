'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Navigation from '@/components/Navigation/Navigation';
import styles from './overview.module.css';

export default function ProjectOverviewPage({ params }) {
    const { id } = use(params);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchProject();
        setUser({
            name: 'Marie Dupont',
            role: 'CHEF_DE_PROJET',
        });
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
            setProject({
                ...data.project,
                contacts: [],  // Empty for now
                phases: [],    // Empty for now
            });

            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            setProject(null);
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

                            {/* Contacts */}
                            <div className={styles.section} style={{ marginTop: 'var(--spacing-xl)' }}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>👥 Contacts & Rôles</h2>
                                </div>
                                <table className={styles.contactsTable}>
                                    <thead>
                                        <tr>
                                            <th>Nom</th>
                                            <th>Rôle</th>
                                            <th>Email</th>
                                            <th>Téléphone</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {project.contacts.map((contact, index) => (
                                            <tr key={index}>
                                                <td><strong>{contact.name}</strong></td>
                                                <td>{contact.role}</td>
                                                <td>{contact.email}</td>
                                                <td>{contact.phone}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Blocking Points */}
                            <div className={styles.section} style={{ marginTop: 'var(--spacing-xl)' }}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>⚠️ Points Bloquants Actifs</h2>
                                </div>
                                <div className={styles.alertCard}>
                                    <div className={styles.alertTitle}>
                                        🔴 Retard livrable CVC
                                    </div>
                                    <div className={styles.alertText}>
                                        Le schéma de ventilation est en retard de 5 jours (échéance: 10/05/2024)
                                    </div>
                                </div>
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
                                    {project.phases.map((phase) => (
                                        <div key={phase.phase} className={styles.dateItem}>
                                            <div className={styles.datePhase}>{getPhaseLabel(phase.phase)}</div>
                                            <div className={styles.datePeriod}>
                                                {new Date(phase.startDate).toLocaleDateString('fr-FR')} - {new Date(phase.endDate).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Latest Decisions */}
                            <div className={styles.section} style={{ marginTop: 'var(--spacing-xl)' }}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>✅ Dernières Décisions</h2>
                                    <a href={`/projects/${id}/decisions`} className="btn btn-sm btn-ghost">Voir tout</a>
                                </div>
                                <div className={styles.decisionsList}>
                                    <div className={styles.decisionCard}>
                                        <div className={styles.decisionTitle}>Choix système de fondations</div>
                                        <div className={styles.decisionMeta}>10/04/2024 • Technique</div>
                                    </div>
                                    <div className={styles.decisionCard}>
                                        <div className={styles.decisionTitle}>Validation note de calcul APD</div>
                                        <div className={styles.decisionMeta}>16/05/2024 • MOA</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Timeline */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>📊 Timeline du Projet</h2>
                        </div>
                        <div className={styles.timeline}>
                            <div className={`${styles.timelineItem} ${styles.timelineItemComplete}`}>
                                <div className={styles.timelineTitle}>APS - Avant-Projet Sommaire</div>
                                <div className={styles.timelineDate}>01/01/2024 - 31/03/2024 • ✅ Terminé</div>
                            </div>
                            <div className={`${styles.timelineItem} ${styles.timelineItemActive}`}>
                                <div className={styles.timelineTitle}>APD - Avant-Projet Définitif</div>
                                <div className={styles.timelineDate}>01/04/2024 - 30/06/2024 • 🔵 En cours</div>
                            </div>
                            <div className={styles.timelineItem}>
                                <div className={styles.timelineTitle}>PRO - Projet</div>
                                <div className={styles.timelineDate}>01/07/2024 - 31/10/2024 • ⏳ À venir</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
