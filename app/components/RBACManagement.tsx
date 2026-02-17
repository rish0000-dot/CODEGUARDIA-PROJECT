'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import { Shield, User, ChevronDown, Check, X, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UserData {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar: string;
}

export default function RBACManagement() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { token } = useAuth();

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdatingId(userId);
        try {
            const response = await axios.post('http://localhost:5000/api/admin/users/assign-role',
                { userId, newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                toast.success(`Role updated to ${newRole}`);
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update role');
        } finally {
            setUpdatingId(null);
        }
    };

    const getRoleStyles = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
            case 'DEVELOPER': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'VIEWER': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Access Management</h1>
                    <p className="text-gray-400 mt-2 font-medium">Manage enterprise roles and system permissions</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-bottom border-white/5 bg-white/5">
                                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Team Member</th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Current Role</th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Assignment</th>
                                <th className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {users.map((u) => (
                                    <motion.tr
                                        key={u.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                                                    {u.avatar}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-lg">{u.name}</div>
                                                    <div className="text-gray-500 text-xs font-mono">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getRoleStyles(u.role)}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                {['ADMIN', 'DEVELOPER', 'VIEWER'].map((role) => (
                                                    <button
                                                        key={role}
                                                        disabled={u.role === role || updatingId === u.id}
                                                        onClick={() => handleRoleChange(u.id, role)}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all transform active:scale-95 disabled:cursor-not-allowed
                                                            ${u.role === role
                                                                ? 'bg-white/20 text-white border border-white/20 opacity-50'
                                                                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white hover:border-white/20'
                                                            }
                                                        `}
                                                    >
                                                        {role === 'ADMIN' ? 'Full Access' : role === 'DEVELOPER' ? 'Dev Only' : 'Read Only'}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {updatingId === u.id ? (
                                                <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin ml-auto" />
                                            ) : (
                                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full blur-[2px] animate-pulse ml-auto" />
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {loading && (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Synchronizing Permissions...</p>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-white/10 p-8 rounded-[32px] flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                        <Shield className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-white">Security Policy Enforcement</h4>
                        <p className="text-gray-400 leading-relaxed">
                            Changes to user roles are effective immediately across all clusters.
                            All modifications are cryptographically signed and recorded in the permanent audit trail.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
