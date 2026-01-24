'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal/Modal';

export default function AssignUserModal({ isOpen, onClose, projectId, currentAssignedUsers, onSuccess }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();

            if (response.ok) {
                setUsers(data.users || []);
            } else {
                setError('Erreur lors du chargement des utilisateurs');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Erreur lors du chargement');
        }
    };

    const handleAssign = async (userId) => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(`/api/projects/${projectId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'assignation');
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Assign error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUnassign = async (userId) => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(`/api/projects/${projectId}/assign?userId=${userId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors du retrait');
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Unassign error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const isUserAssigned = (userId) => {
        return currentAssignedUsers?.some(u => u.id === userId);
    };

    const getRoleBadge = (role) => {
        const badges = {
            CHEF_DE_PROJET: { label: 'Chef de Projet', color: 'purple' },
            REFERENT_LOT: { label: 'Référent Lot', color: 'blue' },
            CONTRIBUTEUR: { label: 'Contributeur', color: 'green' },
            EXTERNE: { label: 'Externe', color: 'gray' },
        };
        return badges[role] || { label: role, color: 'gray' };
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="👥 Gérer l'équipe du projet">
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

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {users.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--color-gray-400)', padding: '2rem' }}>
                        Aucun utilisateur disponible
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        {users.map((user) => {
                            const assigned = isUserAssigned(user.id);
                            const roleBadge = getRoleBadge(user.role);

                            return (
                                <div
                                    key={user.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--spacing-md)',
                                        border: '2px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        background: assigned ? 'var(--color-success-light)' : 'var(--color-surface)',
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                                            {user.name}
                                        </div>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', fontSize: 'var(--font-size-sm)' }}>
                                            <span className={`badge badge-${roleBadge.color}`}>
                                                {roleBadge.label}
                                            </span>
                                            {user.lot && (
                                                <span className="badge badge-blue">{user.lot}</span>
                                            )}
                                            <span style={{ color: 'var(--color-gray-500)' }}>{user.email}</span>
                                        </div>
                                    </div>
                                    <button
                                        className={`btn btn-sm ${assigned ? 'btn-danger' : 'btn-primary'}`}
                                        onClick={() => assigned ? handleUnassign(user.id) : handleAssign(user.id)}
                                        disabled={loading}
                                    >
                                        {assigned ? '❌ Retirer' : '✅ Assigner'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--color-border)' }}>
                <button
                    className="btn btn-ghost"
                    onClick={onClose}
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    Fermer
                </button>
            </div>
        </Modal>
    );
}
