import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, useTheme, Button, TextField, ListItem, ListItemText, IconButton, Chip, alpha, CircularProgress, Tabs, Tab, Skeleton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import ExtensionIcon from '@mui/icons-material/Extension';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import useSWR from 'swr';
import api, { fetcher } from '../utils/api';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

interface Sector { id: number; name: string; }
interface Skill { id: number; name: string; }

export default function AdminSkillsPage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const { data: sectorsData, error: sectorsError, mutate: mutateSectors, isLoading: loadingSectors } = useSWR('/sectors/', fetcher);
  const { data: skillsData, error: skillsError, mutate: mutateSkills, isLoading: loadingSkills } = useSWR('/skills/', fetcher);

  const sectors = sectorsData || [];
  const skills = skillsData || [];
  const loading = loadingSectors || loadingSkills;

  const [mobileTab, setMobileTab] = useState(0);

  const [newSector, setNewSector] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const [loadingAddSector, setLoadingAddSector] = useState(false);
  const [loadingAddSkill, setLoadingAddSkill] = useState(false);
  const [deletingSectorId, setDeletingSectorId] = useState<number | null>(null);
  const [deletingSkillId, setDeletingSkillId] = useState<number | null>(null);
  
  const [searchSector, setSearchSector] = useState('');
  const [searchSkill, setSearchSkill] = useState('');
  
  const [mobileAddOpen, setMobileAddOpen] = useState(false);

  const filteredSectors = sectors.filter((s: Sector) => 
    searchSector ? s.name.toLowerCase().includes(searchSector.toLowerCase()) : true
  );
  
  const filteredSkills = skills.filter((s: Skill) => 
    searchSkill ? s.name.toLowerCase().includes(searchSkill.toLowerCase()) : true
  );

  const handleAddSector = async () => {
    if (!newSector.trim()) return;
    setLoadingAddSector(true);
    try {
      const res = await api.post('/sectors/', { name: newSector.trim() });
      mutateSectors([...sectors, res.data], false);
      setNewSector('');
      dispatch(showSnackbar({ message: 'Secteur ajouté avec succès', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Erreur: Ce secteur existe peut-être déjà.', severity: 'error' }));
    } finally {
      setLoadingAddSector(false);
      setMobileAddOpen(false);
    }
  };

  const handleDeleteSector = async (sector: Sector) => {
    setDeletingSectorId(sector.id);
    try {
      await api.delete(`/sectors/${sector.id}/`);
      mutateSectors(sectors.filter((s: Sector) => s.id !== sector.id), false);
      dispatch(showSnackbar({ message: 'Secteur supprimé', severity: 'info' }));
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la suppression', severity: 'error' }));
    } finally {
      setDeletingSectorId(null);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    setLoadingAddSkill(true);
    try {
      const res = await api.post('/skills/', { name: newSkill.trim() });
      mutateSkills([...skills, res.data], false);
      setNewSkill('');
      dispatch(showSnackbar({ message: 'Compétence ajoutée', severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Erreur: Cette compétence existe peut-être déjà.', severity: 'error' }));
    } finally {
      setLoadingAddSkill(false);
      setMobileAddOpen(false);
    }
  };

  const handleDeleteSkill = async (skill: Skill) => {
    setDeletingSkillId(skill.id);
    try {
      await api.delete(`/skills/${skill.id}/`);
      mutateSkills(skills.filter((s: Skill) => s.id !== skill.id), false);
      dispatch(showSnackbar({ message: 'Compétence supprimée', severity: 'info' }));
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la suppression', severity: 'error' }));
    } finally {
      setDeletingSkillId(null);
    }
  };



  return (
    <Box sx={{ pb: 6, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1, fontSize: { xs: '1.75rem', md: '2.125rem' } }}>
          Domaines & Secteurs
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800 }}>
          Gérez facilement la nomenclature de votre plateforme. Les secteurs et les compétences sont utilisés par les candidats et les employeurs pour affiner leurs recherches.
        </Typography>
      </Box>

      {/* Tabs for Mobile Navigation */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
        <Paper sx={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
          <Tabs 
            value={mobileTab} 
            onChange={(_, nv) => setMobileTab(nv)} 
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', py: 2, fontSize: '0.95rem' }
            }}
          >
            <Tab icon={<CategoryIcon sx={{ mb: 0.5 }} />} label="Secteurs" />
            <Tab icon={<ExtensionIcon sx={{ mb: 0.5 }} />} label="Compétences" />
          </Tabs>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        
        {/* Colonne Gauche : Secteurs */}
        <Paper 
          component={motion.div} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          sx={{ 
            display: { xs: mobileTab === 0 ? 'flex' : 'none', md: 'flex' },
            flex: 1, 
            flexDirection: 'column', 
            height: { xs: 'calc(100vh - 280px)', md: 680 }, 
            minHeight: 500,
            borderRadius: '24px', 
            border: `1px solid ${theme.palette.divider}`, 
            boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.04)}`, 
            overflow: 'hidden',
            bgcolor: 'background.paper',
            position: 'relative'
          }}
        >
          {/* Header Secteurs */}
          <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, color: 'primary.main' }}>
              <CategoryIcon /> Secteurs d'activité
            </Typography>
            <Chip label={sectors.length} color="primary" size="small" sx={{ fontWeight: 800, borderRadius: '8px' }} />
          </Box>

          {/* Formulaire Secteurs */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, p: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField 
                fullWidth 
                placeholder="Ajouter un nouveau secteur..." 
                value={newSector} 
                onChange={(e) => setNewSector(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleAddSector()} 
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '12px',
                    bgcolor: 'background.paper',
                    transition: 'all 0.2s',
                    '&.Mui-focused': { boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}` }
                  } 
                }} 
              />
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleAddSector} 
                disabled={loadingAddSector}
                sx={{ borderRadius: '12px', px: 3, minWidth: 120, fontWeight: 700, boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}` }}
              >
                {loadingAddSector ? <CircularProgress size={24} color="inherit" /> : 'Ajouter'}
              </Button>
            </Box>
          </Box>

          {/* Liste Secteurs */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: alpha(theme.palette.background.default, 0.2) }}>
            <Box sx={{ mb: 2 }}>
              <TextField 
                fullWidth 
                size="small"
                placeholder="Rechercher un secteur..." 
                value={searchSector}
                onChange={(e) => setSearchSector(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '10px',
                    bgcolor: 'background.paper',
                  } 
                }} 
              />
            </Box>
            {loadingSectors ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: '12px' }} />
                ))}
              </Box>
            ) : (
              <>
                <AnimatePresence>
                  {filteredSectors.map((sector: Sector) => (
                    <motion.div key={sector.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <ListItem
                        sx={{ 
                          borderRadius: '12px', 
                          mb: 1, 
                          bgcolor: 'background.paper',
                          border: `1px solid ${theme.palette.divider}`,
                          boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.02)}`,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <ListItemText primary={sector.name} slotProps={{ primary: { sx: { fontWeight: 600, fontSize: '0.95rem' } } }} />
                        <IconButton 
                          edge="end" 
                          onClick={() => handleDeleteSector(sector)} 
                          disabled={deletingSectorId === sector.id}
                          sx={{ 
                            color: 'text.secondary', 
                            transition: 'all 0.2s',
                            '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) } 
                          }}
                        >
                          {deletingSectorId === sector.id ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                        </IconButton>
                      </ListItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredSectors.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <CategoryIcon sx={{ fontSize: 48, opacity: 0.2 }} />
                    <Typography sx={{ fontWeight: 600 }}>Aucun secteur d'activité n'est configuré.</Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Paper>

        {/* Colonne Droite : Compétences */}
        <Paper 
          component={motion.div} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          sx={{ 
            display: { xs: mobileTab === 1 ? 'flex' : 'none', md: 'flex' },
            flex: 1.2, 
            flexDirection: 'column', 
            height: { xs: 'calc(100vh - 280px)', md: 680 }, 
            minHeight: 500,
            borderRadius: '24px', 
            border: `1px solid ${theme.palette.divider}`, 
            boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.04)}`, 
            overflow: 'hidden',
            bgcolor: 'background.paper'
          }}
        >
          {/* Header Compétences */}
          <Box sx={{ p: 3, bgcolor: alpha(theme.palette.secondary.main, 0.03), borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5, color: 'secondary.main' }}>
              <ExtensionIcon /> Dictionnaire des Compétences
            </Typography>
            <Chip label={skills.length} color="secondary" size="small" sx={{ fontWeight: 800, borderRadius: '8px' }} />
          </Box>

          {/* Formulaire Compétences */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, p: 3, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
            <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField 
                fullWidth 
                placeholder="Ex: React.js, Management, Comptabilité..." 
                value={newSkill} 
                onChange={(e) => setNewSkill(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()} 
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
                onClick={handleAddSkill} 
                disabled={loadingAddSkill}
                startIcon={loadingAddSkill ? <CircularProgress size={20} color="inherit" /> : <AddIcon />} 
                sx={{ borderRadius: '12px', px: 3, minWidth: 140, fontWeight: 700, boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.25)}` }}
              >
                Ajouter
              </Button>
            </Box>
          </Box>

          {/* Liste Compétences (Chips) */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 4, bgcolor: alpha(theme.palette.background.default, 0.2) }}>
            <Box sx={{ mb: 3 }}>
              <TextField 
                fullWidth 
                size="small"
                placeholder="Rechercher une compétence..." 
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                sx={{ 
                  '& .MuiOutlinedInput-root': { 
                    borderRadius: '10px',
                    bgcolor: 'background.paper',
                  } 
                }} 
              />
            </Box>
            {loadingSkills ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <Skeleton key={i} variant="rounded" width={100 + Math.random() * 50} height={40} sx={{ borderRadius: '10px' }} />
                ))}
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  <AnimatePresence>
                    {filteredSkills.map((skill: Skill) => (
                      <motion.div key={skill.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                        <Chip
                          label={skill.name}
                          onDelete={() => handleDeleteSkill(skill)}
                          deleteIcon={deletingSkillId === skill.id ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.9rem', 
                            borderRadius: '10px', 
                            py: 2.5,
                            px: 0.5,
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
                {filteredSkills.length === 0 && (
                  <Box sx={{ p: 4, mt: 4, textAlign: 'center', color: 'text.secondary', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <ExtensionIcon sx={{ fontSize: 48, opacity: 0.2 }} />
                    <Typography sx={{ fontWeight: 600 }}>Aucune compétence n'est enregistrée pour l'instant.</Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Paper>

      </Box>

      {/* FAB Mobile */}
      <Fab 
        color={mobileTab === 0 ? "primary" : "secondary"} 
        sx={{ position: 'fixed', bottom: 80, right: 16, display: { xs: 'flex', md: 'none' }, zIndex: 1100 }}
        onClick={() => setMobileAddOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Mobile Add Dialog */}
      <Dialog open={mobileAddOpen} onClose={() => setMobileAddOpen(false)} fullWidth maxWidth="xs" sx={{ '& .MuiDialog-paper': { borderRadius: '24px', m: 2 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {mobileTab === 0 ? 'Ajouter un secteur' : 'Ajouter une compétence'}
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <TextField 
            autoFocus
            fullWidth 
            placeholder={mobileTab === 0 ? "Nom du secteur..." : "Nom de la compétence..."} 
            value={mobileTab === 0 ? newSector : newSkill} 
            onChange={(e) => mobileTab === 0 ? setNewSector(e.target.value) : setNewSkill(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && (mobileTab === 0 ? handleAddSector() : handleAddSkill())} 
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} 
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setMobileAddOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>Annuler</Button>
          <Button 
            variant="contained" 
            color={mobileTab === 0 ? "primary" : "secondary"} 
            onClick={mobileTab === 0 ? handleAddSector : handleAddSkill}
            disabled={mobileTab === 0 ? loadingAddSector : loadingAddSkill}
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            {(mobileTab === 0 ? loadingAddSector : loadingAddSkill) ? <CircularProgress size={20} color="inherit" /> : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
