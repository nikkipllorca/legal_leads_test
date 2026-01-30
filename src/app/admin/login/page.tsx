'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push('/admin/dashboard');
        }
    };

    return (
        <main className="main-wrapper" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div className="form-card" style={{ maxWidth: '400px', width: '100%' }}>
                <h2>Admin <span>Login</span></h2>
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '15px' }}>{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Access Dashboard'}
                    </button>
                </form>
            </div>
        </main>
    );
}
