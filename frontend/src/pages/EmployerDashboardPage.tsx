import React from 'react';
import {
  Box, Typography, Button, Grid, Avatar, Chip,
  useTheme, alpha, IconButton, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { fetchOffers, deleteOffer } from '../store/slices/offersSlice';
import { fetchApplications, updateApplicationStatus, deleteApplication } from '../store/slices/applicationsSlice';
import RatingDialog from '../components/RatingDialog';




export default function EmployerDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isDark = theme.palette.mode === 'dark';

  const { items: allOffers, status: offersStatus } = useAppSelector((state: any) => state.offers);
  const { items: allApplications, status: appsStatus } = useAppSelector((state: any) => state.applications);
  const auth = useAppSelector((state: any) => state.auth);

  React.useEffect(() => {
    if (offersStatus === 'idle') dispatch(fetchOffers({ my_offers: true }));
    dispatch(fetchApplications());
    // Polling every 10s for real-time status updates
    const interval = setInterval(() => {
      dispatch(fetchApplications());
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const activeOffers = React.useMemo(() => {
    return allOffers.filter((o: any) => o.employeurUserId === auth.user?.id && !o.isAd);
  }, [allOffers, auth.user?.id]);

  const averageMatch = React.useMemo(() => {
    if (allApplications.length === 0) return '0%';
    const sum = allApplications.reduce((acc: number, app: any) => acc + (app.match_score || 85), 0);
    return `${Math.round(sum / allApplications.length)}%`;
  }, [allApplications]);
  
  // Transform API applications to match dashboard UI
  const applicants = allApplications.map((app: any) => ({
    id: app.id,
    name: app.candidate?.user?.username || 'Candidat Anonyme',
    role: app.job_offer?.title || 'Mission',
    match: app.match_score,
    type: app.candidate?.profile_type || 'Freelance',
    time: new Date(app.created_at).toLocaleDateString(),
    avatar: app.candidate?.photo || 'https://via.placeholder.com/150',
    status: app.status,
    is_reviewed: app.is_reviewed,
    candidateUserId: app.candidate?.user?.id
  }));

  const handleUpdateStatus = (id: number, newStatus: string) => {
    dispatch(updateApplicationStatus({ id, status: newStatus }))
      .unwrap()
      .then(() => {
        if (newStatus === 'accepted') {
          dispatch(showSnackbar({ message: 'Candidature acceptée avec succès ! ✓', severity: 'success' }));
        } else if (newStatus === 'rejected') {
          dispatch(showSnackbar({ message: 'Candidature refusée.', severity: 'info' }));
        }
      });
  };

  const handleDeleteApplicant = (id: number) => {
    dispatch(deleteApplication(id))
      .unwrap()
      .then(() => {
        dispatch(showSnackbar({ message: 'Candidature retirée de votre historique.', severity: 'info' }));
      });
  };

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState<'reject' | 'delete' | 'delete_offer' | null>(null);
  const [targetId, setTargetId] = React.useState<number | null>(null);

  // Rating dialog state
  const [ratingMissionId, setRatingMissionId] = React.useState<string | null>(null);
  const ratingOpen = ratingMissionId !== null;


  const openConfirmation = (type: 'reject' | 'delete' | 'delete_offer', id: number) => {
    setConfirmType(type);
    setTargetId(id);
    setConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (targetId === null || !confirmType) return;
    if (confirmType === 'reject') {
      handleUpdateStatus(targetId, 'rejected');
    } else if (confirmType === 'delete_offer') {
      dispatch(deleteOffer(targetId))
        .unwrap()
        .then(() => {
          dispatch(showSnackbar({ message: 'Offre supprimée avec succès.', severity: 'info' }));
        });
    } else {
      handleDeleteApplicant(targetId);
    }
    setConfirmOpen(false);
    setConfirmType(null);
    setTargetId(null);
  };

  return (
    <Box sx={{ pb: { xs: 12, md: 4 } }}>
      {/* ─── HERO / GREETING ────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          pt: { xs: 4, md: 6 },
          pb: 4,
          background: isDark
            ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 100%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
          Bonjour, {auth.user?.employer_profile?.company_name || auth.user?.first_name || 'Employeur'} 👋
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
          Voici ce qui se passe sur vos annonces aujourd'hui.
        </Typography>

        {/* ─── STATS GRID ─────────────────────────────────────────────────────────────── */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${theme.palette.divider}`,
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, display: 'flex' }}>
                  <VisibilityIcon />
                </Box>
                <Chip label="+14%" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, fontWeight: 700, borderRadius: 1 }} />
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total des annonces
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {activeOffers.length}
              </Typography>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${theme.palette.divider}`,
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, display: 'flex' }}>
                  <PeopleIcon />
                </Box>
                <Chip label="+nouveaux" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, fontWeight: 700, borderRadius: 1 }} />
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Candidatures reçues
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {allApplications.length}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)',
                border: `1px solid ${theme.palette.divider}`,
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, display: 'flex' }}>
                  <TrendingUpIcon />
                </Box>
                <Chip label="+2%" size="small" sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, fontWeight: 700, borderRadius: 1 }} />
              </Box>
              <Typography color="text.secondary" sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Match Moyen
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800 }}>
                {averageMatch}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* ─── MAIN CONTENT ──────────────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, md: 4 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        
        {/* Left Column: Recent Applicants */}
        <Box sx={{ flex: { md: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
              Candidatures Récentes
            </Typography>
            <Button size="small" sx={{ fontWeight: 600 }}>Voir tout</Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {applicants.map((applicant: any) => (
              <Box
                key={applicant.id}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 4,
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                  border: `1px solid ${theme.palette.divider}`,
                  gap: { xs: 2, sm: 3 },
                  position: 'relative',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: isDark 
                      ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.08)}` 
                      : `0 8px 24px ${alpha(theme.palette.primary.main, 0.04)}`,
                  }
                }}
              >
                {/* Profile Header & Info */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  flex: 1, 
                  pr: { xs: 6, sm: 0 },
                  minWidth: 0 
                }}>
                  <Avatar src={applicant.avatar} sx={{ width: 56, height: 56, borderRadius: 3 }} />
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {applicant.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      Candidature pour: <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>{applicant.role}</span>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Chip 
                        label={applicant.type} 
                        size="small" 
                        sx={{ 
                          height: 20, fontSize: '0.7rem', fontWeight: 600,
                          bgcolor: applicant.type === 'Freelance' ? alpha(theme.palette.info.main, 0.1) : alpha(theme.palette.secondary.main, 0.1),
                          color: applicant.type === 'Freelance' ? theme.palette.info.main : theme.palette.secondary.main
                        }} 
                      />
                      <Typography variant="caption" color="text.disabled">{applicant.time}</Typography>
                      
                      {/* Status indicator badge */}
                      <Chip
                        size="small"
                        label={
                          applicant.status === 'pending'
                            ? 'En attente'
                            : applicant.status === 'accepted'
                            ? 'Accepté'
                            : applicant.status === 'rejected'
                            ? 'Refusé'
                            : applicant.status === 'withdrawn'
                            ? 'Retirée'
                            : 'Terminé'
                        }
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor:
                            applicant.status === 'pending'
                              ? alpha(theme.palette.warning.main, 0.15)
                              : applicant.status === 'accepted'
                              ? alpha(theme.palette.success.main, 0.15)
                              : applicant.status === 'rejected'
                              ? alpha(theme.palette.error.main, 0.1)
                              : applicant.status === 'withdrawn'
                              ? alpha(theme.palette.error.main, 0.15)
                              : alpha(theme.palette.primary.main, 0.1),
                          color:
                            applicant.status === 'pending'
                              ? 'warning.main'
                              : applicant.status === 'accepted'
                              ? 'success.main'
                              : applicant.status === 'rejected'
                              ? 'error.main'
                              : applicant.status === 'withdrawn'
                              ? 'error.main'
                              : 'primary.main',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                
                {/* Match Metric (Absolute on Mobile, Flex on Desktop) */}
                <Box sx={{ 
                  textAlign: 'center',
                  position: { xs: 'absolute', sm: 'static' },
                  top: { xs: 16, sm: 'auto' },
                  right: { xs: 16, sm: 'auto' },
                  minWidth: { sm: 60 }
                }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: { xs: 38, sm: 46 }, height: { xs: 38, sm: 46 }, borderRadius: '50%',
                      border: `2px solid ${theme.palette.success.main}`,
                      color: theme.palette.success.main,
                      fontWeight: 800, fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      bgcolor: alpha(theme.palette.success.main, 0.04)
                    }}
                  >
                    {applicant.match}%
                  </Box>
                  <Typography variant="caption" sx={{ display: { xs: 'none', sm: 'block' }, mt: 0.5, color: 'text.secondary', fontWeight: 600, fontSize: '0.65rem', textTransform: 'uppercase' }}>
                    Match
                  </Typography>
                </Box>

                {/* Actions Section */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap',
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'stretch', sm: 'flex-end' },
                  borderTop: { xs: `1px solid ${theme.palette.divider}`, sm: 'none' },
                  pt: { xs: 1.5, sm: 0 },
                  mt: { xs: 0.5, sm: 0 }
                }}>
                  {applicant.status === 'pending' && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckIcon />}
                        onClick={() => handleUpdateStatus(applicant.id, 'accepted')}
                        sx={{ 
                          borderRadius: '8px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          flex: { xs: 1, sm: 'initial' },
                          py: { xs: 1, sm: 0.5 }
                        }}
                      >
                        Accepter
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<ChatIcon />}
                        onClick={() => {
                          localStorage.setItem(
                            'pending_application',
                            JSON.stringify({
                              employerName: applicant.name,
                              jobTitle: applicant.role,
                              isEmployerContact: true,
                              candidateId: applicant.candidateUserId,
                            })
                          );
                          navigate('/messages');
                        }}
                        sx={{ 
                          borderRadius: '8px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          flex: { xs: 1, sm: 'initial' },
                          py: { xs: 1, sm: 0.5 }
                        }}
                      >
                        Échanger
                      </Button>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => openConfirmation('reject', applicant.id)}
                        sx={{ 
                          border: `1px solid ${theme.palette.divider}`, 
                          borderRadius: '8px',
                          width: 36,
                          height: 36,
                          color: 'error.main',
                          '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </>
                  )}

                  {applicant.status === 'withdrawn' && (
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, width: '100%', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontStyle: 'italic' }}>
                        Le candidat a retiré sa candidature pour cette offre.
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => openConfirmation('delete', applicant.id)}
                        sx={{ borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, width: { xs: '100%', sm: 'auto' }, py: { xs: 1, sm: 0.5 } }}
                      >
                        Nettoyer
                      </Button>
                    </Box>
                  )}

                  {applicant.status === 'completed' && !applicant.is_reviewed && (
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="primary"
                      startIcon={<StarIcon />}
                      sx={{ fontSize: '0.7rem', px: 1.5, py: 1, borderRadius: 2, width: { xs: '100%', sm: 'auto' } }}
                      onClick={() => setRatingMissionId(String(applicant.id))}
                    >
                      Évaluer
                    </Button>
                  )}
                  {applicant.status === 'completed' && applicant.is_reviewed && (
                    <Chip 
                      icon={<CheckIcon />} 
                      label="Évalué" 
                      color="success" 
                      variant="outlined" 
                      size="small" 
                      sx={{ fontWeight: 600 }} 
                    />
                  )}

                  {applicant.status === 'accepted' && (
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="success"
                      startIcon={<DoneAllIcon />}
                      sx={{ fontSize: '0.7rem', px: 1.5, py: 1, borderRadius: 2, width: { xs: '100%', sm: 'auto' }, fontWeight: 700 }}
                      onClick={() => handleUpdateStatus(applicant.id, 'completed')}
                    >
                      Terminer la mission
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right Column: Active Offers & Quick Actions */}
        <Box sx={{ flex: { md: 1 } }}>
          {/* CTA: Post a job */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            className="pressable"
            onClick={() => navigate('/post-offer')}
            startIcon={<AddIcon />}
            sx={{
              py: 2,
              mb: 4,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: '1.05rem',
              boxShadow: `0 8px 24px -8px ${theme.palette.primary.main}`,
            }}
          >
            Publier une annonce
          </Button>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, letterSpacing: '-0.01em' }}>
            Mes Offres Actives
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeOffers.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Aucune annonce publiée pour le moment.
              </Typography>
            )}
            {activeOffers.map((offer: any) => (
              <Box
                key={offer.id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>{offer.titre || offer.title}</Typography>
                  <Box>
                    <IconButton size="small" onClick={() => openConfirmation('delete_offer', offer.id)} color="error" sx={{ mr: 0.5 }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  📍 {offer.quartier || 'Non précisé'}
                </Typography>
                {offer.budget && (
                  <Chip label={offer.budget} size="small" sx={{ fontWeight: 600, height: 20, fontSize: '0.7rem', mr: 1 }} />
                )}
                {offer.urgent && (
                  <Chip label="Urgent" size="small" color="error" sx={{ fontWeight: 600, height: 20, fontSize: '0.7rem' }} />
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {confirmType === 'reject' ? 'Refuser la candidature ?' : confirmType === 'delete_offer' ? 'Supprimer l\'offre ?' : 'Supprimer du registre ?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.95rem' }}>
            {confirmType === 'reject'
              ? "Êtes-vous sûr de vouloir décliner cette candidature ? Le candidat en sera informé."
              : confirmType === 'delete_offer'
              ? "Êtes-vous sûr de vouloir supprimer cette offre d'emploi ? Cette action est irréversible."
              : 'Êtes-vous sûr de vouloir supprimer définitivement cette candidature de votre historique ? Cette action est irréversible.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Annuler
          </Button>
          <Button onClick={handleConfirmAction} variant="contained" color="error" sx={{ fontWeight: 700, borderRadius: '8px' }}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rating Dialog */}
      <RatingDialog
        open={ratingOpen}
        missionId={ratingMissionId}
        onClose={() => setRatingMissionId(null)}
        onSuccess={() => dispatch(fetchApplications())}
      />
    </Box>
  );
}
