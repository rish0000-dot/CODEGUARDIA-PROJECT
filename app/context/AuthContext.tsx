'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
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

            if (!token && !isPublicPath) {
                router.push('/login');
            } else if (token && isPublicPath) {
                router.push('/');
            }
        }
    }, [token, loading, pathname, router]);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });

            if (response.data.success) {
                const { token, user } = response.data;
                setToken(token);
                setUser(user);
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                toast.success(`Welcome back, ${user.name}!`);
                router.push('/');
            }
        } catch (error: any) {
            let message = 'Login failed. Please check your credentials.';
            if (!error.response) {
                message = '🌐 Backend Error: Server is not running on port 5000. Please run "npm run dev:full"';
            } else {
                message = error.response.data?.error || message;
            }
            toast.error(message, { duration: 5000 });
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
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
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
