'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation/Navigation';
import NewDecisionModal from '@/components/NewDecisionModal/NewDecisionModal';
import { hasPermission } from '@/lib/permissions';
import styles from '../overview.module.css';

export default function DecisionsPage({ params }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [decisions, setDecisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDecisions();
        }
    }, [id]);

    const fetchDecisions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/decisions?projectId=${id}`);
            const data = await response.json();

            if (response.ok) {
                setDecisions(data.decisions || []);
            } else {
                console.error("Erreur chargement:", data.error);
            }
        } catch (error) {
            console.error('Error fetching decisions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            TECHNIQUE: 'Technique',
            MOA_VALIDATION: 'Validation MOA',
            ARCHITECT_VALIDATION: 'Validation Architecte',
        };
        return labels[type] || type;
    };

    const getTypeColor = (type) => {
        const colors = {
            TECHNIQUE: 'blue',
            MOA_VALIDATION: 'green',
            ARCHITECT_VALIDATION: 'purple',
        };
        return colors[type] || 'gray';
    };

    return (
        <div className={styles.page}>
            <Navigation projectId={id} user={user} />

            <div className="container">
                <div className={styles.pageContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)' }}>
                        <div>
                            <h1>✅ Décisions & Validations</h1>
                            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                                Journal audit immutable • {decisions.length} décisions enregistrées
                            </p>
                        </div>
                        {hasPermission(user?.role, 'CREATE_DECISION') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowNewModal(true)}
                            >
                                ➕ Nouvelle Décision
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                            {decisions.map((decision) => (
                                <div key={decision.id} className={styles.section}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                                        <div>
                                            <h3 style={{ margin: 0, marginBottom: 'var(--spacing-sm)' }}>
                                                {decision.title}
                                            </h3>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                                <span className={`badge badge-${getTypeColor(decision.type)}`}>
                                                    {getTypeLabel(decision.type)}
                                                </span>
                                                {decision.isValidated && (
                                                    <span className="badge badge-green">
                                                        ✅ Validé
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                            <div>🗓️ {new Date(decision.createdAt).toLocaleDateString('fr-FR')}</div>
                                            <div>👤 {decision.decidedBy.name}</div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                                        <strong>Description:</strong>
                                        <p style={{ margin: '0.5rem 0 0 0' }}>{decision.description}</p>
                                    </div>

                                    {decision.impact && (
                                        <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--color-warning-light)', borderLeft: '4px solid var(--color-warning)', borderRadius: 'var(--radius-md)' }}>
                                            <strong>Impact:</strong>
                                            <p style={{ margin: '0.5rem 0 0 0' }}>{decision.impact}</p>
                                        </div>
                                    )}

                                    {decision.isValidated && (
                                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                            ✅ Validé par <strong>{decision.validatedBy}</strong> le {new Date(decision.validatedAt).toLocaleDateString('fr-FR')}
                                        </div>
                                    )}

                                    <div style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-sm)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                        🔒 Décision immutable • Enregistrée dans le journal d'audit
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <NewDecisionModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                projectId={id}
                onSuccess={(newDecision) => {
                    setDecisions([newDecision, ...decisions]);
                }}
            />
        </div>
    );
}
