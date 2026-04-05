'use client'
import { useState, useEffect } from 'react'
import { Settings, Shield, Terminal, FileCode, CheckCircle2, Trash2, Plus, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Rule {
    id: string;
    name: string;
    pattern: string;
    severity: string;
    category: string;
    description: string;
}

export default function CustomRules() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRule, setNewRule] = useState({
        name: '',
        pattern: '',
        severity: 'MEDIUM',
        category: 'Security',
        description: ''
    });

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await fetch('/api/rules', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setRules(data.rules);
        } catch (e) { toast.error('Failed to fetch rules'); }
        finally { setLoading(false); }
    };

    const addRule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/rules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newRule)
            });
            const data = await res.json();
            if (data.success) {
                setRules([...rules, data.rule]);
                setShowAddForm(false);
                setNewRule({ name: '', pattern: '', severity: 'MEDIUM', category: 'Security', description: '' });
                toast.success('Rule added successfully');
            }
        } catch (e) { toast.error('Failed to add rule'); }
    };

    const deleteRule = async (id: string) => {
        try {
            const res = await fetch(`/api/rules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setRules(rules.filter(r => r.id !== id));
                toast.success('Rule deleted');
            }
        } catch (e) { toast.error('Failed to delete rule'); }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', color: 'white', paddingBottom: '5rem' }}>

            {/* HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem'
                }}>
                    <Settings size={40} color="#ec4899" />
                    Custom Rules Engine
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>
                    Configure specific patterns for the AI and Static Scanner to enforce.
                </p>

                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        marginTop: '2rem',
                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                        border: 'none',
                        padding: '0.75rem 2rem',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        margin: '2rem auto 0'
                    }}
                >
                    <Plus size={20} />
                    {showAddForm ? 'Cancel' : 'Create New Rule'}
                </button>
            </div>

            {/* ADD FORM */}
            {showAddForm && (
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    padding: '2rem',
                    marginBottom: '3rem'
                }}>
                    <form onSubmit={addRule} style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr 1fr' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Rule Name</label>
                            <input
                                type="text"
                                required
                                value={newRule.name}
                                onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                                placeholder="e.g. No Hardcoded Secrets"
                                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Regex Pattern</label>
                            <input
                                type="text"
                                required
                                value={newRule.pattern}
                                onChange={e => setNewRule({ ...newRule, pattern: e.target.value })}
                                placeholder="e.g. AI_KEY_[A-Z0-9]+"
                                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem', color: 'white' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Severity Level</label>
                            <select
                                value={newRule.severity}
                                onChange={e => setNewRule({ ...newRule, severity: e.target.value })}
                                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem', color: 'white' }}
                            >
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HIGH">HIGH</option>
                                <option value="CRITICAL">CRITICAL</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Category</label>
                            <input
                                type="text"
                                value={newRule.category}
                                onChange={e => setNewRule({ ...newRule, category: e.target.value })}
                                placeholder="e.g. Security"
                                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem', color: 'white' }}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Description</label>
                            <textarea
                                value={newRule.description}
                                onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                                placeholder="Describe what this rule prevents..."
                                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.75rem', color: 'white', minHeight: '80px' }}
                            />
                        </div>
                        <button type="submit" style={{ gridColumn: 'span 2', padding: '1rem', background: '#10b981', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer' }}>
                            💾 Save & Activate Rule
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {rules.map((rule) => (
                    <div key={rule.id}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
                            <div style={{
                                background: 'rgba(139, 92, 246, 0.1)',
                                padding: '1rem',
                                borderRadius: '12px'
                            }}>
                                <Terminal size={20} color="#8b5cf6" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'white' }}>
                                        {rule.name}
                                    </div>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        padding: '0.2rem 0.6rem',
                                        background: rule.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                                        borderRadius: '20px',
                                        fontWeight: '800'
                                    }}>{rule.severity}</span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                                    Pattern: <code style={{ color: '#00f5ff' }}>{rule.pattern}</code>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                                    {rule.description}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => deleteRule(rule.id)}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: 'none',
                                padding: '0.75rem',
                                borderRadius: '10px',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                {rules.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <AlertCircle size={40} color="rgba(255,255,255,0.2)" style={{ margin: '0 auto 1rem' }} />
                        <div style={{ color: 'rgba(255,255,255,0.4)' }}>No custom rules configured.</div>
                    </div>
                )}
            </div>

        </div>
    )
}
