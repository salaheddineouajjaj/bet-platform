'use client';

import { useState } from 'react';
import Modal from '@/components/Modal/Modal';

export default function UploadDocumentModal({ isOpen, onClose, projectId, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        folder: '00_Admin',
        lot: 'Structure',
        description: '',
        file: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const folders = [
        '00_Admin',
        '01_APS',
        '02_APD',
        '03_PRO',
        '04_DCE',
        '05_ACT',
    ];

    const lots = ['Structure', 'CVC', 'Électricité', 'Plomberie', 'Façade'];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Auto-fill title if empty
            if (!formData.title) {
                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                setFormData({ ...formData, file, title: nameWithoutExt });
            } else {
                setFormData({ ...formData, file });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.file) {
            setError('Veuillez sélectionner un fichier');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Prepare FormData for file upload
            const uploadData = new FormData();
            uploadData.append('file', formData.file);
            uploadData.append('projectId', projectId);
            uploadData.append('path', formData.folder);
            uploadData.append('lot', formData.lot);
            uploadData.append('title', formData.title);
            uploadData.append('version', '1.0');

            // Upload to API
            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: uploadData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'upload');
            }

            console.log('Document uploaded successfully:', data.document);

            // Call success callback
            if (onSuccess) {
                onSuccess(data.document);
            }

            // Reset form
            setFormData({
                title: '',
                folder: '00_Admin',
                lot: 'Structure',
                description: '',
                file: null,
            });

            // Reset file input
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';

            onClose();
        } catch (error) {
            console.error('Upload error:', error);
            setError(error.message || 'Erreur lors du téléchargement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="📤 Télécharger un Document">
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
                    {/* File Upload */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Fichier *
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.dwg,.xls,.xlsx"
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
                            Formats acceptés: PDF, Word, Excel, DWG
                        </small>
                    </div>

                    {/* Title */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Titre du document *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ex: Note de calcul béton armé v2.0"
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

                    {/* Folder & Lot */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Dossier *
                            </label>
                            <select
                                value={formData.folder}
                                onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '2px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '1rem',
                                }}
                            >
                                {folders.map(folder => (
                                    <option key={folder} value={folder}>{folder}</option>
                                ))}
                            </select>
                        </div>

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
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Description du document..."
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

                    {/* File Preview */}
                    {formData.file && (
                        <div style={{
                            padding: '1rem',
                            background: 'var(--color-success-light)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-sm)',
                        }}>
                            ✅ Fichier sélectionné: <strong>{formData.file.name}</strong>
                            <br />
                            Taille: {(formData.file.size / 1024).toFixed(2)} KB
                        </div>
                    )}

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
                            {loading ? 'Téléchargement...' : 'Télécharger'}
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
