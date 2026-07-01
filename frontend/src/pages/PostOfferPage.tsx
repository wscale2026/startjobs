import React, { useState } from 'react';
import {
  Box, Typography, TextField, Grid, Button, Chip,
  FormControl, InputLabel, Select, MenuItem,
  Divider, Stack, Switch, FormControlLabel, useTheme, Paper, Container, alpha
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';
import BlockIcon from '@mui/icons-material/Block';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { MOCK_OFFERS } from '../mocks/offers';
import QUARTIERS from '../mocks/quartiers';
import { createOffer, fetchOffers, updateOffer } from '../store/slices/offersSlice';

export default function PostOfferPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: apiOffers, status } = useAppSelector((state) => state.offers);
  const { user } = useAppSelector((state: any) => state.auth);
  const role = user?.role;

  // — Role guard: only employers can post offers —
  if (role && role !== 'employer') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2, textAlign: 'center', p: 4 }}>
        <BlockIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Accès refusé</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 400 }}>
          Seuls les employeurs peuvent publier des offres d'emploi. Si vous êtes employeur, veuillez vous connecter avec votre compte employeur.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/offers')} sx={{ mt: 2, borderRadius: 2 }}>
          Voir les offres d'emploi
        </Button>
      </Box>
    );
  }

  React.useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchOffers());
    }
  }, [status, dispatch]);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const editId = query.get('edit');
  const sectors = useAppSelector((state) => state.taxonomy.sectors);
  const dynamicSectors = sectors.length > 0 ? sectors : ['Construction', 'Cuisine', 'Électricité', 'Ménage', 'Livraison', 'Coiffure', 'Plomberie', 'Secrétariat', 'Sécurité', 'Couture', 'Informatique', 'Enseignement', 'Peinture', 'Maintenance'];

  const [form, setForm] = useState({
    titre: '', domaine: '', description: '',
    quartier: '', dateDebut: '', duree: '',
    budget: '', urgent: false,
  });

  React.useEffect(() => {
    if (editId) {
      const offer = apiOffers.find((o) => o.id === editId) || MOCK_OFFERS.find((o) => o.id === editId);
      if (offer) {
        setForm({
          titre: offer.titre,
          domaine: offer.domaine,
          description: offer.description,
          quartier: offer.quartier,
          dateDebut: offer.dateDebut,
          duree: offer.duree,
          budget: offer.budget || '',
          urgent: offer.urgent,
        });
      }
    }
  }, [editId, apiOffers]);

  const handleChange = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.titre,
      sector_name: form.domaine,
      description: form.description,
      neighborhood_name: form.quartier,
      start_date: form.dateDebut,
      duration: form.duree,
      budget: form.budget,
      is_urgent: form.urgent,
      contact_whatsapp: '+237690000000', // could be dynamic
      contact_phone: '+237690000000',
    };

    if (editId) {
      dispatch(updateOffer({ id: editId, data: payload }))
        .unwrap()
        .then(() => {
          dispatch(showSnackbar({ message: 'Offre modifiée avec succès ! ✓', severity: 'success' }));
          navigate('/offers');
        })
        .catch(() => {
          dispatch(showSnackbar({ message: 'Erreur lors de la modification de l\'offre.', severity: 'error' }));
        });
    } else {
      dispatch(createOffer(payload))
        .unwrap()
        .then(() => {
          dispatch(showSnackbar({ message: 'Offre publiée avec succès ! ✓', severity: 'success' }));
          navigate('/offers');
        })
        .catch(() => {
          dispatch(showSnackbar({ message: 'Erreur lors de la publication de l\'offre.', severity: 'error' }));
        });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ position: 'relative', minHeight: '100vh', pb: { xs: 24, md: 14 } }}>
      <Container maxWidth="md" sx={{ pt: { xs: 2, md: 4 } }}>
        {/* En-tête */}
        <Box sx={{ mb: 4 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)} 
            sx={{ 
              mb: 2, 
              color: 'text.secondary',
              fontWeight: 600,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main' }
            }}
          >
            Retour au tableau de bord
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            {editId ? 'Modifier l\'offre' : 'Déposer une annonce'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
            {editId 
              ? 'Ajustez les détails de votre annonce d\'emploi pour attirer les meilleurs profils.' 
              : 'Décrivez le poste avec précision pour trouver le candidat idéal dans votre quartier.'}
          </Typography>
        </Box>

        {/* Section 1: Informations principales */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            borderRadius: '24px', 
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 12px 32px rgba(0,0,0,0.03)',
            mb: 4 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}>
              <InfoOutlinedIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Informations principales</Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth required
                label="Titre du poste"
                placeholder="ex: Aide cuisinière – temps partiel"
                value={form.titre}
                onChange={(e) => handleChange('titre', e.target.value)}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Domaine</InputLabel>
                <Select 
                  value={form.domaine} 
                  label="Domaine" 
                  onChange={(e) => handleChange('domaine', e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  {dynamicSectors.map((d: string) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Quartier d'intervention</InputLabel>
                <Select 
                  value={form.quartier} 
                  label="Quartier d'intervention" 
                  onChange={(e) => handleChange('quartier', e.target.value)}
                  sx={{ borderRadius: '12px' }}
                >
                  {QUARTIERS.map((q) => <MenuItem key={q} value={q}>{q}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth required multiline rows={5}
                label="Description détaillée"
                placeholder="Décrivez les tâches, les attentes, et les conditions de travail…"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                slotProps={{ htmlInput: { maxLength: 500 } }}
                helperText={`${form.description.length} / 500 caractères`}
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': { borderRadius: '16px' },
                  '& .MuiFormHelperText-root': { textAlign: 'right', fontWeight: 600 }
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Section 2: Détails pratiques */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            borderRadius: '24px', 
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, 
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff',
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 12px 32px rgba(0,0,0,0.03)',
            mb: 4 
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
            <Box sx={{ p: 1, borderRadius: '12px', bgcolor: alpha(theme.palette.secondary.main || theme.palette.info.main, 0.1), color: theme.palette.secondary.main || theme.palette.info.main }}>
              <DateRangeOutlinedIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Conditions & Calendrier</Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth type="date" label="Date de début souhaitée" slotProps={{ inputLabel: { shrink: true } }}
                value={form.dateDebut} onChange={(e) => handleChange('dateDebut', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="Durée de la mission"
                placeholder="ex: 3 mois, 1 semaine, CDI"
                value={form.duree} onChange={(e) => handleChange('duree', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="Rémunération (optionnel)"
                placeholder="ex: 45 000 FCFA/mois"
                value={form.budget} onChange={(e) => handleChange('budget', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  p: 2,
                  borderRadius: '12px',
                  border: `1px solid ${form.urgent ? theme.palette.error.main : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                  bgcolor: form.urgent ? alpha(theme.palette.error.main, 0.05) : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocalFireDepartmentIcon sx={{ color: form.urgent ? 'error.main' : 'text.disabled', fontSize: 24 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: form.urgent ? 'error.main' : 'text.primary' }}>Offre Urgente</Typography>
                    <Typography variant="caption" color="text.secondary">Mise en avant prioritaire</Typography>
                  </Box>
                </Box>
                <Switch
                  checked={form.urgent}
                  onChange={(e) => handleChange('urgent', e.target.checked)}
                  color="error"
                />
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Barre d'Actions (Flottante sur tous les écrans) */}
      <Box 
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: { xs: 2, md: 2 },
          pb: { xs: 12, md: 2 }, // Padding extra sur mobile pour éviter la bottom nav globale
          zIndex: 100,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.06)'
        }}
      >
        <Container maxWidth="md" sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'flex-end', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
          <Button
            variant="text"
            color="inherit"
            onClick={() => navigate('/offers')}
            sx={{ 
              px: 3, 
              py: 1.25,
              borderRadius: '12px', 
              fontWeight: 600,
              color: 'text.secondary',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                color: 'text.primary'
              }
            }}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SendIcon />}
            className="pressable"
            sx={{ 
              px: 4,
              py: 1.25,
              borderRadius: '12px',
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 8px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(59, 130, 246, 0.25)'}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: `0 12px 24px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(59, 130, 246, 0.35)'}`,
                transform: 'translateY(-2px)'
              }
            }}
          >
            {editId ? 'Sauvegarder les modifications' : 'Publier l\'annonce'}
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
