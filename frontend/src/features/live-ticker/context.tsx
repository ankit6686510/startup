'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AlertToast, AlertType } from './components/AlertToast';

interface LiveAlertsContextType {
    isEnabled: boolean;
    toggleAlerts: () => void;
}

const LiveAlertsContext = createContext<LiveAlertsContextType | undefined>(undefined);

export function LiveAlertsProvider({ children }: { children: React.ReactNode }) {
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        if (!isEnabled) return;

        // Simulate real-time events with random intervals
        const timeouts: NodeJS.Timeout[] = [];

        const scheduleNextAlert = () => {
            const delay = Math.random() * 15000 + 10000; // Random delay between 10s and 25s
            const timeout = setTimeout(() => {
                triggerRandomAlert();
                scheduleNextAlert();
            }, delay);
            timeouts.push(timeout);
        };

        // Initial kick-off
        const initialTimeout = setTimeout(scheduleNextAlert, 5000);
        timeouts.push(initialTimeout);

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [isEnabled]);

    const triggerRandomAlert = () => {
        const events: { type: AlertType; title: string; message: string }[] = [
            { type: 'FUNDING', title: 'Funding Alert', message: 'NeuralFlow AI just raised $12M Series A led by Sequoia.' },
            { type: 'FUNDING', title: 'Funding Alert', message: 'GreenTech Solutions secured $5M Seed funding.' },
            { type: 'NEW_STARTUP', title: 'New Arrival', message: 'QuantumLeap (Quantum Computing) just joined the platform.' },
            { type: 'TRENDING', title: 'Trending Now', message: 'FinTech sector is seeing +45% activity this week.' },
            { type: 'NEW_STARTUP', title: 'Product Launch', message: 'EcoStream just launched their Beta API.' },
        ];

        const randomEvent = events[Math.floor(Math.random() * events.length)];

        toast.custom((t) => (
            <AlertToast
                t={t}
                type={randomEvent.type}
                title={randomEvent.title}
                message={randomEvent.message}
            />
        ), {
            position: 'bottom-left',
            duration: 5000,
        });
    };

    const toggleAlerts = () => setIsEnabled(prev => !prev);

    return (
        <LiveAlertsContext.Provider value={{ isEnabled, toggleAlerts }}>
            {children}
        </LiveAlertsContext.Provider>
    );
}

export const useLiveAlerts = () => {
    const context = useContext(LiveAlertsContext);
    if (context === undefined) {
        throw new Error('useLiveAlerts must be used within a LiveAlertsProvider');
    }
    return context;
};
