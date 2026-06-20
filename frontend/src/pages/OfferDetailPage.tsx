import React from 'react';
import {
  Box, Typography, Button, Chip, Avatar, Paper, Divider,
  IconButton, Stack, useTheme, Grid, CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import VerifiedIcon from '@mui/icons-material/Verified';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_OFFERS } from '../mocks/offers';
import { useAppSelector, useAppDispatch } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { fetchOffers } from '../store/slices/offersSlice';
import { createApplication } from '../store/slices/applicationsSlice';
import api from '../utils/api';

const DOMAINE_COLORS: Record<string, string> = {
  Cuisine: '#FF6F00', Livraison: '#1565C0', Peinture: '#AD1457',
  Sécurité: '#37474F', Enseignement: '#4527A0', Ménage: '#2E7D32',
  Électricité: '#F57F17', Coiffure: '#C62828',
};

export default function OfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  
  const { items: apiOffers, status } = useAppSelector((state) => state.offers);
  const role = useAppSelector((state) => state.auth.role);
  
  React.useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchOffers());
    }
  }, [status, dispatch]);

  // Try to find in Redux store first, fallback to mock offers if it's a mock ID
  const offer = apiOffers.find((o) => o.id === id) || MOCK_OFFERS.find((o) => o.id === id);

  const isEmployer = role === 'employer';
  const isCandidate = role === 'candidate' || !role;

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!offer) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5">Offre introuvable</Typography>
        <Button onClick={() => navigate('/offers')} sx={{ mt: 2 }}>Retour aux offres</Button>
      </Box>
    );
  }

  const domaineColor = DOMAINE_COLORS[offer.domaine] ?? theme.palette.primary.main;
  const whatsappMsg = encodeURIComponent(
    `Bonjour, je réponds à votre offre "${offer.titre}" sur StartJobs. Je suis disponible et intéressé(e). Pouvons-nous discuter ?`
  );

  const handleApplyViaMessenger = async () => {
    const employeurUserId = (offer as any).employeurUserId;

    if (!employeurUserId) {
      dispatch(showSnackbar({ message: "Impossible de contacter l'employeur (profil non trouvé).", severity: 'error' }));
      return;
    }

    // 1. Store in pending application for chat logic
    localStorage.setItem(
      'pending_application',
      JSON.stringify({
        employerName: offer.employeur,
        jobTitle: offer.titre,
        offerId: offer.id,
        candidateId: employeurUserId,
      })
    );

    // 2. Post application to API (fire and forget for UI, but updates Redux)
    const offerIdNum = Number(offer.id);
    if (!isNaN(offerIdNum)) {
      dispatch(createApplication(offerIdNum) as any)
        .unwrap()
        .catch((err: any) => {
          console.error('Failed to post application:', err);
        });
    }

    dispatch(showSnackbar({ message: 'Candidature envoyée ! Redirection vers la messagerie... 💬', severity: 'success' }));
    navigate('/messages');
  };

  return (
    <Box>
      {/* Back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ border: `1px solid ${theme.palette.divider}`, mr: 1 }}>
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Retour aux offres
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column: Job Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Main header block */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 5,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
              position: 'relative',
              background: `linear-gradient(180deg, ${domaineColor}14 0%, transparent 100%)`,
            }}
          >
            <Box sx={{ height: 6, bgcolor: domaineColor }} />
            <Box sx={{ p: 3.5 }}>
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Avatar
                  sx={{
                    bgcolor: domaineColor,
                    width: 64,
                    height: 64,
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    boxShadow: `0 4px 14px ${domaineColor}35`,
                  }}
                >
                  {offer.domaine.substring(0, 2).toUpperCase()}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                    {offer.urgent && (
                      <Chip
                        icon={<LocalFireDepartmentIcon sx={{ color: 'white !important', fontSize: '13px !important' }} />}
                        label="URGENT"
                        size="small"
                        color="error"
                        sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
                      />
                    )}
                    <Chip
                      label={offer.domaine}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 20,
                        bgcolor: `${domaineColor}1a`,
                        color: domaineColor,
                      }}
                    />
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1, lineHeight: 1.25 }}>
                    {offer.titre}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {offer.employeur}
                    </Typography>
                    {offer.employeurVerifie && (
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: '13px !important' }} />}
                        label="Vérifié"
                        size="small"
                        color="secondary"
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, color: 'white' }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Job description */}
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 5,
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.015em', mb: 2 }}>
              Description du poste
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', whiteSpace: 'pre-line' }}>
              {offer.description}
            </Typography>
          </Paper>

          {/* Key practical info cards */}
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.015em', mb: 2, px: 0.5 }}>
            Détails pratiques
          </Typography>
          <Grid container spacing={2}>
            {[
              { icon: <PlaceIcon color="primary" />, label: 'Quartier & Distance', value: `${offer.quartier} (${offer.distance} km)` },
              { icon: <CalendarTodayIcon color="primary" />, label: 'Date de début', value: offer.dateDebut },
              { icon: <AccessTimeIcon color="primary" />, label: 'Date de publication', value: offer.datePosted },
              { icon: <MonetizationOnIcon color="secondary" />, label: 'Rémunération', value: offer.budget || 'Non spécifié' },
            ].map((item, idx) => (
              <Grid size={{ xs: 6, sm: 6 }} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Avatar sx={{ bgcolor: 'background.default', width: 36, height: 36 }}>
                    {item.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right Column: Dynamic Action Sticky Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ position: 'sticky', top: 90 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 5,
                border: `1px solid ${theme.palette.divider}`,
                background: 'background.paper',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                Raccourcis de candidature
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Postulez instantanément via notre messagerie interne sécurisée ou contactez directement l'employeur.
              </Typography>

              {isEmployer ? (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: 'action.hover',
                    textAlign: 'center',
                    border: `1px dashed ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Visualisation Employeur
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vous êtes l'auteur de cette offre ou connecté en tant qu'employeur.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {/* Instantly Apply via messages */}
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<ChatIcon />}
                    onClick={handleApplyViaMessenger}
                    className="pressable"
                    sx={{
                      borderRadius: 3.5,
                      py: 1.75,
                      fontWeight: 700,
                      boxShadow: theme.shadows[2],
                    }}
                  >
                    Postuler via Messagerie
                  </Button>

                  {/* Apply via WhatsApp */}
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<WhatsAppIcon />}
                    href={`https://wa.me/${offer.whatsapp.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener"
                    className="pressable"
                    sx={{
                      borderColor: '#25D366',
                      color: '#25D366',
                      borderRadius: 3.5,
                      py: 1.5,
                      fontWeight: 700,
                      '&:hover': {
                        borderColor: '#1ebe5c',
                        bgcolor: 'rgba(37, 211, 102, 0.05)',
                      },
                    }}
                  >
                    Contacter via WhatsApp
                  </Button>

                  <Divider />

                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                    En postulant, vos informations de profil vérifiées seront instantanément partagées avec l'employeur.
                  </Typography>
                </Stack>
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
