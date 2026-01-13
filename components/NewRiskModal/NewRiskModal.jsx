'use client';

import { useState } from 'react';
import Modal from '@/components/Modal/Modal';

export default function NewRiskModal({ isOpen, onClose, projectId, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        impactType: 'DELAY',
        impactValue: '',
        mitigation: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const impactTypes = ['DELAY', 'COST', 'PENALTY'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/risks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, projectId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création');
            }

            if (onSuccess) {
                onSuccess(data.risk);
            }

            setFormData({
                title: '',
                description: '',
                impactType: 'DELAY',
                impactValue: '',
                mitigation: '',
            });

            onClose();
        } catch (err) {
            setError(err.message || 'Erreur lors de la création du risque');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="➕ Identifier un Risque">
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
                            placeholder="Ex: Retard livraison béton"
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
                            placeholder="Décrivez le risque..."
                            required
                            rows={3}
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Type d'impact *
                            </label>
                            <select
                                value={formData.impactType}
                                onChange={(e) => setFormData({ ...formData, impactType: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '1rem',
                                }}
                            >
                                {impactTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type === 'DELAY' ? 'Délai' : type === 'COST' ? 'Coût' : 'Pénalité'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Valeur *
                            </label>
                            <input
                                type="text"
                                value={formData.impactValue}
                                onChange={(e) => setFormData({ ...formData, impactValue: e.target.value })}
                                placeholder="Ex: 2 semaines ou 50k€"
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
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Plan de mitigation
                        </label>
                        <textarea
                            value={formData.mitigation}
                            onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
                            placeholder="Actions pour réduire le risque..."
                            rows={3}
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
                            {loading ? 'Création...' : 'Identifier le risque'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
