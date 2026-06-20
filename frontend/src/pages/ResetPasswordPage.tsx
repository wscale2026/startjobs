import React, { useState } from 'react';
import { Box, Typography, Button, TextField, InputAdornment, IconButton, alpha, useTheme } from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import api from '../utils/api';

export default function ResetPasswordPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { uid, token } = useParams<{ uid: string; token: string }>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      dispatch(showSnackbar({ message: 'Les mots de passe ne correspondent pas.', severity: 'error' }));
      return;
    }
    if (password.length < 8) {
      dispatch(showSnackbar({ message: 'Le mot de passe doit contenir au moins 8 caractères.', severity: 'warning' }));
      return;
    }

    setLoading(true);
    try {
      await api.post(`/password_reset/${uid}/${token}/`, { password });
      dispatch(showSnackbar({ message: 'Mot de passe réinitialisé avec succès ! Vous pouvez vous connecter.', severity: 'success' }));
      navigate('/login');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Le lien est invalide ou a expiré.';
      dispatch(showSnackbar({ message: msg, severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.01em' }}>
          Nouveau mot de passe 🔐
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Veuillez entrer votre nouveau mot de passe.
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            label="Nouveau mot de passe"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          <TextField
            fullWidth
            label="Confirmez le mot de passe"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            error={confirmPassword.length > 0 && password !== confirmPassword}
            helperText={confirmPassword.length > 0 && password !== confirmPassword ? "Ne correspond pas" : ""}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" fontSize="small" />
                  </InputAdornment>
                )
              }
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || !password || !confirmPassword || password !== confirmPassword}
            sx={{
              mt: 1,
              py: 1.5,
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
