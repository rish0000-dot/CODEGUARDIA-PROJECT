'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import {
    ShieldAlert,
    FileDown,
    Search,
    Filter,
    Calendar,
    User,
    Activity,
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
}

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchUser, setSearchUser] = useState('');
    const [searchAction, setSearchAction] = useState('');
    const { token } = useAuth();

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/audit-logs', {
                params: {
                    page,
                    limit: 10,
                    user: searchUser,
                    action: searchAction
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setLogs(response.data.logs);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            toast.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, token]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchLogs();
    };

    const exportCSV = async () => {
        try {
            const response = await axios.get('/api/admin/audit-logs/export', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Audit logs exported to CSV');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            full: date.toLocaleString()
        };
    };

    const getActionColor = (action: string) => {
        if (action.includes('FAILED') || action.includes('DENIED')) return 'text-red-400 bg-red-400/10 border-red-400/20';
        if (action.includes('SUCCESS') || action.includes('ENABLED')) return 'text-green-400 bg-green-400/10 border-green-400/20';
        if (action.includes('ROLE')) return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Security Audit Logs</h1>
                    <p className="text-gray-400 mt-2 font-medium italic">Immutable ledger of enterprise system activities</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportCSV}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                    >
                        <FileDown className="w-5 h-5" />
                        Export CSV
                    </button>
                    <button
                        onClick={fetchLogs}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 border border-white/10 p-6 rounded-[24px]">
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter by User Email"
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                </div>
                <div className="relative group">
                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Filter by Action"
                        value={searchAction}
                        onChange={(e) => setSearchAction(e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                </div>
                <button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all">
                    <Search className="w-4 h-4" />
                    Search Logs
                </button>
            </form>

            {/* Timeline View */}
            <div className="relative space-y-6">
                <div className="absolute left-8 top-0 bottom-0 w-px bg-white/10 z-0" />

                <AnimatePresence mode="popLayout">
                    {logs.map((log, index) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative z-10 grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] gap-6"
                        >
                            <div className="flex flex-col items-center pt-1">
                                <div className="text-gray-500 font-black text-sm">{formatDate(log.timestamp).time}</div>
                                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Today</div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-all group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl border ${getActionColor(log.action)}`}>
                                            <ShieldAlert className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-white font-bold">{log.user}</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm mt-1">{log.details || 'No additional parameters'}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-600 font-mono group-hover:text-gray-500 transition-colors">
                                        {log.id}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {logs.length === 0 && !loading && (
                    <div className="py-20 text-center text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-xl font-bold">No events recorded for these filters</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl p-4">
                <div className="text-sm text-gray-500">
                    Showing <span className="text-white font-bold">{(page - 1) * 10 + 1}-{Math.min(page * 10, 100)}</span> of <span className="text-white font-bold">Recent Activity</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 font-bold">
                        Page {page} of {totalPages}
                    </div>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
