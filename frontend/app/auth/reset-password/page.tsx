'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ResetPassword() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Missing reset token. Please check your email link.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(true);
                toast.success('Password reset successfully!');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.error || 'Failed to reset password');
                toast.error(data.error || 'Failed to reset password');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!token && !success) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <AlertCircle size={60} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Invalid Link</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>The password reset link is missing or malformed.</p>
                    <Link href="/auth/forgot-password" style={{ display: 'block', marginTop: '1.5rem', color: '#3b82f6' }}>Request a new link</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a16', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ width: '100%', maxWidth: '450px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2.5rem', backdropFilter: 'blur(20px)' }}
            >
                {!success ? (
                    <>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'white' }}>Set New Password</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>Please enter a strong new password for your account.</p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type="password" required placeholder="New Password"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type="password" required placeholder="Confirm New Password"
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                            <button
                                disabled={loading}
                                type="submit"
                                style={{
                                    padding: '1rem',
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    border: 'none', borderRadius: '14px', color: 'white', fontWeight: '700', fontSize: '1rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircle size={60} style={{ color: '#10b981', marginBottom: '1.5rem' }} />
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem', color: 'white' }}>Success!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>Your password has been reset. Redirecting you to login...</p>
                        <Link href="/login" style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none' }}>Go to Login now</Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    padding: '1rem 1rem 1rem 3.5rem',
    color: 'white',
    fontSize: '1rem',
    outline: 'none'
};
