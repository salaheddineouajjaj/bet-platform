'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation/Navigation';
import UploadDocumentModal from '@/components/UploadDocumentModal/UploadDocumentModal';
import { hasPermission } from '@/lib/permissions';
import styles from '../overview.module.css';

const FOLDER_STRUCTURE = [
    { id: '00_Admin', name: '00 - Administration', icon: '📋' },
    { id: '01_APS', name: '01 - APS', icon: '📐' },
    { id: '02_APD', name: '02 - APD', icon: '📏' },
    { id: '03_PRO', name: '03 - PRO', icon: '📊' },
    { id: '04_DCE', name: '04 - DCE', icon: '📑' },
    { id: '05_ACT', name: '05 - ACT', icon: '🏗️' },
];

export default function DocumentsPage({ params }) {
    const { id } = use(params);
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('00_Admin');
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDocuments();
        }
    }, [id, selectedFolder]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/documents?projectId=${id}&path=${selectedFolder}`);
            const data = await response.json();

            if (response.ok) {
                setDocuments(data.documents || []);
            } else {
                console.error("Erreur chargement:", data.error);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDocument = (doc) => {
        if (doc.fileData) {
            // Open uploaded file
            window.open(doc.fileData, '_blank');
        } else {
            // Generate a demo PDF for mock documents
            const pdfWindow = window.open('', '_blank');
            pdfWindow.document.write(`
                <html>
                <head><title>${doc.title}</title></head>
                <body style="font-family: Arial; padding: 40px;">
                    <h1>📄 ${doc.title}</h1>
                    <p><strong>Fichier:</strong> ${doc.filename}</p>
                    <p><strong>Lot:</strong> ${doc.lot}</p>
                    <p><strong>Version:</strong> v${doc.version}</p>
                    <hr>
                    <p>Ceci est un document de démo.</p>
                    <p>En production, le vrai fichier PDF s'afficherait ici.</p>
                </body>
                </html>
            `);
        }
    };

    const handleDownloadDocument = (doc) => {
        if (doc.fileData) {
            // Download real uploaded file
            const link = document.createElement('a');
            link.href = doc.fileData;
            link.download = doc.filename;
            link.click();
        } else {
            // Generate demo PDF for download
            const content = `BET PLATFORM - DOCUMENT\n\nTitre: ${doc.title}\nFichier: ${doc.filename}\nLot: ${doc.lot}\nVersion: v${doc.version}\nDéposé par: ${doc.uploadedBy.name}\nDate: ${new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}\n\nCeci est un document de démo.`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = doc.filename;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleUploadSuccess = (newDoc) => {
        // Add to localStorage
        const stored = localStorage.getItem('bet_documents');
        const allDocs = stored ? JSON.parse(stored) : [];
        allDocs.push(newDoc);
        localStorage.setItem('bet_documents', JSON.stringify(allDocs));

        // Refresh list
        fetchDocuments();
    };

    return (
        <div className={styles.page}>
            <Navigation projectId={id} user={user} />

            <div className="container">
                <div className={styles.pageContent}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xl)' }}>
                        <h1>📁 Plans & Documents (GED)</h1>
                        {hasPermission(user?.role, 'UPLOAD_DOCUMENT') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowUploadModal(true)}
                            >
                                ⬆️ Télécharger un document
                            </button>
                        )}
                    </div>

                    <div className={styles.grid}>
                        {/* Folder Tree */}
                        <div className={styles.section} style={{ gridColumn: '1' }}>
                            <h3 className={styles.sectionTitle}>Structure des Dossiers</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {FOLDER_STRUCTURE.map((folder) => (
                                    <button
                                        key={folder.id}
                                        className={`btn ${selectedFolder === folder.id ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => setSelectedFolder(folder.id)}
                                        style={{
                                            justifyContent: 'flex-start',
                                            gap: 'var(--spacing-md)',
                                        }}
                                    >
                                        <span style={{ fontSize: '1.25rem' }}>{folder.icon}</span>
                                        {folder.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Documents List */}
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>
                                Documents - {FOLDER_STRUCTURE.find(f => f.id === selectedFolder)?.name}
                            </h3>

                            {loading ? (
                                <p style={{ textAlign: 'center', padding: '2rem' }}>Chargement...</p>
                            ) : documents.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                                    Aucun document dans ce dossier
                                </p>
                            ) : (
                                <table className={styles.contactsTable}>
                                    <thead>
                                        <tr>
                                            <th>Titre</th>
                                            <th>Fichier</th>
                                            <th>Lot</th>
                                            <th>Version</th>
                                            <th>Déposé par</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map((doc) => (
                                            <tr key={doc.id}>
                                                <td><strong>{doc.title}</strong></td>
                                                <td>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                        📄 {doc.filename}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-${doc.lot === 'Structure' ? 'purple' : doc.lot === 'CVC' ? 'blue' : 'gray'}`}>
                                                        {doc.lot}
                                                    </span>
                                                </td>
                                                <td>v{doc.version}</td>
                                                <td>{doc.uploadedBy.name}</td>
                                                <td>{new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handleViewDocument(doc)}
                                                            title="Ouvrir le document"
                                                        >
                                                            👁️ Voir
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-secondary"
                                                            onClick={() => handleDownloadDocument(doc)}
                                                            title="Télécharger le document"
                                                        >
                                                            ⬇️ Télécharger
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <UploadDocumentModal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                projectId={id}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
}
