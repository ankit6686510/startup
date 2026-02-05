import React from 'react';
import { ThemeProvider, CssBaseline, IconButton, Box } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import AdminDashboard from './components/AdminDashboard';
import { createAppTheme } from './theme/theme';
import { useThemeMode } from './hooks/useThemeMode';

function App() {
    const { mode, toggleTheme } = useThemeMode();
    const theme = React.useMemo(() => createAppTheme(mode), [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ position: 'relative', minHeight: '100vh' }}>
                {/* Theme Toggle Button */}
                <Box sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1300 }}>
                    <IconButton
                        onClick={toggleTheme}
                        color="inherit"
                        sx={{
                            bgcolor: 'background.paper',
                            boxShadow: 2,
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        }}
                    >
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Box>

                <AdminDashboard />
            </Box>
        </ThemeProvider>
    );
}

export default App;
