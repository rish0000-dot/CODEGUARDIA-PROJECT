'use client'
import { useState, useEffect } from 'react'
import { Slack, MessageSquare, Plus, Trash2, ExternalLink, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Webhook {
    id: string;
    type: 'Slack' | 'Discord';
    url: string;
    channel: string;
}

export default function Integrations() {
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newHook, setNewHook] = useState({
        type: 'Slack' as 'Slack' | 'Discord',
        url: '',
        channel: ''
    });

    useEffect(() => {
        fetchHooks();
    }, []);

    const fetchHooks = async () => {
        try {
            const res = await fetch('/api/webhooks', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) setWebhooks(data.webhooks);
        } catch (e) { toast.error('Failed to fetch webhooks'); }
        finally { setLoading(false); }
    };

    const addWebhook = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/webhooks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newHook)
            });
            const data = await res.json();
            if (data.success) {
                setWebhooks([...webhooks, data.webhook]);
                setShowAdd(false);
                setNewHook({ type: 'Slack', url: '', channel: '' });
                toast.success(`${newHook.type} integrated successfully`);
            }
        } catch (e) { toast.error('Integration failed'); }
    };

    const deleteWebhook = async (id: string) => {
        try {
            const res = await fetch(`/api/webhooks/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setWebhooks(webhooks.filter(h => h.id !== id));
                toast.success('Integration removed');
            }
        } catch (e) { toast.error('Failed to remove integration'); }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', color: 'white' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                    <Slack size={40} color="#4a154b" />
                    Team Integrations
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
                    Connect CodeGuardian to your team's communication channels.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '2rem' }}>
                {/* ADD NEW */}
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {!showAdd ? (
                        <button
                            onClick={() => setShowAdd(true)}
                            style={{ width: '100%', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '16px', color: 'rgba(255,255,255,0.5)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', 建设性: 'center', gap: '0.75rem' }}
                        >
                            <Plus size={24} /> Add new Slack or Discord Webhook
                        </button>
                    ) : (
                        <form onSubmit={addWebhook} style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['Slack', 'Discord'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setNewHook({ ...newHook, type: type as any })}
                                        style={{ flex: 1, padding: '1rem', background: newHook.type === type ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.2)', border: `2px solid ${newHook.type === type ? '#8b5cf6' : 'transparent'}`, borderRadius: '12px', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    >
                                        {type === 'Slack' ? <Slack size={18} /> : <MessageSquare size={18} />} {type}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="url"
                                placeholder="Webhook URL (https://hooks.slack.com/...)"
                                required
                                value={newHook.url}
                                onChange={e => setNewHook({ ...newHook, url: e.target.value })}
                                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', color: 'white' }}
                            />
                            <input
                                type="text"
                                placeholder="Channel Name (e.g. #security-alerts)"
                                required
                                value={newHook.channel}
                                onChange={e => setNewHook({ ...newHook, channel: e.target.value })}
                                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', color: 'white' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="submit" style={{ flex: 2, padding: '1rem', background: '#8b5cf6', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Connect Integration</button>
                                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    )}
                </div>

                {/* LIST */}
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {webhooks.map(hook => (
                        <div key={hook.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ background: hook.type === 'Slack' ? 'rgba(74, 21, 75, 0.2)' : 'rgba(88, 101, 242, 0.2)', padding: '1rem', borderRadius: '12px' }}>
                                    {hook.type === 'Slack' ? <Slack size={24} color="#4a154b" /> : <MessageSquare size={24} color="#5865f2" />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{hook.channel}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hook.url}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>ACTIVE</div>
                                <button
                                    onClick={() => deleteWebhook(hook.id)}
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '8px', color: '#ef4444', cursor: 'pointer' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {webhooks.length === 0 && !loading && (
                        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                            <AlertCircle size={32} style={{ margin: '0 auto 1rem' }} />
                            <div>No active integrations.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
