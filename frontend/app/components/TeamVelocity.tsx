'use client'
import { Users, TrendingUp, Award, Zap, ShieldCheck } from 'lucide-react'

export default function TeamVelocity() {
    const teamMembers = [
        { name: 'Sarah J.', role: 'Senior Dev', score: 98, prs: 45, impact: 'High', avatar: '#ec4899' },
        { name: 'John D.', role: 'Full Stack', score: 95, prs: 38, impact: 'High', avatar: '#8b5cf6' },
        { name: 'Mike T.', role: 'Backend', score: 92, prs: 52, impact: 'Med', avatar: '#3b82f6' },
        { name: 'Emily R.', role: 'Frontend', score: 89, prs: 29, impact: 'Med', avatar: '#10b981' },
        { name: 'David L.', role: 'Junior Dev', score: 85, prs: 18, impact: 'Low', avatar: '#f59e0b' },
    ];

    const recentActivity = [
        { user: 'Sarah J.', action: 'fixed 3 critical XSS bugs', time: '2h ago', icon: <ShieldCheck size={16} color="#ef4444" /> },
        { user: 'Mike T.', action: 'improved API latency by 40%', time: '4h ago', icon: <Zap size={16} color="#f59e0b" /> },
        { user: 'John D.', action: 'merged 5 PRs with 100% score', time: '5h ago', icon: <Award size={16} color="#8b5cf6" /> },
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'white' }}>

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
                    <Users size={40} color="#3b82f6" />
                    Team Velocity & Impact
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>
                    Track developer performance, code quality trends, and educational growth.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>

                {/* 🏆 LEADERBOARD */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    padding: '2rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Award color="#f59e0b" /> Top Contributors
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {teamMembers.map((member, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: member.avatar,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '1.1rem', color: 'white'
                                    }}>
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{member.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{member.role}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: '#4ade80', fontWeight: '700' }}>{member.score}/100</div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{member.prs} PRs</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 📈 VELOCITY CHART (CSS MOCK) */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    padding: '2rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp color="#8b5cf6" /> Weekly Velocity
                    </h3>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {[65, 72, 68, 85, 92, 88, 95].map((height, i) => (
                            <div key={i} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${height * 1.5}px`,
                                    background: 'linear-gradient(to top, #3b82f6, #8b5cf6)',
                                    borderRadius: '8px 8px 0 0',
                                    opacity: 0.8,
                                    position: 'relative',
                                    transition: 'height 1s ease'
                                }}>
                                    {i === 6 && (
                                        <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', color: '#4ade80', fontWeight: 'bold' }}>
                                            +12%
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '1rem', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                        Avg Score: <strong style={{ color: '#4ade80' }}>89/100</strong> (Top 5% of teams)
                    </div>
                </div>

            </div>

            {/* ⚡ ACTIVITY FEED */}
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '24px',
                padding: '2rem',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
            }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Latest Team Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {recentActivity.map((activity, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            borderBottom: i !== recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                        }}>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                                {activity.icon}
                            </div>
                            <div>
                                <span style={{ fontWeight: '700', color: '#d1d5db' }}>{activity.user}</span> Using AI, {activity.action}.
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>{activity.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
