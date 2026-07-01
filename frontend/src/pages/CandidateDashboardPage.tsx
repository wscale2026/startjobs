import React from 'react';
import {
  Box, Typography, Grid, Paper, Avatar, Button,
  Chip, useTheme, alpha, LinearProgress, TextField, InputAdornment, Stack, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import SendIcon from '@mui/icons-material/SendOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getFullMediaUrl } from "../utils/api";
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ChatIcon from '@mui/icons-material/Chat';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import BusinessIcon from '@mui/icons-material/Business';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { fetchApplications, updateApplicationStatus, deleteApplication } from '../store/slices/applicationsSlice';
import { fetchOffers } from '../store/slices/offersSlice';
import CardSkeleton from '../components/CardSkeleton';

// Mock constants removed and made dynamic inside the component

// Mock data moved to state initialization

export default function CandidateDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isDark = theme.palette.mode === 'dark';

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState('all');
  
  const [dismissedActivities, setDismissedActivities] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dismissedActivities');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notificationToDelete, setNotificationToDelete] = React.useState<string | null>(null);

  const handleDismissActivity = (id: string) => {
    const updated = [...dismissedActivities, id];
    setDismissedActivities(updated);
    localStorage.setItem('dismissedActivities', JSON.stringify(updated));
    setNotificationToDelete(null);
  };

  const { items: allApplications, status: appsStatus } = useAppSelector((state: any) => state.applications);
  const { items: allOffers, status: offersStatus } = useAppSelector((state: any) => state.offers);
  const auth = useAppSelector((state: any) => state.auth);
  const user = auth.user;
  const candidateProfile = user?.candidate_profile;

  React.useEffect(() => {
    dispatch(fetchApplications());
    dispatch(fetchOffers());
    // Polling every 10s so status updates appear instantly for candidate
    const interval = setInterval(() => {
      dispatch(fetchApplications());
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const completedMissions = React.useMemo(() => {
    return allApplications.filter((app: any) => app.status === 'completed').length;
  }, [allApplications]);

  const acceptedCount = React.useMemo(() => {
    return allApplications.filter((app: any) => app.status === 'accepted').length;
  }, [allApplications]);

  // Dynamically build candidate stats
  const candidateStats = React.useMemo(() => {
    const totalApplications = allApplications.length;
    const completedCount = completedMissions + acceptedCount;
    const accumulatedHours = (completedCount * 8) || (candidateProfile?.total_missions || 0) * 8 || 0;
    
    return [
      { label: 'Vues profil', value: String(candidateProfile?.profile_views ?? 0), trend: `+${candidateProfile?.profile_views ?? 0}`, icon: <VisibilityIcon /> },
      { label: 'Candidatures', value: String(totalApplications), trend: `+${totalApplications}`, icon: <SendIcon /> },
      { label: 'Missions faites', value: String(completedCount), trend: `Score: ${candidateProfile?.score || '4.8'}★`, icon: <StarBorderIcon /> },
      { label: 'Heures cumulées', value: `${accumulatedHours}h`, trend: `+${accumulatedHours}h`, icon: <AccessTimeIcon /> },
    ];
  }, [allApplications, candidateProfile, completedMissions, acceptedCount]);

  const reputationLevel = React.useMemo(() => {
    const total = Math.max(completedMissions + acceptedCount, candidateProfile?.total_missions || 0);
    if (total === 0) {
      return {
        name: 'Débutant',
        progress: 10,
        text: 'Complétez ou faites accepter votre première mission pour débloquer le badge Bronze !',
        badge: 'Top 50%',
        color: 'secondary' as const
      };
    } else if (total < 5) {
      return {
        name: 'Niveau Bronze',
        progress: Math.min(40 + (total * 10), 74),
        text: `Encore ${5 - total} mission${5 - total > 1 ? 's' : ''} pour débloquer le badge Argent !`,
        badge: 'Top 30%',
        color: 'warning' as const
      };
    } else if (total < 15) {
      return {
        name: 'Niveau Argent',
        progress: Math.min(75 + ((total - 5) * 2.5), 99),
        text: `Plus que ${15 - total} mission${15 - total > 1 ? 's' : ''} réussie${15 - total > 1 ? 's' : ''} pour atteindre le Niveau Or ! 🚀`,
        badge: 'Top 15%',
        color: 'info' as const
      };
    } else {
      return {
        name: 'Niveau Or',
        progress: 100,
        text: 'Félicitations ! Vous faites partie de l\'élite des professionnels recommandés du quartier. ⭐',
        badge: 'Top 5%',
        color: 'success' as const
      };
    }
  }, [completedMissions, acceptedCount]);

  // Dynamically slice top recommended jobs matching user's neighborhood
  const recommendedJobs = React.useMemo(() => {
    let filtered = allOffers;
    if (candidateProfile?.neighborhood) {
      filtered = allOffers.filter((offer: any) => 
        offer.quartier?.toLowerCase().includes(candidateProfile.neighborhood.toLowerCase())
      );
    }
    // If no matching jobs in neighborhood, just show latest jobs
    if (filtered.length === 0) {
      filtered = allOffers;
    }
    
    // Sort by id descending (newest first)
    const sorted = [...filtered].sort((a: any, b: any) => Number(b.id) - Number(a.id));
    
    return sorted.slice(0, 2).map((offer: any) => ({
      id: offer.id,
      title: offer.titre || 'Mission',
      company: offer.employeur || 'Entreprise Vérifiée',
      location: offer.quartier || 'Non spécifié',
      salary: offer.budget || 'À débattre',
      distance: `à ${offer.distance || '1.0'}km`
    }));
  }, [allOffers, candidateProfile]);

  const myCandidatures = allApplications.map((app: any) => ({
    id: app.id,
    name: 'Moi',
    role: app.job_offer?.title || 'Mission',
    match: app.match_score,
    type: app.job_offer?.employer?.company_name || 'Entreprise',
    time: new Date(app.created_at).toLocaleDateString(),
    avatar: app.job_offer?.employer?.logo || '',
    status: app.status,
    is_reviewed: app.is_reviewed,
    employerUserId: app.job_offer?.employer?.user?.id
  }));

  const handleWithdrawCandidacy = (id: number) => {
    dispatch(updateApplicationStatus({ id, status: 'withdrawn' }))
      .unwrap()
      .then(() => {
        dispatch(showSnackbar({ message: 'Candidature retirée avec succès. L\'employeur en a été informé.', severity: 'info' }));
      });
  };

  const handleDeleteCandidacy = (id: number) => {
    dispatch(deleteApplication(id))
      .unwrap()
      .then(() => {
        dispatch(showSnackbar({ message: 'Historique de candidature supprimé.', severity: 'info' }));
      });
  };

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState<'withdraw' | 'delete' | null>(null);
  const [targetId, setTargetId] = React.useState<number | null>(null);

  const openConfirmation = (type: 'withdraw' | 'delete', id: number) => {
    setConfirmType(type);
    setTargetId(id);
    setConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (targetId === null || !confirmType) return;
    if (confirmType === 'withdraw') {
      handleWithdrawCandidacy(targetId);
    } else {
      handleDeleteCandidacy(targetId);
    }
    setConfirmOpen(false);
    setConfirmType(null);
    setTargetId(null);
  };

  const filteredCandidatures = React.useMemo(() => {
    return myCandidatures.filter((c: any) => {
      const matchesSearch = c.role.toLowerCase().includes(searchQuery.toLowerCase()) || c.type.toLowerCase().includes(searchQuery.toLowerCase());
      if (selectedStatus === 'all') return matchesSearch;
      return matchesSearch && c.status === selectedStatus;
    });
  }, [myCandidatures, searchQuery, selectedStatus]);

  const activities = React.useMemo(() => {
    const list: any[] = [];
    myCandidatures.forEach((c: any, index: number) => {
      if (c.status === 'completed' && c.is_reviewed) {
        list.push({
          id: `act_rev_${index}`,
          text: `Bravo ! L'employeur a laissé un avis sur votre mission "${c.role}". ⭐`,
          time: 'Récemment',
          highlight: true,
          type: 'success',
        });
      } else if (c.status === 'accepted') {
        list.push({
          id: `act_acc_${index}`,
          text: `Félicitations ! Votre candidature pour "${c.role}" a été ACCEPTEE par l'employeur. 🎉`,
          time: 'Il y a quelques minutes',
          highlight: true,
          type: 'success',
        });
      } else if (c.status === 'rejected') {
        list.push({
          id: `act_rej_${index}`,
          text: `Votre candidature pour "${c.role}" a été déclinée par l'employeur.`,
          time: 'Hier',
          highlight: false,
          type: 'error',
        });
      } else if (c.status === 'pending') {
        list.push({
          id: `act_pen_${index}`,
          text: `Votre candidature pour "${c.role}" est actuellement EN ATTENTE de validation.`,
          time: 'En cours',
          highlight: false,
          type: 'warning',
        });
      }
    });

    if (list.length === 0) {
      const hasOffers = allOffers && allOffers.length > 0;
      list.push({
        id: 'default_1',
        text: hasOffers 
          ? 'Bienvenue sur StartJobs ! Consultez nos nouvelles offres.' 
          : 'Bienvenue sur StartJobs ! Il n\'y a pas encore d\'offres disponibles pour le moment, mais restez à l\'écoute.',
        time: 'À l\'instant',
        highlight: true,
        type: 'info',
      });
    }
    
    // Sort by most recent and filter out dismissed
    return list.filter(act => !dismissedActivities.includes(act.id)).slice(0, 5);
  }, [myCandidatures, allOffers, dismissedActivities]);

  // Profile completion check
  const isProfileIncomplete = React.useMemo(() => {
    if (!candidateProfile) return true;
    const hasBio = !!(candidateProfile.bio?.trim());
    const hasNeighborhood = !!(candidateProfile.neighborhood?.trim());
    const hasSkills = candidateProfile.skills?.length > 0;
    const hasPhoto = !!(candidateProfile.photo);
    return !hasBio || !hasNeighborhood || !hasSkills || !hasPhoto;
  }, [candidateProfile]);

  return (
    <Box sx={{ pb: { xs: 12, md: 4 } }}>
      {/* ─── PROFILE COMPLETION BANNER ──────────────────────────────────────── */}
      {isProfileIncomplete && (
        <Box
          sx={{
            mx: { xs: 2, md: 4 },
            mt: { xs: 2, md: 3 },
            mb: -1,
            p: 2,
            borderRadius: 3,
            background: isDark
              ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.18)}, ${alpha(theme.palette.warning.dark, 0.1)})`
              : `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.12)}, ${alpha(theme.palette.warning.light, 0.07)})`,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.4)}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1, minWidth: 0 }}>
            <WarningAmberIcon sx={{ color: 'warning.main', flexShrink: 0, mt: 0.25 }} />
            <Box>
              <Typography sx={{ fontWeight: 800, color: 'warning.dark', fontSize: '0.95rem' }}>
                ⚠️ Votre profil est incomplet !
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Complétez votre profil (photo, bio, compétences, quartier) pour maximiser vos chances d'être recruté.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            color="warning"
            onClick={() => navigate('/profile')}
            sx={{ fontWeight: 700, borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0, width: { xs: '100%', sm: 'auto' }, py: { xs: 1, sm: 0.5 } }}
          >
            Compléter mon profil
          </Button>
        </Box>
      )}

      {/* ─── HERO / GREETING ────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          pt: { xs: 4, md: 6 },
          pb: 4,
          background: isDark
            ? `linear-gradient(180deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 100%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 100%)`,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
          Salut, {user?.first_name || user?.username || 'Candidat'} ! 👋
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
          Voici vos statistiques de recherche et opportunités du quartier.
        </Typography>

        {/* ─── STATS GRID ─────────────────────────────────────────────────────────────── */}
        <Grid container spacing={2}>
          {candidateStats.map((stat) => (
            <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 4,
                  bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)',
                  border: `1px solid ${theme.palette.divider}`,
                  backdropFilter: 'blur(10px)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Box
                    sx={{
                      p: 0.75,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main,
                      display: 'flex'
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                    {stat.trend}
                  </Typography>
                </Box>
                <Typography color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {stat.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ─── MAIN CONTENT ──────────────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, md: 4 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        
        {/* Left Column: Recommendations & Reputation */}
        <Box sx={{ flex: { md: 2 } }}>
          {/* REPUTATION WIDGET */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'white',
              mb: 4,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              gap: 3
            }}
          >
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette[reputationLevel.color].main, 0.1),
                color: theme.palette[reputationLevel.color].main,
              }}
            >
              <EmojiEventsIcon fontSize="large" />
            </Avatar>
            <Box sx={{ flex: 1, width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{reputationLevel.name}</Typography>
                <Chip label={reputationLevel.badge} size="small" color={reputationLevel.color} sx={{ fontWeight: 600, height: 20, fontSize: '0.7rem' }} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {reputationLevel.text}
              </Typography>
              <LinearProgress variant="determinate" value={reputationLevel.progress} sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette[reputationLevel.color].main, 0.1), '& .MuiLinearProgress-bar': { bgcolor: theme.palette[reputationLevel.color].main } }} />
            </Box>
          </Paper>

          {/* RECOMMENDED OFFERS */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
              Offres Recommandées
            </Typography>
            <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/offers')} sx={{ fontWeight: 600 }}>Voir tout</Button>
          </Box>

          <Grid container spacing={2}>
            {offersStatus === 'loading' && recommendedJobs.length === 0 ? (
              <Grid size={{ xs: 12 }}><CardSkeleton count={2} /></Grid>
            ) : recommendedJobs.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  Aucune offre recommandée disponible pour le moment.
                </Typography>
              </Grid>
            ) : (
              recommendedJobs.map((job: any) => (
              <Grid size={{ xs: 12, sm: 6 }} key={job.id}>
                <Box
                  className="pressable"
                  onClick={() => navigate('/offers')}
                  sx={{
                    p: 2.5,
                    borderRadius: 4,
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'white',
                    border: `1px solid ${theme.palette.divider}`,
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{job.title}</Typography>
                      <Chip label={job.distance} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                    </Box>
                    <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>{job.company}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <LocationOnIcon sx={{ fontSize: 18 }} />
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>{job.location}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: theme.palette.secondary.main, fontSize: '0.9rem' }}>
                      {job.salary}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))
            )}
          </Grid>
        </Box>

        {/* Right Column: Recent Activity */}
        <Box sx={{ flex: { md: 1 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, letterSpacing: '-0.01em' }}>
            Notifications & Statuts
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activities.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Aucune nouvelle notification.
              </Typography>
            )}
            {activities.map((act) => (
              <Box
                key={act.id}
                sx={{
                  position: 'relative',
                  p: 2,
                  pr: 5,
                  borderRadius: 3,
                  bgcolor: act.highlight 
                    ? (isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02))
                    : 'transparent',
                  border: `1px solid ${act.highlight ? theme.palette.primary.main : theme.palette.divider}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setNotificationToDelete(act.id)}
                  sx={{ position: 'absolute', top: 6, right: 6, opacity: 0.6, '&:hover': { opacity: 1, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' } }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ fontSize: '0.925rem', fontWeight: act.highlight ? 600 : 400 }}>
                  {act.text}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {act.time}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ─── NEW SECTION: MY CANDIDATURES & COLLABORATIONS ───────────────────────── */}
      <Box sx={{ px: { xs: 2, md: 4 }, mt: 6 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
            Mes Candidatures & Collaborations
          </Typography>

          {/* Search Box */}
          <TextField
            placeholder="Rechercher par métier..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }
            }}
            sx={{
              width: { xs: '100%', sm: 260 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              }
            }}
          />
        </Box>

        {/* Filter Chips Bar */}
        <Stack direction="row" spacing={1} sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          {[
            { label: 'Toutes', value: 'all' },
            { label: 'En attente', value: 'pending' },
            { label: 'Acceptées', value: 'accepted' },
            { label: 'Terminées', value: 'completed' },
            { label: 'Retirées', value: 'withdrawn' },
          ].map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              clickable
              onClick={() => setSelectedStatus(item.value)}
              sx={{
                fontWeight: 700,
                px: 1,
                fontSize: '0.8rem',
                borderRadius: '8px',
                bgcolor: selectedStatus === item.value ? theme.palette.secondary.main : 'action.hover',
                color: selectedStatus === item.value ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: selectedStatus === item.value ? theme.palette.secondary.main : 'action.selected',
                }
              }}
            />
          ))}
        </Stack>

        <Grid container spacing={3}>
          {appsStatus === 'loading' && filteredCandidatures.length === 0 ? (
            <Grid size={{ xs: 12 }}><CardSkeleton count={2} /></Grid>
          ) : filteredCandidatures.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 4, textAlign: 'center', border: `1px dashed ${theme.palette.divider}`, bgcolor: 'transparent' }}>
                <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                  Aucune candidature ne correspond à votre recherche ou filtre actuel.
                </Typography>
              </Paper>
            </Grid>
          ) : (
            filteredCandidatures.map((candidacy: any) => {
              const isAccepted = candidacy.status === 'accepted';
              const isPending = candidacy.status === 'pending';
              const isRejected = candidacy.status === 'rejected';
              const isCompleted = candidacy.status === 'completed';
              const isWithdrawn = candidacy.status === 'withdrawn';

              return (
                <Grid size={{ xs: 12, md: 6 }} key={candidacy.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      border: `1px solid ${
                        isAccepted
                          ? alpha(theme.palette.success.main, 0.5)
                          : isRejected
                          ? alpha(theme.palette.error.main, 0.3)
                          : theme.palette.divider
                      }`,
                      background: isAccepted
                        ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, transparent 100%)`
                        : 'background.paper',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Avatar
                          src={getFullMediaUrl(candidacy.avatar)}
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '10px',
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                          }}
                        >
                          <BusinessIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2 }}>
                            {candidacy.role}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {candidacy.type}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        size="small"
                        icon={
                          isAccepted ? (
                            <CheckCircleIcon sx={{ fontSize: '14px !important' }} />
                          ) : isRejected ? (
                            <CancelIcon sx={{ fontSize: '14px !important' }} />
                          ) : undefined
                        }
                        label={
                          isPending
                            ? 'En attente'
                            : isAccepted
                            ? 'Collaborateur - Accepté'
                            : isRejected
                            ? 'Décliné'
                            : isWithdrawn
                            ? 'Candidature Retirée'
                            : (isCompleted && candidacy.is_reviewed)
                            ? 'Évaluée ⭐'
                            : 'Mission Terminée'
                        }
                        color={isAccepted ? 'success' : isRejected ? 'error' : isPending ? 'warning' : isWithdrawn ? 'default' : 'primary'}
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Box>

                    {/* Collaboration banner */}
                    {isAccepted && (
                      <Box
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.success.main, 0.08),
                          border: `1px dashed ${alpha(theme.palette.success.main, 0.3)}`,
                        }}
                      >
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                          Félicitations ! Vous travaillez avec cet employeur sur cette mission. 🤝
                        </Typography>
                      </Box>
                    )}

                    {isRejected && (
                      <Box
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.error.main, 0.05),
                          border: `1px dashed ${alpha(theme.palette.error.main, 0.2)}`,
                        }}
                      >
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                          Cette candidature n'a pas été retenue pour cette fois. Continuez vos recherches !
                        </Typography>
                      </Box>
                    )}

                    {isPending && (
                      <Box
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.warning.main, 0.05),
                          border: `1px dashed ${alpha(theme.palette.warning.main, 0.2)}`,
                        }}
                      >
                        <Typography variant="body2" color="warning.main" sx={{ fontWeight: 500 }}>
                          Votre candidature est en cours d'étude par le recruteur.
                        </Typography>
                      </Box>
                    )}

                    {isWithdrawn && (
                      <Box
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.action.selected, 0.5),
                          border: `1px dashed ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Vous avez annulé cette candidature. Elle n'est plus active et l'employeur ne peut plus la valider.
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                      {/* Left: Deletion or Withdrawal */}
                      <Box>
                        {isPending && (
                          <Button
                            variant="text"
                            color="error"
                            size="small"
                            startIcon={<CloseIcon />}
                            onClick={() => openConfirmation('withdraw', candidacy.id)}
                            sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Retirer
                          </Button>
                        )}
                        {(isCompleted || isRejected || isWithdrawn) && (
                          <Button
                            variant="text"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => openConfirmation('delete', candidacy.id)}
                            sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Supprimer
                          </Button>
                        )}
                      </Box>

                      {/* Right: Messaging */}
                      {!isWithdrawn && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ChatIcon />}
                          onClick={() => {
                            localStorage.setItem(
                              'pending_application',
                              JSON.stringify({
                                employerName: candidacy.type,
                                jobTitle: candidacy.role,
                                isEmployerContact: true,
                                candidateId: candidacy.employerUserId
                              })
                            );
                            navigate('/messages');
                          }}
                          sx={{ borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}
                        >
                          Discuter
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })
          )}
        </Grid>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {confirmType === 'withdraw' ? 'Retirer la candidature ?' : 'Supprimer la candidature ?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.95rem' }}>
            {confirmType === 'withdraw'
              ? "Êtes-vous sûr de vouloir retirer votre candidature ? L'employeur en sera immédiatement notifié par une étiquette d'avertissement."
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
      <Dialog open={!!notificationToDelete} onClose={() => setNotificationToDelete(null)} sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Supprimer la notification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette notification ? Cette action la masquera définitivement de votre tableau de bord.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setNotificationToDelete(null)} color="inherit" sx={{ fontWeight: 600 }}>Annuler</Button>
          <Button onClick={() => notificationToDelete && handleDismissActivity(notificationToDelete)} color="error" variant="contained" disableElevation sx={{ fontWeight: 700, borderRadius: '8px' }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
