import React from 'react';
import {
  Box, Typography, Avatar, Chip, useTheme, alpha, Button,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import type { JobOffer } from '../mocks/offers';

interface OfferCardProps { 
  offer: JobOffer; 
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

const DOMAINE_COLORS: Record<string, string> = {
  'Cuisine':      '#EA580C',
  'Livraison':    '#1D4ED8',
  'Peinture':     '#7C3AED',
  'Sécurité':     '#374151',
  'Enseignement': '#4C1D95',
  'Ménage':       '#059669',
  'Électricité':  '#D97706',
  'Coiffure':     '#BE185D',
  'Construction': '#0891B2',
  'Formation':    '#059669',
};

export default function OfferCard({ offer, onEdit, onDelete }: OfferCardProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const color = DOMAINE_COLORS[offer.domaine] ?? theme.palette.primary.main;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = encodeURIComponent(
      `Bonjour, je réponds à votre offre "${offer.titre}" sur StartJobs.`
    );
    window.open(`https://wa.me/${offer.whatsapp.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
  };

  return (
    <Box
      className="card-lift pressable"
      onClick={() => navigate(`/offers/${offer.id}`)}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <Box sx={{ height: 2, background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})` }} />

      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          {/* Domain avatar */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: alpha(color, isDark ? 0.2 : 0.1),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800, color, letterSpacing: '0.02em' }}>
              {offer.domaine.substring(0, 2).toUpperCase()}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Title + urgent */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
              {offer.urgent && <LocalFireDepartmentIcon sx={{ fontSize: 13, color: 'error.main', flexShrink: 0 }} />}
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  letterSpacing: '-0.015em',
                  lineHeight: 1.3,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {offer.titre}
              </Typography>
            </Box>

            {/* Employer */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.75rem' }}>
                {offer.employeur}
              </Typography>
              {offer.employeurVerifie && (
                <VerifiedIcon sx={{ fontSize: 12, color: 'secondary.main', flexShrink: 0 }} />
              )}
            </Box>
          </Box>
        </Box>

        {/* Meta */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PlaceIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {offer.quartier} · {offer.distance} km
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {offer.datePosted}
            </Typography>
          </Box>
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: '0.8125rem',
            lineHeight: 1.65,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}
        >
          {offer.description}
        </Typography>

        {/* Tags */}
        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.75rem', fontWeight: 600, px: 1, py: 0.25,
              borderRadius: '4px',
              bgcolor: alpha(color, isDark ? 0.18 : 0.08),
              color,
            }}
          >
            {offer.domaine}
          </Typography>
          {offer.budget && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.75rem', fontWeight: 700, px: 1, py: 0.25,
                borderRadius: '4px',
                bgcolor: alpha(theme.palette.secondary.main, isDark ? 0.18 : 0.08),
                color: 'secondary.main',
              }}
            >
              {offer.budget}
            </Typography>
          )}
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem', ml: 'auto' }}>
            {offer.duree}
          </Typography>
        </Box>

        {/* Footer action */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            pt: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          {onEdit && onDelete ? (
            <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(e);
                }}
                sx={{ flex: 1, borderRadius: 2, fontSize: '0.8rem', py: 0.5 }}
              >
                Modifier
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(e);
                }}
                sx={{ flex: 1, borderRadius: 2, fontSize: '0.8rem', py: 0.5 }}
              >
                Supprimer
              </Button>
            </Box>
          ) : (
            <>
              <Box
                onClick={handleWhatsApp}
                className="pressable"
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 0.75,
                  px: 1.5, py: 0.75,
                  borderRadius: '6px',
                  border: '1px solid #16A34A',
                  color: '#16A34A',
                  bgcolor: alpha('#16A34A', isDark ? 0.12 : 0.06),
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  '&:hover': { bgcolor: alpha('#16A34A', isDark ? 0.2 : 0.12) },
                }}
              >
                <WhatsAppIcon sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>WhatsApp</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                <Typography variant="caption" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>Voir</Typography>
                <ArrowForwardIcon sx={{ fontSize: 13 }} />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
