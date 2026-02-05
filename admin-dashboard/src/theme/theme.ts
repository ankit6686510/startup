import { createTheme, ThemeOptions } from '@mui/material/styles';

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Light mode
                primary: {
                    main: '#6366f1',
                    light: '#818cf8',
                    dark: '#4f46e5',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#8b5cf6',
                    light: '#a78bfa',
                    dark: '#7c3aed',
                },
                success: {
                    main: '#10b981',
                    light: '#34d399',
                    dark: '#059669',
                },
                warning: {
                    main: '#f59e0b',
                    light: '#fbbf24',
                    dark: '#d97706',
                },
                error: {
                    main: '#ef4444',
                    light: '#f87171',
                    dark: '#dc2626',
                },
                info: {
                    main: '#3b82f6',
                    light: '#60a5fa',
                    dark: '#2563eb',
                },
                background: {
                    default: '#f8fafc',
                    paper: '#ffffff',
                },
                text: {
                    primary: '#1e293b',
                    secondary: '#64748b',
                },
            }
            : {
                // Dark mode
                primary: {
                    main: '#818cf8',
                    light: '#a5b4fc',
                    dark: '#6366f1',
                    contrastText: '#000000',
                },
                secondary: {
                    main: '#a78bfa',
                    light: '#c4b5fd',
                    dark: '#8b5cf6',
                },
                success: {
                    main: '#34d399',
                    light: '#6ee7b7',
                    dark: '#10b981',
                },
                warning: {
                    main: '#fbbf24',
                    light: '#fcd34d',
                    dark: '#f59e0b',
                },
                error: {
                    main: '#f87171',
                    light: '#fca5a5',
                    dark: '#ef4444',
                },
                info: {
                    main: '#60a5fa',
                    light: '#93c5fd',
                    dark: '#3b82f6',
                },
                background: {
                    default: '#0f172a',
                    paper: '#1e293b',
                },
                text: {
                    primary: '#f1f5f9',
                    secondary: '#cbd5e1',
                },
            }),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
        },
        h2: {
            fontWeight: 700,
            fontSize: '2rem',
        },
        h3: {
            fontWeight: 600,
            fontSize: '1.75rem',
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: mode === 'light'
                        ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                        : '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
                    transition: 'box-shadow 0.3s ease-in-out',
                    '&:hover': {
                        boxShadow: mode === 'light'
                            ? '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                            : '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontWeight: 500,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    backgroundColor: mode === 'light' ? '#f1f5f9' : '#334155',
                },
            },
        },
    },
});

export const createAppTheme = (mode: 'light' | 'dark') => {
    return createTheme(getDesignTokens(mode));
};
