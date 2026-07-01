import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Box, IconButton, useTheme, Typography, Avatar, alpha, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AdminSidebar from '../components/AdminSidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAppSelector } from '../store';
import { useMessagePolling } from '../hooks/useMessagePolling';
import SnackbarProvider from '../components/SnackbarProvider';

export default function AdminLayout() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const isMessagesPage = location.pathname.includes('/messages');
  const auth = useAppSelector(state => state.auth);

  // Protected route check
  if (auth.role !== 'admin' && auth.role !== 'staff' && !auth.user?.is_superuser && !auth.user?.is_staff && auth.status !== 'loading') {
    return <Navigate to="/admin/login" replace />;
  }

  // Poll for admin messages (using global hook)
  useMessagePolling(5000);

  return (
    <Box sx={{ display: 'flex', height: '100dvh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <SnackbarProvider />
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <Box
          sx={{
            height: 72,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(12px)',
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit" onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ display: { xs: 'flex', md: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Administration StartJobs
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ThemeToggle />
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{auth.user?.username || 'Admin'}</Typography>
              <Typography variant="caption" color="text.secondary">{auth.user?.email || 'admin@startjobs.cm'}</Typography>
            </Box>
            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>
              {auth.user?.username ? auth.user.username[0].toUpperCase() : 'A'}
            </Avatar>
          </Box>
        </Box>

        {/* Page Content */}
        <Box sx={{ flex: 1, overflow: isMessagesPage ? 'hidden' : 'auto', p: isMessagesPage ? 0 : { xs: 2, md: 4 }, pb: { xs: 14, md: isMessagesPage ? 0 : 4 } }}>
          <Outlet />
        </Box>
      </Box>

      {/* Mobile Bottom Navigation (Premium Floating Pill) */}
      <Box sx={{ 
        display: { xs: 'flex', md: 'none' }, 
        position: 'fixed', 
        bottom: 16, 
        left: 16, 
        right: 16, 
        zIndex: 1100,
        borderRadius: '24px',
        bgcolor: isDark ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
        p: 0.75,
        justifyContent: 'center'
      }}>
        <BottomNavigation
          showLabels={false}
          value={location.pathname === '/admin' ? 0 : location.pathname.includes('/admin/users') ? 1 : location.pathname.includes('/admin/offers') ? 2 : false}
          onChange={(event, newValue) => {
            if (newValue === 3) {
              setSidebarOpen(true);
            } else {
              const paths = ['/admin', '/admin/users', '/admin/offers'];
              navigate(paths[newValue]);
            }
          }}
          sx={{ bgcolor: 'transparent', height: 56, gap: 1, width: '100%' }}
        >
          {[
            { label: 'Accueil', icon: <DashboardIcon /> },
            { label: 'Utilisateurs', icon: <PeopleIcon /> },
            { label: 'Offres', icon: <WorkIcon /> },
            { label: 'Menu', icon: <MenuIcon /> }
          ].map((item, i) => {
            const isActive = location.pathname === '/admin' ? i === 0 : location.pathname.includes('/admin/users') ? i === 1 : location.pathname.includes('/admin/offers') ? i === 2 : false;
            return (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 0.5,
                    color: isActive ? (isDark ? '#fff' : 'primary.main') : 'text.secondary',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isActive ? 'translateY(-2px)' : 'none',
                  }}>
                    {item.icon}
                  </Box>
                }
                className="pressable"
                sx={{ 
                  minWidth: '60px',
                  p: 0,
                  borderRadius: '16px',
                  bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  transition: 'all 0.25s ease',
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.65rem',
                    fontWeight: isActive ? 800 : 500,
                    opacity: isActive ? 1 : 0,
                    mt: 0.5,
                    transition: 'all 0.25s ease',
                    display: isActive ? 'block' : 'none'
                  }
                }}
              />
            );
          })}
        </BottomNavigation>
      </Box>
    </Box>
  );
}
