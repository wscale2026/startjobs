import React, { useMemo, useState, useEffect } from 'react';
import {
  Box, Typography, Button, useTheme, alpha,
  Grid, Chip, Paper, CircularProgress
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import TuneIcon from '@mui/icons-material/Tune';
import PublicIcon from '@mui/icons-material/Public';
import SearchBar from '../components/SearchBar';
import ProfileCard from '../components/ProfileCard';
import AdCard from '../components/AdCard';
import { useAppSelector, useAppDispatch } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { MOCK_WORKERS } from '../mocks/workers';
import api from '../utils/api';
import CardSkeleton from '../components/CardSkeleton';

let cachedRawCandidates: any[] | null = null;
let cachedAdsSearch: any[] | null = null;

export default function SearchPage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { query, domaine, typeProfil, disponible, rayon } = useAppSelector((s) => s.filters);
  const globalQuartier = useAppSelector((s) => s.location.quartier);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!cachedRawCandidates);

  const userQuartier = useAppSelector((s) => s.location.quartier);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setIsLocating(false);
          dispatch(showSnackbar({ message: 'Géolocalisation activée avec succès', severity: 'success' }));
        },
        () => {
          setIsLocating(false);
          dispatch(showSnackbar({ message: 'Impossible d\'obtenir votre position', severity: 'error' }));
        }
      );
    } else {
      setIsLocating(false);
      dispatch(showSnackbar({ message: 'Géolocalisation non supportée', severity: 'warning' }));
    }
  };

  const handleClearLocation = () => {
    setUserCoords(null);
    dispatch(showSnackbar({ message: 'Recherche globale réactivée', severity: 'info' }));
  };

  useEffect(() => {
    if (cachedAdsSearch) {
      setAds(cachedAdsSearch);
    } else {
      api.get('offers/?is_ad=true').then(res => {
        cachedAdsSearch = res.data;
        setAds(res.data);
      }).catch(console.error);
    }

    const processCandidates = (rawCandidates: any[]) => {
      const mapped = rawCandidates.map((c: any) => {
        const candidateQuartier = c.neighborhood || '';
        // Simulate smart distance: same quartier → 1-2 km, different → 5-15 km
        const isSameQuartier = userQuartier && userQuartier !== 'Tous les quartiers'
          && candidateQuartier.toLowerCase().includes(userQuartier.toLowerCase());
        const distance = isSameQuartier
          ? parseFloat((Math.random() * 1.5 + 0.5).toFixed(1))
          : parseFloat((Math.random() * 10 + 5).toFixed(1));
        return {
          id: String(c.user?.id || c.id),
          user_id: c.user?.id,
          prenom: c.user?.first_name || 'Candidat',
          nom: c.user?.last_name || '',
          photo: c.photo || '',
          photoColor: theme.palette.secondary.main,
          quartier: candidateQuartier || 'Non renseigné',
          distance,
          latitude: c.latitude,
          longitude: c.longitude,
          score: c.score || 5,
          totalMissions: c.total_missions || 0,
          bio: c.bio || 'Aucune description rédigée.',
          disponible: c.is_available,
          domaines: c.skills?.map((s: any) => s.name) || [],
          competences: c.skills?.map((s: any) => s.name) || [],
          langues: c.languages?.map((l: any) => l.name) || ['Français'],
          permis: c.has_license,
          experiences: c.experiences?.map((xp: any) => ({
            id: String(xp.id),
            titre: xp.title,
            employeur: xp.employer_name,
            date: xp.date,
            type: xp.exp_type,
            rating: xp.rating,
            commentaire: xp.comment
          })) || [],
          typeProfil: c.profile_type || 'Freelance'
        };
      });
      setCandidates(mapped);
    };

    if (cachedRawCandidates) {
      processCandidates(cachedRawCandidates);
    } else {
      api.get('candidates/')
        .then((res) => {
          cachedRawCandidates = res.data;
          processCandidates(res.data);
        })
        .catch((err) => {
          console.error('Error fetching candidates:', err);
          setCandidates(MOCK_WORKERS);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [theme, userQuartier]);

  const filtered = useMemo(() => {
    return candidates.map(w => {
      let finalDistance = w.distance;
      if (userCoords && w.latitude && w.longitude) {
        finalDistance = calculateDistance(userCoords.lat, userCoords.lng, w.latitude, w.longitude);
      }
      return { ...w, distance: parseFloat(finalDistance.toFixed(1)) };
    }).filter((w) => {
      if (query) {
        const q = query.toLowerCase();
        const match =
          w.prenom.toLowerCase().includes(q) ||
          w.nom.toLowerCase().includes(q) ||
          w.domaines.some((d: string) => d.toLowerCase().includes(q)) ||
          w.competences.some((c: string) => c.toLowerCase().includes(q)) ||
          w.quartier.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (domaine && !w.domaines.includes(domaine)) return false;
      if (typeProfil && w.typeProfil !== typeProfil) return false;
      if (disponible && !w.disponible) return false;
      if (rayon && w.distance > rayon) return false;
      if (globalQuartier && globalQuartier !== 'Tous les quartiers') {
        const wq = w.quartier.toLowerCase();
        const gq = globalQuartier.toLowerCase();
        if (!wq.includes(gq) && !gq.includes(wq)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (userCoords) return a.distance - b.distance;
      return 0;
    });
  }, [candidates, query, domaine, typeProfil, disponible, rayon, globalQuartier, userCoords]);

  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <SearchBar />
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}><CardSkeleton count={3} /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ display: { xs: 'none', sm: 'block' } }}><CardSkeleton count={3} /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} sx={{ display: { xs: 'none', lg: 'block' } }}><CardSkeleton count={3} /></Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search */}
      <SearchBar />

      {/* Geo Banner */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          p: { xs: 2, sm: 2 },
          mb: 3,
          mt: 3,
          gap: 2,
          borderRadius: 4,
          bgcolor: isLocating ? alpha(theme.palette.warning.main, 0.05) : (userCoords ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.primary.main, 0.04)),
          border: `1px solid ${isLocating ? alpha(theme.palette.warning.main, 0.2) : (userCoords ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.primary.main, 0.1))}`,
          transition: 'all 0.3s ease'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44, height: 44, borderRadius: '12px',
              bgcolor: isLocating ? alpha(theme.palette.warning.main, 0.1) : (userCoords ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.primary.main, 0.1)),
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}
          >
            <PlaceIcon sx={{ color: isLocating ? 'warning.main' : (userCoords ? 'success.main' : 'primary.main'), fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
              Candidats autour de vous
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, lineHeight: 1.3 }}>
              {userCoords ? 'Rayon calculé autour de votre position exacte' : (globalQuartier !== 'Tous les quartiers' ? `Basé sur votre recherche: ${globalQuartier}` : 'Activez la géolocalisation pour voir les candidats à proximité')}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
          {userCoords && (
            <Button
              variant="outlined"
              size="medium"
              startIcon={<PublicIcon />}
              onClick={handleClearLocation}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, color: 'text.secondary', borderColor: 'divider', py: { xs: 1, sm: 0.5 } }}
            >
              Tous les candidats
            </Button>
          )}
          <Button
            variant="contained"
            size="medium"
            color={userCoords ? "success" : "primary"}
            startIcon={isLocating ? <CircularProgress size={16} color="inherit" /> : <PlaceIcon />}
            className="pressable"
            disabled={isLocating || !!userCoords}
            onClick={handleLocateMe}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 700, boxShadow: 'none', py: { xs: 1, sm: 0.5 } }}
          >
            {isLocating ? 'Recherche...' : (userCoords ? 'Position active' : 'Me localiser')}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4, alignItems: { xs: 'stretch', md: 'center' } }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.015em' }}>
            {filtered.length} profil{filtered.length !== 1 ? 's' : ''}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Trié par distance · {globalQuartier !== 'Tous les quartiers' ? 'Votre quartier' : 'Douala'}
            </Typography>
            {globalQuartier && globalQuartier !== 'Tous les quartiers' && (
              <Chip 
                label={`Proche de ${globalQuartier}`} 
                size="small" 
                color="primary" 
                onDelete={() => { /* removed */ }} 
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Grid */}
      {filtered.length > 0 ? (
        <Grid container spacing={2}>
          {filtered.map((worker, idx) => (
            <React.Fragment key={worker.id}>
              {idx > 0 && idx % 4 === 0 && ads.length > 0 && (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                  <AdCard ad={ads[(idx / 4 - 1) % ads.length]} />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                <ProfileCard worker={worker} />
              </Grid>
            </React.Fragment>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 14, color: 'text.secondary' }}>
          <Box
            sx={{
              width: 64, height: 64, borderRadius: '16px',
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 3,
            }}
          >
            <SearchOffIcon sx={{ fontSize: 28, color: 'primary.main', opacity: 0.6 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, fontSize: '1rem' }}>
            Aucun résultat
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, mx: 'auto', lineHeight: 1.7 }}>
            Essayez d'autres mots-clés ou élargissez votre rayon de recherche.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
