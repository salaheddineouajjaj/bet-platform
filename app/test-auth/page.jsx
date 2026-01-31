'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthDiagnosticPage() {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        runDiagnostics();
    }, []);

    async function runDiagnostics() {
        const diagnostics = {};

        // 1. Check Supabase session
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            diagnostics.session = {
                exists: !!session,
                email: session?.user?.email || 'N/A',
                token: session?.access_token ? 'Present' : 'Missing',
                tokenLength: session?.access_token?.length || 0,
                error: error?.message
            };
        } catch (e) {
            diagnostics.session = { error: e.message };
        }

        // 2. Check cookies
        try {
            diagnostics.cookies = {
                all: document.cookie,
                hasSupabase: document.cookie.includes('sb-'),
                count: document.cookie.split(';').length
            };
        } catch (e) {
            diagnostics.cookies = { error: e.message };
        }

        // 3. Test API with Authorization header
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch('/api/debug-auth', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            diagnostics.apiTest = {
                status: response.status,
                response: data
            };
        } catch (e) {
            diagnostics.apiTest = { error: e.message };
        }

        // 4. Test /api/projects directly
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const response = await fetch('/api/projects', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            let data;
            try {
                data = await response.json();
            } catch {
                data = { error: 'Could not parse JSON' };
            }

            diagnostics.projectsTest = {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                response: data,
                headers: Object.fromEntries(response.headers.entries())
            };
        } catch (e) {
            diagnostics.projectsTest = { error: e.message };
        }

        // 5. Environment check
        diagnostics.environment = {
            location: window.location.href,
            isLocalhost: window.location.hostname === 'localhost',
            isVercel: window.location.hostname.includes('vercel.app'),
            userAgent: navigator.userAgent
        };

        setResults(diagnostics);
        setLoading(false);
    }

    return (
        <div style={{
            padding: '2rem',
            fontFamily: 'monospace',
            backgroundColor: '#1a1a1a',
            color: '#0f0',
            minHeight: '100vh'
        }}>
            <h1 style={{ color: '#0f0' }}>🔍 BET Platform Auth Diagnostics</h1>

            {loading ? (
                <p>Running diagnostics...</p>
            ) : (
                <>
                    <button
                        onClick={runDiagnostics}
                        style={{
                            padding: '10px 20px',
                            margin: '20px 0',
                            backgroundColor: '#0f0',
                            color: '#000',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        🔄 Re-run Tests
                    </button>

                    <pre style={{
                        backgroundColor: '#000',
                        padding: '20px',
                        borderRadius: '8px',
                        overflow: 'auto',
                        maxHeight: '80vh'
                    }}>
                        {JSON.stringify(results, null, 2)}
                    </pre>

                    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#333', borderRadius: '8px' }}>
                        <h2>📋 Quick Analysis</h2>
                        {results.session?.exists ? (
                            <p style={{ color: '#0f0' }}>✅ Supabase session exists for: {results.session.email}</p>
                        ) : (
                            <p style={{ color: '#f00' }}>❌ No Supabase session found</p>
                        )}

                        {results.apiTest?.response?.success ? (
                            <p style={{ color: '#0f0' }}>✅ Debug API authenticated successfully</p>
                        ) : (
                            <p style={{ color: '#f00' }}>❌ Debug API failed: {results.apiTest?.response?.error || 'Unknown'}</p>
                        )}

                        {results.projectsTest?.ok ? (
                            <p style={{ color: '#0f0' }}>✅ Projects API responded OK</p>
                        ) : (
                            <p style={{ color: '#f00' }}>❌ Projects API failed with status: {results.projectsTest?.status}</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
