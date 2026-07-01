import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, useTheme, TextField, Grid, Switch, Divider, Button, alpha, CircularProgress, Chip, IconButton, Avatar } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import PublicIcon from '@mui/icons-material/Public';
import SaveIcon from '@mui/icons-material/Save';
import SyncIcon from '@mui/icons-material/Sync';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { updateSettingsLocally } from '../store/slices/siteSettingsSlice';
import api from '../utils/api';

interface SiteSettings {
  site_name: string;
  contact_email: string;
  maintenance_mode: boolean;
  allow_registrations: boolean;
  require_email_verification: boolean;
  notify_admins_on_registration: boolean;
  notify_admins_on_employer_registration: boolean;
  suspend_employer_features: boolean;
  show_empty_offers_countdown: boolean;
  seo_title: string;
  seo_description: string;
  logo: string | null;
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: 'StartJobs',
  contact_email: 'support@startjobs.cm',
  maintenance_mode: false,
  allow_registrations: true,
  require_email_verification: true,
  notify_admins_on_registration: true,
  notify_admins_on_employer_registration: true,
  suspend_employer_features: false,
  show_empty_offers_countdown: true,
  seo_title: 'StartJobs - La plateforme des emplois pour jeunes',
  seo_description: 'Trouvez rapidement des petits boulots et des offres de stage au Cameroun.',
  logo: null,
};

