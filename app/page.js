'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // For now, redirect to a simple info page
    // Later this will check auth and redirect accordingly
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gradient-primary)',
      color: 'white',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
          BET Platform
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
          Plateforme Collaborative pour Bureau d'Études
        </p>
        <p style={{ marginBottom: '2rem' }}>
          Gestion de projets • Coordination inter-lots • Suivi des livrables
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/projects"
            className="btn btn-lg"
            style={{
              background: 'white',
              color: 'var(--color-primary)',
              padding: '1rem 2rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontWeight: 600,
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            Voir les projets
          </a>
          <a
            href="/auth/login"
            className="btn btn-lg btn-ghost"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              fontWeight: 600,
              backdropFilter: 'blur(10px)'
            }}
          >
            Se connecter
          </a>
        </div>

        <div style={{ marginTop: '3rem', fontSize: '0.875rem', opacity: 0.8 }}>
          <p>Projet ADS 2024 • Bureau d'Études Technique</p>
        </div>
      </div>
    </div>
  );
}
