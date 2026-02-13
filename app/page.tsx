'use client'
import { useState, useEffect } from 'react'

interface Issue {
  id: string
  file: string
  line: number
  category: string
  severity: string
  confidence: number
  suggestion: string
}

interface ScanResult {
  success: boolean
  issues: Issue[]
  repoUrl: string
  riskScore: number
  totalIssues?: number
  timestamp?: string
}

interface ScanHistoryItem {
  repoUrl: string
  riskScore: number
  issues: number
  timestamp: string
  fullResult?: ScanResult
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('rish0000-dot/Portfolio')
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState<ScanResult | null>(null)

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('scanHistory') || '[]')
      setScanHistory(history.slice(0, 10))
    } catch (err) {
      console.error('Failed to load scan history:', err)
      setScanHistory([])
    }
  }, [])

  const scanRepo = async () => {
    if (!repoUrl.trim()) {
      setError('Enter GitHub repo (owner/repo)')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        
        const newScan: ScanHistoryItem = {
          repoUrl: data.repoUrl || repoUrl,
          riskScore: data.riskScore,
          issues: data.issues.length,
          timestamp: new Date().toLocaleString(),
          fullResult: data
        }
        
        const history: ScanHistoryItem[] = JSON.parse(localStorage.getItem('scanHistory') || '[]')
        const updatedHistory: ScanHistoryItem[] = [newScan, ...history.slice(0, 8)]
        localStorage.setItem('scanHistory', JSON.stringify(updatedHistory))
        setScanHistory(updatedHistory)
      } else {
        setError(data.error || 'Scan failed')
      }
    } catch (err) {
      setError('Network error')
      console.error('❌ Scan error:', err)
    } finally {
      setLoading(false)
    }
  }

  const showDashboard = (fullResult: ScanResult) => {
    setSelectedResult(fullResult)
    setIsHistoryOpen(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#ef4444'
      case 'HIGH': return '#f59e0b'
      default: return '#eab308'
    }
  }

  const toggleHistory = () => setIsHistoryOpen(prev => !prev)
  
  const handleHistoryClick = (e: React.MouseEvent, scan: ScanHistoryItem) => {
    e.stopPropagation()
    if (scan.fullResult) showDashboard(scan.fullResult)
  }

  // 🔥 ADVANCED ENTERPRISE DASHBOARD
  if (selectedResult) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at center, #0f0f23 0%, #1a0d2e 30%, #1e1b4b 70%, #2d1b69 100%)',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        padding: '1rem'
      }}>
        {/* Animated Background */}
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 1,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120,119,198,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,119,198,0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120,219,255,0.1) 0%, transparent 50%)
          `
        }} />
        
        <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          {/* 🔥 Glassmorphic Back Button */}
          <button onClick={() => setSelectedResult(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
              background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.2)', color: 'white',
              padding: '1.25rem 2.5rem', borderRadius: '24px', cursor: 'pointer',
              fontWeight: '600', fontSize: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              Object.assign(e.currentTarget.style, {
                background: 'rgba(255,255,255,0.15)',
                transform: 'translateY(-4px)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              })
            }}
            onMouseLeave={(e) => {
              Object.assign(e.currentTarget.style, {
                background: 'rgba(255,255,255,0.08)',
                transform: 'translateY(0)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              })
            }}
          >
            ← Back to Scanner
          </button>

          {/* 🔥 Hero Risk Score */}
          <div style={{
            background: 'rgba(31, 41, 55, 0.6)', backdropFilter: 'blur(40px) saturate(180%)',
            borderRadius: '32px', border: '1px solid rgba(255,255,255,0.15)',
            padding: '4rem 3rem', textAlign: 'center', margin: '3rem 0',
            position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ 
              fontSize: 'clamp(4rem, 12vw, 8rem)', 
              background: 'linear-gradient(135deg, #00f5ff, #a855f7, #ec4899)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontWeight: '900', letterSpacing: '-0.05em', textShadow: '0 0 60px rgba(0,245,255,0.5)'
            }}>
              {selectedResult.riskScore}/100
            </div>
            <div style={{ 
              fontSize: '1.75rem', 
              color: selectedResult.riskScore > 70 ? '#fca5a5' : '#86efac',
              fontWeight: '800', marginTop: '1rem', letterSpacing: '0.05em',
              textShadow: '0 0 20px currentColor'
            }}>
              {selectedResult.riskScore > 70 ? '🔴 HIGH RISK' : '🟢 LOW RISK'}
            </div>
            <div style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', marginTop: '1.5rem' }}>
              {selectedResult.repoUrl} • {selectedResult.issues.length} vulnerabilities
            </div>
          </div>

          {/* 🔥 Issues Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
            gap: '2.5rem', marginTop: '2rem'
          }}>
            {selectedResult.issues.map((issue) => (
              <div key={issue.id}
                style={{
                  background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(30px) saturate(180%)',
                  borderRadius: '28px', border: '1px solid rgba(255,255,255,0.12)',
                  padding: '2.5rem', position: 'relative', overflow: 'hidden',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, {
                    transform: 'translateY(-16px) scale(1.02)',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.4)'
                  })
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, {
                    transform: 'translateY(0) scale(1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                  })
                }}
              >
                {/* Severity Badge */}
                <div style={{
                  position: 'absolute', top: '2rem', right: '2rem',
                  background: getSeverityColor(issue.severity), color: 'white',
                  padding: '0.75rem 1.5rem', borderRadius: '50px', fontSize: '0.875rem',
                  fontWeight: '800', letterSpacing: '0.1em', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  textTransform: 'uppercase'
                }}>
                  {issue.severity}
                </div>

                <div style={{ paddingRight: '200px' }}>
                  <h3 style={{ 
                    fontSize: '1.75rem', fontWeight: '900', color: 'white',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, white, rgba(255,255,255,0.8))',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                  }}>
                    {issue.category}
                  </h3>
                  
                  <div style={{ 
                    color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem',
                    fontFamily: '"SF Mono", monospace', fontSize: '1.1rem',
                    display: 'flex', alignItems: 'center', gap: '1rem'
                  }}>
                    <div style={{
                      background: 'rgba(0,245,255,0.2)', color: '#00f5ff',
                      padding: '0.5rem 1rem', borderRadius: '12px', fontWeight: '600'
                    }}>
                      📁 {issue.file.split(':')[0]}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)' }}>Line {issue.line}</div>
                  </div>

                  <div style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    Confidence: 
                    <span style={{ color: '#00f5ff', fontSize: '1.5rem', fontWeight: '800' }}>
                      {issue.confidence}%
                    </span>
                  </div>

                  {/* Solution Card */}
                  <div style={{
                    background: 'rgba(34,197,94,0.15)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(34,197,94,0.3)', borderRadius: '20px',
                    padding: '2rem', position: 'relative', overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                      background: 'linear-gradient(90deg, #22c55e, #4ade80, #22c55e)'
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '48px', height: '48px', background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem'
                      }}>💡</div>
                      <div style={{ color: '#22c55e', fontSize: '1.25rem', fontWeight: '800' }}>
                        Recommended Fix
                      </div>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.95)', lineHeight: '1.7', fontSize: '1.05rem' }}>
                      {issue.suggestion}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 🔥 MAIN SCANNER - PROFESSIONAL UI
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #0f0f23 0%, #1a0d2e 30%, #1e1b4b 70%, #2d1b69 100%)',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      padding: '1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 10 }}>
        
        {/* History Toggle Button */}
        <button
          onClick={toggleHistory}
          style={{
            position: 'fixed', top: '2rem', right: '2rem', zIndex: 1000,
            width: '64px', height: '64px', background: 'linear-gradient(135deg, #00f5ff, #ec4899)',
            border: 'none', borderRadius: '50%', color: 'white', fontSize: '1.5rem',
            cursor: 'pointer', boxShadow: '0 12px 40px rgba(0,245,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, {
              transform: 'scale(1.1) rotate(90deg)',
              boxShadow: '0 20px 50px rgba(0,245,255,0.6)'
            })
          }}
          onMouseLeave={(e) => {
            Object.assign(e.currentTarget.style, {
              transform: 'scale(1) rotate(0deg)',
              boxShadow: '0 12px 40px rgba(0,245,255,0.4)'
            })
          }}
        >
          📊
          {scanHistory.length > 0 && (
            <span style={{
              position: 'absolute', top: '-6px', right: '-6px',
              width: '24px', height: '24px', background: '#ef4444', borderRadius: '50%',
              fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold'
            }}>
              {scanHistory.length}
            </span>
          )}
        </button>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)', fontWeight: '900', marginBottom: '1rem',
            background: 'linear-gradient(135deg, #00f5ff, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(139, 92, 246, 0.5)'
          }}>
            CodeGuardian AI
          </h1>
          <p style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px', margin: '0 auto' }}>
            Enterprise-grade AI-powered security scanner for GitHub repositories
          </p>
        </div>

        {/* Scanner Form */}
        <div style={{
          background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '32px', padding: '3.5rem', marginBottom: '3rem',
          border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: '2.5rem', textAlign: 'center' }}>
            🔍 Instant Repository Scan
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
            <input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="owner/repo (e.g., rish0000-dot/Portfolio)"
              style={{
                flex: 1, padding: '1.75rem 2.5rem', background: 'rgba(255,255,255,0.12)',
                borderRadius: '24px', color: 'white', border: '2px solid rgba(255,255,255,0.25)',
                fontSize: '1.375rem', outline: 'none', minWidth: '500px',
                backdropFilter: 'blur(15px)', transition: 'all 0.3s ease',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
              }}
              onFocus={(e) => {
                Object.assign(e.currentTarget.style, {
                  borderColor: '#00f5ff', boxShadow: '0 0 0 4px rgba(0,245,255,0.2)'
                })
              }}
              onBlur={(e) => {
                Object.assign(e.currentTarget.style, {
                  borderColor: 'rgba(255,255,255,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                })
              }}
            />
            <button
              onClick={scanRepo}
              disabled={loading}
              style={{
                padding: '1.75rem 4rem', background: 'linear-gradient(135deg, #00f5ff, #ec4899)',
                color: 'white', fontWeight: '800', borderRadius: '24px', fontSize: '1.375rem',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, boxShadow: '0 20px 40px rgba(0,245,255,0.4)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => !loading && Object.assign(e.currentTarget.style, {
                transform: 'translateY(-6px)', boxShadow: '0 30px 60px rgba(0,245,255,0.6)'
              })}
              onMouseLeave={(e) => !loading && Object.assign(e.currentTarget.style, {
                transform: 'translateY(0)', boxShadow: '0 20px 40px rgba(0,245,255,0.4)'
              })}
            >
              {loading ? '🔄 AI Analyzing...' : '🚀 SCAN NOW'}
            </button>
          </div>
          
          {error && (
            <div style={{
              marginTop: '2rem', padding: '1.5rem', background: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.4)', borderRadius: '16px', color: '#fecaca',
              backdropFilter: 'blur(10px)'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {loading && (
          <div style={{
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
            borderRadius: '32px', padding: '4rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <div style={{ fontSize: '3rem', color: '#00f5ff', marginBottom: '1.5rem' }}>
              🔍 AI Analysis in Progress
            </div>
            <div style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)' }}>
              Scanning {repoUrl} for critical vulnerabilities...
            </div>
          </div>
        )}

        {result && result.success && (
          <div style={{
            background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
            borderRadius: '32px', padding: '3.5rem', border: '1px solid rgba(255,255,255,0.15)'
          }}>
            {/* Quick result preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
              {result.issues.map(issue => (
                <div key={issue.id} style={{
                  padding: '2rem', background: 'rgba(255,255,255,0.06)',
                  borderRadius: '24px', borderLeft: `5px solid ${getSeverityColor(issue.severity)}`,
                  transition: 'all 0.3s ease', cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  Object.assign(e.currentTarget.style, { transform: 'translateY(-8px)' })
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, { transform: 'translateY(0)' })
                }}
                onClick={() => showDashboard(result)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>
                      {issue.category}
                    </h4>
                    <span style={{
                      background: getSeverityColor(issue.severity), color: 'white',
                      padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: '700'
                    }}>
                      {issue.severity}
                    </span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'monospace' }}>
                    📁 {issue.file.split(':')[0]} Line {issue.line}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🔥 Side History Panel */}
      {isHistoryOpen && (
        <>
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.6)', zIndex: 998, backdropFilter: 'blur(8px)'
          }} onClick={toggleHistory} />
          
          <div style={{
            position: 'fixed', top: 0, right: 0, width: '450px', height: '100vh',
            background: 'rgba(30, 27, 75, 0.98)', backdropFilter: 'blur(30px)',
            borderLeft: '1px solid rgba(255,255,255,0.15)', zIndex: 999,
            padding: '2.5rem', overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: '900' }}>
                📊 Scan History ({scanHistory.length})
              </h2>
              <button onClick={toggleHistory} style={{
                background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.5)',
                color: 'white', padding: '0.75rem 1.5rem', borderRadius: '16px', cursor: 'pointer'
              }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {scanHistory.map((scan, i) => (
                <div key={i}
                  style={{
                    padding: '2rem', background: 'rgba(59,130,246,0.15)',
                    borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', transition: 'all 0.3s ease'
                  }}
                  onClick={(e) => handleHistoryClick(e, scan)}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, {
                      background: 'rgba(59,130,246,0.3)', transform: 'translateX(8px)'
                    })
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, {
                      background: 'rgba(59,130,246,0.15)', transform: 'translateX(0)'
                    })
                  }}
                >
                  <div style={{ fontWeight: '800', color: '#60a5fa', fontSize: '1.25rem' }}>
                    {scan.repoUrl}
                  </div>
                  <div style={{ color: 'white', fontSize: '2rem', fontWeight: '900', margin: '0.5rem 0' }}>
                    {scan.riskScore}/100
                  </div>
                  <div style={{ 
                    color: scan.riskScore > 70 ? '#ef4444' : '#22c55e',
                    fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.75rem'
                  }}>
                    {scan.riskScore > 70 ? '🔴 HIGH RISK' : '🟢 LOW RISK'}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                    {scan.issues} issues • {scan.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
