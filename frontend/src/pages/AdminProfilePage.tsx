import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Avatar, Grid, Paper, alpha, useTheme, InputAdornment, IconButton, Divider, Chip, CircularProgress } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { fetchCurrentUser } from '../store/slices/authSlice';
import api from '../utils/api';

export default function AdminProfilePage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.user);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.first_name || '');
      setLastName(currentUser.last_name || '');
      setEmail(currentUser.email || '');
      setUsername(currentUser.username || '');
    }
  }, [currentUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: any = {
        first_name: firstName,
        last_name: lastName,
        email: email,
      };
      if (newPassword) {
        payload.password = newPassword;
      }
      
      await api.patch('/users/me/', payload);
      dispatch(fetchCurrentUser()); // Refresh Redux state
      
      if (newPassword) {
        dispatch(showSnackbar({ message: 'Profil et mot de passe mis à jour avec succès', severity: 'success' }));
      } else {
        dispatch(showSnackbar({ message: 'Profil mis à jour avec succès', severity: 'success' }));
      }
      setNewPassword('');
    } catch (err) {
      dispatch(showSnackbar({ message: 'Erreur lors de la mise à jour', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const displayName = `${firstName} ${lastName}`.trim() || username || 'Admin';

  return (
    <Box sx={{ pb: 6, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 4 }}>
        Mon Profil Administrateur
      </Typography>

      <Grid container spacing={4}>
        {/* Colonne Photo */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} sx={{ p: 4, borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, textAlign: 'center', boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.05)}` }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <Avatar sx={{ width: 140, height: 140, bgcolor: theme.palette.primary.main, fontSize: '4rem', fontWeight: 800, boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}` }}>
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{displayName}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{email}</Typography>
            <Chip
              label={currentUser?.is_superuser ? 'Super Admin' : 'Modérateur'}
              color="primary"
              size="small"
              sx={{ fontWeight: 700, borderRadius: '8px' }}
            />
          </Paper>
        </Grid>

        {/* Colonne Formulaire */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.05)}` }}>

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" /> Informations Personnelles
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Prénom" variant="outlined" value={firstName} onChange={(e) => setFirstName(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Nom de famille" variant="outlined" value={lastName} onChange={(e) => setLastName(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nom d'utilisateur"
                  variant="outlined"
                  value={username}
                  disabled
                  helperText="Non modifiable"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth label="Adresse Email" variant="outlined" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" /> Sécurité
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Saisissez un nouveau mot de passe ci-dessous pour le modifier.
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nouveau Mot de passe (optionnel)"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Laissez vide pour ne pas changer"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleSave}
                disabled={loading}
                sx={{ borderRadius: '12px', fontWeight: 800, px: 4, py: 1.5, boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}` }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Sauvegarder les modifications'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
