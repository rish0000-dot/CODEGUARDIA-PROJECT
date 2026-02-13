'use client'
import { create } from 'zustand'

interface ScanState {
  progress: number
  issues: any[]
  scan: () => void
}

export const MOCK_ISSUES = [
  { id: '1', file: 'src/api/users.js', line: 47, category: 'XSS', severity: 'CRITICAL', confidence: 98, suggestion: 'Use textContent' },
  { id: '2', file: 'src/utils/auth.js', line: 23, category: 'SQL Injection', severity: 'HIGH', confidence: 92, suggestion: 'Use prepared statements' },
  { id: '3', file: 'components/Header.tsx', line: 12, category: 'Memory Leak', severity: 'MEDIUM', confidence: 87, suggestion: 'Use useCallback' }
]

export const useScanStore = create<ScanState>((set) => ({
  progress: 0,
  issues: [],
  scan: () => {
    set({ progress: 0 })
    const interval = setInterval(() => {
      set((state) => {
        const newProgress = Math.min(state.progress + 15, 100)
        if (newProgress >= 100) {
          clearInterval(interval)
          return { progress: 100, issues: MOCK_ISSUES }
        }
        return { progress: newProgress }
      })
    }, 500)
  }
}))
