'use client';

import { useState } from 'react';

export default function TestAssignPage() {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const testAssign = async () => {
        setLoading(true);
        setResult('Testing...');

        try {
            // Get first project
            const projectsRes = await fetch('/api/projects');
            const projectsData = await projectsRes.json();
            const project = projectsData.projects[0];

            setResult(`Found project: ${project.name} (ID: ${project.id})\n`);

            // Get users
            const usersRes = await fetch('/api/users');
            const usersData = await usersRes.json();
            const user = usersData.users.find(u => u.role !== 'CHEF_DE_PROJET');

            setResult(prev => prev + `Found user: ${user.name} (ID: ${user.id})\n`);

            // Try to assign
            setResult(prev => prev + `\nAssigning ${user.name} to ${project.name}...\n`);

            const assignRes = await fetch(`/api/projects/${project.id}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            const assignData = await assignRes.json();

            if (assignRes.ok) {
                setResult(prev => prev + `✅ SUCCESS: ${JSON.stringify(assignData, null, 2)}\n`);
            } else {
                setResult(prev => prev + `❌ ERROR: ${JSON.stringify(assignData, null, 2)}\n`);
            }

            // Check if it's in the database
            setResult(prev => prev + `\nRechecking project...\n`);
            const recheckRes = await fetch(`/api/projects/${project.id}`);
            const recheckData = await recheckRes.json();

            setResult(prev => prev + `Assigned users: ${JSON.stringify(recheckData.project.assignedUsers, null, 2)}\n`);

        } catch (error) {
            setResult(prev => prev + `\n❌ EXCEPTION: ${error.message}\n${error.stack}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>🧪 Test Assignation API</h1>

            <button
                onClick={testAssign}
                disabled={loading}
                style={{
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    background: loading ? '#ccc' : '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginBottom: '2rem',
                }}
            >
                {loading ? 'Testing...' : '▶️ Run Test'}
            </button>

            <pre style={{
                background: '#1e1e1e',
                color: '#d4d4d4',
                padding: '1rem',
                borderRadius: '8px',
                overflow: 'auto',
                maxHeight: '600px',
                fontFamily: 'monospace',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
            }}>
                {result || 'Click "Run Test" to start...'}
            </pre>
        </div>
    );
}
