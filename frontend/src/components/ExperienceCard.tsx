import React from 'react';
import {
  Box, Typography, Avatar, useTheme, alpha, Chip,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import type { Experience } from '../mocks/workers';

interface ExperienceCardProps {
  experience: Experience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isVerified = experience.type === 'verified';

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '10px',
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
        display: 'flex',
        gap: 2,
        alignItems: 'flex-start',
      }}
    >
      {/* Left indicator */}
      <Box
        sx={{
          width: 8,
          flexShrink: 0,
          mt: 0.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: isVerified ? 'secondary.main' : 'text.disabled',
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.875rem', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            {experience.titre}
          </Typography>
          {isVerified && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              <VerifiedIcon sx={{ fontSize: 13, color: 'secondary.main' }} />
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: 'secondary.main', fontWeight: 600 }}>
                Vérifié
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', mb: 1 }}>
          {experience.employeur} · {experience.date}
        </Typography>

        {isVerified && experience.rating && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon
                  key={s}
                  sx={{
                    fontSize: 11,
                    color: s <= Math.round(experience.rating!) ? '#F59E0B' : alpha('#F59E0B', 0.25),
                  }}
                />
              ))}
              <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? '#FDE68A' : '#92400E', fontSize: '0.75rem' }}>
                {experience.rating.toFixed(1)}
              </Typography>
            </Box>
            {experience.commentaire && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                "{experience.commentaire}"
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
