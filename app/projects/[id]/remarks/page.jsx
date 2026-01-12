'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Navigation from '@/components/Navigation/Navigation';
import NewRemarkModal from '@/components/NewRemarkModal/NewRemarkModal';
import { hasPermission } from '@/lib/permissions';
import styles from '../overview.module.css';

export default function RemarksPage({ params }) {
    const { id } = use(params);
    const [remarks, setRemarks] = useState([]);
    const [selectedRemark, setSelectedRemark] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);

    useEffect(() => {
        fetchRemarks();
        setUser({
            name: 'Marie Dupont',
            role: 'CHEF_DE_PROJET',
        });
    }, [id]);

    const fetchRemarks = () => {
        setLoading(true);
        setTimeout(() => {
            setRemarks([
                {
                    id: '1',
                    title: 'Vérification charge sismique',
                    description: 'La note de calcul doit intégrer les charges sismiques selon la zone 4.',
                    priority: 'HAUTE',
                    status: 'EN_COURS',
                    responsable: { name: 'Pierre Martin' },
                    deadline: '2024-05-25',
                    createdBy: { name: 'Marie Dupont' },
                    comments: [
                        { id: '1', content: 'Pris en compte, je mets à jour la note.', author: { name: 'Pierre Martin' }, createdAt: '2024-05-14' },
                    ],
                },
                {
                    id: '2',
                    title: 'Détail ancrage poteaux',
                    description: 'Les détails d\'ancrage des poteaux en zone de reprise ne sont pas clairs.',
                    priority: 'MOYENNE',
                    status: 'OUVERT',
                    responsable: { name: 'Pierre Martin' },
                    deadline: '2024-06-05',
                    createdBy: { name: 'Jean Architecte' },
                    comments: [],
                },
            ]);
            setLoading(false);
        }, 300);
    };

    const getPriorityColor = (priority) => {
        const colors = { BASSE: 'gray', MOYENNE: 'blue', HAUTE: 'orange', CRITIQUE: 'red' };
        return colors[priority] || 'gray';
    };

    const getStatusColor = (status) => {
        const colors = { OUVERT: 'red', EN_COURS: 'orange', RESOLU: 'blue', VALIDE: 'green', FERME: 'gray' };
        return colors[status] || 'gray';
    };

    return (
        <div className={styles.page}>
            <Navigation projectId={id} user={user} />

            <div className="container">
                <div className={styles.pageContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)' }}>
                        <h1>💬 Remarques & Visa</h1>
                        {hasPermission(user?.role, 'CREATE_REMARK') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowNewModal(true)}
                            >
                                ➕ Nouvelle Remarque
                            </button>
                        )}
                    </div>

                    <div className={styles.grid}>
                        {/* Remarks List */}
                        <div>
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h3 className={styles.sectionTitle}>Liste des Remarques</h3>
                                </div>

                                {loading ? (
                                    <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                        {remarks.map((remark) => (
                                            <div
                                                key={remark.id}
                                                onClick={() => setSelectedRemark(remark)}
                                                style={{
                                                    padding: 'var(--spacing-md)',
                                                    border: '2px solid var(--color-border)',
                                                    borderRadius: 'var(--radius-md)',
                                                    cursor: 'pointer',
                                                    transition: 'all var(--transition-base)',
                                                    backgroundColor: selectedRemark?.id === remark.id ? 'var(--color-primary-light)' : 'transparent',
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                                                    <strong>{remark.title}</strong>
                                                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                                        <span className={`badge badge-${getPriorityColor(remark.priority)}`}>
                                                            {remark.priority}
                                                        </span>
                                                        <span className={`badge badge-${getStatusColor(remark.status)}`}>
                                                            {remark.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0 }}>
                                                    Responsable: {remark.responsable.name} • Échéance: {new Date(remark.deadline).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Remark Detail */}
                        <div>
                            {selectedRemark ? (
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h3 className={styles.sectionTitle}>{selectedRemark.title}</h3>
                                    </div>

                                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                                            <span className={`badge badge-${getPriorityColor(selectedRemark.priority)}`}>
                                                {selectedRemark.priority}
                                            </span>
                                            <span className={`badge badge-${getStatusColor(selectedRemark.status)}`}>
                                                {selectedRemark.status}
                                            </span>
                                        </div>
                                        <p>{selectedRemark.description}</p>
                                    </div>

                                    <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                                        <div><strong>Responsable:</strong> {selectedRemark.responsable.name}</div>
                                        <div><strong>Créé par:</strong> {selectedRemark.createdBy.name}</div>
                                        <div><strong>Échéance:</strong> {new Date(selectedRemark.deadline).toLocaleDateString('fr-FR')}</div>
                                    </div>

                                    <div className={styles.sectionHeader}>
                                        <h4 className={styles.sectionTitle}>💬 Commentaires ({selectedRemark.comments.length})</h4>
                                    </div>

                                    {selectedRemark.comments.map((comment) => (
                                        <div key={comment.id} style={{ padding: 'var(--spacing-md)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-sm)' }}>
                                            <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                                                {comment.author.name} • {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                                            </div>
                                            <p style={{ margin: 0 }}>{comment.content}</p>
                                        </div>
                                    ))}

                                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                                        <textarea
                                            className="form-textarea"
                                            placeholder="Ajouter un commentaire..."
                                            rows="3"
                                        ></textarea>
                                        <button className="btn btn-primary" style={{ marginTop: 'var(--spacing-sm)' }}>
                                            Envoyer
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.section} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                                    Sélectionnez une remarque pour voir les détails
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* New Remark Modal */}
            <NewRemarkModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                projectId={id}
                onSuccess={(newRemark) => {
                    setRemarks([newRemark, ...remarks]);
                    setSelectedRemark(newRemark);
                }}
            />
        </div>
    );
}
