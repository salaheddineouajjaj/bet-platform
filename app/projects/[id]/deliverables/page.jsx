'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Navigation from '@/components/Navigation/Navigation';
import KanbanBoard from '@/components/KanbanBoard/KanbanBoard';
import styles from '../overview.module.css';

export default function DeliverablesPage({ params }) {
    const { id } = use(params);
    const [deliverables, setDeliverables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('kanban'); // 'kanban' or 'table'
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchDeliverables();
        setUser({
            name: 'Marie Dupont',
            role: 'CHEF_DE_PROJET',
        });
    }, [id]);

    const fetchDeliverables = async () => {
        try {
            setLoading(true);
            // Mock data
            setTimeout(() => {
                setDeliverables([
                    {
                        id: '1',
                        name: 'Note de calcul béton armé',
                        lot: 'Structure',
                        phase: 'APD',
                        responsable: 'Pierre Martin',
                        dueDate: '2024-05-15',
                        status: 'VALIDE',
                        version: '2.0',
                    },
                    {
                        id: '2',
                        name: 'Plans de ferraillage fondations',
                        lot: 'Structure',
                        phase: 'APD',
                        responsable: 'Pierre Martin',
                        dueDate: '2024-06-01',
                        status: 'A_VALIDER',
                        version: '1.0',
                    },
                    {
                        id: '3',
                        name: 'Note de dimensionnement chauffage',
                        lot: 'CVC',
                        phase: 'APD',
                        responsable: 'Sophie Bernard',
                        dueDate: '2024-05-20',
                        status: 'EN_COURS',
                        version: '1.0',
                    },
                    {
                        id: '4',
                        name: 'Schémas de principe ventilation',
                        lot: 'CVC',
                        phase: 'APD',
                        responsable: 'Sophie Bernard',
                        dueDate: '2024-05-10', // Late!
                        status: 'EN_COURS',
                        version: '1.0',
                    },
                    {
                        id: '5',
                        name: 'Schéma unifilaire tableau général',
                        lot: 'Électricité',
                        phase: 'APD',
                        responsable: 'Luc Moreau',
                        dueDate: '2024-06-10',
                        status: 'A_FAIRE',
                        version: '1.0',
                    },
                ]);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error:', error);
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
                            <button className="btn btn-primary">
                                ➕ Nouveau Livrable
                            </button>
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
        </div>
    );
}
