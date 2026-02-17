'use client'
import { DollarSign, ShieldAlert, Activity, TrendingUp } from 'lucide-react'

export default function ROIAnalytics() {
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
                    <Activity size={40} color="#10b981" />
                    ROI & Impact Analytics
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>
                    Quantifiable business value delivered by CodeGuardian AI.
                </p>
            </div>

            {/* 💰 BIG STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>

                <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <DollarSign color="#10b981" size={24} />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981' }}>$142k</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)' }}>Proactive Savings (YTD)</div>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <ShieldAlert color="#ef4444" size={24} />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ef4444' }}>156</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)' }}>Vulnerabilities Blocked</div>
                </div>

                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.2)', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <TrendingUp color="#3b82f6" size={24} />
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#3b82f6' }}>+32%</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)' }}>Code Quality Index</div>
                </div>

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* 📈 12-WEEK TREND CHART */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    padding: '2rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Quality Trend (12 Weeks)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {[65, 68, 70, 72, 75, 74, 78, 80, 82, 85, 87, 89].map((val, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '6%' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${(val - 50) * 4}px`,
                                    background: i > 8 ? '#10b981' : 'rgba(255,255,255,0.2)',
                                    borderRadius: '4px'
                                }} />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                        <span>Week 1 (65/100)</span>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>Current (89/100)</span>
                    </div>
                </div>

                {/* 📊 COST SAVINGS BREAKDOWN */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    padding: '2rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Savings Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Security (XSS, SQL, Auth)</span>
                                <span style={{ fontWeight: 'bold' }}>$78,000</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                <div style={{ width: '65%', height: '100%', background: '#ef4444', borderRadius: '4px' }} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Performance (Latency, Memory)</span>
                                <span style={{ fontWeight: 'bold' }}>$12,000</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                <div style={{ width: '15%', height: '100%', background: '#f59e0b', borderRadius: '4px' }} />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Maintenance (Refactoring)</span>
                                <span style={{ fontWeight: 'bold' }}>$52,000</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                <div style={{ width: '45%', height: '100%', background: '#3b82f6', borderRadius: '4px' }} />
                            </div>
                        </div>

                    </div>

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', textAlign: 'center', color: '#10b981' }}>
                        Projected Annual Savings: <strong>$215,000</strong>
                    </div>
                </div>

            </div>

        </div>
    )
}
