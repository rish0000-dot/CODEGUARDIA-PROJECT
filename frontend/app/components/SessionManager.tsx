'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE = 2 * 60 * 1000; // 2 minutes warning

export default function SessionManager() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120); // 120 seconds for warning

    const handleLogout = useCallback(() => {
        logout();
        router.push('/login?reason=timeout');
        setShowWarning(false);
    }, [logout, router]);

    useEffect(() => {
        if (!user) return;

        let logoutTimer: any;
        let warningTimer: any;

        const resetTimers = () => {
            setShowWarning(false);
            clearTimeout(logoutTimer);
            clearTimeout(warningTimer);

            warningTimer = setTimeout(() => {
                setShowWarning(true);
                startCountdown();
            }, TIMEOUT_DURATION - WARNING_BEFORE);

            logoutTimer = setTimeout(handleLogout, TIMEOUT_DURATION);
        };

        const startCountdown = () => {
            let seconds = 120;
            const interval = setInterval(() => {
                seconds -= 1;
                setTimeLeft(seconds);
                if (seconds <= 0) clearInterval(interval);
            }, 1000);
        };

        // Track user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimers));

        resetTimers(); // Initial start

        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimers));
            clearTimeout(logoutTimer);
            clearTimeout(warningTimer);
        };
    }, [user, handleLogout]);

    return (
        <AnimatePresence>
            {showWarning && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
                    width: '350px', background: '#13132b', border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '20px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '10px' }}>
                                <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                            </div>
                            <h4 style={{ color: 'white', fontWeight: '700', margin: 0 }}>Session Expiring</h4>
                        </div>

                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            You've been inactive for a while. You will be logged out in <strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong> due to security policies.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowWarning(false)}
                                style={{
                                    flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                                    color: 'white', fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Keep Working
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    flex: 1, padding: '0.75rem', background: '#ef4444',
                                    border: 'none', borderRadius: '12px',
                                    color: 'white', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                }}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
