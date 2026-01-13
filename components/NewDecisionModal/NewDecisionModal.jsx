'use client';

import { useState } from 'react';
import Modal from '@/components/Modal/Modal';

export default function NewDecisionModal({ isOpen, onClose, projectId, onSuccess }) {
    const [formData, setFormData] = useState({
        type: 'TECHNIQUE',
        title: '',
        description: '',
        impact: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const types = ['TECHNIQUE', 'MOA_VALIDATION', 'ARCHITECT_VALIDATION'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/decisions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, projectId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création');
            }

            if (onSuccess) {
                onSuccess(data.decision);
            }

            setFormData({
                type: 'TECHNIQUE',
                title: '',
                description: '',
                impact: '',
            });

            onClose();
        } catch (err) {
            setError(err.message || 'Erreur lors de la création de la décision');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="➕ Nouvelle Décision">
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
                            Type *
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        >
                            {types.map(type => (
                                <option key={type} value={type}>{type.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Titre *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Choix système de fondations"
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
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Décrivez la décision..."
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

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Impact
                        </label>
                        <input
                            type="text"
                            value={formData.impact}
                            onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                            placeholder="Ex: Budget: +150k€ / Planning: +2 semaines"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
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
                            {loading ? 'Création...' : 'Créer la décision'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
