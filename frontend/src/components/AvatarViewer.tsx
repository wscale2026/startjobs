import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/* ─── Context ─────────────────────────────────────────────────────────────── */

interface AvatarViewerState {
  open: boolean;
  src: string | null;
  name: string;
  initials?: string;
  color?: string;
}

interface AvatarViewerContextValue {
  openViewer: (src: string | null | undefined, name: string, initials?: string, color?: string) => void;
}

const AvatarViewerContext = createContext<AvatarViewerContextValue>({
  openViewer: () => {},
});

export function useAvatarViewer() {
  return useContext(AvatarViewerContext);
}

/* ─── Provider + Modal ────────────────────────────────────────────────────── */

export function AvatarViewerProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';

  const [state, setState] = useState<AvatarViewerState>({
    open: false,
    src: null,
    name: '',
  });

  const openViewer = useCallback(
    (src: string | null | undefined, name: string, initials?: string, color?: string) => {
      setState({ open: true, src: src || null, name, initials, color });
    },
    []
  );

  const handleClose = () => setState((s) => ({ ...s, open: false }));

  return (
    <AvatarViewerContext.Provider value={{ openViewer }}>
      {children}

      <Dialog
        open={state.open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              background: 'transparent',
              boxShadow: 'none',
              overflow: 'visible',
              m: 0,
            },
          },
          backdrop: {
            sx: {
              backdropFilter: 'blur(12px)',
              bgcolor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.7)',
            },
          },
        }}
      >
        {/* Close button top-right */}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'fixed',
            top: { xs: 12, sm: 24 },
            right: { xs: 12, sm: 24 },
            bgcolor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.3)',
            color: '#fff',
            zIndex: 9999,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 2, sm: 3 },
            p: { xs: 2, sm: 3 },
            outline: 'none',
          }}
        >
          {/* Big Avatar */}
          <Avatar
            src={state.src || undefined}
            sx={{
              width: { xs: 220, sm: 300, md: 360 },
              height: { xs: 220, sm: 300, md: 360 },
              fontSize: { xs: '4rem', sm: '6rem', md: '7rem' },
              fontWeight: 800,
              bgcolor: state.color || theme.palette.primary.main,
              color: '#fff',
              boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              border: `4px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.6)'}`,
              transition: 'all 0.25s ease',
            }}
          >
            {!state.src && (state.initials || (state.name ? state.name[0].toUpperCase() : '?'))}
          </Avatar>

          {/* Name below */}
          {state.name && (
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                textAlign: 'center',
                px: 2,
              }}
            >
              {state.name}
            </Typography>
          )}
        </Box>
      </Dialog>
    </AvatarViewerContext.Provider>
  );
}
