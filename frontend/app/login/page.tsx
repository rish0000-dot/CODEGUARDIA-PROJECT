'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('admin@codeguardian.ai');
    const [password, setPassword] = useState('password123');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(email, password);
        } catch (err) {
            console.error('Form Submission Error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0f0f23]">
            {/* Dynamic Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="w-full max-w-md px-6 z-10"
            >
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 mb-6 shadow-lg shadow-indigo-500/20"
                        >
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">CodeGuardian AI</h1>
                        <p className="text-indigo-200/60 font-medium">Enterprise Security Intelligence</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-indigo-100/70 ml-1">Work Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300 hover:bg-white/10"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-semibold text-indigo-100/70">Password</label>
                                <button type="button" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">Forgot?</button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300 hover:bg-white/10"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/25 transition-all duration-300 flex items-center justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <AnimatePresence mode="wait">
                                {isSubmitting ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Authenticating...</span>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="text"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-2"
                                    >
                                        <span>Sign In</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        {/* Demo Credentials Helper */}
                        <div className="mt-8 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                            <p className="text-xs text-indigo-300/50 uppercase tracking-widest font-bold mb-2">Demo Access</p>
                            <p className="text-sm text-indigo-100/70 font-mono">admin@codeguardian.ai / password123</p>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-indigo-200/30 text-xs font-medium uppercase tracking-[0.2em]">
                    &copy; 2026 CodeGuardian AI &bull; Enterprise Grade
                </p>
            </motion.div>
        </div>
    );
}
