import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Box, Typography, Avatar, IconButton, Slide, useTheme, alpha } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../store';
import { dismissSnackbar } from '../store/slices/snackbarSlice';

export default function SnackbarProvider() {
  const dispatch = useAppDispatch();
  const queue = useAppSelector((s) => s.snackbar.queue);
  const current = queue[0] ?? null;
  const theme = useTheme();

  const isWhatsApp = current?.message?.startsWith('WHATSAPP|');
  
  let senderName = '';
  let messageBody = '';
  
  if (isWhatsApp) {
    const parts = current.message.split('|');
    senderName = parts[1] || 'StartJobs';
    messageBody = parts[2] || '';
  }

  return current ? (
    <Snackbar
      key={current.id}
      open
      autoHideDuration={isWhatsApp ? 5000 : 4000}
      onClose={() => dispatch(dismissSnackbar(current.id))}
      anchorOrigin={isWhatsApp ? { vertical: 'top', horizontal: 'center' } : { vertical: 'bottom', horizontal: 'center' }}
      sx={isWhatsApp ? { mt: { xs: 2, sm: 4 }, maxWidth: 400, width: '100%', px: 2 } : { mb: 9 }}
    >
      {isWhatsApp ? (
        <Box
          sx={{
            width: '100%',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 8px 32px rgba(0,0,0,0.6)' 
              : '0 8px 32px rgba(0,0,0,0.12)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          {/* Header */}
          <Box sx={{ 
            px: 2, py: 1.5, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem', fontWeight: 700 }}>
              {senderName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {senderName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: -0.25 }}>
                Nouveau message
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => dispatch(dismissSnackbar(current.id))} sx={{ p: 0.5 }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
          {/* Body */}
          <Box sx={{ px: 2, py: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
              {messageBody}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Alert
          severity={current.severity}
          onClose={() => dispatch(dismissSnackbar(current.id))}
          sx={{ width: '100%', borderRadius: 3 }}
        >
          {current.message}
        </Alert>
      )}
    </Snackbar>
  ) : null;
}
