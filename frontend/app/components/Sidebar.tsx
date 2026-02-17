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
    logout: () => void;
}

export default function Sidebar({ currentView, setCurrentView, user, logout }: SidebarProps) {
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

            {/* User Profile / Logout */}
            <div style={{
                marginTop: 'auto',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem',
                    borderRadius: '12px',
                    transition: 'background 0.2s',
                    cursor: 'default'
                }}>
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
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                    }}>
                        {user?.avatar || 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {user?.name || 'User'}
                        </div>
                        <div style={{
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {user?.role}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => logout()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        color: 'rgba(255, 255, 255, 0.6)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        padding: '0.5rem',
                        transition: 'all 0.2s ease',
                        width: '100%'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                    }}
                >
                    <LogOut size={14} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
