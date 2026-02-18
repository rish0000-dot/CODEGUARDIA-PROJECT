'use client'
import { useRef, useState, useEffect } from 'react'
import { FileText, Download, Printer, Share2, Check, Loader2, Sparkles, TrendingUp, ShieldCheck, ArrowRight, Activity, Trash2, Calendar, Clock, Mail } from 'lucide-react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

export default function Reports() {
    const reportRef = useRef<HTMLDivElement>(null)
    const [isExporting, setIsExporting] = useState(false)
    const [isSharing, setIsSharing] = useState(false)
    const [showAutoModal, setShowAutoModal] = useState(false)
    const [scheduleType, setScheduleType] = useState('WEEKLY')
    const [autoLoading, setAutoLoading] = useState(false)
    const [recipient, setRecipient] = useState('')
    const [activeSchedules, setActiveSchedules] = useState<any[]>([])

    // Fetch active schedules
    const fetchSchedules = async () => {
        try {
            // Only admin can fetch/create schedules - handled by backend check usually, 
            // but we can wrap in try/catch to handle 403 gracefully if needed.
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/reports/automate', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setActiveSchedules(response.data.schedules);
            }
        } catch (err) {
            console.error('Failed to fetch schedules', err);
        }
    };

    useEffect(() => {
        if (showAutoModal) {
            fetchSchedules();
        }
    }, [showAutoModal]);

    const handleExport = async (type: 'pdf' | 'png') => {
        if (!reportRef.current) return

        setIsExporting(true)
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                backgroundColor: '#0f0f23',
                logging: false
            })

            if (type === 'png') {
                const link = document.createElement('a')
                link.download = `CodeGuardian-Report-${new Date().toISOString().split('T')[0]}.png`
                link.href = canvas.toDataURL('image/png')
                link.click()
                toast.success('Report downloaded as PNG')
            } else {
                const imgData = canvas.toDataURL('image/png')
                const pdf = new jsPDF('p', 'mm', 'a4')
                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
                pdf.save(`CodeGuardian-Report-${new Date().toISOString().split('T')[0]}.pdf`)
                toast.success('Report downloaded as PDF')
            }
        } catch (err) {
            toast.error('Export failed')
        } finally {
            setIsExporting(false)
        }
    }

    const handleShare = () => {
        setIsSharing(true)
        setTimeout(() => {
            setIsSharing(false)
            toast.success('Share link copied to clipboard')
            navigator.clipboard.writeText(window.location.href)
        }, 1500)
    }

    const handleAutomate = async () => {
        setAutoLoading(true)
        try {
            const token = localStorage.getItem('token')
            await axios.post('http://localhost:5000/api/reports/automate', {
                frequency: scheduleType,
                recipient: recipient || 'admin@codeguardian.ai', // Default to admin if empty
                reportType: 'SECURITY_SUMMARY'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            toast.success(`Report scheduled ${scheduleType.toLowerCase()}!`)
            setShowAutoModal(false)
        } catch (err) {
            toast.error('Failed to schedule report. Admin access required.')
        } finally {
            setAutoLoading(false)
        }
    }

    const handleDeleteSchedule = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/reports/automate/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Schedule deleted successfully');
            fetchSchedules(); // Refresh list
        } catch (err) {
            toast.error('Failed to delete schedule');
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'white' }}>

            {/* Header Controls */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: isExporting ? 'wait' : 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                        Export PDF
                    </button>
                    <button
                        onClick={() => handleExport('png')}
                        disabled={isExporting}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: isExporting ? 'wait' : 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                        Export PNG
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setShowAutoModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '700',
                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Clock size={18} />
                        Automate Report
                    </button>

                    <button
                        onClick={handleShare}
                        disabled={isSharing}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '600',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isSharing ? <Check size={18} /> : <Share2 size={18} />}
                        {isSharing ? 'Copied!' : 'Share Report'}
                    </button>
                </div>
            </div>

            {/* AUTOMATION MODAL */}
            <AnimatePresence>
                {showAutoModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1000,
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                background: '#13132b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '24px',
                                padding: '2rem',
                                width: '800px', // Wider for split view
                                maxWidth: '95vw',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '2rem'
                            }}
                        >
                            {/* LEFT: CREATE SCHEDULE */}
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Sparkles color="#ec4899" /> Automate Delivery
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                    Schedule recurring executive summaries sent directly to stakeholders.
                                </p>

                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '12px' }}>
                                    {['DAILY', 'WEEKLY', 'MONTHLY'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setScheduleType(type)}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: scheduleType === type ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                color: scheduleType === type ? 'white' : 'rgba(255,255,255,0.5)',
                                                fontWeight: '600',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>Recipient Email</label>
                                    <input
                                        type="email"
                                        placeholder="stakeholder@company.com"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '12px',
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'white',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                    />
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                                        * Defaults to your admin email if left blank.
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                                    <button
                                        onClick={() => setShowAutoModal(false)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            background: 'transparent',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: 'rgba(255,255,255,0.7)',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAutomate}
                                        disabled={autoLoading}
                                        style={{
                                            flex: 2,
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {autoLoading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                                        Confirm Schedule
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT: ACTIVE SCHEDULES */}
                            <div style={{
                                borderLeft: '1px solid rgba(255,255,255,0.1)',
                                paddingLeft: '2rem',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                                    Active Schedules
                                </h3>

                                <div style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', paddingRight: '0.5rem' }}>
                                    {activeSchedules.length === 0 ? (
                                        <div style={{
                                            height: '100%', display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center',
                                            color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontStyle: 'italic'
                                        }}>
                                            <Calendar size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                            No active automations.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {activeSchedules.map((schedule) => (
                                                <div key={schedule.id} style={{
                                                    background: 'rgba(255,255,255,0.03)',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    padding: '0.75rem',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {schedule.frequency}
                                                            <span style={{
                                                                fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '4px',
                                                                background: 'rgba(16, 185, 129, 0.2)', color: '#10b981'
                                                            }}>ACTIVE</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <Mail size={10} /> {schedule.recipient || 'Admin'}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteSchedule(schedule.id)}
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            width: '28px',
                                                            height: '28px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        title="Delete Schedule"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* REPORT PAPER */}
            <div
                ref={reportRef}
                style={{
                    background: 'white',
                    color: '#1e1b4b',
                    padding: '3rem',
                    borderRadius: '4px', // Paper-like
                    boxShadow: '0 0 50px rgba(0,0,0,0.5)',
                    minHeight: '1000px',
                    position: 'relative'
                }}
            >
                {/* PDF Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>
                            Security Audit Report
                        </h1>
                        <div style={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>
                            CodeGuardian Enterprise Analysis
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#6366f1' }}>CONFIDENTIAL</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>{new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Executive Summary */}
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity color="#6366f1" /> Executive Summary
                    </h2>
                    <p style={{ lineHeight: '1.6', color: '#475569', fontSize: '1rem' }}>
                        This automated audit analyzed the repository's codebase for security vulnerabilities, architectural integrity, and code quality.
                        The system detected <strong>3 critical issues</strong> that require immediate attention to prevent potential data breaches.
                        Overall code health is rated at <strong>B+</strong>, with strong performance metrics but areas for security hardening.
                    </p>
                </div>

                {/* Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {[
                        { label: 'Risk Score', value: '85/100', color: '#059669', icon: <ShieldCheck size={24} /> },
                        { label: 'Vulnerabilities', value: '3 Critical', color: '#dc2626', icon: <Activity size={24} /> },
                        { label: 'Tech Debt', value: 'Low', color: '#2563eb', icon: <TrendingUp size={24} /> },
                    ].map((metric, i) => (
                        <div key={i} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: metric.color }}>
                                {metric.icon}
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>{metric.value}</div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase' }}>{metric.label}</div>
                        </div>
                    ))}
                </div>

                {/* Key Findings Table */}
                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '1.5rem' }}>
                        Key Findings
                    </h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', borderRadius: '8px 0 0 8px', color: '#475569' }}>Severity</th>
                                <th style={{ padding: '1rem', color: '#475569' }}>Issue Type</th>
                                <th style={{ padding: '1rem', borderRadius: '0 8px 8px 0', color: '#475569' }}>Recommendation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { sev: 'CRITICAL', type: 'SQL Injection Risk', rec: 'Use parameterized queries in auth.ts' },
                                { sev: 'HIGH', type: 'Exposed API Keys', rec: 'Move secrets to .env file immediately' },
                                { sev: 'MEDIUM', type: 'Deprecated package', rec: 'Upgrade "request" library to "axios"' },
                            ].map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem', fontWeight: '700', color: row.sev === 'CRITICAL' ? '#dc2626' : row.sev === 'HIGH' ? '#ea580c' : '#ca8a04' }}>
                                        {row.sev}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#334155', fontWeight: '600' }}>{row.type}</td>
                                    <td style={{ padding: '1rem', color: '#475569' }}>{row.rec}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
                    <div>Generated by CodeGuardian AI Enterprise</div>
                    <div>Page 1 of 1</div>
                </div>
            </div>
        </div>
    )
}
