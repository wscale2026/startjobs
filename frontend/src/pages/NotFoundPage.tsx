import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 4 }}>
      <SearchOffIcon sx={{ fontSize: 80, color: 'text.disabled' }} />
      <Typography variant="h4" sx={{ fontWeight: 700 }}>Page introuvable</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 300 }}>
        La page que vous cherchez n'existe pas ou a été déplacée.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')} sx={{ borderRadius: 3, mt: 1 }}>
        Retour à l'accueil
      </Button>
    </Box>
  );
}
