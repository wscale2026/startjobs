import React, { useState } from 'react';
import { Box, Typography, Button, TextField, InputAdornment, alpha, useTheme } from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import api from '../utils/api';

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.post('/password_reset/', { email });
      setSuccess(true);
      dispatch(showSnackbar({ message: 'Un lien de réinitialisation a été envoyé si cette adresse existe.', severity: 'success' }));
    } catch (error) {
      dispatch(showSnackbar({ message: 'Erreur lors de la demande. Veuillez réessayer plus tard.', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.01em' }}>
          Mot de passe oublié ? 🔒
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Entrez votre adresse email pour recevoir un lien de réinitialisation.
        </Typography>
      </Box>

      {success ? (
        <Box sx={{ textAlign: 'center', p: 3, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main', mb: 2 }}>
            Email envoyé !
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vérifiez votre boîte de réception (et vos spams) pour réinitialiser votre mot de passe.
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate('/login')}
            sx={{ mt: 3, borderRadius: 2, fontWeight: 700 }}
          >
            Retour à la connexion
          </Button>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Adresse Email"
              type="email"
              variant="outlined"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || !email}
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: 2.5,
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
            </Button>

            <Button
              variant="text"
              color="inherit"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/login')}
              sx={{ mt: 1, fontWeight: 600, color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}
            >
              Retour à la connexion
            </Button>
          </Box>
        </form>
      )}
    </Box>
  );
}
