'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Lead {
    id: string;
    created_at: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    city: string;
    is_commercial: boolean;
    estimate_range: string;
}

export default function AdminDashboard() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/admin/login');
            } else {
                fetchLeads();
            }
        };
        checkUser();
    }, [router]);

    const fetchLeads = async () => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching leads:', error.message);
        } else {
            setLeads(data || []);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    if (loading) {
        return (
            <div className="main-wrapper" style={{ justifyContent: 'center' }}>
                <p>Loading leads...</p>
            </div>
        );
    }

    return (
        <main className="main-wrapper" style={{ flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Lead <span>Dashboard</span></h1>
                <button onClick={handleLogout} style={{ width: 'auto', padding: '10px 20px', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                    Logout
                </button>
            </div>

            <div className="form-card" style={{ padding: '20px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Date</th>
                            <th style={{ padding: '12px' }}>Name</th>
                            <th style={{ padding: '12px' }}>Contact</th>
                            <th style={{ padding: '12px' }}>Location</th>
                            <th style={{ padding: '12px' }}>18-Wheeler</th>
                            <th style={{ padding: '12px' }}>Estimate</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>No leads found yet.</td>
                            </tr>
                        ) : (
                            leads.map((lead) => (
                                <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                                        {new Date(lead.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {lead.first_name} {lead.last_name}
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                                        {lead.email}<br />
                                        <span style={{ color: 'var(--gold)' }}>{lead.phone}</span>
                                    </td>
                                    <td style={{ padding: '12px' }}>{lead.city}</td>
                                    <td style={{ padding: '12px' }}>
                                        {lead.is_commercial ? '✅ Yes' : '❌ No'}
                                    </td>
                                    <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--gold)' }}>
                                        {lead.estimate_range}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
