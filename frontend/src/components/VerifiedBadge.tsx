import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';

interface VerifiedBadgeProps {
  label?: string;
  size?: 'small' | 'medium';
}

export default function VerifiedBadge({ label = 'Vérifié', size = 'small' }: VerifiedBadgeProps) {
  return (
    <Tooltip title="Profil vérifié par StartJobs">
      <Chip
        icon={<VerifiedIcon sx={{ fontSize: '14px !important', color: 'white !important' }} />}
        label={label}
        size={size}
        sx={{
          bgcolor: 'secondary.main',
          color: 'white',
          fontWeight: 600,
          height: size === 'small' ? 24 : 32,
          fontSize: size === 'small' ? '0.6875rem' : '0.8125rem',
        }}
      />
    </Tooltip>
  );
}
