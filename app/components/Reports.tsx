'use client'
import { FileText, Download, Printer, Share2 } from 'lucide-react'

export default function Reports() {
    const handlePrint = () => {
        window.print();
    };

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
                    <FileText size={40} color="#f59e0b" />
                    Enterprise Reports
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>
                    Generate executive summaries and compliance documents.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 300px', gap: '2rem' }}>

                {/* 📄 DOCUMENT PREVIEW */}
                <div style={{
                    background: 'white',
                    color: 'black',
                    padding: '3rem',
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    minHeight: '600px',
                    position: 'relative',
                    fontFamily: 'Georgia, serif'
                }}>
                    <div style={{ borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>CodeGuardian AI</h1>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>Executive Quality Report</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                            <div><strong>ID:</strong> CG-2024-8X92</div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>1. Executive Summary</h2>
                    <p style={{ lineHeight: '1.6', marginBottom: '1.5rem', color: '#444' }}>
                        Over the past quarter, the engineering team has successfully integrated
                        AI-driven code reviews into the CI/CD pipeline. This initiative has resulted
                        in a measurable reduction in technical debt and a significant improvement
                        in code security posture. Key metrics indicate a <strong>32% decrease</strong> in critical vulnerabilities
                        reaching production.
                    </p>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>2. Key Performance Indicators</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Metric</th>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Q3 Result</th>
                                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem' }}>Code Quality Score</td>
                                <td style={{ padding: '0.5rem' }}>89/100</td>
                                <td style={{ padding: '0.5rem', color: 'green' }}>+12%</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem' }}>Security Incidents</td>
                                <td style={{ padding: '0.5rem' }}>0</td>
                                <td style={{ padding: '0.5rem', color: 'green' }}>-100%</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem' }}>Est. Cost Savings</td>
                                <td style={{ padding: '0.5rem' }}>$142,000</td>
                                <td style={{ padding: '0.5rem', color: 'green' }}>+28%</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ position: 'absolute', bottom: '2rem', right: '3rem', fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>
                        Generated by CodeGuardian Enterprise
                    </div>
                </div>

                {/* ⚙️ CONTROLS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Export Options</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                                <Printer size={18} /> Print / Save as PDF
                            </button>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                                <Download size={18} /> Download CSV
                            </button>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>
                                <Share2 size={18} /> Share Report Link
                            </button>
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                        <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem' }}>✨ Pro Tip</h4>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                            You can automate these reports to be emailed to stakeholders every Monday morning in the Settings tab.
                        </p>
                    </div>

                </div>

            </div>

        </div>
    )
}
