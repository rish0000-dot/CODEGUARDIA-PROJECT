'use client'
import { useState, useEffect } from 'react'
import { Loader2, LogOut, Settings, User, ChevronDown, Shield, CreditCard, Users, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import PRAutomation from './components/PRAutomation'
import TeamVelocity from './components/TeamVelocity'
import ROIAnalytics from './components/ROIAnalytics'
import CustomRules from './components/CustomRules'
import Reports from './components/Reports'
import RBACManagement from './components/RBACManagement'
import AuditLogs from './components/AuditLogs'

interface AIReviewResult {
  overallScore: number;
  scores: {
    security: number;
    performance: number;
    quality: number;
    architecture: number;
  };
  issues: Array<{
    line: number;
    type: string;
    message: string;
    fix: string;
    severity: string;
    confidence: number;
    category?: string; // Backwards compatibility
    suggestion?: string; // Backwards compatibility
  }>;
  improvements: string[];
  businessImpact?: string;
}

// Assuming this is the User interface the instruction refers to
interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  mfaEnabled?: boolean;
}

type TabType = 'security' | 'review' | 'architecture';

// Backwards compatibility interfaces
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

export default function Home() {
  // EXISTING STATES
  const [repoUrl, setRepoUrl] = useState('')
  const [scanHistory, setScanHistory] = useState<any[]>([]) // specific type relaxed for hybrid history
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')

  // 🔥 NEW AI STATES
  const [activeTab, setActiveTab] = useState<TabType>('security');
  const [codeInput, setCodeInput] = useState('');
  const [aiReview, setAIReview] = useState<AIReviewResult | null>(null);
  const [aiLoading, setAILoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const router = useRouter();

  const { user, logout, loading: authLoading } = useAuth();

  // Helper helper to format dates safely
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

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
    setAIReview(null)

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)

        const newScan = {
          repoUrl: data.repoUrl || repoUrl,
          type: 'security',
          overallScore: data.riskScore, // Map riskScore to overallScore
          riskScore: data.riskScore, // Keep original
          issues: data.issues.length,
          timestamp: new Date().toISOString(),
          fullResult: data
        }

        const history = JSON.parse(localStorage.getItem('scanHistory') || '[]')
        const updatedHistory = [newScan, ...history.slice(0, 9)]
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

  // 🛡️ PRODUCTION MASTER VALIDATOR (Client-side mirror)
  const masterValidator = (input: string, scanType: string) => {
    const REPO_REGEX = /^((https?:\/\/)?(www\.)?(github\.com\/))?[\w.-]+\/[\w.-]+$/;
    const CODE_REGEX = /\b(function|const|let|var|useEffect|useState|fetch|axios|console\.log|import|export|class|async|await|interface|type|return|if|for|while|switch|case|break)\b/;

    const isRepo = REPO_REGEX.test(input);
    const isCode = CODE_REGEX.test(input);

    if (isRepo) return { valid: true, type: 'repo' };

    if (isCode) {
      const CODE_TABS = ['review'];
      if (!CODE_TABS.includes(scanType)) {
        return {
          valid: false,
          error: `❌ ${scanType.toUpperCase()} requires GitHub repo only (owner/repo)`
        };
      }
      return { valid: true, type: 'code' };
    }

    const canAcceptCode = scanType === 'review';
    return {
      valid: false,
      error: `❌ INVALID INPUT\n\n${scanType.toUpperCase()} accepts:\n✅ GitHub repo: rish0000-dot/Portfolio\n${canAcceptCode ? '✅ Code snippet: console.log("debug")\n' : ''}❌ Random text`
    };
  };

  const aiReviewRepo = async () => {
    const input = repoUrl.trim() || codeInput.trim();

    if (!input) {
      setError('Enter repo URL or paste code');
      setAIReview(null);
      setResult(null);
      return;
    }

    const validation = masterValidator(input, activeTab);

    if (!validation.valid) {
      setError(validation.error!);
      setAIReview(null);
      setResult(null);
      return;
    }

    setAILoading(true);
    setError('');
    setAIReview(null);
    setResult(null);

    try {
      // Get Custom Rules
      const savedRules = localStorage.getItem('customRules');
      const activeRules = savedRules
        ? JSON.parse(savedRules).filter((r: any) => r.enabled).map((r: any) => r.label)
        : ['No console.log', 'Strict TypeScript', 'CamelCase Naming']; // Defaults

      console.log('🚀 Sending Rules to AI:', activeRules); // Debug log

      const response = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          repoUrl: repoUrl.trim(),
          code: codeInput.trim(),
          customRules: activeRules,
          files: ['package.json', 'src/App.tsx', 'components/']
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const parsedReview = JSON.parse(data.review);
        setAIReview(parsedReview);

        // 🔥 HISTORY SAVE
        const newScan = {
          repoUrl: repoUrl || 'Code Snippet',
          type: activeTab,
          overallScore: data.overallScore || parsedReview.overallScore || 85,
          timestamp: new Date().toISOString()
        };
        const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        localStorage.setItem('scanHistory', JSON.stringify([newScan, ...history.slice(0, 9)]));
        setScanHistory([newScan, ...history.slice(0, 9)]);

      } else {
        setError(data.error || 'AI Review failed');
      }
    } catch (err) {
      setError('Network error - Check OpenAI key');
      console.error('❌ AI Review error:', err);
    } finally {
      setAILoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #0f0f23 0%, #1a0d2e 30%, #1e1b4b 70%, #2d1b69 100%)',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
      padding: '1rem'
    }}>
      {/* Auth Loading Screen */}
      {authLoading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: '#0f0f23',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem'
        }}>
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <div style={{ color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: '0.1em', fontSize: '0.75rem', textTransform: 'uppercase' }}>Encrypted handshake...</div>
        </div>
      )}

      {/* Main Layout Wrap */}
      {user && !authLoading && (
        <>
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

          {/* IMPORTED SIDEBAR */}
          <Sidebar currentView={currentView} setCurrentView={setCurrentView} user={user} logout={logout} />

          {/* MAIN CONTENT AREA */}
          <div style={{
            marginLeft: '280px', // Offset for sidebar
            padding: '2rem',
            position: 'relative',
            zIndex: 10,
            minHeight: '100vh'
          }}>

            {/* VIEW: DASHBOARD (Original Content) */}
            {/* VIEW: DASHBOARD (Original Content) */}
            {currentView === 'dashboard' && (
              <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 10 }}>

                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>

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

                {/* 🔥 ENTERPRISE TABS */}
                <div style={{
                  display: 'flex',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  padding: '0.75rem',
                  marginBottom: '2rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { id: 'security' as TabType, icon: '🔍', label: 'Security Scan', color: '#00f5ff', roles: ['ADMIN', 'DEVELOPER'] },
                    { id: 'review' as TabType, icon: '💻', label: 'Code Review', color: '#8b5cf6', roles: ['ADMIN', 'DEVELOPER'] },
                    { id: 'architecture' as TabType, icon: '🏗️', label: 'Architecture', color: '#10b981', roles: ['ADMIN', 'DEVELOPER'] }
                  ].filter(tab => tab.roles.includes(user.role)).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        flex: 1,
                        padding: '1.25rem 1rem',
                        background: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                        borderRadius: '20px',
                        border: `2px solid ${activeTab === tab.id ? tab.color : 'rgba(255,255,255,0.1)'}`,
                        color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)',
                        fontWeight: '700',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        minWidth: '150px'
                      }}
                    >
                      <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* 🔥 DYNAMIC INPUT BASED ON TAB */}
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  padding: '3rem',
                  marginBottom: '3rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
                }}>
                  <h2 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    color: 'white',
                    marginBottom: '2rem',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem'
                  }}>
                    {activeTab === 'security' ? '🔍 Repository Security Scan' :
                      activeTab === 'review' ? '💻 AI Code Review Assistant' :
                        '🏗️ Architecture Analysis'}
                  </h2>

                  {/* REPO INPUT (Always visible) */}
                  <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <input
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="Enter GitHub repo (owner/repo)"
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                        padding: '1.5rem 3.5rem 1.5rem 2rem', // Added paddingRight for button
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '16px',
                        color: 'white',
                        border: repoUrl.trim() ? (masterValidator(repoUrl.trim(), activeTab).valid ? '2px solid #10b981' : '2px solid #ef4444') : '2px solid rgba(255,255,255,0.3)',
                        fontSize: '1.25rem',
                        outline: 'none',
                        backdropFilter: 'blur(10px)'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          aiReviewRepo();
                        }
                      }}
                    />
                    {repoUrl && (
                      <button
                        onClick={() => {
                          setRepoUrl('');
                          setAIReview(null);
                          setResult(null);
                          setError('');
                        }}
                        style={{
                          position: 'absolute',
                          right: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'rgba(255,255,255,0.8)',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.2)', color: 'white' })}
                        onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' })}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* CODE INPUT (Code Review tab only) */}
                  {activeTab === 'review' && (
                    <textarea
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder="Paste your code here for AI review... (or use repo URL above)"
                      style={{
                        width: '100%',
                        height: '250px',
                        padding: '1.5rem 2rem',
                        background: 'rgba(255,255,255,0.15)',
                        borderRadius: '16px',
                        color: 'white',
                        border: codeInput.trim() ? (masterValidator(codeInput.trim(), activeTab).valid ? '2px solid #10b981' : '2px solid #ef4444') : '2px solid rgba(255,255,255,0.3)',
                        fontSize: '1.1rem',
                        fontFamily: 'Monaco, "Fira Code", Consolas, monospace',
                        outline: 'none',
                        marginBottom: '1.5rem',
                        backdropFilter: 'blur(10px)',
                        resize: 'vertical'
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && aiReviewRepo()}
                    />
                  )}

                  {/* MAIN BUTTON */}
                  <button
                    onClick={aiReviewRepo}
                    disabled={loading || aiLoading}
                    style={{
                      width: '100%',
                      padding: '1.5rem 3rem',
                      background: activeTab === 'security' ? 'linear-gradient(45deg, #00f5ff, #ec4899)' :
                        activeTab === 'review' ? 'linear-gradient(45deg, #8b5cf6, #ec4899)' :
                          'linear-gradient(45deg, #10b981, #059669)',
                      color: 'white',
                      fontWeight: '800',
                      borderRadius: '16px',
                      fontSize: '1.25rem',
                      border: 'none',
                      cursor: (loading || aiLoading) ? 'not-allowed' : 'pointer',
                      opacity: (loading || aiLoading) ? 0.7 : 1,
                      boxShadow: (loading || aiLoading) ? 'none' : '0 10px 30px rgba(0,245,255,0.4)',
                      transition: 'all 0.4s ease'
                    }}
                    onMouseEnter={(e) => !(loading || aiLoading) && Object.assign(e.currentTarget.style, {
                      transform: 'translateY(-4px)', boxShadow: '0 20px 40px rgba(0,245,255,0.6)'
                    })}
                    onMouseLeave={(e) => !(loading || aiLoading) && Object.assign(e.currentTarget.style, {
                      transform: 'translateY(0)', boxShadow: '0 10px 30px rgba(0,245,255,0.4)'
                    })}
                  >
                    {(loading || aiLoading)
                      ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          {activeTab === 'security' ? '🔍' : activeTab === 'review' ? '🤖' : '🏗️'} AI Analyzing...
                        </div>
                      )
                      : `${activeTab === 'security' ? '🚀 SCAN NOW' : activeTab === 'review' ? '🤖 GET AI REVIEW' : '🏗️ ANALYZE ARCHITECTURE'}`
                    }
                  </button>

                  {error && (
                    <div style={{
                      marginTop: '1.5rem',
                      padding: '1rem 1.5rem',
                      background: 'rgba(239,68,68,0.2)',
                      border: '1px solid rgba(239,68,68,0.5)',
                      borderRadius: '12px',
                      color: '#fecaca',
                      textAlign: 'center'
                    }}>
                      ⚠️ {error}
                    </div>
                  )}

                  {user.role === 'VIEWER' && (
                    <div style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: 'rgba(255,255,255,0.5)',
                      fontStyle: 'italic'
                    }}>
                      Scanning is disabled for Viewer accounts. Please explore the Analytics or Reports tabs.
                    </div>
                  )}
                </div>

                {/* 🔥 ENTERPRISE RESULTS DASHBOARD */}
                {(result || aiReview) && !loading && !aiLoading && (
                  <div style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(30px)',
                    borderRadius: '24px',
                    padding: '3rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                    marginBottom: '2rem'
                  }}>

                    {/* 🔥 BUSINESS METRICS TOP ROW */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1.5rem',
                      marginBottom: '2.5rem'
                    }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                        padding: '2rem',
                        borderRadius: '20px',
                        textAlign: 'center',
                        border: '2px solid rgba(59,130,246,0.3)'
                      }}>
                        <div style={{ fontSize: '3rem', color: 'white', fontWeight: '900' }}>
                          {aiReview?.overallScore || result?.riskScore || 0}/100
                        </div>
                        <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>Overall Score</div>
                      </div>

                      {aiReview?.scores && (
                        <>
                          <div style={{
                            background: 'rgba(239,68,68,0.2)',
                            padding: '2rem',
                            borderRadius: '20px',
                            textAlign: 'center',
                            border: '2px solid rgba(239,68,68,0.3)'
                          }}>
                            <div style={{ fontSize: '2.5rem', color: '#ef4444', fontWeight: '800' }}>
                              {aiReview.scores.security}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.9)' }}>Security</div>
                          </div>

                          <div style={{
                            background: 'rgba(245,158,11,0.2)',
                            padding: '2rem',
                            borderRadius: '20px',
                            textAlign: 'center',
                            border: '2px solid rgba(245,158,11,0.3)'
                          }}>
                            <div style={{ fontSize: '2.5rem', color: '#f59e0b', fontWeight: '800' }}>
                              {aiReview.scores.performance}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.9)' }}>Performance</div>
                          </div>

                          <div style={{
                            background: 'rgba(168,85,247,0.2)',
                            padding: '2rem',
                            borderRadius: '20px',
                            textAlign: 'center',
                            border: '2px solid rgba(168,85,247,0.3)'
                          }}>
                            <div style={{ fontSize: '2.5rem', color: '#a855f7', fontWeight: '800' }}>
                              {aiReview.scores.quality}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.9)' }}>Quality</div>
                          </div>

                          <div style={{
                            background: 'rgba(14,165,233,0.2)',
                            padding: '2rem',
                            borderRadius: '20px',
                            textAlign: 'center',
                            border: '2px solid rgba(14,165,233,0.3)'
                          }}>
                            <div style={{ fontSize: '2.5rem', color: '#0ea5e9', fontWeight: '800' }}>
                              {aiReview.scores.architecture}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.9)' }}>Architecture</div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 🔥 CRITICAL ISSUES */}
                    <h3 style={{
                      fontSize: '1.8rem',
                      color: '#00f5ff',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      🚨 Critical Issues Found ({(aiReview?.issues?.length || result?.issues?.length || 0)})
                    </h3>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      {(aiReview?.issues || result?.issues || []).slice(0, 5).map((issue: any, i: number) => (
                        <div key={i} style={{
                          padding: '2rem',
                          borderRadius: '16px',
                          borderLeft: `5px solid ${issue.severity === 'HIGH' || issue.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`,
                          background: 'rgba(255,255,255,0.05)',
                          backdropFilter: 'blur(10px)'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                          }}>
                            <h4 style={{
                              fontSize: '1.4rem',
                              fontWeight: '700',
                              color: 'white',
                              margin: 0
                            }}>
                              {issue.line ? `Line ${issue.line}: ` : ''}{issue.category || issue.message}
                            </h4>
                            <span style={{
                              background: issue.severity === 'HIGH' || issue.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                              color: 'white',
                              padding: '0.25rem 1rem',
                              borderRadius: '20px',
                              fontSize: '0.875rem',
                              fontWeight: '700'
                            }}>
                              {issue.severity || issue.confidence ? `${issue.confidence || 100}%` : 'CRITICAL'}
                            </span>
                          </div>

                          <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>
                            {issue.message}
                          </p>

                          <div style={{
                            background: 'rgba(34,197,94,0.2)',
                            padding: '1.25rem',
                            borderRadius: '12px',
                            borderLeft: '4px solid #22c55e',
                            marginTop: '1rem'
                          }}>
                            <strong style={{ color: '#22c55e', fontSize: '1.1rem' }}>💡 Fix:</strong>{' '}
                            <span style={{ color: 'rgba(255,255,255,0.95)' }}>{issue.fix || issue.suggestion}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 🔥 BUSINESS IMPACT */}
                    {aiReview?.businessImpact && (
                      <div style={{
                        background: 'linear-gradient(135deg, #059669, #10b981)',
                        padding: '2rem',
                        borderRadius: '20px',
                        marginTop: '2rem',
                        textAlign: 'center'
                      }}>
                        <h4 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>
                          💰 Business Impact
                        </h4>
                        <div style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.95)', fontWeight: '700' }}>
                          {aiReview.businessImpact}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 🔥 ENHANCED LOADING */}
                {(loading || aiLoading) && (
                  <div style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(30px)',
                    borderRadius: '24px',
                    padding: '4rem 3rem',
                    border: '1px solid rgba(255,255,255,0.15)',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: '3rem'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #00f5ff, #8b5cf6, #ec4899)',
                      animation: 'loading 2s infinite linear'
                    }} />

                    <div style={{ fontSize: '3.5rem', color: '#8b5cf6', marginBottom: '1.5rem' }}>
                      {activeTab === 'security' ? '🔍' : activeTab === 'review' ? '🤖' : '🏗️'}
                    </div>
                    <div style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem' }}>
                      {activeTab === 'security' ? 'AI Security Analysis' :
                        activeTab === 'review' ? 'AI Code Review in Progress' :
                          'Architecture Analysis'}
                    </div>
                    <div style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)' }}>
                      Analyzing {repoUrl || 'your code'}...
                    </div>
                  </div>
                )}

                {/* 📊 ENHANCED SCAN HISTORY */}
                {/* 📊 HISTORY SIDE DRAWER */}
                <div style={{
                  position: 'fixed',
                  top: 0,
                  right: showHistory ? 0 : '-450px',
                  width: '400px',
                  maxWidth: '100%',
                  height: '100vh',
                  background: 'rgba(15, 15, 35, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderLeft: '1px solid rgba(255,255,255,0.1)',
                  padding: '2rem',
                  transition: 'right 0.3s ease-in-out',
                  zIndex: 1000,
                  boxShadow: showHistory ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', margin: 0 }}>
                      🕒 Scan History
                    </h3>
                    <button
                      onClick={() => setShowHistory(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {scanHistory.length === 0 ? (
                    <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: '2rem' }}>
                      No history yet. Run a scan!
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          localStorage.removeItem('scanHistory');
                          setScanHistory([]);
                        }}
                        style={{
                          width: '100%',
                          background: 'rgba(239,68,68,0.1)',
                          color: '#fca5a5',
                          border: '1px solid rgba(239,68,68,0.3)',
                          padding: '0.75rem',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          marginBottom: '1.5rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        Clear All History
                      </button>

                      <div style={{ display: 'grid', gap: '1rem' }}>
                        {scanHistory.map((scan: any, i: number) => (
                          <div key={i} style={{
                            padding: '1.25rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                            onClick={() => {
                              setRepoUrl(scan.repoUrl);
                              if (scan.type) setActiveTab(scan.type as TabType);
                              setShowHistory(false); // Close drawer on selection
                            }}
                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.1)' })}
                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.05)' })}
                          >
                            <div style={{ fontWeight: '700', color: 'white', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {scan.repoUrl}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                              <span style={{ color: '#60a5fa' }}>{(scan.type || 'SECURITY').toUpperCase()}</span>
                              <span style={{ color: scan.overallScore > 80 ? '#4ade80' : '#facc15', fontWeight: 'bold' }}>
                                {scan.overallScore || scan.riskScore}/100
                              </span>
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                              {formatDate(scan.timestamp)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* OVERLAY FOR DRAWER */}
                {showHistory && (
                  <div
                    onClick={() => setShowHistory(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(5px)',
                      zIndex: 999
                    }}
                  />
                )}

              </div>
            )}

            {/* VIEW: PR AUTOMATION */}
            {currentView === 'pr-automation' && (
              <PRAutomation />
            )}

            {/* VIEW: TEAM */}
            {currentView === 'team' && (
              <TeamVelocity />
            )}

            {/* VIEW: ANALYTICS */}
            {currentView === 'analytics' && (
              <ROIAnalytics />
            )}

            {/* VIEW: RULES */}
            {currentView === 'rules' && (
              <CustomRules />
            )}

            {/* VIEW: REPORTS */}
            {currentView === 'reports' && (
              <Reports />
            )}

            {/* VIEW: RBAC */}
            {currentView === 'rbac' && (
              <RBACManagement />
            )}

            {/* VIEW: AUDIT LOGS */}
            {currentView === 'audit-logs' && (
              <AuditLogs />
            )}

            {/* 🕒 FLOATING HISTORY BUTTON */}
            {currentView === 'dashboard' && (
              <button
                onClick={() => setShowHistory(true)}
                style={{
                  position: 'fixed',
                  bottom: '1.5rem',
                  right: '1.5rem',
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  padding: '0.6rem 1rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 100
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <div style={{
                  fontSize: '1rem',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '2px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>🕒</div>
                History
              </button>
            )}

          </div>
        </>
      )}
    </div>
  )
}
