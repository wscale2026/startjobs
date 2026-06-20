import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, useTheme, Button, TextField, ListItem, ListItemText, IconButton, Chip, alpha, CircularProgress, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import PlaceIcon from '@mui/icons-material/Place';
import EditIcon from '@mui/icons-material/Edit';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import api from '../utils/api';

interface Neighborhood {
  id: number;
  name: string;
  city: string;
}

export default function AdminLocationsPage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [localCities, setLocalCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState(0); // 0: Villes, 1: Quartiers

  const [newCityOpen, setNewCityOpen] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newNeighborhoodName, setNewNeighborhoodName] = useState('');

  const [loadingAddNeighborhood, setLoadingAddNeighborhood] = useState(false);
  const [loadingDeleteCity, setLoadingDeleteCity] = useState(false);
  const [loadingEditCity, setLoadingEditCity] = useState(false);
  const [deletingNeighborhoodId, setDeletingNeighborhoodId] = useState<number | null>(null);

  // Dialog states for editing and deleting cities
  const [cityToDelete, setCityToDelete] = useState<string | null>(null);
  const [editCityOpen, setEditCityOpen] = useState(false);
  const [cityToEdit, setCityToEdit] = useState<string | null>(null);
  const [newEditedCityName, setNewEditedCityName] = useState('');

  useEffect(() => {
    fetchNeighborhoods();
  }, []);

  const fetchNeighborhoods = async () => {
    try {
      const res = await api.get('/neighborhoods/');
      const data: Neighborhood[] = res.data.results || res.data;
      setNeighborhoods(data);
      
      const uniqueCities = Array.from(new Set(data.map(n => n.city).filter(Boolean)));
      setLocalCities(uniqueCities);
      
      if (uniqueCities.length > 0 && !selectedCity) {
        setSelectedCity(uniqueCities[0]);
      }
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors du chargement des localisations', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = () => {
    const city = newCityName.trim();
    if (!city) return;
    
    if (localCities.includes(city)) {
      dispatch(showSnackbar({ message: 'Cette ville existe déjà.', severity: 'warning' }));
      return;
    }

    setLocalCities(prev => [...prev, city]);
    setSelectedCity(city);
    setNewCityOpen(false);
    setNewCityName('');
    dispatch(showSnackbar({ message: `Ville "${city}" ajoutée. Ajoutez un quartier pour la sauvegarder.`, severity: 'info' }));
    
    if (window.innerWidth < 900) {
      setMobileTab(1); // Switch to neighborhoods tab on mobile
    }
  };

  const handleAddNeighborhood = async () => {
    const name = newNeighborhoodName.trim();
    if (!name || !selectedCity) return;

    setLoadingAddNeighborhood(true);
    try {
      const res = await api.post('/neighborhoods/', { name, city: selectedCity });
      setNeighborhoods(prev => [...prev, res.data]);
      setNewNeighborhoodName('');
      
      // Ensure the city is securely in localCities if it wasn't
      if (!localCities.includes(selectedCity)) {
        setLocalCities(prev => [...prev, selectedCity]);
      }
      
      dispatch(showSnackbar({ message: 'Quartier ajouté avec succès', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Erreur: Ce quartier existe peut-être déjà pour cette ville.', severity: 'error' }));
    } finally {
      setLoadingAddNeighborhood(false);
    }
  };

  const handleDeleteNeighborhood = async (neighborhood: Neighborhood) => {
    setDeletingNeighborhoodId(neighborhood.id);
    try {
      await api.delete(`/neighborhoods/${neighborhood.id}/`);
      setNeighborhoods(prev => prev.filter(n => n.id !== neighborhood.id));
      dispatch(showSnackbar({ message: 'Quartier supprimé', severity: 'info' }));
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la suppression', severity: 'error' }));
    } finally {
      setDeletingNeighborhoodId(null);
    }
  };

  const confirmDeleteCity = (city: string) => {
    setCityToDelete(city);
  };

  const handleConfirmDeleteCity = async () => {
    if (!cityToDelete) return;
    const city = cityToDelete;
    
    setLoadingDeleteCity(true);
    // Delete all neighborhoods of this city
    const cityNeighborhoods = neighborhoods.filter(n => n.city === city);
    try {
      if (cityNeighborhoods.length > 0) {
        await Promise.all(cityNeighborhoods.map(n => api.delete(`/neighborhoods/${n.id}/`)));
      }
      
      setNeighborhoods(prev => prev.filter(n => n.city !== city));
      setLocalCities(prev => prev.filter(c => c !== city));
      
      if (selectedCity === city) {
        const remaining = localCities.filter(c => c !== city);
        setSelectedCity(remaining.length > 0 ? remaining[0] : null);
      }
      
      dispatch(showSnackbar({ message: 'Ville et ses quartiers supprimés', severity: 'info' }));
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la suppression de la ville', severity: 'error' }));
    } finally {
      setCityToDelete(null);
      setLoadingDeleteCity(false);
    }
  };

  const openEditCity = (city: string) => {
    setCityToEdit(city);
    setNewEditedCityName(city);
    setEditCityOpen(true);
  };

  const handleEditCity = async () => {
    const newName = newEditedCityName.trim();
    if (!newName || !cityToEdit || newName === cityToEdit) {
      setEditCityOpen(false);
      return;
    }

    if (localCities.includes(newName)) {
      dispatch(showSnackbar({ message: 'Une ville avec ce nom existe déjà.', severity: 'warning' }));
      return;
    }

    const cityNeighborhoods = neighborhoods.filter(n => n.city === cityToEdit);
    setLoadingEditCity(true);
    try {
      if (cityNeighborhoods.length > 0) {
        // Update each neighborhood's city via PATCH
        await Promise.all(cityNeighborhoods.map(n => 
          api.patch(`/neighborhoods/${n.id}/`, { city: newName })
        ));
        
        setNeighborhoods(prev => prev.map(n => n.city === cityToEdit ? { ...n, city: newName } : n));
      }
      
      setLocalCities(prev => prev.map(c => c === cityToEdit ? newName : c));
      
      if (selectedCity === cityToEdit) {
        setSelectedCity(newName);
      }
      
      dispatch(showSnackbar({ message: 'Ville renommée avec succès', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la modification de la ville', severity: 'error' }));
    } finally {
      setEditCityOpen(false);
      setCityToEdit(null);
      setLoadingEditCity(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} thickness={4} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  const selectedCityNeighborhoods = neighborhoods.filter(n => n.city === selectedCity);

  return (
    <Box sx={{ pb: 6, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: { xs: 3, md: 5 }, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
            Villes & Quartiers
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
            Définissez les zones géographiques couvertes par la plateforme pour faciliter le matching de proximité.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setNewCityOpen(true)} 
          sx={{ borderRadius: '12px', fontWeight: 700, px: 3, py: 1.2, boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}` }}
        >
          Nouvelle Ville
        </Button>
      </Box>

      {/* Tabs for Mobile Navigation */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
        <Paper sx={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
          <Tabs 
            value={mobileTab} 
            onChange={(_, nv) => setMobileTab(nv)} 
            variant="fullWidth"
            sx={{ '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', py: 2, fontSize: '0.95rem' } }}
          >
            <Tab icon={<LocationCityIcon sx={{ mb: 0.5 }} />} label="Villes" />
            <Tab icon={<PlaceIcon sx={{ mb: 0.5 }} />} label="Quartiers" disabled={!selectedCity} />
          </Tabs>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        
        {/* Colonne Gauche : Villes */}
        <Paper 
          component={motion.div} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          sx={{ 
            display: { xs: mobileTab === 0 ? 'flex' : 'none', md: 'flex' },
            flex: 1, 
            flexDirection: 'column', 
            height: { xs: 'calc(100vh - 350px)', md: 680 }, 
            minHeight: 500,
            borderRadius: '24px', 
            border: `1px solid ${theme.palette.divider}`, 
            boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.04)}`, 
            overflow: 'hidden',
            bgcolor: 'background.paper',
            position: 'relative'
          }}
        >
          {/* Header Villes */}
          <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main' }}>
              <LocationCityIcon /> Villes Desservies
            </Typography>
            <Chip label={localCities.length} color="primary" size="small" sx={{ fontWeight: 800, borderRadius: '8px' }} />
          </Box>

          {/* Liste Villes */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: alpha(theme.palette.background.default, 0.2) }}>
            <AnimatePresence>
              {localCities.map((city) => {
                const count = neighborhoods.filter(n => n.city === city).length;
                const isSelected = selectedCity === city;
                return (
                  <motion.div key={city} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <ListItem
                      onClick={() => {
                        setSelectedCity(city);
                        if (window.innerWidth < 900) setMobileTab(1);
                      }}
                      sx={{ 
                        borderRadius: '12px', 
                        mb: 1, 
                        cursor: 'pointer',
                        bgcolor: isSelected ? 'primary.main' : 'background.paper',
                        color: isSelected ? 'white' : 'text.primary',
                        border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                        boxShadow: isSelected ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}` : `0 2px 8px ${alpha(theme.palette.common.black, 0.02)}`,
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: isSelected ? `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}` : `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                        }
                      }}
                    >
                      <ListItemText primary={city} slotProps={{ primary: { sx: { fontWeight: isSelected ? 800 : 600, fontSize: '1rem' } } }} />
                      <Chip 
                        label={count} 
                        size="small" 
                        sx={{ 
                          fontWeight: 800, 
                          mr: 1, 
                          bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : alpha(theme.palette.primary.main, 0.1),
                          color: isSelected ? 'white' : 'primary.main',
                        }} 
                      />
                      <IconButton 
                        size="small"
                        onClick={(e) => { e.stopPropagation(); openEditCity(city); }} 
                        sx={{ 
                          mr: 0.5,
                          color: isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary', 
                          transition: 'all 0.2s',
                          '&:hover': { color: isSelected ? 'white' : 'primary.main', bgcolor: isSelected ? 'rgba(255,255,255,0.1)' : alpha(theme.palette.primary.main, 0.1) } 
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        edge="end" 
                        onClick={(e) => { e.stopPropagation(); confirmDeleteCity(city); }} 
                        sx={{ 
                          color: isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary', 
                          transition: 'all 0.2s',
                          '&:hover': { color: isSelected ? 'white' : 'error.main', bgcolor: isSelected ? 'rgba(255,255,255,0.1)' : alpha(theme.palette.error.main, 0.1) } 
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {localCities.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <LocationCityIcon sx={{ fontSize: 48, opacity: 0.2 }} />
                <Typography sx={{ fontWeight: 600 }}>Aucune ville configurée.</Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Colonne Droite : Quartiers */}
        <Paper 
          component={motion.div} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          sx={{ 
            display: { xs: mobileTab === 1 ? 'flex' : 'none', md: 'flex' },
            flex: 1.5, 
            flexDirection: 'column', 
            height: { xs: 'calc(100vh - 350px)', md: 680 }, 
            minHeight: 500,
            borderRadius: '24px', 
            border: `1px solid ${theme.palette.divider}`, 
            boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.04)}`, 
            overflow: 'hidden',
            bgcolor: 'background.paper'
          }}
        >
          {selectedCity ? (
            <>
              {/* Header Quartiers */}
              <Box sx={{ p: 3, bgcolor: alpha(theme.palette.secondary.main, 0.03), borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, color: 'secondary.main' }}>
                  <PlaceIcon /> Quartiers de {selectedCity}
                </Typography>
                <Chip label={selectedCityNeighborhoods.length} color="secondary" size="small" sx={{ fontWeight: 800, borderRadius: '8px' }} />
              </Box>

              {/* Formulaire Quartiers */}
              <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField 
                    fullWidth 
                    placeholder={`Ajouter un quartier à ${selectedCity}...`}
                    value={newNeighborhoodName} 
                    onChange={(e) => setNewNeighborhoodName(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNeighborhood()} 
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: '12px',
                        bgcolor: 'background.paper',
                        transition: 'all 0.2s',
                        '&.Mui-focused': { boxShadow: `0 4px 20px ${alpha(theme.palette.secondary.main, 0.15)}` }
                      } 
                    }} 
                  />
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={handleAddNeighborhood} 
                    disabled={loadingAddNeighborhood}
                    startIcon={loadingAddNeighborhood ? <CircularProgress size={20} color="inherit" /> : <AddIcon />} 
                    sx={{ borderRadius: '12px', px: 3, minWidth: 140, fontWeight: 700, boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.25)}` }}
                  >
                    Ajouter
                  </Button>
                </Box>
              </Box>

              {/* Liste Quartiers (Chips) */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 4, bgcolor: alpha(theme.palette.background.default, 0.2) }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  <AnimatePresence>
                    {selectedCityNeighborhoods.map((n) => (
                      <motion.div key={n.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                        <Chip
                          label={n.name}
                          onDelete={() => handleDeleteNeighborhood(n)}
                          deleteIcon={deletingNeighborhoodId === n.id ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.9rem', 
                            borderRadius: '10px', 
                            py: 2.5,
                            px: 1,
                            bgcolor: 'background.paper', 
                            color: 'text.primary', 
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow: `0 2px 6px ${alpha(theme.palette.common.black, 0.04)}`,
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: theme.palette.secondary.main,
                              boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.15)}`,
                              transform: 'translateY(-2px)',
                              '& .MuiChip-deleteIcon': {
                                color: 'error.main'
                              }
                            },
                            '& .MuiChip-deleteIcon': {
                              color: 'text.secondary',
                              fontSize: '1.2rem',
                              transition: 'color 0.2s'
                            }
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </Box>
                {selectedCityNeighborhoods.length === 0 && (
                  <Box sx={{ p: 4, mt: 4, textAlign: 'center', color: 'text.secondary', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <PlaceIcon sx={{ fontSize: 48, opacity: 0.2 }} />
                    <Typography sx={{ fontWeight: 600 }}>Aucun quartier enregistré pour {selectedCity}.</Typography>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', p: 4 }}>
              <LocationCityIcon sx={{ fontSize: 80, opacity: 0.1, mb: 3 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Sélectionnez une ville</Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', maxWidth: 300 }}>
                Cliquez sur une ville dans la liste de gauche pour afficher et gérer ses quartiers.
              </Typography>
            </Box>
          )}
        </Paper>

      </Box>

      {/* Add City Dialog */}
      <Dialog open={newCityOpen} onClose={() => setNewCityOpen(false)} slotProps={{ paper: { sx: { borderRadius: '20px', width: '100%', maxWidth: 400 } } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Nouvelle Ville</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Entrez le nom de la nouvelle ville que vous souhaitez couvrir.
          </Typography>
          <TextField
            autoFocus
            label="Nom de la ville (ex: Douala)"
            fullWidth
            variant="outlined"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCity()}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button onClick={() => setNewCityOpen(false)} color="inherit" sx={{ fontWeight: 700, borderRadius: '10px' }}>Annuler</Button>
          <Button onClick={handleAddCity} variant="contained" color="primary" disableElevation sx={{ fontWeight: 700, borderRadius: '10px', px: 3 }}>Ajouter la ville</Button>
        </DialogActions>
      </Dialog>

      {/* Edit City Dialog */}
      <Dialog open={editCityOpen} onClose={() => setEditCityOpen(false)} slotProps={{ paper: { sx: { borderRadius: '20px', width: '100%', maxWidth: 400 } } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Modifier la Ville</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Renommez la ville "{cityToEdit}". Cela mettra à jour tous les quartiers rattachés.
          </Typography>
          <TextField
            autoFocus
            label="Nouveau nom de la ville"
            fullWidth
            variant="outlined"
            value={newEditedCityName}
            onChange={(e) => setNewEditedCityName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEditCity()}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button onClick={() => setEditCityOpen(false)} color="inherit" sx={{ fontWeight: 700, borderRadius: '10px' }}>Annuler</Button>
          <Button onClick={handleEditCity} variant="contained" color="primary" disableElevation disabled={loadingEditCity} sx={{ fontWeight: 700, borderRadius: '10px', px: 3 }}>
            {loadingEditCity ? <CircularProgress size={24} color="inherit" /> : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete City Confirmation Dialog */}
      <Dialog open={!!cityToDelete} onClose={() => setCityToDelete(null)} slotProps={{ paper: { sx: { borderRadius: '20px', width: '100%', maxWidth: 400 } } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1, color: 'error.main' }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Êtes-vous sûr de vouloir supprimer la ville <strong>{cityToDelete}</strong> ?
          </Typography>
          <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
            Attention : Tous les quartiers associés à cette ville seront définitivement supprimés !
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 1 }}>
          <Button onClick={() => setCityToDelete(null)} color="inherit" sx={{ fontWeight: 700, borderRadius: '10px' }}>Annuler</Button>
          <Button onClick={handleConfirmDeleteCity} variant="contained" color="error" disableElevation disabled={loadingDeleteCity} sx={{ fontWeight: 700, borderRadius: '10px', px: 3 }}>
            {loadingDeleteCity ? <CircularProgress size={24} color="inherit" /> : 'Supprimer définitivement'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
