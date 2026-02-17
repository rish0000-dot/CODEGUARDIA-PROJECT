'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldCheck, ArrowLeft, CheckCircle2, Copy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MFASetupPage() {
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [step, setStep] = useState(1);
    const { token, user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            router.push('/login');
        }
    }, [token, router]);

    const handleSetupMFA = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:5000/api/auth/mfa/setup',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setQrCode(response.data.qrCode);
                setSecret(response.data.secret);
                setStep(2);
            }
        } catch (error) {
            toast.error('Failed to initialize MFA setup');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:5000/api/auth/mfa/verify-setup',
                { token: verificationCode },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                toast.success('MFA Enabled Successfully!');
                setStep(3);
                setTimeout(() => router.push('/'), 2000);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Secret copied to clipboard');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full" />
                <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 md:p-12 relative z-10 shadow-2xl"
            >
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                        Secure Your Account
                    </h1>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex items-start gap-4">
                                <ShieldCheck className="w-10 h-10 text-blue-400 shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Multi-Factor Authentication</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Add an extra layer of security to your account. We'll use your authenticator app to generate unique verification codes.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleSetupMFA}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center"
                            >
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Get Started'}
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <p className="text-gray-300 mb-6">Scan this QR code with Google Authenticator or Authy</p>
                                <div className="bg-white p-4 rounded-3xl inline-block shadow-xl mb-6 ring-4 ring-blue-500/20">
                                    <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Or enter this secret manually</p>
                                    <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between font-mono">
                                        <span className="text-blue-400 truncate mr-4">{secret}</span>
                                        <button onClick={() => copyToClipboard(secret)} className="text-gray-400 hover:text-white transition-colors">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleVerifySetup} className="space-y-4">
                                <label className="text-sm font-semibold text-gray-400 ml-1">Verification Code</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="Enter 6-digit code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20"
                                >
                                    {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm & Enable'}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-10 text-center"
                        >
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-12 h-12 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Account Secured!</h2>
                            <p className="text-gray-400">Multi-Factor Authentication is now active. You'll be redirected to your dashboard.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
