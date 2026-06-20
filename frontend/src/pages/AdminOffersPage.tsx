import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, IconButton, useTheme, TextField, InputAdornment, alpha, Avatar, 
  Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, 
  DialogContentText, TablePagination, Tabs, Tab, CircularProgress, Stack 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublicIcon from '@mui/icons-material/Public';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import WorkIcon from '@mui/icons-material/Work';
import EditIcon from '@mui/icons-material/Edit';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinkIcon from '@mui/icons-material/Link';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PlaceIcon from '@mui/icons-material/Place';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import api from '../utils/api';
import AdCard from '../components/AdCard';

export default function AdminOffersPage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [search, setSearch] = useState('');
  const [offers, setOffers] = useState<any[]>([]);
  
  // Tabs
  const [tabIndex, setTabIndex] = useState(0);

  // States
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [previewAd, setPreviewAd] = useState<any>(null);
  
  // Suppression Vercel-style
  const [offerToDelete, setOfferToDelete] = useState<{id: string, titre: string, is_ad: boolean} | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal PUB
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [isEditAd, setIsEditAd] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [isSubmittingAd, setIsSubmittingAd] = useState(false);
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    ad_url: '',
    ad_image_url: '',
    budget: 'Publicité'
  });

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchOffers = () => {
    api.get('offers/')
      .then(res => {
        setOffers(res.data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Filtering
  const jobOffers = offers.filter(o => !o.is_ad);
  const ads = offers.filter(o => o.is_ad);

  const currentList = tabIndex === 0 ? jobOffers : ads;
  const filteredList = currentList.filter(o => {
    const titleMatch = o.title?.toLowerCase().includes(search.toLowerCase());
    const empMatch = o.employer?.company_name?.toLowerCase().includes(search.toLowerCase());
    return titleMatch || empMatch;
  });

  const paginatedList = filteredList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleOpenDelete = (id: string, titre: string, is_ad: boolean) => {
    setOfferToDelete({ id, titre, is_ad });
    setDeleteConfirmText('');
  };

  const confirmDelete = () => {
    if (!offerToDelete) return;
    setIsDeleting(true);
    api.delete(`offers/${offerToDelete.id}/`)
      .then(() => {
        setOffers(offers.filter(o => String(o.id) !== String(offerToDelete.id)));
        dispatch(showSnackbar({ 
          message: `${offerToDelete.is_ad ? 'Publicité' : 'Offre'} supprimée avec succès.`, 
          severity: 'success' 
        }));
        setOfferToDelete(null);
        setSelectedOffer(null);
        setPreviewAd(null);
      })
      .catch(err => {
        dispatch(showSnackbar({ message: 'Erreur lors de la suppression', severity: 'error' }));
      })
      .finally(() => setIsDeleting(false));
  };

  const handleOpenCreateAd = () => {
    setIsEditAd(false);
    setEditingAdId(null);
    setAdForm({ title: '', description: '', ad_url: '', ad_image_url: '', budget: 'Publicité' });
    setAdModalOpen(true);
  };

  const handleOpenEditAd = (ad: any) => {
    setIsEditAd(true);
    setEditingAdId(ad.id);
    setAdForm({
      title: ad.title || '',
      description: ad.description || '',
      ad_url: ad.ad_url || '',
      ad_image_url: ad.ad_image_url || '',
      budget: 'Publicité'
    });
    setAdModalOpen(true);
  };

  const handleSubmitAd = () => {
    setIsSubmittingAd(true);
    const payload = {
      ...adForm,
      is_ad: true,
      description: adForm.description || 'Contenu promotionnel',
    };

    const request = isEditAd 
      ? api.patch(`offers/${editingAdId}/`, payload)
      : api.post('offers/', payload);

    request.then(res => {
      dispatch(showSnackbar({ message: `Publicité ${isEditAd ? 'modifiée' : 'créée'} avec succès !`, severity: 'success' }));
      setAdModalOpen(false);
      fetchOffers();
    })
    .catch(err => {
      dispatch(showSnackbar({ message: 'Erreur lors de l\'enregistrement', severity: 'error' }));
    })
    .finally(() => setIsSubmittingAd(false));
  };

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Offres d'emploi & Publicités
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez les annonces publiées par les employeurs et vos annonces sponsorisées
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: { xs: '100%', md: 280 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>, sx: { borderRadius: '12px', bgcolor: 'background.paper', boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}` } } }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateAd}
            sx={{ borderRadius: '12px', fontWeight: 700, px: 3 }}
          >
            Créer une Pub
          </Button>
        </Box>
      </Box>

      {/* TABS */}
      <Tabs 
        value={tabIndex} 
        onChange={(_, v) => { setTabIndex(v); setPage(0); }} 
        sx={{ mb: 3, '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' } }}
      >
        <Tab label={`Offres d'emploi (${jobOffers.length})`} sx={{ fontWeight: 700, textTransform: 'none', fontSize: '1rem' }} />
        <Tab label={`Publicités (${ads.length})`} sx={{ fontWeight: 700, textTransform: 'none', fontSize: '1rem' }} />
      </Tabs>

      <Paper sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.05)}`, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.5) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>{tabIndex === 0 ? "Annonce" : "Publicité"}</TableCell>
              {tabIndex === 0 && <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Employeur</TableCell>}
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>{tabIndex === 0 ? "Secteur / Quartier" : "URL Cible"}</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Statut</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              {paginatedList.map((row) => (
                <TableRow 
                  key={row.id} 
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {tabIndex === 1 && (
                        <Avatar variant="rounded" src={row.ad_image_url} sx={{ width: 48, height: 48, bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main' }}>
                          <AddPhotoAlternateIcon />
                        </Avatar>
                      )}
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>{row.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(row.created_at).toLocaleDateString('fr-FR')}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  {tabIndex === 0 && (
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, fontWeight: 700, fontSize: '0.9rem' }}>
                          {row.employer?.company_name?.[0] || 'E'}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600 }}>{row.employer?.company_name || 'Inconnu'}</Typography>
                      </Box>
                    </TableCell>
                  )}

                  <TableCell>
                    {tabIndex === 0 ? (
                      <Box>
                        <Chip label={row.sector?.name || 'Général'} size="small" variant="outlined" sx={{ mr: 1, mb: 0.5, fontWeight: 600 }} />
                        <Chip label={row.neighborhood?.name || 'Localisation inconnue'} size="small" variant="outlined" sx={{ mb: 0.5, fontWeight: 600 }} />
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LinkIcon fontSize="small" />
                        <a href={row.ad_url} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                          {row.ad_url?.replace(/^https?:\/\//, '').substring(0, 30)}...
                        </a>
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Chip label={row.is_active ? "En Ligne" : "Fermée"} size="small" icon={<PublicIcon />} color={row.is_active ? "success" : "default"} variant="outlined" sx={{ fontWeight: 700, borderRadius: '8px' }} />
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      {tabIndex === 1 && (
                        <Tooltip title="Modifier la PUB">
                          <IconButton size="small" color="primary" onClick={() => handleOpenEditAd(row)} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={tabIndex === 0 ? "Voir les détails" : "Aperçu de la PUB"}>
                        <IconButton onClick={() => tabIndex === 0 ? setSelectedOffer(row) : setPreviewAd(row)} size="small" color="info" sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) } }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(row.id, row.title, row.is_ad)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            {filteredList.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>Aucun élément trouvé.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredList.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        labelRowsPerPage="Éléments par page:"
      />
      </Paper>

      {/* Dialog Détails Offre (Améliorée) */}
      <Dialog 
        open={!!selectedOffer} 
        onClose={() => setSelectedOffer(null)}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: '24px', overflow: 'hidden' } }}
      >
        {selectedOffer && (
          <>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>{selectedOffer.title}</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip icon={<BusinessIcon fontSize="small" />} label={selectedOffer.employer?.company_name || 'Inconnu'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, border: 'none' }} />
                  {selectedOffer.is_urgent && <Chip label="Urgent" size="small" color="error" sx={{ fontWeight: 700 }} />}
                </Box>
              </Box>
              <IconButton onClick={() => setSelectedOffer(null)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <DialogContent sx={{ p: 4, bgcolor: 'background.default' }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WorkIcon color="primary" /> Description de l'offre
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'text.secondary' }}>
                      {selectedOffer.description}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={2}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 2 }}>DÉTAILS CLÉS</Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main' }}><LocalOfferIcon fontSize="small" /></Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Secteur</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedOffer.sector?.name || 'Général'}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}><PlaceIcon fontSize="small" /></Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Quartier</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedOffer.neighborhood?.name || 'Non spécifié'}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}><CalendarTodayIcon fontSize="small" /></Avatar>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Date de début</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedOffer.start_date || 'Dès que possible'}</Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.success.main, 0.02) }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 2 }}>CONTACTS</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <WhatsAppIcon color="success" fontSize="small" />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedOffer.contact_whatsapp || 'Non renseigné'}</Typography>
                      </Box>
                    </Paper>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button 
                onClick={() => handleOpenDelete(selectedOffer.id, selectedOffer.title, false)} 
                variant="outlined" 
                color="error" 
                startIcon={<DeleteIcon />}
                sx={{ borderRadius: '12px', fontWeight: 700 }}
              >
                Supprimer l'offre
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Aperçu de la PUB */}
      <Dialog 
        open={!!previewAd} 
        onClose={() => setPreviewAd(null)}
        maxWidth="xs"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: '24px', bgcolor: 'transparent', boxShadow: 'none' } }}
      >
        {previewAd && (
          <Box sx={{ position: 'relative' }}>
            <IconButton 
              onClick={() => setPreviewAd(null)} 
              sx={{ position: 'absolute', right: -12, top: -12, bgcolor: 'background.paper', boxShadow: 3, zIndex: 10, '&:hover': { bgcolor: 'background.default' } }}
            >
              <CloseIcon />
            </IconButton>
            <Box sx={{ height: 400 }}>
              <AdCard ad={previewAd} />
            </Box>
          </Box>
        )}
      </Dialog>

      {/* Dialog de Suppression Vercel-Style */}
      <Dialog open={!!offerToDelete} onClose={() => setOfferToDelete(null)} maxWidth="xs" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: '24px' } }}>
        <DialogTitle sx={{ fontWeight: 900, color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon /> Confirmation Requise
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3, fontWeight: 500 }}>
            Êtes-vous sûr de vouloir supprimer <b>{offerToDelete?.titre}</b> ? Cette action est irréversible.
          </DialogContentText>
          <Box sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), border: `1px dashed ${theme.palette.error.main}`, borderRadius: '12px', mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.dark' }}>
              Veuillez taper <strong>SUPPRIMER</strong> pour confirmer.
            </Typography>
          </Box>
          <TextField
            fullWidth
            size="small"
            placeholder="SUPPRIMER"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOfferToDelete(null)} variant="outlined" color="inherit" sx={{ borderRadius: '12px', fontWeight: 700 }} disabled={isDeleting}>
            Annuler
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error" 
            disableElevation 
            disabled={deleteConfirmText !== 'SUPPRIMER' || isDeleting}
            sx={{ borderRadius: '12px', fontWeight: 700 }}
          >
            {isDeleting ? <CircularProgress size={24} color="inherit" /> : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Création / Modification de Publicité */}
      <Dialog open={adModalOpen} onClose={() => setAdModalOpen(false)} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isEditAd ? "Modifier la Publicité" : "Nouvelle Publicité"}
          <IconButton onClick={() => setAdModalOpen(false)} size="small" disabled={isSubmittingAd}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderBottom: 'none' }}>
          <DialogContentText sx={{ mb: 3 }}>
            {isEditAd ? "Ajustez les informations de la publicité existante." : "Créez une annonce publicitaire qui apparaîtra dans les résultats de recherche des candidats."}
          </DialogContentText>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Titre de la publicité"
                placeholder="Ex: Formation Développeur Web"
                value={adForm.title}
                onChange={e => setAdForm({...adForm, title: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description courte"
                placeholder="Devenez développeur en 6 mois..."
                value={adForm.description}
                onChange={e => setAdForm({...adForm, description: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="URL de redirection"
                placeholder="https://mon-site.com"
                value={adForm.ad_url}
                onChange={e => setAdForm({...adForm, ad_url: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PublicIcon fontSize="small" /></InputAdornment> } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="URL de l'image (Bannière)"
                placeholder="https://..."
                value={adForm.ad_image_url}
                onChange={e => setAdForm({...adForm, ad_image_url: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><AddPhotoAlternateIcon fontSize="small" /></InputAdornment> } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setAdModalOpen(false)} variant="outlined" color="inherit" sx={{ borderRadius: '12px', fontWeight: 700 }} disabled={isSubmittingAd}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmitAd} 
            variant="contained" 
            color="primary"
            disabled={!adForm.title || !adForm.ad_url || isSubmittingAd}
            sx={{ borderRadius: '12px', fontWeight: 700, minWidth: 140 }}
          >
            {isSubmittingAd ? <CircularProgress size={24} color="inherit" /> : (isEditAd ? "Enregistrer" : "Publier")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
