'use client';

import Modal from '@/components/Modal/Modal';

export default function PhaseChangeModal({ isOpen, onClose, currentPhase, nextPhase, onConfirm, loading }) {
    const getPhaseLabel = (phase) => {
        const phases = {
            ESQUISSE: 'ESQ - Esquisse',
            APS: 'APS - Avant-Projet Sommaire',
            APD: 'APD - Avant-Projet Définitif',
            PRO: 'PRO - Projet',
            DCE: 'DCE - Dossier de Consultation',
            ACT: 'ACT - Assistance Contrats',
            DET: 'DET - Direction Execution',
            AOR: 'AOR - Assistance Operations Reception',
        };
        return phases[phase] || phase;
    };

    const getPhaseIcon = (phase) => {
        const icons = {
            ESQUISSE: '📐',
            APS: '📝',
            APD: '📋',
            PRO: '🏗️',
            DCE: '📄',
            ACT: '🤝',
            DET: '👷',
            AOR: '✅',
        };
        return icons[phase] || '📊';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="🔄 Changer de Phase">
            <div style={{ padding: '1rem 0' }}>
                <p style={{
                    fontSize: '1.1rem',
                    marginBottom: '2rem',
                    color: 'var(--color-text)',
                    lineHeight: 1.6,
                }}>
                    Voulez-vous faire progresser le projet vers la phase suivante?
                </p>

                {/* Phase Transition Visual */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    padding: '2rem',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '2rem',
                }}>
                    {/* Current Phase */}
                    <div style={{
                        textAlign: 'center',
                        flex: 1,
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '0.5rem',
                        }}>
                            {getPhaseIcon(currentPhase)}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--color-gray-500)',
                            marginBottom: '0.25rem',
                        }}>
                            Phase actuelle
                        </div>
                        <div style={{
                            fontWeight: 600,
                            color: 'var(--color-text)',
                        }}>
                            {getPhaseLabel(currentPhase)}
                        </div>
                    </div>

                    {/* Arrow */}
                    <div style={{
                        fontSize: '2rem',
                        color: 'var(--color-primary)',
                        animation: 'pulse 2s ease-in-out infinite',
                    }}>
                        →
                    </div>

                    {/* Next Phase */}
                    <div style={{
                        textAlign: 'center',
                        flex: 1,
                    }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: '0.5rem',
                        }}>
                            {getPhaseIcon(nextPhase)}
                        </div>
                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--color-gray-500)',
                            marginBottom: '0.25rem',
                        }}>
                            Prochaine phase
                        </div>
                        <div style={{
                            fontWeight: 600,
                            color: 'var(--color-primary)',
                        }}>
                            {getPhaseLabel(nextPhase)}
                        </div>
                    </div>
                </div>

                {/* Warning */}
                <div style={{
                    padding: '1rem',
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                }}>
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'rgb(146, 64, 14)' }}>
                            Action importante
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'rgb(146, 64, 14)' }}>
                            Cette action sera enregistrée dans l'historique du projet et notifiera l'équipe.
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    justifyContent: 'flex-end',
                }}>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={onClose}
                        disabled={loading}
                        style={{ minWidth: '120px' }}
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onConfirm}
                        disabled={loading}
                        style={{
                            minWidth: '180px',
                            background: loading ? 'var(--color-gray-400)' : 'var(--gradient-primary)',
                        }}
                    >
                        {loading ? '⏳ Changement...' : '✅ Confirmer le changement'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 0.8;
                    }
                }
            `}</style>
        </Modal>
    );
}
