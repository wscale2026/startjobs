import React from 'react';
import { Box, Typography, alpha, useTheme, Button } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PublicIcon from '@mui/icons-material/Public';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface AdCardProps { ad: any; }

export default function AdCard({ ad }: AdCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (!ad) return null;

  const handleClick = () => {
    if (ad.ad_url) {
      window.open(ad.ad_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Box
      className="card-static pressable"
      onClick={handleClick}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '16px',
        border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.3 : 0.15)}`,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          '& .ad-cta': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }
        }
      }}
    >
      {/* Media / Image Container */}
      <Box 
        sx={{ 
          height: 160, 
          width: '100%', 
          position: 'relative',
          bgcolor: ad.ad_image_url ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
          backgroundImage: ad.ad_image_url ? `url(${ad.ad_image_url})` : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        {/* SPONSORED BADGE */}
        <Box 
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 1.25, py: 0.5,
            borderRadius: '6px',
            bgcolor: 'rgba(0, 0, 0, 0.65)',
            color: '#fff',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 14, color: theme.palette.warning.main }} />
          <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Sponsorisé
          </Typography>
        </Box>

        {/* Fallback Icon if no image */}
        {!ad.ad_image_url && (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.2 }}>
            <PublicIcon sx={{ fontSize: 64, color: 'primary.main' }} />
          </Box>
        )}
      </Box>

      {/* Content Container */}
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary', 
            fontWeight: 700, 
            mb: 0.5, 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            fontSize: '0.7rem'
          }}
        >
          {ad.employer?.company_name || ad.employeur || 'Partenaire StartJobs'}
        </Typography>

        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 800, 
            lineHeight: 1.3, 
            mb: 1.5,
            color: 'text.primary',
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden' 
          }}
        >
          {ad.title || ad.titre}
        </Typography>

        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary', 
            lineHeight: 1.6,
            mb: 3,
            display: '-webkit-box', 
            WebkitLineClamp: 3, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden' 
          }}
        >
          {ad.description}
        </Typography>

        {/* Call To Action */}
        <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button
            className="ad-cta"
            fullWidth
            variant="outlined"
            color="primary"
            endIcon={<OpenInNewIcon />}
            sx={{ 
              borderRadius: '8px', 
              fontWeight: 700, 
              textTransform: 'none',
              transition: 'all 0.2s ease',
              borderWidth: '2px',
              '&:hover': { borderWidth: '2px' }
            }}
          >
            En savoir plus
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
