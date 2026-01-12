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

    const impactTypes = [
        { value: 'DELAY', label: 'Délai' },
        { value: 'COST', label: 'Coût' },
        { value: 'PENALTY', label: 'Pénalité' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Mock success
            await new Promise(resolve => setTimeout(resolve, 500));

            const newRisk = {
                id: Date.now().toString(),
                ...formData,
                status: 'OPEN',
            };

            if (onSuccess) {
                onSuccess(newRisk);
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                impactType: 'DELAY',
                impactValue: '',
                mitigation: '',
            });

            onClose();
        } catch (err) {
            setError('Erreur lors de la création du risque');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="⚠️ Identifier un Risque">
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
                            Titre du risque *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Retard livraison matériaux"
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
                            placeholder="Décrivez le risque et ses conséquences..."
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

                    {/* Impact Type */}
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
                            {impactTypes.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Impact Value */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Valeur de l'impact *
                        </label>
                        <input
                            type="text"
                            value={formData.impactValue}
                            onChange={(e) => setFormData({ ...formData, impactValue: e.target.value })}
                            placeholder={formData.impactType === 'COST' ? 'Ex: 15000 EUR' : formData.impactType === 'DELAY' ? 'Ex: 2 semaines' : 'Ex: 5000 EUR/jour'}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        />
                        <small style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                            {formData.impactType === 'COST' && 'Indiquez le montant (ex: 15000 EUR)'}
                            {formData.impactType === 'DELAY' && 'Indiquez la durée (ex: 2 semaines, 10 jours)'}
                            {formData.impactType === 'PENALTY' && 'Indiquez le montant de pénalité (ex: 5000 EUR/jour)'}
                        </small>
                    </div>

                    {/* Mitigation */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Plan de mitigation
                        </label>
                        <textarea
                            value={formData.mitigation}
                            onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
                            placeholder="Actions prévues pour réduire ou éviter le risque..."
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
                            {loading ? 'Création...' : 'Identifier le risque'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
