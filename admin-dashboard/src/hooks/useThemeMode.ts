import { useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark';

export const useThemeMode = () => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const savedMode = localStorage.getItem('themeMode') as ThemeMode;
        return savedMode || 'light';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    return { mode, toggleTheme };
};
