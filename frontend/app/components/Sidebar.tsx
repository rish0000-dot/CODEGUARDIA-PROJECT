'use client'
import {
    LayoutDashboard,
    GitPullRequest,
    Users,
    BarChart3,
    Settings,
    FileText,
    LogOut,
    ShieldAlert,
    UserCog,
    ChevronDown,
    Shield,
    CreditCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
    currentView: string;
    setCurrentView: (view: string) => void;
    user: any;
    logout: () => void;
}

export default function Sidebar({ currentView, setCurrentView, user, logout }: SidebarProps) {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);
    const allMenuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'DEVELOPER', 'VIEWER'] },
        { id: 'pr-automation', label: 'PR Auto-Review', icon: <GitPullRequest size={20} />, roles: ['ADMIN', 'DEVELOPER'] },
        { id: 'team', label: 'Team Velocity', icon: <Users size={20} />, roles: ['ADMIN', 'DEVELOPER'] },
        { id: 'analytics', label: 'ROI Analytics', icon: <BarChart3 size={20} />, roles: ['ADMIN', 'DEVELOPER', 'VIEWER'] },
        { id: 'rules', label: 'Custom Rules', icon: <Settings size={20} />, roles: ['ADMIN'] },
        { id: 'reports', label: 'Reports', icon: <FileText size={20} />, roles: ['ADMIN', 'VIEWER'] },
        { id: 'rbac', label: 'RBAC Management', icon: <UserCog size={20} />, roles: ['ADMIN'] },
        { id: 'audit-logs', label: 'Audit Logs', icon: <ShieldAlert size={20} />, roles: ['ADMIN'] },
    ];

    const menuItems = allMenuItems.filter(item => item.roles.includes(user?.role));

    return (
        <div style={{
            width: '280px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: 'rgba(15, 15, 35, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100
        }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .sidebar-menu::-webkit-scrollbar {
                    width: 4px;
                }
                .sidebar-menu::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar-menu::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .sidebar-menu::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            ` }} />
            {/* Logo Area */}
            <div style={{ marginBottom: '2rem', paddingLeft: '0.5rem' }}>
                <h1 style={{
                    fontSize: '1.25rem',
                    fontWeight: '900',
                    background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.25rem',
                    letterSpacing: '-1px'
                }}>
                    CodeGuardian
                </h1>
                <div style={{
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    fontWeight: '800'
                }}>
                    Enterprise
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="sidebar-menu" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                overflowY: 'auto',
                paddingRight: '4px'
            }}>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.65rem 1rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: currentView === item.id
                                ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.15), transparent)'
                                : 'transparent',
                            color: currentView === item.id ? '#fff' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left',
                            fontWeight: currentView === item.id ? '600' : '400',
                            fontSize: '0.85rem',
                            borderLeft: currentView === item.id ? '2px solid #8b5cf6' : '2px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                            if (currentView !== item.id) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (currentView !== item.id) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                            }
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </div>

            {/* User Profile Management */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                position: 'relative'
            }}>
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '16px',
                        background: showMenu ? 'rgba(255,255,255,0.05)' : 'transparent',
                        border: '1px solid rgba(255,255,255,0.05)',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        textAlign: 'left'
                    }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        color: 'white',
                        fontSize: '0.8rem',
                        flexShrink: 0
                    }}>
                        {user?.avatar || 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {user?.name || 'User'}
                        </div>
                        <div style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            textTransform: 'uppercase'
                        }}>
                            {user?.role}
                        </div>
                    </div>
                    <ChevronDown size={14} style={{
                        color: 'rgba(255,255,255,0.3)',
                        transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                    }} />
                </button>

                {/* DROPDOWN MENU */}
                {showMenu && (
                    <div style={{
                        position: 'absolute',
                        bottom: 'calc(100% + 12px)',
                        left: 0,
                        width: '100%',
                        background: 'rgba(15,15,35,0.98)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        padding: '0.5rem',
                        boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
                        zIndex: 1000,
                        animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <div style={{ padding: '0.5rem 0.75rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.25rem' }}>
                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: '800' }}>Logged in as</div>
                            <div style={{ fontSize: '0.75rem', color: 'white', fontWeight: '500', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                        </div>

                        {[
                            { icon: <Shield size={14} />, label: user?.mfaEnabled ? 'MFA Enabled' : 'Enable MFA', onClick: () => router.push('/mfa-setup'), color: user?.mfaEnabled ? '#10b981' : 'rgba(255,255,255,0.7)' },
                            { icon: <Settings size={14} />, label: 'Settings', onClick: () => setCurrentView('rules') },
                            { icon: <Users size={14} />, label: 'Team', onClick: () => setCurrentView('team') },
                            { icon: <CreditCard size={14} />, label: 'Billing', onClick: () => { } },
                        ].map((item, i) => (
                            <button
                                key={i}
                                onClick={() => { item.onClick(); setShowMenu(false); }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.65rem 0.75rem',
                                    borderRadius: '10px',
                                    color: item.color || 'rgba(255,255,255,0.7)',
                                    fontSize: '0.8rem',
                                    fontWeight: '500',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.color = 'white';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = item.color || 'rgba(255,255,255,0.7)';
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}

                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.25rem 0' }} />

                        <button
                            onClick={() => logout()}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.65rem 0.75rem',
                                borderRadius: '10px',
                                color: '#faafaf',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                                e.currentTarget.style.color = '#ff8080';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#faafaf';
                            }}
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
