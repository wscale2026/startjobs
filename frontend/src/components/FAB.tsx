import React from 'react';
import { Fab, useTheme, useMediaQuery, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

export default function FAB() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: isMobile ? 80 : 32, // Above bottom nav on mobile
        right: { xs: 16, sm: 24, md: 32 },
        zIndex: 1100, // Above other content, below dialogs
      }}
    >
      <Fab
        color="primary"
        variant="extended"
        onClick={() => navigate('/post-offer')}
        className="pressable"
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.01em',
          // Note: transform and box-shadow transitions are handled by theme.ts MuiFab override
        }}
      >
        <AddIcon sx={{ mr: 0.5 }} />
        Publier une offre
      </Fab>
    </Box>
  );
}
