export default function LoadingSpinner({ fullScreen = false, message = "Chargement..." }) {
    const containerStyle = fullScreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background)',
        zIndex: 9999,
    } : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
    };

    return (
        <div style={containerStyle}>
            <div className="spinner-container">
                <div className="spinner"></div>
                <div className="spinner-glow"></div>
            </div>
            {message && (
                <p style={{
                    marginTop: '1.5rem',
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                    fontWeight: 500,
                }}>{message}</p>
            )}

            <style jsx>{`
                .spinner-container {
                    position: relative;
                    width: 60px;
                    height: 60px;
                }

                .spinner {
                    width: 60px;
                    height: 60px;
                    border: 4px solid var(--color-border);
                    border-top-color: var(--color-primary);
                    border-radius: 50%;
                    animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
                }

                .spinner-glow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.1);
                    }
                }
            `}</style>
        </div>
    );
}
