'use client';

import { useState } from 'react';
import Modal from '@/components/Modal/Modal';

export default function NewMeetingModal({ isOpen, onClose, projectId, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        participants: '',
        crContent: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, projectId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création');
            }

            if (onSuccess) {
                onSuccess(data.meeting);
            }

            setFormData({
                title: '',
                date: '',
                participants: '',
                crContent: '',
            });

            onClose();
        } catch (err) {
            setError(err.message || 'Erreur lors de la création de la réunion');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="➕ Nouvelle Réunion">
            <form onSubmit={handleSubmit}>
                {error && (
                    <div style={{
                        background: 'var(--color-danger-light)',
                        color: 'var(--color-danger)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1rem',
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Titre *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Réunion de coordination lots"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Date *
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Participants *
                        </label>
                        <input
                            type="text"
                            value={formData.participants}
                            onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                            placeholder="Ex: Marie Dupont, Pierre Martin, Sophie Bernard"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Compte rendu *
                        </label>
                        <textarea
                            value={formData.crContent}
                            onChange={(e) => setFormData({ ...formData, crContent: e.target.value })}
                            placeholder="Contenu du compte rendu..."
                            required
                            rows={6}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                            style={{ flex: 1 }}
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            disabled={loading}
                        >
                            {loading ? 'Création...' : 'Créer la réunion'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
