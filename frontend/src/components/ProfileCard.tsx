import React from 'react';
import { Box, Typography, Avatar, Chip, useTheme, alpha, Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import PlaceIcon from '@mui/icons-material/Place';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import type { Worker } from '../mocks/workers';

interface ProfileCardProps { worker: Worker; }

export default function ProfileCard({ worker }: ProfileCardProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      className="card-lift pressable"
      onClick={() => navigate(`/search/${worker.id}`)}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Top color accent: slim, elegant */}
      <Box sx={{ height: 2, bgcolor: worker.photoColor, opacity: 0.8 }} />

      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Header row */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Avatar
            src={worker.photo || undefined}
            sx={{
              width: 44,
              height: 44,
              bgcolor: worker.photoColor,
              fontSize: '0.875rem',
              fontWeight: 700,
              flexShrink: 0,
              borderRadius: '10px', // Shadcn: square avatars
            }}
          >
            {!worker.photo ? `${worker.prenom[0] || ''}${(worker.nom || '')[0] || ''}`.toUpperCase() : ''}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Name + verified */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  letterSpacing: '-0.015em',
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {worker.prenom} {worker.nom}
              </Typography>
              {worker.verified && (
                <VerifiedIcon sx={{ fontSize: 14, color: 'secondary.main', flexShrink: 0 }} />
              )}
            </Box>

            {/* Location */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PlaceIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {worker.quartier} · {worker.distance} km
              </Typography>
            </Box>
          </Box>

          {/* Availability Badge */}
          <Box sx={{ ml: 'auto', flexShrink: 0 }}>
            {worker.disponible ? (
              <Chip
                label="Disponible"
                size="small"
                color="secondary"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  height: 22,
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.15),
                  color: 'secondary.main',
                  border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                }}
              />
            ) : (
              <Chip
                label="Occupé"
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  height: 22,
                  color: 'text.disabled',
                  borderColor: 'divider',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Score + missions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              bgcolor: alpha('#F59E0B', isDark ? 0.15 : 0.1),
              borderRadius: '6px', px: 1, py: 0.25,
            }}
          >
            <StarIcon sx={{ fontSize: 12, color: '#F59E0B' }} />
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: isDark ? '#FDE68A' : '#92400E', lineHeight: 1 }}>
              {worker.score.toFixed(1)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem' }}>
            {worker.totalMissions} mission{worker.totalMissions > 1 ? 's' : ''}
          </Typography>
          {worker.typeProfil && (
            <Box sx={{ ml: 'auto' }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'text.disabled',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {worker.typeProfil}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Domains — compact pill tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {worker.domaines.slice(0, 3).map((d) => (
            <Typography
              key={d}
              variant="caption"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                px: 1,
                py: 0.25,
                borderRadius: '4px',
                bgcolor: alpha(worker.photoColor, isDark ? 0.15 : 0.08),
                color: worker.photoColor,
                lineHeight: 1.6,
              }}
            >
              {d}
            </Typography>
          ))}
        </Box>

        {/* Bio */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.8125rem',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {worker.bio}
        </Typography>

        {/* Footer action */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Button
            variant="contained"
            size="small"
            startIcon={<ChatIcon sx={{ fontSize: '14px !important' }} />}
            onClick={(e) => {
              e.stopPropagation();
              localStorage.setItem(
                'pending_application',
                JSON.stringify({
                  employerName: `${worker.prenom} ${worker.nom}`,
                  jobTitle: 'Prise de contact employeur',
                  isEmployerContact: true,
                  candidateId: (worker as any).user?.id || (worker as any).user_id,
                })
              );
              navigate('/messages');
            }}
            className="pressable"
            sx={{
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              py: 0.5,
              px: 1.25,
            }}
          >
            Contacter
          </Button>

          <Button
            variant="text"
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: '13px !important' }} />}
            sx={{
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'text.secondary',
            }}
          >
            Profil
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
