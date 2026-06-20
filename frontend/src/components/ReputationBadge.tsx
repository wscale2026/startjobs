import React from 'react';
import { Box, Rating, Typography, Chip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

interface ReputationBadgeProps {
  score: number;
  totalMissions: number;
  size?: 'small' | 'medium' | 'large';
}

export default function ReputationBadge({ score, totalMissions, size = 'medium' }: ReputationBadgeProps) {
  const starSize = size === 'large' ? 28 : size === 'medium' ? 20 : 16;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <StarIcon sx={{ color: '#FFC107', fontSize: starSize }} />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: size === 'large' ? '1.5rem' : size === 'medium' ? '1.125rem' : '0.9375rem',
            color: 'text.primary',
          }}
        >
          {score.toFixed(1)}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {totalMissions} mission{totalMissions > 1 ? 's' : ''}
      </Typography>
      {score >= 4.5 && (
        <Chip
          label="Top"
          size="small"
          sx={{
            bgcolor: 'secondary.main',
            color: 'white',
            fontWeight: 700,
            height: 20,
            fontSize: '0.625rem',
          }}
        />
      )}
    </Box>
  );
}
