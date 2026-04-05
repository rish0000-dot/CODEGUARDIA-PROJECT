'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (res.ok) {
                setSent(true);
            } else {
                setError(data.error || 'Failed to send reset link');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: '450px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2.5rem', backdropFilter: 'blur(20px)' }}
            >
                {!sent ? (
                    <>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'white' }}>Forgot Password?</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>Enter your email and we'll send you a link to reset your password.</p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type="email" required placeholder="name@company.com"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '1rem 1rem 1rem 3.5rem', color: 'white', fontSize: '1rem', outline: 'none' }}
                                />
                            </div>

                            {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                            <button
                                disabled={loading}
                                type="submit"
                                style={{
                                    padding: '1rem',
                                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                    border: 'none', borderRadius: '14px', color: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircle size={60} style={{ color: '#10b981', marginBottom: '1.5rem' }} />
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: 'white' }}>Email Sent!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>Check your inbox at <strong>{email}</strong> for instructions to reset your password.</p>
                        <Link href="/login" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>Back to Login</Link>
                    </div>
                )}

                {!sent && (
                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <Link href="/login" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
