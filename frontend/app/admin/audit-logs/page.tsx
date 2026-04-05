'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Filter, Download, Calendar, User, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
    ip: string;
    userAgent: string;
}

export default function AuditLogsPage() {
    const { user: currentUser } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/audit-logs');
            const data = await res.json();
            if (res.ok) {
                setLogs(data.logs || []);
            } else {
                toast.error('Failed to load audit logs');
            }
        } catch (err) {
            toast.error('Connection error');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            window.location.href = '/api/admin/audit-logs/export';
            toast.success('Export started...');
        } catch (err) {
            toast.error('Export failed');
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = filterAction === 'ALL' || log.action === filterAction;
        return matchesSearch && matchesAction;
    });

    const uniqueActions = ['ALL', ...Array.from(new Set(logs.map(l => l.action)))];

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a16', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Shield size={40} style={{ color: '#8b5cf6' }} /> Audit Logs
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Monitor all security and authentication events across the system.</p>
                    </div>
                    <button
                        onClick={handleExport}
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px', padding: '0.75rem 1.5rem', color: 'white', fontWeight: '600',
                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        <Download size={18} /> Export CSV
                    </button>
                </div>

                {/* FILTERS */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ flex: 2, position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                        <input
                            type="text" placeholder="Search by user, action or details..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            style={inputStyle}
                        />
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Filter size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                        <select
                            value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
                            style={{ ...inputStyle, paddingLeft: '3rem', appearance: 'none' }}
                        >
                            {uniqueActions.map(action => <option key={action} value={action} style={{ background: '#13132b' }}>{action}</option>)}
                        </select>
                    </div>
                </div>

                {/* LOGS TABLE */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                    <th style={{ padding: '1.25rem 1.5rem' }}>Timestamp</th>
                                    <th style={{ padding: '1.25rem 1.5rem' }}>User</th>
                                    <th style={{ padding: '1.25rem 1.5rem' }}>Action</th>
                                    <th style={{ padding: '1.25rem 1.5rem' }}>Details</th>
                                    <th style={{ padding: '1.25rem 1.5rem' }}>Origin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading logs...</td></tr>
                                ) : filteredLogs.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No matching logs found.</td></tr>
                                ) : (
                                    filteredLogs.map(log => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.95rem' }}>
                                            <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }}>
                                                <div style={{ color: 'rgba(255,255,255,0.8)' }}>{new Date(log.timestamp).toLocaleDateString()}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <User size={14} style={{ color: '#3b82f6' }} />
                                                    {log.user}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                <span style={{
                                                    padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
                                                    background: getActionColor(log.action).bg, color: getActionColor(log.action).text
                                                }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{log.details}</td>
                                            <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }}>
                                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{log.ip}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>{log.userAgent.split(' ')[0]}</div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

const getActionColor = (action: string) => {
    if (action.includes('FAILED') || action.includes('LOCKED')) return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' };
    if (action.includes('CREATED') || action.includes('SUCCESS')) return { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' };
    if (action.includes('RESET')) return { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' };
    return { bg: 'rgba(255, 255, 255, 0.1)', text: 'rgba(255, 255, 255, 0.8)' };
};

const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px', padding: '1rem 1rem 1rem 3rem', color: 'white', fontSize: '1rem', outline: 'none'
};
