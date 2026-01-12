'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
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
    const [documents, setDocuments] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('00_Admin');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        fetchDocuments();
        setUser({
            name: 'Marie Dupont',
            role: 'CHEF_DE_PROJET',
        });
    }, [id, selectedFolder]);

    const fetchDocuments = () => {
        setLoading(true);
        // Mock data 
        setTimeout(() => {
            setDocuments([
                {
                    id: '1',
                    filename: 'CCTP_general.pdf',
                    path: '00_Admin',
                    lot: 'Général',
                    version: '1.0',
                    uploadedBy: { name: 'Marie Dupont' },
                    uploadedAt: '2024-05-01',
                },
                {
                    id: '2',
                    filename: 'Note_calcul_BA_v2.0.pdf',
                    path: '02_APD',
                    lot: 'Structure',
                    version: '2.0',
                    uploadedBy: { name: 'Pierre Martin' },
                    uploadedAt: '2024-05-12',
                },
                {
                    id: '3',
                    filename: 'Plans_ferraillage_fondations_v1.0.pdf',
                    path: '02_APD',
                    lot: 'Structure',
                    version: '1.0',
                    uploadedBy: { name: 'Pierre Martin' },
                    uploadedAt: '2024-05-15',
                },
            ].filter(doc => doc.path === selectedFolder));
            setLoading(false);
        }, 300);
    };

    const handleViewDocument = (doc) => {
        // Open in new tab (placeholder - would use real file URL in production)
        alert(`📄 Ouverture de: ${doc.filename}\n\n⚠️ Feature en développement\n\nEn production, ce fichier s'ouvrira dans un nouvel onglet via Supabase Storage.`);
        // window.open(doc.fileUrl, '_blank');
    };

    const handleDownloadDocument = (doc) => {
        // Download file (placeholder)
        alert(`⬇️ Téléchargement de: ${doc.filename}\n\n⚠️ Feature en développement\n\nEn production, le fichier sera téléchargé depuis Supabase Storage.`);
        // const link = document.createElement('a');
        // link.href = doc.fileUrl;
        // link.download = doc.filename;
        // link.click();
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
                                                <td>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                                        📄 <strong>{doc.filename}</strong>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge badge-${doc.lot === 'Structure' ? 'purple' :
                                                        doc.lot === 'CVC' ? 'blue' : 'gray'
                                                        }`}>
                                                        {doc.lot}
                                                    </span>
                                                </td>
                                                <td>v{doc.version}</td>
                                                <td>{doc.uploadedBy.name}</td>
                                                <td>{new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                                        <button
                                                            className="btn btn-sm btn-ghost"
                                                            onClick={() => handleViewDocument(doc)}
                                                        >
                                                            👁️ Voir
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-ghost"
                                                            onClick={() => handleDownloadDocument(doc)}
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
                onSuccess={(newDoc) => {
                    // Add to current folder's documents
                    if (newDoc.folder === selectedFolder) {
                        setDocuments([...documents, newDoc]);
                    }
                }}
            />
        </div>
    );
}
