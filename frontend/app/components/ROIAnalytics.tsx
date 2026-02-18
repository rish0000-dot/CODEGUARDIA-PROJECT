'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Users, Clock, TrendingUp, Shield, BarChart3 } from 'lucide-react'

export default function ROIAnalytics() {
    const [teamSize, setTeamSize] = useState(10)
    const [hourlyRate, setHourlyRate] = useState(85)
    const [prVolume, setPrVolume] = useState(25)

    // Constants
    const MANUAL_REVIEW_TIME = 30 // minutes
    const AI_REVIEW_TIME = 3 // minutes
    const BREACH_COST_AVG = 4450000 // $4.45M avg cost of data breach
    const PLATFORM_COST = 299 * 12 // Annual platform cost

    // Calculations
    const timeSavedPerPR = (MANUAL_REVIEW_TIME - AI_REVIEW_TIME) / 60 // hours
    const totalHoursSaved = timeSavedPerPR * prVolume * 52 // Annual
    const hardSavings = totalHoursSaved * hourlyRate // $

    // Probabilistic risk avoidance (simplified model for UI)
    const riskFactor = Math.min(prVolume / 100, 0.5) // Cap at 50% risk based on velocity
    const riskAvoidanceValue = BREACH_COST_AVG * 0.01 * riskFactor // 1% chance * risk factor

    const totalValue = hardSavings + riskAvoidanceValue
    const roi = ((totalValue - PLATFORM_COST) / PLATFORM_COST) * 100

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'white' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{
                    fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #10b981, #0ea5e9)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                    ROI Impact Analysis
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
                    Calculate the value of AI-driven security for your organization.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', gap: '2rem' }}>

                {/* LEFT: INPUTS */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    padding: '2rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <SettingsSliderIcon /> Modeling Parameters
                    </h3>

                    {/* Team Size */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Engineering Team Size</label>
                            <span style={{ color: '#0ea5e9', fontWeight: '700' }}>{teamSize} devs</span>
                        </div>
                        <input
                            type="range" min="1" max="500" value={teamSize}
                            onChange={(e) => setTeamSize(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#0ea5e9' }}
                        />
                    </div>

                    {/* Hourly Rate */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Avg. Hourly Cost</label>
                            <span style={{ color: '#10b981', fontWeight: '700' }}>${hourlyRate}/hr</span>
                        </div>
                        <input
                            type="range" min="20" max="300" step="5" value={hourlyRate}
                            onChange={(e) => setHourlyRate(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#10b981' }}
                        />
                    </div>

                    {/* PR Volume */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Weekly PR Volume</label>
                            <span style={{ color: '#8b5cf6', fontWeight: '700' }}>{prVolume} scans</span>
                        </div>
                        <input
                            type="range" min="5" max="1000" step="5" value={prVolume}
                            onChange={(e) => setPrVolume(Number(e.target.value))}
                            style={{ width: '100%', accentColor: '#8b5cf6' }}
                        />
                    </div>

                    <div style={{
                        marginTop: '2rem', padding: '1rem', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <strong>💡 Benchmark:</strong> Enterprises with {teamSize} devs typically see a 30% velocity increase within 3 months.
                    </div>
                </div>

                {/* RIGHT: RESULTS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Key Metrics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '1.5rem',
                            borderRadius: '20px', border: '1px solid rgba(99, 102, 241, 0.3)'
                        }}>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Projected Annual Value</div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'white' }}>
                                ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                        </div>
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem',
                            borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                            <div style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '0.5rem' }}>ROI Multiplier</div>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>
                                {roi.toFixed(0)}%
                            </div>
                        </div>
                    </div>

                    {/* Chart Visualization */}
                    <div style={{
                        flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '24px',
                        padding: '2rem', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <h3 style={{ alignSelf: 'flex-start', fontSize: '1.1rem', fontWeight: '700', marginBottom: '2rem', color: 'rgba(255,255,255,0.8)' }}>
                            Value Composition
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', height: '200px', width: '100%', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>

                            {/* Bar 1: Cost */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: '10%' }}
                                    style={{ width: '60px', background: 'rgba(239, 68, 68, 0.5)', borderRadius: '8px 8px 0 0' }}
                                />
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Cost</span>
                            </div>

                            {/* Bar 2: Hard Savings */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.min((hardSavings / totalValue) * 80, 80)}%` }}
                                    style={{ width: '60px', background: '#0ea5e9', borderRadius: '8px 8px 0 0' }}
                                />
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Time</span>
                            </div>

                            {/* Bar 3: Risk */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.min((riskAvoidanceValue / totalValue) * 90, 90)}%` }}
                                    style={{ width: '60px', background: '#8b5cf6', borderRadius: '8px 8px 0 0' }}
                                />
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Risk</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SettingsSliderIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
        </svg>
    )
}
