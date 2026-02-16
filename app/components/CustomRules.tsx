'use client'
import { useState, useEffect } from 'react'
import { Settings, Shield, Terminal, FileCode, CheckCircle2 } from 'lucide-react'

interface Rule {
    id: string;
    label: string;
    description: string;
    icon: any;
    enabled: boolean;
}

export default function CustomRules() {
    const [rules, setRules] = useState<Rule[]>([
        {
            id: 'no-console',
            label: 'No console.log',
            description: 'Flag any console.log statements left in production code.',
            icon: <Terminal size={20} color="#f59e0b" />,
            enabled: true
        },
        {
            id: 'strict-ts',
            label: 'Strict TypeScript',
            description: 'Enforce type definitions and ban "any" type usage.',
            icon: <Shield size={20} color="#3b82f6" />,
            enabled: true
        },
        {
            id: 'functional',
            label: 'Functional Components',
            description: 'Prefer React functional components over class components.',
            icon: <FileCode size={20} color="#ec4899" />,
            enabled: false
        },
        {
            id: 'naming',
            label: 'CamelCase Naming',
            description: 'Enforce camelCase for variables and functions.',
            icon: <CheckCircle2 size={20} color="#10b981" />,
            enabled: true
        }
    ]);

    useEffect(() => {
        const savedRules = localStorage.getItem('customRules');
        if (savedRules) {
            setRules(JSON.parse(savedRules));
        }
    }, []);

    const toggleRule = (id: string) => {
        const newRules = rules.map(rule =>
            rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
        );
        setRules(newRules);
        localStorage.setItem('customRules', JSON.stringify(newRules));
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', color: 'white' }}>

            {/* HEADER */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem'
                }}>
                    <Settings size={40} color="#ec4899" />
                    Custom Rules Engine
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>
                    Configure specific coding standards for the AI to enforce.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {rules.map((rule) => (
                    <div key={rule.id}
                        onClick={() => toggleRule(rule.id)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            border: `1px solid ${rule.enabled ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: rule.enabled ? '0 0 20px rgba(139, 92, 246, 0.2)' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                background: rule.enabled ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.05)',
                                padding: '1rem',
                                borderRadius: '12px',
                                transition: 'all 0.2s'
                            }}>
                                {rule.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.25rem', color: rule.enabled ? 'white' : 'rgba(255,255,255,0.6)' }}>
                                    {rule.label}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                                    {rule.description}
                                </div>
                            </div>
                        </div>

                        {/* TOGGLE SWITCH */}
                        <div style={{
                            width: '60px',
                            height: '32px',
                            background: rule.enabled ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            position: 'relative',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{
                                width: '26px',
                                height: '26px',
                                background: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '3px',
                                left: rule.enabled ? '31px' : '3px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }} />
                        </div>

                    </div>
                ))}
            </div>

        </div>
    )
}
