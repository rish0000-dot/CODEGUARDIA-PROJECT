'use client';

import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationToastProps {
    message: string;
    onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 500);
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            zIndex: 10000,
            transform: visible ? 'translateX(0)' : 'translateX(120%)',
            transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            borderLeft: '4px solid #8b5cf6'
        }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                <Bell size={20} color="#a78bfa" />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', color: 'white', fontSize: '0.875rem' }}>Update</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.8125rem' }}>{message}</div>
            </div>
            <button
                onClick={() => { setVisible(false); setTimeout(onClose, 500); }}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255, 255, 255, 0.4)', cursor: 'pointer' }}
            >
                <X size={16} />
            </button>
        </div>
    );
};
