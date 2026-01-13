'use client';

import { useState } from 'react';
import Modal from '@/components/Modal/Modal';

export default function NewProjectModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        moa: '',
        architecte: '',
        adresse: '',
        type: 'RESIDENTIEL',
        phase: 'APS',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const types = ['RESIDENTIEL', 'TERTIAIRE', 'INDUSTRIEL', 'INFRASTRUCTURE'];
    const phases = ['APS', 'APD', 'PRO', 'DCE', 'ACT'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // REAL API CALL to database
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création du projet');
            }

            // Success!
            if (onSuccess) {
                onSuccess(data.project);
            }

            // Reset form
            setFormData({
                name: '',
                moa: '',
                architecte: '',
                adresse: '',
                type: 'RESIDENTIEL',
                phase: 'APS',
            });

            onClose();
        } catch (err) {
            console.error('Create project error:', err);
            setError(err.message || 'Erreur lors de la création du projet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="➕ Nouveau Projet">
            <form onSubmit={handleSubmit}>
                {error && <div style={{ background: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>{error}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nom du projet *</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Construction Résidence Les Érables" required style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>MOA *</label>
                        <input type="text" value={formData.moa} onChange={(e) => setFormData({ ...formData, moa: e.target.value })} placeholder="Ex: Ville de Paris" required style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Architecte *</label>
                        <input type="text" value={formData.architecte} onChange={(e) => setFormData({ ...formData, architecte: e.target.value })} placeholder="Ex: Cabinet Dupont" required style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Adresse *</label>
                        <input type="text" value={formData.adresse} onChange={(e) => setFormData({ ...formData, adresse: e.target.value })} placeholder="Ex: 15 Rue Victor Hugo, 75001 Paris" required style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Type *</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }}>
                                {types.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phase *</label>
                            <select value={formData.phase} onChange={(e) => setFormData({ ...formData, phase: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }}>
                                {phases.map(phase => <option key={phase} value={phase}>{phase}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }} disabled={loading}>Annuler</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Création...' : 'Créer le projet'}</button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
