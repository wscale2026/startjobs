import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageLoaderProps {
  text?: string;
}

export default function PageLoader({ text = "Chargement des données..." }: PageLoaderProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '50vh', 
        gap: 3 
      }}
    >
      <Box sx={{
        display: 'inline-block',
        position: 'relative',
        width: 80,
        height: 80,
      }}>
        {/* Ring CSS animation inspired by loading.io */}
        {[0, 1, 2, 3].map((i) => (
          <Box key={i} sx={{
            boxSizing: 'border-box',
            display: 'block',
            position: 'absolute',
            width: 64,
            height: 64,
            margin: '8px',
            border: '6px solid transparent',
            borderRadius: '50%',
            animation: 'lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
            borderColor: 'primary.main transparent transparent transparent',
            animationDelay: `${-0.15 * (3 - i)}s`
          }} />
        ))}
      </Box>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ 
          fontWeight: 600, 
          letterSpacing: '0.5px',
          animation: 'pulse 1.5s infinite ease-in-out' 
        }}
      >
        {text}
      </Typography>
      <style>{`
        @keyframes lds-ring {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </Box>
  );
}
