import React from 'react';
import {
  Box, Typography, Avatar, Button, Chip, Stack, Paper, Divider,
  Grid, useTheme, LinearProgress, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Container, alpha
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { useAppDispatch } from '../store';
import { logout, updateProfile } from '../store/slices/authSlice';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { useNavigate } from 'react-router-dom';
import { MOCK_WORKERS } from '../mocks/workers';
import ReputationBadge from '../components/ReputationBadge';
import VerifiedBadge from '../components/VerifiedBadge';
import ExperienceCard from '../components/ExperienceCard';
import BusinessIcon from '@mui/icons-material/Business';
import { useAppSelector } from '../store';
import EditProfileModal from '../components/EditProfileModal';
import { fetchOffers } from '../store/slices/offersSlice';
import { fetchApplications } from '../store/slices/applicationsSlice';
import { getFullMediaUrl } from '../utils/api';
import { useAvatarViewer } from '../components/AvatarViewer';

// Use first mock worker as the "current user" profile
const ME = MOCK_WORKERS[0];

export default function ProfilePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.role);
  const user = useAppSelector((state) => state.auth.user);
  const { items: myOffers, status: offersStatus } = useAppSelector((state: any) => state.offers);
  const { items: myApplications, status: appsStatus } = useAppSelector((state: any) => state.applications);
  const isEmployer = role === 'employer';

  React.useEffect(() => {
    if (isEmployer) {
      if (offersStatus === 'idle') dispatch(fetchOffers({ my_offers: true }));
      if (appsStatus === 'idle') dispatch(fetchApplications());
    }
  }, [isEmployer, offersStatus, appsStatus, dispatch]);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const { openViewer } = useAvatarViewer();

  const candXP = user?.candidate_profile?.experiences || [];
  const sortedXP = [...candXP].sort((a: any) => a.exp_type === 'verified' ? -1 : 1);
  let profileCompletion = 0;
  if (user?.candidate_profile) {
    const cp = user.candidate_profile;
    profileCompletion += 20; // Base score pour l'inscription
    if (cp.bio) profileCompletion += 15;
    if (cp.photo) profileCompletion += 15;
    if (cp.highest_diploma || cp.institution) profileCompletion += 15;
    if (cp.skills && cp.skills.length > 0) profileCompletion += 15;
    if (cp.experiences && cp.experiences.length > 0) profileCompletion += 10;
    if (cp.languages && cp.languages.length > 0) profileCompletion += 10;
    profileCompletion = Math.min(100, profileCompletion);
  }
  const isDark = theme.palette.mode === 'dark';

  const handleLogout = () => {
    dispatch(logout());
    dispatch(showSnackbar({ message: 'Déconnexion réussie ! À bientôt', severity: 'info' }));
    navigate('/');
  };

  if (isEmployer) {
    return (
      <Container maxWidth="lg" sx={{ pb: 8, pt: 2 }}>
        {/* En-tête (Cover & Avatar) */}
        <Box sx={{ position: 'relative', mb: 0 }}>
          {/* Cover Banner */}
          <Box 
            sx={{ 
              height: { xs: 120, md: 180 }, 
              borderRadius: { xs: '0 0 24px 24px', md: '24px' }, 
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.light} 100%)`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Décoration abstraite (mesh) sur la bannière */}
            <Box sx={{ position: 'absolute', top: '-50%', left: '-10%', width: '60%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)', transform: 'rotate(30deg)' }} />
          </Box>
          
          {/* Avatar Superposé */}
          <Box sx={{ position: 'absolute', bottom: { xs: -40, md: -50 }, left: { xs: 24, md: 32 } }}>
            <Avatar 
              src={getFullMediaUrl(user?.employer_profile?.logo) || undefined}
              onClick={() => openViewer(
                getFullMediaUrl(user?.employer_profile?.logo),
                user?.employer_profile?.company_name || user?.username || 'Entreprise',
                (user?.employer_profile?.company_name || user?.username || 'E')[0].toUpperCase()
              )}
              sx={{ 
                width: { xs: 80, md: 120 }, 
                height: { xs: 80, md: 120 }, 
                bgcolor: theme.palette.background.paper, 
                color: 'primary.main',
                border: `4px solid ${theme.palette.background.default}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'scale(1.05)', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' },
              }}
            >
              {!user?.employer_profile?.logo && <BusinessIcon sx={{ fontSize: { xs: 40, md: 60 } }} />}
            </Avatar>
          </Box>
        </Box>

        {/* Informations Principales (Sous l'avatar) */}
        <Box sx={{ px: { xs: 3, md: 4 }, pt: { xs: 6, md: 8 }, mb: 5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
                {user?.employer_profile?.company_name || user?.username || 'Entreprise'}
              </Typography>
              {user?.employer_profile?.verified && <VerifiedBadge />}
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 600 }}>
              {user?.employer_profile?.description || `Bienvenue sur le profil de ${user?.employer_profile?.company_name || user?.username}. Gérez vos annonces et recrutez les meilleurs talents.`}
            </Typography>
            {user?.employer_profile?.verified ? (
              <Chip 
                label="Entreprise Certifiée" 
                color="success"
                size="small"
                sx={{ fontWeight: 600, borderRadius: '8px' }}
              />
            ) : user?.employer_profile?.verification_requested ? (
              <Chip 
                label="Demande de badge en attente" 
                color="warning"
                size="small"
                sx={{ fontWeight: 600, borderRadius: '8px' }}
              />
            ) : user?.role === 'employer' ? (
              <Button 
                variant="outlined" 
                color="primary" 
                size="small" 
                onClick={() => {
                  dispatch(updateProfile({
                    userId: user.id,
                    role: 'employer',
                    profileData: { verification_requested: true }
                  })).unwrap()
                  .then(() => dispatch(showSnackbar({ message: 'Demande envoyée avec succès', severity: 'success' })))
                  .catch(() => dispatch(showSnackbar({ message: 'Erreur lors de la demande', severity: 'error' })));
                }}
                sx={{ fontWeight: 600, borderRadius: '8px', textTransform: 'none' }}
              >
                Demander le badge Vérifié
              </Button>
            ) : null}
          </Box>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />} 
            onClick={() => setEditOpen(true)}
            sx={{ 
              borderRadius: '12px', 
              textTransform: 'none', 
              fontWeight: 600,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
              width: { xs: '100%', md: 'auto' }
            }}
          >
            Modifier le profil
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* Dashboard Metrics */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, px: 1 }}>Tableau de bord</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: '20px', 
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                    display: 'flex', flexDirection: 'column', gap: 1
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Offres Actives</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>{myOffers.length}</Typography>
                  <Typography variant="caption" color="text.disabled">Annonces publiées</Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    borderRadius: '20px', 
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
                    display: 'flex', flexDirection: 'column', gap: 1
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidatures</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main' }}>{myApplications.length}</Typography>
                  <Typography variant="caption" color="text.disabled">Profils reçus</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Company Details */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, px: 1 }}>Coordonnées</Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: '20px', 
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
              }}
            >
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}><EmailOutlinedIcon fontSize="small" /></Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Email professionnel</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.email || '-'}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}><PhoneOutlinedIcon fontSize="small" /></Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Téléphone</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.employer_profile?.phone || 'Non renseigné'}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}><LocationOnOutlinedIcon fontSize="small" /></Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Localisation</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {user?.employer_profile?.city || user?.employer_profile?.neighborhood ? (
                        `${user.employer_profile.city || ''}${user.employer_profile.city && user.employer_profile.neighborhood ? ', ' : ''}${user.employer_profile.neighborhood || ''}`
                      ) : (
                        user?.employer_profile?.address || 'Non renseignée'
                      )}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}><WorkOutlineOutlinedIcon fontSize="small" /></Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Secteur d'activité</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.employer_profile?.industry || 'Non renseigné'}</Typography>
                  </Box>
                </Box>
                {user?.employer_profile?.recruits_per_month && (
                  <>
                    <Divider sx={{ borderStyle: 'dashed' }} />
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}><GroupOutlinedIcon fontSize="small" /></Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Recrutements par mois</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.employer_profile.recruits_per_month} profils</Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Stack>
            </Paper>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, mt: 4, px: 1 }}>Présentation de l'entreprise</Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: '20px', 
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary', whiteSpace: 'pre-wrap' }}>
                {user?.employer_profile?.description || 'Aucune présentation renseignée. Cliquez sur "Modifier le profil" pour ajouter une description de votre entreprise.'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => setLogoutOpen(true)}
            sx={{ 
              borderRadius: '12px', 
              py: 1.5, 
              px: 4,
              fontWeight: 700,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${alpha(theme.palette.error.main, 0.5)}` }
            }}
          >
            Se déconnecter
          </Button>
        </Box>

        <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)} slotProps={{ paper: { sx: { borderRadius: '24px', p: 1, maxWidth: 400 } } }}>
          <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pt: 3 }}>Déconnexion</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ textAlign: 'center', mb: 1 }}>
              Êtes-vous sûr de vouloir vous déconnecter de votre espace recruteur ?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 1 }}>
            <Button onClick={() => setLogoutOpen(false)} sx={{ fontWeight: 600, color: 'text.secondary', borderRadius: '10px', px: 3 }}>Annuler</Button>
            <Button onClick={handleLogout} color="error" variant="contained" sx={{ borderRadius: '10px', fontWeight: 700, px: 3, boxShadow: 'none' }}>
              Me déconnecter
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Profile Modal */}
        <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} isEmployer={true} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pb: 8, pt: 2 }}>
      {/* En-tête (Cover & Avatar) */}
      <Box sx={{ position: 'relative', mb: 0 }}>
        {/* Cover Banner */}
        <Box 
          sx={{ 
            height: { xs: 120, md: 180 }, 
            borderRadius: { xs: '0 0 24px 24px', md: '24px' }, 
            background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.light} 100%)`,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', bottom: '-20%', right: '-5%', width: '40%', height: '150%', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', transform: 'rotate(-15deg)' }} />
        </Box>
        
        {/* Avatar Superposé */}
        <Box sx={{ position: 'absolute', bottom: { xs: -40, md: -50 }, left: { xs: 24, md: 32 } }}>
          <Avatar 
            src={getFullMediaUrl(user?.candidate_profile?.photo) || undefined}
            onClick={() => openViewer(
              getFullMediaUrl(user?.candidate_profile?.photo),
              `${user?.last_name || ''} ${user?.first_name || ''}`.trim() || user?.username || 'Candidat',
              (user?.first_name ? user.first_name[0].toUpperCase() : user?.username ? user.username[0].toUpperCase() : 'C')
            )}
            sx={{ 
              width: { xs: 80, md: 120 }, 
              height: { xs: 80, md: 120 }, 
              bgcolor: theme.palette.secondary.main, 
              fontSize: { xs: '2rem', md: '3rem' }, 
              fontWeight: 800, 
              color: 'white',
              border: `4px solid ${theme.palette.background.default}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'scale(1.05)', boxShadow: '0 12px 32px rgba(0,0,0,0.2)' },
            }}
          >
            {!user?.candidate_profile?.photo && (user?.first_name ? user.first_name[0].toUpperCase() : user?.username ? user.username[0].toUpperCase() : 'C')}
          </Avatar>
        </Box>
      </Box>

      {/* Informations Principales */}
      <Box sx={{ px: { xs: 3, md: 4 }, pt: { xs: 6, md: 8 }, mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
              {`${user?.last_name || ''} ${user?.first_name || ''}`.trim() || user?.username || 'Candidat'}
            </Typography>
            {user?.candidate_profile?.score && user?.candidate_profile?.score >= 4.5 && <VerifiedBadge />}
          </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnOutlinedIcon fontSize="small" /> {user?.candidate_profile?.neighborhood || 'Non renseigné'} · Douala
          </Typography>
          {user?.candidate_profile?.is_available && (
            <Chip label="Disponible pour mission" color="success" size="small" sx={{ fontWeight: 600, borderRadius: '6px' }} />
          )}
        </Box>

        <Typography variant="body1" sx={{ lineHeight: 1.7, maxWidth: 800 }}>
          {user?.candidate_profile?.bio || 'Aucune description rédigée pour le moment. Modifiez votre profil pour vous présenter et attirer les employeurs de votre quartier.'}
        </Typography>
        </Box>
        <Button 
          variant="contained" 
          color="secondary"
          startIcon={<EditIcon />} 
          onClick={() => setEditOpen(true)}
          sx={{ 
            borderRadius: '12px', 
            textTransform: 'none', 
            fontWeight: 600,
            boxShadow: `0 4px 14px ${alpha(theme.palette.secondary.main, 0.4)}`,
            width: { xs: '100%', md: 'auto' }
          }}
        >
          Modifier le profil
        </Button>
      </Box>

      {/* Barre de complétion du profil immersive */}
      <Paper 
        elevation={0} 
        sx={{ 
          mx: 4, mb: 5, p: 3, 
          borderRadius: '20px', 
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1.5 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Complétion du profil</Typography>
            <Typography variant="body2" color="text.secondary">
              {profileCompletion === 100 ? 'Votre profil est parfait ! Vous êtes très visible.' : 'Un profil complet attire 3x plus d\'opportunités.'}
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: profileCompletion === 100 ? 'success.main' : 'secondary.main' }}>
            {profileCompletion}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={profileCompletion} 
          color={profileCompletion === 100 ? 'success' : 'secondary'}
          sx={{ height: 10, borderRadius: 5, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} 
        />
      </Paper>

      <Grid container spacing={4} sx={{ px: 2 }}>
        {/* Colonne de Gauche : Domaines, Compétences, Stats */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, mb: 4, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Informations de contact</Typography>
            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Email</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{user?.email || '-'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Téléphone</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{user?.candidate_profile?.phone || 'Non renseigné'}</Typography>
              </Box>
              {user?.candidate_profile?.date_of_birth && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Date de naissance</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{new Date(user.candidate_profile.date_of_birth).toLocaleDateString('fr-FR')}</Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Formation</Typography>
            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Diplôme le plus élevé</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{user?.candidate_profile?.highest_diploma || 'Non renseigné'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Établissement</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{user?.candidate_profile?.institution || 'Non renseigné'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Année d'obtention</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{user?.candidate_profile?.graduation_year || 'Non renseignée'}</Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Domaines d'activité</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {user?.candidate_profile?.skills && user.candidate_profile.skills.length > 0 ? (
                user.candidate_profile.skills.map((d: any) => (
                  <Chip key={d.id} label={d.name} color="secondary" sx={{ fontWeight: 600, borderRadius: '8px' }} />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">Aucun domaine spécifié</Typography>
              )}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Langues parlées</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {user?.candidate_profile?.languages && user.candidate_profile.languages.length > 0 ? (
                user.candidate_profile.languages.map((l: any) => (
                  <Chip key={l.id} label={l.name} variant="outlined" color="primary" sx={{ fontWeight: 600, borderRadius: '8px' }} />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">Aucune langue ajoutée</Typography>
              )}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Statistiques clés</Typography>
            <Stack spacing={2.5}>
              {[
                ['Type de profil', user?.candidate_profile?.profile_type || 'Non spécifié'],
                ['Missions réalisées', user?.candidate_profile?.total_missions || 0],
                ['Score moyen', `${user?.candidate_profile?.score || 5}/5`],
                ['Permis de conduire', user?.candidate_profile?.has_license ? 'Oui' : 'Non'],
                ['Rayon de déplacement', `${user?.candidate_profile?.distance_max || 3} km`],
              ].map(([label, value]) => (
                <Box key={String(label)} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{value}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Colonne de Droite : Expériences */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Expériences</Typography>
              <Chip label={sortedXP.length} size="small" color="secondary" sx={{ fontWeight: 700 }} />
            </Box>
            <Button size="small" startIcon={<AddIcon />} variant="outlined" color="secondary" onClick={() => setEditOpen(true)} sx={{ borderRadius: '8px', fontWeight: 600 }}>
              Ajouter
            </Button>
          </Box>

          {sortedXP.length > 0 ? (
            <Stack spacing={2}>
              {sortedXP.map((xp: any) => (
                <ExperienceCard
                  key={xp.id}
                  experience={{
                    id: xp.id,
                    titre: xp.title,
                    employeur: xp.employer_name,
                    date: xp.date,
                    type: xp.exp_type,
                    rating: xp.rating,
                    commentaire: xp.comment
                  }}
                />
              ))}
            </Stack>
          ) : (
            <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: `1px dashed ${theme.palette.divider}`, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>Aucune expérience listée</Typography>
              <Typography variant="body2" color="text.secondary">
                Complétez vos premières missions sur StartJobs ou ajoutez manuellement vos expériences passées.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={() => setLogoutOpen(true)}
          sx={{ 
            borderRadius: '12px', 
            py: 1.5, 
            px: 4,
            fontWeight: 700,
            bgcolor: alpha(theme.palette.error.main, 0.05),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${alpha(theme.palette.error.main, 0.5)}` }
          }}
        >
          Se déconnecter
        </Button>
      </Box>

      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)} slotProps={{ paper: { sx: { borderRadius: '24px', p: 1, maxWidth: 400 } } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pt: 3 }}>Déconnexion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', mb: 1 }}>
            Êtes-vous sûr de vouloir vous déconnecter de votre compte candidat ?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 1 }}>
          <Button onClick={() => setLogoutOpen(false)} sx={{ fontWeight: 600, color: 'text.secondary', borderRadius: '10px', px: 3 }}>Annuler</Button>
          <Button onClick={handleLogout} color="error" variant="contained" sx={{ borderRadius: '10px', fontWeight: 700, px: 3, boxShadow: 'none' }}>
            Me déconnecter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Modal */}
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} isEmployer={false} />
    </Container>
  );
}
