'use client';

import { useState } from 'react';
import Modal from '@/components/Modal/Modal';

export default function NewDeliverableModal({ isOpen, onClose, projectId, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        lot: 'Structure',
        phase: 'APD',
        responsable: '',
        dueDate: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const lots = ['Structure', 'CVC', 'Électricité', 'Plomberie', 'Façade'];
    const phases = ['APS', 'APD', 'PRO', 'DCE', 'ACT'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // REAL API CALL
            const response = await fetch('/api/deliverables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, projectId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création');
            }

            // Call success callback
            if (onSuccess) {
                onSuccess(data.deliverable);
            }

            // Reset form
            setFormData({
                name: '',
                lot: 'Structure',
                phase: 'APD',
                responsable: '',
                dueDate: '',
            });

            onClose();
        } catch (err) {
            setError(err.message || 'Erreur lors de la création du livrable');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="➕ Nouveau Livrable">
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
                    {/* Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Nom du livrable *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Note de calcul béton armé"
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

                    {/* Lot */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Lot *
                        </label>
                        <select
                            value={formData.lot}
                            onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        >
                            {lots.map(lot => (
                                <option key={lot} value={lot}>{lot}</option>
                            ))}
                        </select>
                    </div>

                    {/* Phase */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Phase *
                        </label>
                        <select
                            value={formData.phase}
                            onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        >
                            {phases.map(phase => (
                                <option key={phase} value={phase}>{phase}</option>
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

                    {/* Due Date */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Date d'échéance *
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                            {loading ? 'Création...' : 'Créer le livrable'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
