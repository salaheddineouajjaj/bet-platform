'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation/Navigation';
import NewMeetingModal from '@/components/NewMeetingModal/NewMeetingModal';
import { hasPermission } from '@/lib/permissions';
import styles from '../overview.module.css';

export default function MeetingsPage({ params }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewModal, setShowNewModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchMeetings();
        }
    }, [id]);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/meetings?projectId=${id}`);
            const data = await response.json();

            if (response.ok) {
                setMeetings(data.meetings || []);
            } else {
                console.error("Erreur chargement:", data.error);
            }
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Navigation projectId={id} user={user} />

            <div className="container">
                <div className={styles.pageContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)' }}>
                        <h1>📅 Réunions & Comptes Rendus</h1>
                        {hasPermission(user?.role, 'CREATE_MEETING') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowNewModal(true)}
                            >
                                ➕ Nouvelle Réunion
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</p>
                    ) : (
                        meetings.map((meeting) => (
                            <div key={meeting.id} className={styles.section} style={{ marginBottom: 'var(--spacing-xl)' }}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <h2 className={styles.sectionTitle}>{meeting.title}</h2>
                                        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                            {new Date(meeting.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            {' à '}
                                            {new Date(meeting.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>👥 Participants:</div>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                        {meeting.participants.map((p, i) => (
                                            <span key={i} className="badge badge-blue">{p}</span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <h4 style={{ marginBottom: 'var(--spacing-md)' }}>📝 Compte Rendu:</h4>
                                    <div style={{ whiteSpace: 'pre-wrap', padding: 'var(--spacing-md)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                                        {meeting.crContent}
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ marginBottom: 'var(--spacing-md)' }}>✅ Actions ({meeting.actionItems.length}):</h4>
                                    <table className={styles.contactsTable}>
                                        <thead>
                                            <tr>
                                                <th>Action</th>
                                                <th>Assigné à</th>
                                                <th>Échéance</th>
                                                <th>Statut</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {meeting.actionItems.map((action) => (
                                                <tr key={action.id}>
                                                    <td>{action.description}</td>
                                                    <td>{action.assignedTo.name}</td>
                                                    <td>{new Date(action.dueDate).toLocaleDateString('fr-FR')}</td>
                                                    <td>
                                                        <span className={`badge badge-${action.status === 'DONE' ? 'green' :
                                                            action.status === 'IN_PROGRESS' ? 'blue' : 'gray'
                                                            }`}>
                                                            {action.status === 'DONE' ? 'Terminé' :
                                                                action.status === 'IN_PROGRESS' ? 'En cours' : 'À faire'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <NewMeetingModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                projectId={id}
                onSuccess={(newMeeting) => {
                    setMeetings([newMeeting, ...meetings]);
                }}
            />
        </div>
    );
}
