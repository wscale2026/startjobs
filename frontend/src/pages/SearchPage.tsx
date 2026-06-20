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

export default function SearchPage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { query, domaine, typeProfil, disponible, rayon } = useAppSelector((s) => s.filters);
  const globalQuartier = useAppSelector((s) => s.location.quartier);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);

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
    api.get('offers/?is_ad=true').then(res => setAds(res.data)).catch(console.error);

    api.get('candidates/')
      .then((res) => {
        const mapped = res.data.map((c: any) => {
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
            photo: c.photo || 'https://via.placeholder.com/150',
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
      })
      .catch((err) => {
        console.error('Error fetching candidates:', err);
        setCandidates(MOCK_WORKERS);
      });
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

  return (
    <Box>
      {/* Search */}
      <SearchBar />

      {/* Geo Banner */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          mb: 3,
          mt: 3,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: '10px',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <PlaceIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Candidats autour de vous</Typography>
            <Typography variant="caption" color="text.secondary">
              {userCoords ? 'Rayon calculé autour de votre position exacte' : (globalQuartier !== 'Tous les quartiers' ? `Basé sur votre recherche: ${globalQuartier}` : 'Activez la géolocalisation pour voir les candidats à proximité')}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {userCoords && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<PublicIcon />}
              onClick={handleClearLocation}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, color: 'text.secondary', borderColor: 'divider' }}
            >
              Tous les candidats
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={isLocating ? <CircularProgress size={16} color="inherit" /> : <PlaceIcon />}
            className="pressable"
            disabled={isLocating || !!userCoords}
            onClick={handleLocateMe}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
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
