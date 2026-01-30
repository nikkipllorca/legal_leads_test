'use client';

import { useEffect, useState } from 'react';

interface Profile {
    id: string;
    email: string;
    role: string;
}

export default function UserManagement() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'editor' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (!data.error) setProfiles(data);
        setLoading(false);
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, role: newRole }),
        });

        if (res.ok) fetchProfiles();
        else alert('Failed to update role');
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAdding(true);
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        });

        if (res.ok) {
            setNewUser({ email: '', password: '', role: 'editor' });
            fetchProfiles();
        } else {
            const data = await res.json();
            alert('Error: ' + data.error);
        }
        setIsAdding(false);
    };

    if (loading) return <p>Loading users...</p>;

    return (
        <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>User <span>Management</span></h2>
            </div>

            <div className="form-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3>Add New User</h3>
                <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group" style={{ flex: 1, minWidth: '200px' }}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group" style={{ minWidth: '120px' }}>
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button type="submit" disabled={isAdding} style={{ padding: '12px 24px', width: 'auto' }}>
                        {isAdding ? 'Adding...' : 'Add User'}
                    </button>
                </form>
            </div>

            <div className="form-card" style={{ padding: '20px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Email</th>
                            <th style={{ padding: '12px' }}>Role</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px' }}>{p.email}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        background: p.role === 'admin' ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                                        color: p.role === 'admin' ? 'black' : 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {p.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <select
                                        value={p.role}
                                        onChange={(e) => handleUpdateRole(p.id, e.target.value)}
                                        style={{ padding: '4px', fontSize: '0.8rem', width: 'auto' }}
                                    >
                                        <option value="editor">Make Editor</option>
                                        <option value="admin">Make Admin</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
