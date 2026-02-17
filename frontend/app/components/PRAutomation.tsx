'use client'
import { useState } from 'react'
import { GitPullRequest, AlertCircle, CheckCircle2, XCircle, Shield, Zap, Code2 } from 'lucide-react'

export default function PRAutomation() {
    const [diffInput, setDiffInput] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [error, setError] = useState('');

    const analyzePR = async () => {
        if (!diffInput.trim()) {
            setError('Please enter a diff or code snippet');
            return;
        }

        setAnalyzing(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('/api/ai-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'pr_automation',
                    code: diffInput.trim(),
                    files: ['diff_input'], // Mock file context
                    customRules: [] // Or load from localStorage if needed
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const parsedReview = JSON.parse(data.review);
                // Map API response to PRAutomation UI needs if necessary
                // PRAutomation expects: { score: number, status: string, summary: string, comments: Array<{ file, line, type, severity, message, fix }>, impact: string }

                const mappedResult = {
                    score: parsedReview.overallScore || 85,
                    status: (parsedReview.overallScore || 85) >= 80 ? 'APPROVED' : 'BLOCKED',
                    summary: parsedReview.summary || 'Review complete.',
                    comments: (parsedReview.issues || []).map((issue: any) => ({
                        file: issue.file || 'code',
                        line: issue.line || 0,
                        type: issue.type || 'QUALITY',
                        severity: issue.severity || 'MEDIUM',
                        message: issue.message || '',
                        fix: issue.fix || ''
                    })),
                    impact: parsedReview.businessImpact || '$0/mo potential risk prevented'
                };

                setResult(mappedResult);
            } else {
                setError(data.error || 'AI Analysis failed');
            }
        } catch (err) {
            setError('Network error - Check API status');
            console.error('❌ PR Review error:', err);
        } finally {
            setAnalyzing(false);
        }
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
                    <GitPullRequest size={40} color="#8b5cf6" />
                    GitHub PR Auto-Review
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>
                    Simulate an automated AI review on your Pull Requests.
                </p>
            </div>

            {/* INPUT AREA */}
            {!result && (
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    padding: '2rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600' }}>
                        Paste Git Diff or Code Snippet:
                    </label>
                    <textarea
                        value={diffInput}
                        onChange={(e) => setDiffInput(e.target.value)}
                        placeholder={`diff --git a/src/App.tsx b/src/App.tsx
index 83a04c..92b32a 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -42,7 +42,7 @@
- <div dangerouslySetInnerHTML={{ __html: userInput }} />
+ <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />`}
                        style={{
                            width: '100%',
                            height: '300px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            color: '#d4d4d8',
                            fontFamily: 'monospace',
                            padding: '1rem',
                            outline: 'none',
                            resize: 'vertical',
                            marginBottom: '2rem'
                        }}
                    />

                    {error && (
                        <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid #ef4444',
                            borderRadius: '12px',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '0.9rem',
                            whiteSpace: 'pre-line'
                        }}>
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={analyzePR}
                        disabled={analyzing || !diffInput}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '1.1rem',
                            cursor: (analyzing || !diffInput) ? 'not-allowed' : 'pointer',
                            opacity: (analyzing || !diffInput) ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {analyzing ? '🤖 Analyzing Diff...' : '🚀 Run Auto-Review'}
                    </button>
                </div>
            )}

            {/* RESULT VIEW */}
            {result && (
                <div style={{ animation: 'fadeIn 0.5s ease' }}>

                    {/* STATUS HEADER */}
                    <div style={{
                        background: '#161b22', // GitHub Dark Bg
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                    }}>AI</div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>CodeGuardian Bot <span style={{ background: 'rgba(255,255,255,0.1)', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>BOT</span></div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>commented just now</div>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '20px',
                                    background: result.score >= 80 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                    color: result.score >= 80 ? '#4ade80' : '#f87171',
                                    fontWeight: '700',
                                    border: `1px solid ${result.score >= 80 ? '#22c55e' : '#ef4444'}`
                                }}>
                                    Score: {result.score}/100
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', color: '#c9d1d9' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Analysis Summary</h3>
                            <p style={{ marginBottom: '1.5rem' }}>{result.summary}</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Security Impact</div>
                                    <div style={{ color: '#ef4444', fontWeight: '600' }}>High Risk Prevented</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Est. ROI</div>
                                    <div style={{ color: '#4ade80', fontWeight: '600' }}>{result.impact}</div>
                                </div>
                            </div>

                            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'white' }}>🔍 Inline Comments</h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {result.comments.map((comment: any, i: number) => (
                                    <div key={i} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
                                            {comment.file}:{comment.line}
                                        </div>
                                        <div style={{ padding: '1rem', background: '#0d1117' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                {comment.type === 'SECURITY' ? <Shield size={16} color="#ef4444" /> : <Zap size={16} color="#f59e0b" />}
                                                <span style={{ fontWeight: '700', color: comment.type === 'SECURITY' ? '#ef4444' : '#f59e0b', fontSize: '0.9rem' }}>
                                                    [{comment.severity}] {comment.type}
                                                </span>
                                            </div>
                                            <p style={{ marginBottom: '0.75rem' }}>{comment.message}</p>
                                            <div style={{ background: 'rgba(34,197,94,0.1)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid #22c55e' }}>
                                                <code style={{ color: '#4ade80', fontFamily: 'monospace' }}>{comment.fix}</code>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                    {/* BLOCK MERGE BANNER */}
                    {result.score < 80 && (
                        <div style={{
                            background: '#240808',
                            border: '1px solid #7d1a1a',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: '#7d1a1a', borderRadius: '50%', padding: '0.5rem' }}>
                                    <XCircle size={24} color="white" />
                                </div>
                                <div>
                                    <div style={{ color: '#fca5a5', fontWeight: '700', fontSize: '1.1rem' }}>Merging is blocked</div>
                                    <div style={{ color: '#fecaca', fontSize: '0.9rem' }}>Quality score (78/100) is below the threshold of 80.</div>
                                </div>
                            </div>
                            <button style={{
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.2)',
                                color: 'rgba(255,255,255,0.5)',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                cursor: 'not-allowed'
                            }}>
                                Merge Pull Request
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => { setResult(null); setDiffInput(''); setError(''); }}
                        style={{
                            marginTop: '2rem',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        ← Scan Another Diff
                    </button>

                </div>
            )}
        </div>
    )
}
