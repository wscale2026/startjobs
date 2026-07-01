import React from 'react';
import { Tooltip, Box } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';

interface VerifiedBadgeProps {
  size?: 'small' | 'medium' | 'large';
  title?: string;
}

export default function VerifiedBadge({ size = 'small', title = 'Employeur vérifié par StartJobs' }: VerifiedBadgeProps) {
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;

  return (
    <Tooltip title={title} placement="top">
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}>
        <VerifiedIcon 
          sx={{ 
            fontSize: iconSize, 
            color: '#25D366', // WhatsApp green
          }} 
        />
      </Box>
    </Tooltip>
  );
}
