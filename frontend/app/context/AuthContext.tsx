'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

// Relative paths will be proxied via next.config.ts
const API_BASE_URL = '';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar: string;
    mfaEnabled?: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<{ requiresMFA?: boolean; mfaToken?: string } | void>;
    verifyMFA: (mfaToken: string, code: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    requiresMFA: boolean;
    mfaToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [requiresMFA, setRequiresMFA] = useState(false);
    const [mfaToken, setMfaToken] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    // Protect routes
    useEffect(() => {
        if (!loading) {
            const publicPaths = ['/login'];
            const isPublicPath = publicPaths.includes(pathname);

            if (!token && !isPublicPath && !requiresMFA) {
                router.push('/login');
            } else if (token && isPublicPath) {
                router.push('/');
            }
        }
    }, [token, loading, pathname, router]);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                if (data.requiresMFA) {
                    setRequiresMFA(true);
                    setMfaToken(data.mfaToken);
                    toast.info('Verification Required: Please enter your 6-digit MFA code.');
                    router.push('/mfa-verify');
                    return { requiresMFA: true, mfaToken: data.mfaToken };
                }

                const { token, user } = data;
                setToken(token);
                setUser(user);
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                toast.success(`Welcome back, ${user.name}!`);
                router.push('/');
            } else {
                toast.error(data.error || 'Login failed');
            }
        } catch (error: any) {
            toast.error('🌐 Connection Error: Backend unreachable (Port 5000)');
            throw error;
        }
    };

    const verifyMFA = async (mfaToken: string, code: string) => {
        try {
            const response = await axios.post('/api/auth/mfa/verify-login', { mfaToken, code });

            if (response.data.success) {
                const { token, user } = response.data;
                setToken(token);
                setUser(user);
                setRequiresMFA(false);
                setMfaToken(null);
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                toast.success(`Access Granted. Welcome, ${user.name}!`);
                router.push('/');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'MFA verification failed');
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.info('Logged out successfully');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, verifyMFA, logout, loading, requiresMFA, mfaToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