export default function AdminSettingsPage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    api.get('/admin/settings/')
      .then(res => {
        setSettings(res.data);
        setLogoPreview(res.data.logo || null);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        dispatch(showSnackbar({ message: 'Paramètres chargés localement (API indisponible).', severity: 'warning' }));
      });
  }, [dispatch]);

  const handleChange = (key: keyof SiteSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setDirty(true);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('site_name', settings.site_name);
      formData.append('contact_email', settings.contact_email);
      formData.append('maintenance_mode', settings.maintenance_mode.toString());
      formData.append('allow_registrations', String(settings.allow_registrations));
      formData.append('require_email_verification', String(settings.require_email_verification));
      formData.append('notify_admins_on_registration', String(settings.notify_admins_on_registration));
      formData.append('notify_admins_on_employer_registration', String(settings.notify_admins_on_employer_registration));
      formData.append('suspend_employer_features', String(settings.suspend_employer_features));
      formData.append('show_empty_offers_countdown', String(settings.show_empty_offers_countdown));
      formData.append('seo_title', settings.seo_title);
      formData.append('seo_description', settings.seo_description);

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await api.put('/admin/settings/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newLogoUrl = res.data.logo || settings.logo;
      setSettings(prev => ({ ...prev, logo: newLogoUrl }));
      setLogoPreview(newLogoUrl);
      
      // Update global redux store so the UI updates immediately everywhere
      dispatch(updateSettingsLocally({ 
        site_name: settings.site_name, 
        logo: newLogoUrl,
        maintenance_mode: settings.maintenance_mode,
        allow_registrations: settings.allow_registrations
      }));

      dispatch(showSnackbar({ message: 'Configuration sauvegardée avec succès ✓', severity: 'success' }));
      setDirty(false);
      setLogoFile(null);
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de la sauvegarde.', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 2 }}>
        <CircularProgress size={32} />
        <Typography color="text.secondary" sx={{ fontWeight: 600 }}>Chargement des paramètres...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Configuration Globale
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez l'identité visuelle et les paramètres essentiels de la plateforme
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {dirty && <Chip label="Modifications non sauvegardées" color="warning" size="small" sx={{ fontWeight: 700 }} />}
          <Button
            variant="contained"
            size="large"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || !dirty}
            sx={{ borderRadius: '12px', fontWeight: 800, boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}` }}
          >
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Section Identité & Logo */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, ml: 2, color: 'text.secondary', textTransform: 'uppercase' }}>
            Identité Visuelle & Contact
          </Typography>
          <Paper component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', overflow: 'hidden', p: 2 }}>
            <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
              
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`, 
                  borderRadius: '16px', p: 3, height: '100%', minHeight: 200,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.05) }
                }}>
                  {logoPreview ? (
                    <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <img src={logoPreview} alt="Logo de la plateforme" style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }} />
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => { setLogoPreview(settings.logo); setLogoFile(null); setDirty(true); }}
                        sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'background.paper', boxShadow: 2, '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <CloudUploadIcon sx={{ fontSize: 48, color: alpha(theme.palette.primary.main, 0.5), mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Aucun logo configuré</Typography>
                    </Box>
                  )}
                  
                  <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
                  <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()} sx={{ mt: logoPreview ? 2 : 0, borderRadius: '8px', fontWeight: 600 }}>
                    {logoPreview ? 'Changer de Logo' : 'Uploader un Logo'}
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth label="Nom de la Plateforme" value={settings.site_name}
                      onChange={handleChange('site_name')} variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth label="Email de Contact Support" value={settings.contact_email}
                      onChange={handleChange('contact_email')} variant="outlined" type="email"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Section Sécurité & Accès */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, ml: 2, color: 'text.secondary', textTransform: 'uppercase' }}>
            Paramètres Système & Accès
          </Typography>
          <Paper component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {/* Maintenance */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: settings.maintenance_mode ? alpha(theme.palette.error.main, 0.05) : 'transparent', transition: 'all 0.3s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', width: 36, height: 36 }}>
                    <WarningAmberIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: settings.maintenance_mode ? 'error.main' : 'text.primary' }}>Mode Maintenance</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Désactive l'accès public.</Typography>
                  </Box>
                </Box>
                <Switch checked={settings.maintenance_mode} onChange={handleChange('maintenance_mode')} color="error" />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Ouverture des Inscriptions</Typography>
                </Box>
                <Switch checked={settings.allow_registrations} onChange={handleChange('allow_registrations')} color="success" />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Vérification Email Obligatoire</Typography>
                </Box>
                <Switch checked={settings.require_email_verification} onChange={handleChange('require_email_verification')} color="primary" />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Notifier les Admins (Candidats)</Typography>
                </Box>
                <Switch checked={settings.notify_admins_on_registration} onChange={handleChange('notify_admins_on_registration')} color="primary" />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Notifier les Admins (Employeurs)</Typography>
                </Box>
                <Switch checked={settings.notify_admins_on_employer_registration} onChange={handleChange('notify_admins_on_employer_registration')} color="secondary" />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: settings.suspend_employer_features ? alpha(theme.palette.error.main, 0.05) : 'transparent' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, color: settings.suspend_employer_features ? 'error.main' : 'text.primary' }}>Suspendre les fonctionnalités employeur</Typography>
                </Box>
                <Switch checked={settings.suspend_employer_features} onChange={handleChange('suspend_employer_features')} color="error" />
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Afficher Compte à Rebours (Offres Vides)</Typography>
                </Box>
                <Switch checked={settings.show_empty_offers_countdown} onChange={handleChange('show_empty_offers_countdown')} color="secondary" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Section SEO */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, ml: 2, color: 'text.secondary', textTransform: 'uppercase' }}>
            Référencement Naturel (SEO)
          </Typography>
          <Paper component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} sx={{ borderRadius: '16px', border: `1px solid ${theme.palette.divider}`, boxShadow: '0 2px 10px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth label="Balise Title Globale" value={settings.seo_title}
                onChange={handleChange('seo_title')} variant="standard"
                slotProps={{ input: { disableUnderline: true, sx: { fontWeight: 600 } } }}
                sx={{ mb: 2 }}
              />
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth multiline rows={3} label="Meta Description Globale" value={settings.seo_description}
                onChange={handleChange('seo_description')} variant="standard"
                slotProps={{ input: { disableUnderline: true, sx: { color: 'text.secondary' } } }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
