'use client';

import React from 'react';

interface ProgressRingProps {
    radius: number;
    stroke: number;
    progress: number;
    status: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ radius, stroke, progress, status }) => {
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
            <svg
                height={radius * 2}
                width={radius * 2}
                style={{ transform: 'rotate(-90deg)', transition: 'all 0.4s ease' }}
            >
                <circle
                    stroke="rgba(255,255,255,0.1)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke={progress === 100 ? '#10b981' : '#00f5ff'}
                    fill="transparent"
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeLinecap="round"
                />
            </svg>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white' }}>{progress}%</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem' }}>{status}</div>
            </div>
        </div>
    );
};
