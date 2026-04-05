'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';

function VerifyContent() {
    const { verifyEmail } = useAuth();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    React.useEffect(() => {
        if (token) {
            verifyEmail(token).then((success: boolean) => {
                setStatus(success ? 'success' : 'error');
            });
        }
    }, [token, verifyEmail]);

    return (
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl text-center max-w-sm w-full">
            {status === 'loading' && (
                <>
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
                    <h1 className="text-2xl font-bold text-white mb-2">Verifying Email...</h1>
                    <p className="text-gray-400 text-sm">One second while we secure your account.</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                        <ShieldCheck className="text-green-400 w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
                    <p className="text-gray-400 text-sm mb-8">Your account is now active and secure.</p>
                    <a href="/login" className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all">
                        Proceed to Login
                    </a>
                </>
            )}

            {status === 'error' && (
                <>
                    <h1 className="text-2xl font-bold text-white mb-2 text-red-400">Verification Failed</h1>
                    <p className="text-gray-400 text-sm mb-8">The link may have expired or is invalid.</p>
                    <a href="/signup" className="block w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all">
                        Back to Signup
                    </a>
                </>
            )}
        </div>
    );
}

export default function VerifyPage() {
    return (
        <div className="min-h-screen bg-[#050510] flex items-center justify-center p-4">
            <Suspense fallback={<Loader2 className="animate-spin text-white" />}>
                <VerifyContent />
            </Suspense>
        </div>
    );
}
