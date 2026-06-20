import React, { useState } from 'react';
import {
  Box, Fab, Popover, Typography, IconButton, Paper,
  Avatar, TextField, useTheme, alpha,
} from '@mui/material';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function FloatingChat() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [message, setMessage] = useState('');
  const open = Boolean(anchorEl);

  return (
    <>
      <Fab
        color="primary"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="pressable"
        size="medium"
        sx={{
          position: 'fixed',
          bottom: { xs: 84, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 900,
          width: 48,
          height: 48,
          borderRadius: '14px',
          boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
        }}
      >
        <ChatBubbleRoundedIcon sx={{ fontSize: 20 }} />
      </Fab>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: isDark
                ? '0 20px 40px rgba(0,0,0,0.6)'
                : '0 20px 40px rgba(15,23,42,0.12)',
              overflow: 'hidden',
              mb: 1,
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32, height: 32, borderRadius: '8px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 16, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.875rem' }}>
                Support StartJobs
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box className="status-dot-live" sx={{ width: 6, height: 6 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                  En ligne
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setAnchorEl(null)} className="pressable" sx={{ borderRadius: '6px' }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ p: 2, bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02), minHeight: 200 }}>
          {/* Bot message */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Box
              sx={{
                width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 14, color: 'white' }} />
            </Box>
            <Box
              sx={{
                p: 1.5, borderRadius: '0 10px 10px 10px',
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                maxWidth: '80%',
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
                Bonjour ! Comment pouvons-nous vous aider aujourd'hui ?
              </Typography>
            </Box>
          </Box>

          {/* Promo message */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box
              sx={{
                width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 14, color: 'white' }} />
            </Box>
            <Box
              sx={{
                p: 1.5, borderRadius: '0 10px 10px 10px',
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                maxWidth: '80%',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 0.5 }}>
                Offre spéciale 🎓
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
                Formation certifiée en électricité — 50% de réduction ce mois-ci.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Input */}
        <Box
          sx={{
            p: 1.5,
            bgcolor: 'background.paper',
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Votre message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '0.875rem',
              },
            }}
          />
          <IconButton
            color="primary"
            disabled={!message}
            className="pressable"
            sx={{
              width: 34, height: 34,
              borderRadius: '8px',
              bgcolor: message ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              flexShrink: 0,
            }}
          >
            <SendIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Popover>
    </>
  );
}
