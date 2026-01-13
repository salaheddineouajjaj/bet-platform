'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation/Navigation';
import KanbanBoard from '@/components/KanbanBoard/KanbanBoard';
import NewDeliverableModal from '@/components/NewDeliverableModal/NewDeliverableModal';
import { hasPermission } from '@/lib/permissions';
import styles from '../overview.module.css';

export default function DeliverablesPage({ params }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [deliverables, setDeliverables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('kanban'); // 'kanban' or 'table'
    const [showNewModal, setShowNewModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDeliverables();
        }
    }, [id]);

    const fetchDeliverables = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/deliverables?projectId=${id}`);
            const data = await response.json();

            if (response.ok) {
                setDeliverables(data.deliverables || []);
            } else {
                console.error("Erreur chargement:", data.error);
            }
        } catch (error) {
            console.error('Error fetching deliverables:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (deliverableId, newStatus) => {
        // Optimistic update
        setDeliverables(prev =>
            prev.map(d =>
                d.id === deliverableId ? { ...d, status: newStatus } : d
            )
        );

        // In real app, call API
        // try {
        //   await fetch(`/api/deliverables/${deliverableId}`, {
        //     method: 'PUT',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ status: newStatus }),
        //   });
        // } catch (error) {
        //   console.error('Error updating status:', error);
        //   // Revert on error
        //   fetchDeliverables();
        // }
    };

    if (loading) {
        return (
            <div className={styles.page}>
                <Navigation projectId={id} user={user} />
                <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
                    Chargement des livrables...
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Navigation projectId={id} user={user} />

            <div className="container">
                <div className={styles.pageContent}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--spacing-xl)',
                    }}>
                        <div>
                            <h1 style={{ margin: 0, marginBottom: 'var(--spacing-sm)' }}>
                                📋 Planning des Livrables
                            </h1>
                            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
                                {deliverables.length} livrables • {deliverables.filter(d => d.status === 'VALIDE').length} validés
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <button
                                    className={`btn ${view === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setView('kanban')}
                                >
                                    📊 Kanban
                                </button>
                                <button
                                    className={`btn ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setView('table')}
                                >
                                    📑 Tableau
                                </button>
                            </div>
                            {hasPermission(user?.role, 'CREATE_DELIVERABLE') && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowNewModal(true)}
                                >
                                    ➕ Nouveau Livrable
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Kanban View */}
                    {view === 'kanban' && (
                        <KanbanBoard
                            deliverables={deliverables}
                            onStatusChange={handleStatusChange}
                        />
                    )}

                    {/* Table View */}
                    {view === 'table' && (
                        <div className={styles.section}>
                            <table className={styles.contactsTable}>
                                <thead>
                                    <tr>
                                        <th>Lot</th>
                                        <th>Livrable</th>
                                        <th>Phase</th>
                                        <th>Responsable</th>
                                        <th>Échéance</th>
                                        <th>Statut</th>
                                        <th>Version</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliverables.map((del) => (
                                        <tr key={del.id}>
                                            <td>
                                                <span className={`badge badge-${del.lot === 'Structure' ? 'purple' :
                                                    del.lot === 'CVC' ? 'blue' : 'orange'
                                                    }`}>
                                                    {del.lot}
                                                </span>
                                            </td>
                                            <td><strong>{del.name}</strong></td>
                                            <td>{del.phase}</td>
                                            <td>{del.responsable}</td>
                                            <td>
                                                {new Date(del.dueDate).toLocaleDateString('fr-FR')}
                                                {new Date(del.dueDate) < new Date() && del.status !== 'VALIDE' && (
                                                    <span className="badge badge-red" style={{ marginLeft: '0.5rem' }}>
                                                        Retard
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${del.status === 'VALIDE' ? 'green' :
                                                    del.status === 'EN_COURS' ? 'blue' :
                                                        del.status === 'A_VALIDER' ? 'orange' : 'gray'
                                                    }`}>
                                                    {del.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>v{del.version}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* New Deliverable Modal */}
            <NewDeliverableModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                projectId={id}
                onSuccess={(newDeliverable) => {
                    setDeliverables([...deliverables, newDeliverable]);
                }}
            />
        </div>
    );
}
