'use client'
import { useState, useEffect } from 'react'
import { Users, Shield, Plus, MoreVertical, Trash2, Check, X, Search, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'

export default function RBACManagement() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'VIEWER', // Default
        password: ''
    })

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setUsers(response.data.users)
        } catch (err) {
            console.error('Failed to fetch users', err)
            toast.error('Failed to load users. Admin access required.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleAddUser = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            toast.error('All fields are required')
            return
        }

        try {
            const token = localStorage.getItem('token')
            await axios.post('http://localhost:5000/api/admin/users', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('User added successfully')
            setShowAddModal(false)
            setFormData({ name: '', email: '', role: 'VIEWER', password: '' }) // Reset
            fetchUsers()
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to add user')
        }
    }

    const handleDeleteUser = async (id: string, email: string) => {
        if (email === currentUser.email) {
            toast.error("You cannot delete your own account.")
            return
        }

        if (!confirm(`Are you sure you want to remove ${email}? This cannot be undone.`)) return

        try {
            const token = localStorage.getItem('token')
            await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('User removed successfully')
            fetchUsers()
        } catch (err) {
            toast.error('Failed to delete user')
        }
    }

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', color: 'white' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Users size={32} color="#8b5cf6" /> Team Management
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                        Manage access, roles, and permissions for your enterprise.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem 1.5rem',
                        color: 'white',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
                    }}
                >
                    <Plus size={20} /> Add New User
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '2rem', position: 'relative' }}>
                <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        padding: '1rem 1rem 1rem 3rem',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Users Table */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                {/* Table Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <div>User</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                </div>

                {/* Table Body */}
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No users found.</div>
                    ) : (
                        filteredUsers.map((u) => (
                            <div key={u.id} style={{
                                display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1fr',
                                padding: '1.25rem 1.5rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                alignItems: 'center',
                                transition: 'background 0.2s'
                            }}
                                className="hover:bg-white/5" // Tailwind shorthand implies we rely on standard css for hover if not using styled-components, but standard inline hover is hard. Using inline logic instead if needed, but simple layout is fine.
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.8rem'
                                    }}>
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontWeight: '600' }}>{u.name}</span>
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{u.email}</div>
                                <div>
                                    <span style={{
                                        padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
                                        background: u.role === 'ADMIN' ? 'rgba(139, 92, 246, 0.2)' : u.role === 'DEVELOPER' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.1)',
                                        color: u.role === 'ADMIN' ? '#c084fc' : u.role === 'DEVELOPER' ? '#60a5fa' : 'rgba(255,255,255,0.8)'
                                    }}>
                                        {u.role}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    {u.email !== currentUser.email && (
                                        <button
                                            onClick={() => handleDeleteUser(u.id, u.email)}
                                            style={{
                                                padding: '0.5rem', background: 'transparent', border: 'none',
                                                color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer', borderRadius: '8px',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Remove User"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ADD USER MODAL */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            style={{
                                background: '#13132b',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '24px',
                                padding: '2rem',
                                width: '450px',
                                maxWidth: '90vw',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>Add New User</h3>
                                <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Full Name</label>
                                    <input
                                        type="text" placeholder="John Doe"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Email Address</label>
                                    <input
                                        type="email" placeholder="john@company.com"
                                        value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Role</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {['ADMIN', 'DEVELOPER', 'VIEWER'].map(role => (
                                            <button
                                                key={role}
                                                onClick={() => setFormData({ ...formData, role })}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.75rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid',
                                                    borderColor: formData.role === role ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                                                    background: formData.role === role ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                                    color: formData.role === role ? 'white' : 'rgba(255,255,255,0.5)',
                                                    fontWeight: '600',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>Password</label>
                                    <input
                                        type="password" placeholder="••••••••"
                                        value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        style={inputStyle}
                                    />
                                </div>

                                <button
                                    onClick={handleAddUser}
                                    style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                                        border: 'none',
                                        borderRadius: '14px',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                                    }}
                                >
                                    Create Account
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '0.95rem',
    outline: 'none'
}
