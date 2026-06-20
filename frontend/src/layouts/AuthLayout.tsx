import React from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import SnackbarProvider from '../components/SnackbarProvider';

export default function AuthLayout() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
        background: `linear-gradient(135deg, ${theme.palette.primary.main}18 0%, ${theme.palette.secondary.main}10 100%)`,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 4,
          p: { xs: 3, sm: 4 },
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Outlet />
      </Paper>
      <SnackbarProvider />
    </Box>
  );
}
