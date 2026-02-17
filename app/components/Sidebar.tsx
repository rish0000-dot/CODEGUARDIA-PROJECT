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
    UserCog
} from 'lucide-react';

interface SidebarProps {
    currentView: string;
    setCurrentView: (view: string) => void;
    user: any;
}

export default function Sidebar({ currentView, setCurrentView, user }: SidebarProps) {
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
            {/* Logo Area */}
            <div style={{ marginBottom: '3rem', paddingLeft: '0.5rem' }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #00f5ff, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.5px'
                }}>
                    CodeGuardian
                </h1>
                <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                }}>
                    Enterprise
                </div>
            </div>

            {/* Navigation Menu */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: currentView === item.id
                                ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.2), transparent)'
                                : 'transparent',
                            color: currentView === item.id ? '#fff' : 'rgba(255,255,255,0.6)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left',
                            fontWeight: currentView === item.id ? '600' : '400',
                            borderLeft: currentView === item.id ? '3px solid #8b5cf6' : '3px solid transparent'
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

            {/* User Profile / Logout */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: 'white'
                    }}>
                        {user?.avatar || 'U'}
                    </div>
                    <div>
                        <div style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}>{user?.name || 'User'}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{user?.role}</div>
                    </div>
                </div>

                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: 'rgba(239, 68, 68, 0.8)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    padding: '0.5rem 0',
                    transition: 'color 0.2s'
                }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(239, 68, 68, 0.8)'}
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
