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

    const types = [
        { value: 'TECHNIQUE', label: 'Technique' },
        { value: 'MOA', label: 'MOA' },
        { value: 'ARCHITECTE', label: 'Architecte' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const newDecision = {
                id: Date.now().toString(),
                ...formData,
                decidedBy: { name: 'Marie Dupont' },
                createdAt: new Date().toISOString(),
            };

            if (onSuccess) onSuccess(newDecision);

            setFormData({ type: 'TECHNIQUE', title: '', description: '', impact: '' });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="➕ Nouvelle Décision">
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Type de décision *</label>
                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }}>
                            {types.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Titre *</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Validation système de fondations" required style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '1rem' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description *</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Décrivez la décision prise..." required rows={4} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Impact</label>
                        <textarea value={formData.impact} onChange={(e) => setFormData({ ...formData, impact: e.target.value })} placeholder="Impact sur le projet..." rows={3} style={{ width: '100%', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }} disabled={loading}>Annuler</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Création...' : 'Enregistrer la décision'}</button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
