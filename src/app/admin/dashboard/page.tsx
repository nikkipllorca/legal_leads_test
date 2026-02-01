'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import UserManagement from '@/components/UserManagement';

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
    is_archived: boolean;
}

export default function AdminDashboard() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'leads' | 'users'>('leads');
    const [showArchived, setShowArchived] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/admin/login');
            } else {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                setRole(profile?.role || 'editor');
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

        if (error) console.error('Error fetching leads:', error.message);
        else setLeads(data || []);
        setLoading(false);
    };

    const handleArchive = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('leads')
            .update({ is_archived: !currentStatus })
            .eq('id', id);

        if (error) alert('Error updating lead: ' + error.message);
        else fetchLeads();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to PERMANENTLY delete this lead?')) return;

        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) alert('Error deleting lead: ' + error.message);
        else fetchLeads();
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    if (loading) {
        return (
            <div className="main-wrapper" style={{ justifyContent: 'center' }}>
                <p>Loading...</p>
            </div>
        );
    }

    const filteredLeads = leads.filter(lead => lead.is_archived === showArchived);

    return (
        <main className="main-wrapper" style={{ flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Admin <span>Portal</span></h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleLogout} style={{ width: 'auto', padding: '10px 20px', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                        Logout
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px' }}>
                <button
                    onClick={() => setActiveTab('leads')}
                    style={{
                        background: 'none',
                        color: activeTab === 'leads' ? 'var(--gold)' : 'white',
                        borderBottom: activeTab === 'leads' ? '2px solid var(--gold)' : 'none',
                        padding: '10px',
                        borderRadius: '0',
                        width: 'auto',
                        cursor: 'pointer'
                    }}
                >
                    Leads
                </button>
                {role === 'admin' && (
                    <button
                        onClick={() => setActiveTab('users')}
                        style={{
                            background: 'none',
                            color: activeTab === 'users' ? 'var(--gold)' : 'white',
                            borderBottom: activeTab === 'users' ? '2px solid var(--gold)' : 'none',
                            padding: '10px',
                            borderRadius: '0',
                            width: 'auto',
                            cursor: 'pointer'
                        }}
                    >
                        User Management
                    </button>
                )}
            </div>

            {activeTab === 'leads' ? (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowArchived(false)}
                                style={{
                                    width: 'auto',
                                    padding: '8px 16px',
                                    background: !showArchived ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                                    color: !showArchived ? 'black' : 'white'
                                }}
                            >
                                Active Leads
                            </button>
                            <button
                                onClick={() => setShowArchived(true)}
                                style={{
                                    width: 'auto',
                                    padding: '8px 16px',
                                    background: showArchived ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                                    color: showArchived ? 'black' : 'white'
                                }}
                            >
                                Archived
                            </button>
                        </div>
                        {showArchived && role === 'admin' && filteredLeads.length > 0 && (
                            <button
                                onClick={async () => {
                                    if (!confirm('Are you sure you want to PERMANENTLY delete ALL archived leads?')) return;
                                    const { error } = await supabase.from('leads').delete().eq('is_archived', true);
                                    if (error) alert('Error: ' + error.message);
                                    else fetchLeads();
                                }}
                                style={{
                                    width: 'auto',
                                    padding: '8px 16px',
                                    background: '#ff4444',
                                    color: 'white',
                                    fontSize: '0.8rem'
                                }}
                            >
                                Empty Archive
                            </button>
                        )}
                    </div>

                    <div className="form-card" style={{ padding: '20px', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                    <th style={{ padding: '12px' }}>Date</th>
                                    <th style={{ padding: '12px' }}>Name</th>
                                    <th style={{ padding: '12px' }}>Contact</th>
                                    <th style={{ padding: '12px' }}>Location</th>
                                    <th style={{ padding: '12px' }}>Estimate</th>
                                    <th style={{ padding: '12px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>
                                            No {showArchived ? 'archived' : 'active'} leads found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                                                {new Date(lead.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {lead.first_name} {lead.last_name}
                                                {lead.is_commercial && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--gold)' }}>🚛 18-Wheeler</span>}
                                            </td>
                                            <td style={{ padding: '12px', fontSize: '0.85rem' }}>
                                                {lead.email}<br />
                                                <span style={{ color: 'var(--gold)' }}>{lead.phone}</span>
                                            </td>
                                            <td style={{ padding: '12px' }}>{lead.city}</td>
                                            <td style={{ padding: '12px', fontWeight: 'bold', color: 'var(--gold)' }}>
                                                {lead.estimate_range}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <button
                                                        onClick={() => handleArchive(lead.id, lead.is_archived)}
                                                        style={{ padding: '5px 10px', fontSize: '0.75rem', width: 'auto' }}
                                                    >
                                                        {lead.is_archived ? 'Unarchive' : 'Archive'}
                                                    </button>
                                                    {role === 'admin' && (
                                                        <button
                                                            onClick={() => handleDelete(lead.id)}
                                                            style={{ padding: '5px 10px', fontSize: '0.75rem', width: 'auto', background: '#ff4444', color: 'white' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <UserManagement />
            )}
        </main>
    );
}

