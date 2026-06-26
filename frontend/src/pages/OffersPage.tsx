import React, { useMemo, useState } from 'react';
import {
  Box, Typography, Button, useTheme, alpha, Grid, Tabs, Tab, Paper,
  TextField, InputAdornment, MenuItem, FormControl, InputLabel, Select, Collapse,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip,
  Fade, keyframes
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import WorkIcon from '@mui/icons-material/Work';
import AddIcon from '@mui/icons-material/Add';
import PlaceIcon from '@mui/icons-material/Place';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate } from 'react-router-dom';
import OfferCard from '../components/OfferCard';
import AdCard from '../components/AdCard';
import PageLoader from '../components/PageLoader';
import { useAppSelector, useAppDispatch } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { fetchOffers, deleteOffer } from '../store/slices/offersSlice';
import { setCoords } from '../store/slices/locationSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api, { fetcher } from '../utils/api';
import useSWR from 'swr';

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
`;

export default function OffersPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState(0);
  const { items: offers, status: offersStatus } = useAppSelector((state) => state.offers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomaine, setSelectedDomaine] = useState('');
  const [selectedQuartier, setSelectedQuartier] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const globalQuartier = useAppSelector((s) => s.location.quartier);

  const role = useAppSelector((state) => state.auth.role);
  const currentUser = useAppSelector((state) => state.auth.user);
  const isEmployer = role === 'employer';

  const { data: adsData } = useSWR('offers/?is_ad=true', fetcher);
  const ads = adsData || [];
  const [isLocating, setIsLocating] = useState(false);
  const [isGeoActive, setIsGeoActive] = useState(false);

  const siteSettings = useAppSelector((state) => state.siteSettings);

  React.useEffect(() => {
    if (offersStatus === 'idle') {
      dispatch(fetchOffers());
    }
  }, [offersStatus, dispatch]);

  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    if (!isEmployer && offers.length === 0 && siteSettings.show_empty_offers_countdown) {
      let targetDateStr = localStorage.getItem('emptyOffersCountdownTarget');
      let targetDate: Date;
      if (!targetDateStr) {
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 30);
        localStorage.setItem('emptyOffersCountdownTarget', targetDate.toISOString());
      } else {
        targetDate = new Date(targetDateStr);
      }

      const timer = setInterval(() => {
        const now = new Date();
        const difference = targetDate.getTime() - now.getTime();
        
        if (difference <= 0) {
          clearInterval(timer);
          // Reset for another 30 days if it hits 0
          targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + 30);
          localStorage.setItem('emptyOffersCountdownTarget', targetDate.toISOString());
        } else {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
          });
        }
      }, 1000);
      return () => clearInterval(timer);
    } else if (offers.length > 0) {
      localStorage.removeItem('emptyOffersCountdownTarget');
    }
  }, [isEmployer, offers.length, siteSettings.show_empty_offers_countdown]);

  // Filter offers depending on role
  const filteredOffers = useMemo(() => {
    let result = offers;
    if (isEmployer && currentUser) {
      // Return only the current employer's offers
      const employerName = currentUser.employer_profile?.company_name || currentUser.username;
      result = result.filter((o) => o.employeur === employerName);
    } else if (!isEmployer) {
      // Apply candidate search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter((o) =>
          o.titre?.toLowerCase().includes(q) ||
          o.description?.toLowerCase().includes(q) ||
          o.employeur?.toLowerCase().includes(q) ||
          o.domaine?.toLowerCase().includes(q)
        );
      }
      // Apply domaine filter
      if (selectedDomaine) {
        result = result.filter((o) => o.domaine === selectedDomaine);
      }
      // Apply selected dropdown quartier filter
      if (selectedQuartier) {
        result = result.filter((o) => {
          const oq = (o.quartier || '').toLowerCase();
          const sq = selectedQuartier.toLowerCase();
          return oq.includes(sq) || sq.includes(oq);
        });
      }
      // Apply global store quartier filter
      if (globalQuartier && globalQuartier !== 'Tous les quartiers') {
        const gq = globalQuartier.toLowerCase();
        result = result.filter((o) => {
          const oq = (o.quartier || '').toLowerCase();
          return oq.includes(gq) || gq.includes(oq);
        });
      }
    }
    return result;
  }, [offers, isEmployer, searchQuery, selectedDomaine, selectedQuartier, globalQuartier, currentUser]);

  const all = filteredOffers;
  const urgent = useMemo(() => filteredOffers.filter((o) => o.urgent), [filteredOffers]);
  const displayed = tab === 0 ? all : urgent;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null);

  const openConfirmation = (id: string) => {
    setConfirmTargetId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!confirmTargetId) return;
    dispatch(deleteOffer(confirmTargetId))
      .unwrap()
      .then(() => {
        dispatch(showSnackbar({ message: 'L\'annonce a été supprimée avec succès !', severity: 'success' }));
      })
      .catch(() => {
        dispatch(showSnackbar({ message: 'Erreur lors de la suppression de l\'annonce', severity: 'error' }));
      });
    setConfirmOpen(false);
    setConfirmTargetId(null);
  };

  const handleEdit = (id: string) => {
    navigate(`/post-offer?edit=${id}`);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      dispatch(showSnackbar({ message: "La géolocalisation n'est pas supportée par votre navigateur", severity: 'error' }));
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        dispatch(setCoords({ lat: latitude, lng: longitude }));
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          let quartier = '';
          if (data && data.address) {
            quartier = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.city || data.address.town || '';
          }
          
          if (quartier) {
            setSelectedQuartier(quartier);
            setIsGeoActive(true);
            dispatch(showSnackbar({ message: `Localisé avec succès près de ${quartier}`, severity: 'success' }));
          } else {
            setIsGeoActive(true);
            dispatch(showSnackbar({ message: `Localisé avec succès mais lieu non identifié.`, severity: 'success' }));
          }
        } catch (error) {
          console.error(error);
          dispatch(showSnackbar({ message: 'Localisation réussie (Coordonnées trouvées)', severity: 'success' }));
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        dispatch(showSnackbar({ message: 'Erreur de géolocalisation. Veuillez autoriser l\'accès.', severity: 'error' }));
      }
    );
  };


  if (offersStatus === 'loading') {
    return <PageLoader text="Recherche des offres disponibles..." />;
  }

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.025em', mb: 0.25 }}>
            {isEmployer ? 'Mes annonces' : 'Offres d\'emploi'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {isEmployer ? 'Gérez et modifiez vos publications d\'emploi actives' : 'Opportunités dans votre quartier'}
          </Typography>
        </Box>
        {isEmployer && (
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            className="pressable"
            onClick={() => navigate('/post-offer')}
            sx={{ borderRadius: '8px', fontWeight: 600 }}
          >
            Publier une offre
          </Button>
        )}
      </Box>

      {/* Advanced Search & Filtering for Candidate */}
      {!isEmployer && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 4,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Rechercher par titre, description, employeur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, minWidth: '240px' }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }
              }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<TuneIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                borderRadius: '8px',
                borderColor: showFilters ? 'primary.main' : 'divider',
                color: showFilters ? 'primary.main' : 'text.primary',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Filtres
            </Button>
          </Box>

          <Collapse in={showFilters} timeout="auto" unmountOnExit>
            <Grid container spacing={2} sx={{ mt: 1.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Domaine d'activité</InputLabel>
                  <Select
                    value={selectedDomaine}
                    label="Domaine d'activité"
                    onChange={(e) => setSelectedDomaine(e.target.value)}
                  >
                    <MenuItem value="">Tous les domaines</MenuItem>
                    {['Cuisine', 'Livraison', 'Peinture', 'Sécurité', 'Enseignement', 'Ménage', 'Électricité', 'Coiffure'].map((d) => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Quartier</InputLabel>
                  <Select
                    value={selectedQuartier}
                    label="Quartier"
                    onChange={(e) => setSelectedQuartier(e.target.value)}
                  >
                    <MenuItem value="">Tous les quartiers</MenuItem>
                    {(() => {
                      const options = ['Bonapriso', 'Akwa', 'Bonanjo', 'Deido', 'Kotto', 'Denver', 'Logbessou', 'Bastos'];
                      if (selectedQuartier && !options.includes(selectedQuartier)) {
                        options.push(selectedQuartier);
                      }
                      return options.map((q) => (
                        <MenuItem key={q} value={q}>{q}</MenuItem>
                      ));
                    })()}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Collapse>
        </Paper>
      )}

      {/* Geo Banner */}
      {!isEmployer && (
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            mb: 3,
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
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Offres autour de vous</Typography>
              <Typography variant="caption" color="text.secondary">
                {isGeoActive ? 'Géolocalisation activée' : globalQuartier !== 'Tous les quartiers' ? `Basé sur votre recherche: ${globalQuartier}` : 'Activez la géolocalisation pour voir les offres à proximité'}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isGeoActive && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                className="pressable"
                onClick={() => {
                  setIsGeoActive(false);
                  setSelectedQuartier('');
                  dispatch(showSnackbar({ message: 'Filtre de géolocalisation retiré.', severity: 'info' }));
                }}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
              >
                Toutes les offres
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={isLocating ? undefined : <PlaceIcon />}
              className="pressable"
              onClick={handleGeolocation}
              disabled={isLocating}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
            >
              {isLocating ? 'Recherche...' : 'Me localiser'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTabs-indicator': { height: 2, borderRadius: '2px' },
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Tab
          label={`Toutes (${all.length})`}
          id="tab-all"
          sx={{ fontWeight: 500, fontSize: '0.9375rem', pb: 1.5 }}
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LocalFireDepartmentIcon sx={{ fontSize: 14, color: 'error.main' }} />
              <span>Urgentes ({urgent.length})</span>
            </Box>
          }
          id="tab-urgent"
          sx={{ fontWeight: 500, fontSize: '0.9375rem', pb: 1.5 }}
        />
      </Tabs>

      {/* Grid */}
      {displayed.length > 0 || (!isEmployer && ads.length > 0) ? (
        <Grid container spacing={2}>
          {(() => {
            const elements = [];
            let adIndex = 0;
            
            displayed.forEach((offer, idx) => {
              // Show an ad before the 1st, 4th, 7th... offer
              if (!isEmployer && ads.length > 0 && idx % 3 === 0) {
                elements.push(
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={`ad-${adIndex}`}>
                    <AdCard ad={ads[adIndex % ads.length]} />
                  </Grid>
                );
                adIndex++;
              }
              elements.push(
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={offer.id}>
                  <OfferCard 
                    offer={offer} 
                    onEdit={isEmployer ? () => handleEdit(offer.id) : undefined}
                    onDelete={isEmployer ? () => openConfirmation(offer.id) : undefined}
                  />
                </Grid>
              );
            });

            // If no offers but we have ads
            if (displayed.length === 0 && !isEmployer && ads.length > 0) {
              elements.push(
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key="ad-fallback">
                  <AdCard ad={ads[0]} />
                </Grid>
              );
            }

            return elements;
          })()}
        </Grid>
      ) : (
        <Paper elevation={0} sx={{ p: 6, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          {isEmployer ? (
            <>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Aucune annonce active</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Vous n'avez pas encore publié d'annonces ou elles ont été retirées.
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/post-offer')}>
                Déposer votre première offre
              </Button>
            </>
          ) : siteSettings.show_empty_offers_countdown && offers.length === 0 ? (
            <Fade in={true} timeout={800}>
              <Box sx={{ maxWidth: 500, mx: 'auto', py: 4 }}>
                <Box sx={{ 
                  display: 'inline-flex', p: 2.5, borderRadius: '24px', 
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  color: 'warning.main', mb: 3,
                  animation: `${pulseGlow} 2s infinite`
                }}>
                  <HourglassEmptyIcon sx={{ fontSize: 48 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, letterSpacing: '-0.03em' }}>
                  Nouvelles offres en préparation
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                  Notre équipe travaille activement avec nos partenaires pour vous dénicher les meilleures opportunités. Les prochaines offres seront disponibles au plus tard dans :
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
                  {[
                    { label: 'Jours', value: timeLeft.days },
                    { label: 'Heures', value: timeLeft.hours },
                    { label: 'Minutes', value: timeLeft.minutes },
                    { label: 'Secondes', value: timeLeft.seconds }
                  ].map((item, idx) => (
                    <Grid size={{ xs: 3 }} key={item.label}>
                      <Paper elevation={0} sx={{ 
                        p: 1.5, borderRadius: '16px', 
                        bgcolor: 'background.default', border: `1px solid ${theme.palette.divider}`,
                        position: 'relative', overflow: 'hidden'
                      }}>
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', bgcolor: idx % 2 === 0 ? 'primary.main' : 'secondary.main' }} />
                        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'monospace', mt: 0.5 }}>
                          {item.value.toString().padStart(2, '0')}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.65rem' }}>
                          {item.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <AccessTimeIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Revenez régulièrement pour ne rien manquer !
                  </Typography>
                </Box>
              </Box>
            </Fade>
          ) : (
            <>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Aucune offre disponible</Typography>
              <Typography variant="body2" color="text.secondary">
                Il n'y a pas encore d'offres d'emploi correspondant à votre recherche.
              </Typography>
            </>
          )}
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Supprimer l'annonce ?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.95rem' }}>
            Êtes-vous sûr de vouloir supprimer définitivement cette annonce ? Cette action est irréversible et supprimera également toutes les candidatures associées.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" sx={{ fontWeight: 700, borderRadius: '8px' }}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
