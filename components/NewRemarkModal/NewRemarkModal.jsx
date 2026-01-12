'use client';

import { useState } from 'react';
import Modal from '@/components/Modal/Modal';

export default function NewRemarkModal({ isOpen, onClose, projectId, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'MOYENNE',
        responsable: '',
        deadline: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const priorities = [
        { value: 'BASSE', label: 'Basse' },
        { value: 'MOYENNE', label: 'Moyenne' },
        { value: 'HAUTE', label: 'Haute' },
        { value: 'CRITIQUE', label: 'Critique' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // TODO: Replace with real API call
            // const res = await fetch('/api/remarks', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ ...formData, projectId }),
            // });

            // Mock success
            await new Promise(resolve => setTimeout(resolve, 500));

            const newRemark = {
                id: Date.now().toString(),
                ...formData,
                status: 'OUVERT',
                createdBy: { name: 'Marie Dupont' },
                responsable: { name: formData.responsable },
                comments: [],
            };

            if (onSuccess) {
                onSuccess(newRemark);
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                priority: 'MOYENNE',
                responsable: '',
                deadline: '',
            });

            onClose();
        } catch (err) {
            setError('Erreur lors de la création de la remarque');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="➕ Nouvelle Remarque">
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
                    {/* Title */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Titre *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Vérification charge sismique"
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

                    {/* Description */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Décrivez la remarque en détail..."
                            required
                            rows={4}
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

                    {/* Priority */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Priorité *
                        </label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        >
                            {priorities.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Responsable */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Responsable *
                        </label>
                        <input
                            type="text"
                            value={formData.responsable}
                            onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                            placeholder="Ex: Pierre Martin"
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

                    {/* Deadline */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Date limite
                        </label>
                        <input
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    {/* Buttons */}
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
                            {loading ? 'Création...' : 'Créer la remarque'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
