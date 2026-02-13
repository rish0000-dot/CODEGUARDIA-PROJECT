'use client'
import { useState } from 'react'

const MOCK_ISSUES = [
  { id: '1', file: 'src/api/users.js', line: 47, category: 'XSS', severity: 'CRITICAL', confidence: 98, suggestion: 'Use textContent instead of innerHTML' },
  { id: '2', file: 'src/utils/auth.js', line: 23, category: 'SQL Injection', severity: 'HIGH', confidence: 92, suggestion: 'Use prepared statements' },
  { id: '3', file: 'components/Header.tsx', line: 12, category: 'Memory Leak', severity: 'MEDIUM', confidence: 87, suggestion: 'Use useCallback' }
]

export default function Dashboard() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '900',
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Scan Results
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>
          3 security issues found • Last scan: 2 minutes ago
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', color: '#ef4444' }}>1</div>
          <div>CRITICAL</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', color: '#f59e0b' }}>1</div>
          <div>HIGH</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '1.5rem',
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2.5rem', color: '#10b981' }}>1</div>
          <div>MEDIUM</div>
        </div>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Detailed Issues</h2>
        {MOCK_ISSUES.map((issue) => (
          <div key={issue.id} style={{
            display: 'flex',
            gap: '1rem',
            padding: '1rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            alignItems: 'center'
          }}>
            <code style={{ color: '#60a5fa', flex: 1 }}>{issue.file}:{issue.line}</code>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: issue.severity === 'CRITICAL' ? '#fef2f2' : '#fef3c7',
              color: issue.severity === 'CRITICAL' ? '#dc2626' : '#d97706'
            }}>
              {issue.severity}
            </span>
            <span>{issue.confidence}%</span>
            <button style={{
              padding: '0.5rem 1rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px'
            }}>
              Fix →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
