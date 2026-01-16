'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/permissions';
import styles from './users.module.css';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        role: 'CONTRIBUTEUR',
        lot: '',
        password: 'demo123',
    });

    const roles = [
        { value: 'CHEF_DE_PROJET', label: 'Chef de Projet', description: 'Accès complet à tout' },
        { value: 'REFERENT_LOT', label: 'Référent Lot', description: 'Gestion d\'un lot spécifique' },
        { value: 'CONTRIBUTEUR', label: 'Contributeur', description: 'Consultation et édition limitée' },
        { value: 'EXTERNE', label: 'Externe (MOA/Architecte)', description: 'Lecture seule et validations' },
    ];

    const lots = ['Structure', 'CVC', 'Électricité', 'Plomberie', 'VRD', 'Façades'];

    useEffect(() => {
        if (user) {
            if (!hasPermission(user.role, 'MANAGE_USERS')) {
                router.push('/projects');
                return;
            }
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/users');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur de chargement');
            }

            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const url = editingUser ? '/api/users' : '/api/users';
            const method = editingUser ? 'PUT' : 'POST';
            const body = editingUser
                ? { id: editingUser.id, ...formData }
                : formData;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur');
            }

            if (editingUser) {
                setUsers(users.map(u => u.id === data.user.id ? data.user : u));
            } else {
                setUsers([data.user, ...users]);
            }

            closeModal();
        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setSubmitting(true);

        try {
            const response = await fetch(`/api/users?id=${deleteConfirm.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur de suppression');
            }

            setUsers(users.filter(u => u.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const openEditModal = (userToEdit) => {
        setEditingUser(userToEdit);
        setFormData({
            email: userToEdit.email,
            name: userToEdit.name,
            role: userToEdit.role,
            lot: userToEdit.lot || '',
            password: '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({
            email: '',
            name: '',
            role: 'CONTRIBUTEUR',
            lot: '',
            password: 'demo123',
        });
        setError('');
    };

    const getRoleLabel = (role) => {
        const r = roles.find(r => r.value === role);
        return r ? r.label : role;
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            CHEF_DE_PROJET: 'purple',
            REFERENT_LOT: 'blue',
            CONTRIBUTEUR: 'green',
            EXTERNE: 'gray',
        };
        return colors[role] || 'gray';
    };

    if (!user || !hasPermission(user.role, 'MANAGE_USERS')) {
        return <div>Accès refusé</div>;
    }

    return (
        <div className={styles.page}>
            <Navigation user={user} />

            <div className={styles.pageHeader}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <div>
                            <h1 className={styles.pageTitle}>👥 Gestion des Utilisateurs</h1>
                            <p className={styles.pageSubtitle}>
                                Créez et gérez les comptes utilisateurs de la plateforme
                            </p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowModal(true)}
                        >
                            ➕ Nouvel Utilisateur
                        </button>
                    </div>
                </div>
            </div>

            <div className="container">
                {error && (
                    <div className={styles.errorBanner}>
                        ⚠️ {error}
                        <button onClick={() => setError('')}>✕</button>
                    </div>
                )}

                {loading ? (
                    <div className={styles.loading}>Chargement...</div>
                ) : users.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>👤</div>
                        <h2>Aucun utilisateur</h2>
                        <p>Créez votre premier utilisateur pour commencer</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowModal(true)}
                        >
                            ➕ Créer un utilisateur
                        </button>
                    </div>
                ) : (
                    <div className={styles.usersTable}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Utilisateur</th>
                                    <th>Email</th>
                                    <th>Rôle</th>
                                    <th>Lot</th>
                                    <th>Créé le</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar}>
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className={styles.userName}>{u.name}</span>
                                            </div>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>
                                            <span className={`badge badge-${getRoleBadgeColor(u.role)}`}>
                                                {getRoleLabel(u.role)}
                                            </span>
                                        </td>
                                        <td>{u.lot || '-'}</td>
                                        <td>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => openEditModal(u)}
                                                    title="Modifier"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => setDeleteConfirm(u)}
                                                    title="Supprimer"
                                                    disabled={u.id === user.id}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingUser ? '✏️ Modifier l\'utilisateur' : '➕ Nouvel utilisateur'}</h2>
                            <button className={styles.closeBtn} onClick={closeModal}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className={styles.modalBody}>
                                {error && <div className={styles.formError}>{error}</div>}

                                <div className={styles.formGroup}>
                                    <label>Nom complet *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Marie Dupont"
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="marie@example.com"
                                        required
                                        disabled={!!editingUser}
                                    />
                                </div>

                                {!editingUser && (
                                    <div className={styles.formGroup}>
                                        <label>Mot de passe</label>
                                        <input
                                            type="text"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="demo123"
                                        />
                                        <small>Par défaut: demo123</small>
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label>Rôle *</label>
                                    <div className={styles.roleOptions}>
                                        {roles.map((role) => (
                                            <label
                                                key={role.value}
                                                className={`${styles.roleOption} ${formData.role === role.value ? styles.selected : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value={role.value}
                                                    checked={formData.role === role.value}
                                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                />
                                                <div>
                                                    <strong>{role.label}</strong>
                                                    <span>{role.description}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {(formData.role === 'REFERENT_LOT' || formData.role === 'CONTRIBUTEUR') && (
                                    <div className={styles.formGroup}>
                                        <label>Lot assigné</label>
                                        <select
                                            value={formData.lot}
                                            onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                                        >
                                            <option value="">Sélectionner un lot</option>
                                            {lots.map((lot) => (
                                                <option key={lot} value={lot}>{lot}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeModal}
                                    disabled={submitting}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? '⏳ En cours...' : (editingUser ? 'Mettre à jour' : 'Créer l\'utilisateur')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>⚠️ Supprimer l'utilisateur</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Êtes-vous sûr de vouloir supprimer <strong>{deleteConfirm.name}</strong> ?</p>
                            <p className={styles.warningText}>
                                Cette action est irréversible. L'utilisateur ne pourra plus se connecter.
                            </p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={submitting}
                            >
                                Annuler
                            </button>
                            <button
                                className={styles.deleteConfirmBtn}
                                onClick={handleDelete}
                                disabled={submitting}
                            >
                                {submitting ? '⏳ Suppression...' : '🗑️ Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
