'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Navigation from '@/components/Navigation/Navigation';
import NewRiskModal from '@/components/NewRiskModal/NewRiskModal';
import { hasPermission } from '@/lib/permissions';
import styles from '../overview.module.css';

export default function RisksPage({ params }) {
    const { id } = use(params);
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);

    useEffect(() => {
        fetchRisks();
        setUser({
            name: 'Marie Dupont',
            role: 'CHEF_DE_PROJET',
        });
    }, [id]);

    const fetchRisks = () => {
        setLoading(true);
        setTimeout(() => {
            setRisks([
                {
                    id: '1',
                    title: 'Retard livraison schémas CVC',
                    description: 'Le lot CVC accumule du retard sur les schémas de ventilation. Risque de blocage pour la synthèse architecturale.',
                    impactType: 'DELAY',
                    impactValue: '2 semaines',
                    mitigation: 'Renfort d\'une ressource supplémentaire sur le lot CVC.',
                    status: 'MITIGATING',
                    responsable: { name: 'Sophie Bernard' },
                    createdBy: { name: 'Marie Dupont' },
                    createdAt: '2024-05-15',
                },
                {
                    id: '2',
                    title: 'Dépassement budget fondations',
                    description: 'Le changement de système de fondations entraîne un surcoût non prévu.',
                    impactType: 'COST',
                    impactValue: '150 000 EUR',
                    mitigation: 'Négociation avec MOA pour rallonge budgétaire. Optimisation autres lots.',
                    status: 'OPEN',
                    responsable: { name: 'Marie Dupont' },
                    createdBy: { name: 'Marie Dupont' },
                    createdAt: '2024-04-12',
                },
            ]);
            setLoading(false);
        }, 300);
    };

    const getImpactColor = (type) => {
        const colors = { DELAY: 'orange', COST: 'red', PENALTY: 'red' };
        return colors[type] || 'gray';
    };

    const getImpactLabel = (type) => {
        const labels = { DELAY: 'Délai', COST: 'Coût', PENALTY: 'Pénalité' };
        return labels[type] || type;
    };

    const getStatusColor = (status) => {
        const colors = { OPEN: 'red', MITIGATING: 'orange', RESOLVED: 'green' };
        return colors[status] || 'gray';
    };

    const getStatusLabel = (status) => {
        const labels = { OPEN: 'Ouvert', MITIGATING: 'En mitigation', RESOLVED: 'Résolu' };
        return labels[status] || status;
    };

    return (
        <div className={styles.page}>
            <Navigation projectId={id} user={user} />

            <div className="container">
                <div className={styles.pageContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)' }}>
                        <div>
                            <h1>⚠️ Risques & Retards</h1>
                            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                                {risks.filter(r => r.status !== 'RESOLVED').length} risques actifs sur {risks.length} total
                            </p>
                        </div>
                        {hasPermission(user?.role, 'CREATE_RISK') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowNewModal(true)}
                            >
                                ➕ Identifier un Risque
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                            {risks.map((risk) => (
                                <div key={risk.id} className={styles.section}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                                        <div>
                                            <h3 style={{ margin: 0, marginBottom: 'var(--spacing-sm)' }}>
                                                {risk.title}
                                            </h3>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                                <span className={`badge badge-${getImpactColor(risk.impactType)}`}>
                                                    {getImpactLabel(risk.impactType)}: {risk.impactValue}
                                                </span>
                                                <span className={`badge badge-${getStatusColor(risk.status)}`}>
                                                    {getStatusLabel(risk.status)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                        <strong>Description du risque:</strong>
                                        <p style={{ margin: '0.5rem 0', padding: 'var(--spacing-md)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                                            {risk.description}
                                        </p>
                                    </div>

                                    <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--color-success-light)', borderLeft: '4px solid var(--color-success)', borderRadius: 'var(--radius-md)' }}>
                                        <strong>💡 Plan de mitigation:</strong>
                                        <p style={{ margin: '0.5rem 0 0 0' }}>{risk.mitigation}</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                                                Responsable
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                {risk.responsable.name}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                                                Identifié par
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                {risk.createdBy.name}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                                                Date de création
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                {new Date(risk.createdAt).toLocaleDateString('fr-FR')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* New Risk Modal */}
            <NewRiskModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                projectId={id}
                onSuccess={(newRisk) => {
                    setRisks([newRisk, ...risks]);
                }}
            />
        </div>
    );
}
