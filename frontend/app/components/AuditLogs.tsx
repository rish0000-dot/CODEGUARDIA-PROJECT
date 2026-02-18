'use client'
import { useState, useEffect } from 'react'
import { FileText, Search, Filter, Download, ChevronLeft, ChevronRight, Loader2, ShieldAlert, CheckCircle, User, Activity } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

interface Log {
    id: string
    timestamp: string
    user: string
    action: string
    details: string
}

export default function AuditLogs() {
    const { user } = useAuth()
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalLogs, setTotalLogs] = useState(0)
    const [filters, setFilters] = useState({
        user: '',
        action: ''
    })
    const [isExporting, setIsExporting] = useState(false)

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('http://localhost:5000/api/admin/audit-logs', {
                params: {
                    page,
                    limit: 10,
                    user: filters.user || undefined,
                    action: filters.action || undefined
                },
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                setLogs(response.data.logs)
                setTotalPages(response.data.totalPages)
                setTotalLogs(response.data.total)
            }
        } catch (err) {
            console.error('Failed to fetch audit logs:', err)
            toast.error('Failed to load audit logs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLogs()
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [page, filters])

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('http://localhost:5000/api/admin/audit-logs/export', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            toast.success('Audit logs exported successfully')
        } catch (err) {
            console.error('Export failed:', err)
            toast.error('Failed to export logs')
        } finally {
            setIsExporting(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        })
    }

    const getActionColor = (action: string) => {
        if (action.includes('DELETE') || action.includes('failed') || action.includes('DENIED')) return '#ef4444' // Red
        if (action.includes('CREATED') || action.includes('SUCCESS') || action.includes('ENABLED')) return '#10b981' // Green
        if (action.includes('LOGIN')) return '#3b82f6' // Blue
        return '#f59e0b' // Yellow/Orange default
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'white' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShieldAlert size={32} color="#f59e0b" /> Security Audit Logs
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                        Track and monitor all sensitive system activities.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)'
                    }}>
                        Total Events: <span style={{ color: 'white', fontWeight: '700' }}>{totalLogs}</span>
                    </div>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            border: 'none', borderRadius: '12px', color: 'white', fontWeight: '600',
                            cursor: isExporting ? 'wait' : 'pointer',
                            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'
            }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                    <input
                        type="text" placeholder="Filter by User..."
                        value={filters.user}
                        onChange={(e) => { setFilters({ ...filters, user: e.target.value }); setPage(1); }}
                        style={{
                            width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem',
                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px', color: 'white', outline: 'none', fontSize: '0.9rem'
                        }}
                    />
                </div>
                <div style={{ position: 'relative' }}>
                    <Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                    <input
                        type="text" placeholder="Filter by Action (e.g. LOGIN)..."
                        value={filters.action}
                        onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(1); }}
                        style={{
                            width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem',
                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px', color: 'white', outline: 'none', fontSize: '0.9rem'
                        }}
                    />
                </div>
            </div>

            {/* Logs Table */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 3fr',
                    padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase'
                }}>
                    <div>Timestamp</div>
                    <div>User</div>
                    <div>Action</div>
                    <div>Details</div>
                </div>

                <div style={{ minHeight: '300px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'rgba(255,255,255,0.4)' }}>
                            <Loader2 className="animate-spin" size={32} style={{ marginBottom: '1rem' }} />
                            Loading logs...
                        </div>
                    ) : logs.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'rgba(255,255,255,0.4)' }}>
                            <Activity size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            No audit logs found.
                        </div>
                    ) : (
                        logs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 3fr',
                                    padding: '1.25rem 1.5rem',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    alignItems: 'center',
                                    fontSize: '0.9rem',
                                    color: 'rgba(255,255,255,0.8)'
                                }}
                                className="hover:bg-white/5 transition-colors"
                            >
                                <div style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                                    {formatDate(log.timestamp)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                                    <User size={14} color="rgba(255,255,255,0.5)" />
                                    {log.user}
                                </div>
                                <div>
                                    <span style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                                        background: `${getActionColor(log.action)}20`,
                                        color: getActionColor(log.action),
                                        border: `1px solid ${getActionColor(log.action)}40`
                                    }}>
                                        {log.action}
                                    </span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.details}>
                                    {log.details || '-'}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div style={{
                    padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        style={{
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px', padding: '0.5rem', color: 'white',
                            cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1
                        }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                        Page <span style={{ color: 'white', fontWeight: '700' }}>{page}</span> of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                        style={{
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px', padding: '0.5rem', color: 'white',
                            cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1
                        }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}
