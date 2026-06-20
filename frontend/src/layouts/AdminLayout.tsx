import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Box, IconButton, useTheme, Typography, Avatar, alpha } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AdminSidebar from '../components/AdminSidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useAppSelector } from '../store';
import { useMessagePolling } from '../hooks/useMessagePolling';
import SnackbarProvider from '../components/SnackbarProvider';

export default function AdminLayout() {
  const theme = useTheme();
  const location = useLocation();
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
        <Box sx={{ flex: 1, overflow: isMessagesPage ? 'hidden' : 'auto', p: isMessagesPage ? 0 : { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
