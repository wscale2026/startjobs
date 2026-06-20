import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment,
  IconButton, Tab, Tabs, alpha, useTheme, Alert, AlertTitle,
  CircularProgress, Dialog, DialogContent, DialogActions
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, CheckCircleOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { login, logout } from '../store/slices/authSlice';
import { showSnackbar } from '../store/slices/snackbarSlice';
import api from '../utils/api';

export default function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { site_name, allow_registrations, maintenance_mode } = useAppSelector((state: any) => state.siteSettings);
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleResend = () => {
    setResending(true);
    api.post('resend-verification/', { identifier })
      .then((res) => {
        setResending(false);
        setResendSuccess(true);
        setShowDialog(true);
      })
      .catch((err) => {
        setResending(false);
        dispatch(showSnackbar({ message: err.response?.data?.detail || 'Erreur lors du renvoi', severity: 'error' }));
      });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    dispatch(login({ username: identifier, password }))
      .unwrap()
      .then((user: any) => {
        setLoading(false);
        if (user.role === 'admin' || user.role === 'staff') {
          dispatch(logout());
          dispatch(showSnackbar({ message: 'Veuillez utiliser la page de connexion administrateur.', severity: 'error' }));
          return;
        }

        if (user.role !== role) {
          dispatch(logout());
          const message = user.role === 'employer' 
            ? 'Vous possédez un compte Employeur. Veuillez sélectionner "Je suis Employeur".'
            : 'Vous possédez un compte Candidat. Veuillez sélectionner "Je suis Candidat".';
          dispatch(showSnackbar({ message, severity: 'error' }));
          return;
        }

        if (user.role === 'employer') {
          navigate('/employer/dashboard');
        } else {
          navigate('/candidate/dashboard');
        }
      })
      .catch((err: any) => {
        setLoading(false);
        const errorMsg = err || 'Identifiants incorrects';
        if (errorMsg.includes('Veuillez vérifier votre adresse email')) {
          setNeedsVerification(true);
        }
        dispatch(showSnackbar({ message: errorMsg, severity: 'error' }));
      });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {maintenance_mode && (
        <Alert severity="warning" sx={{ borderRadius: '12px', mb: -1 }}>
          <AlertTitle sx={{ fontWeight: 800 }}>Maintenance technique en cours</AlertTitle>
          La plateforme est temporairement inaccessible. Merci de votre patience.
        </Alert>
      )}
      
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.01em' }}>
          Bon retour parmi nous 👋
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Connectez-vous pour accéder à votre espace
        </Typography>
      </Box>

      {/* Role Selection Tabs */}
      <Tabs
        value={role}
        onChange={(_, newValue) => setRole(newValue)}
        variant="fullWidth"
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          borderRadius: 2,
          p: 0.5,
          minHeight: 44,
          '& .MuiTab-root': {
            borderRadius: 1.5,
            minHeight: 36,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.9rem',
          },
          '& .Mui-selected': {
            bgcolor: 'background.paper',
            color: 'primary.main',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 2px 8px rgba(0,0,0,0.5)'
              : '0 2px 8px rgba(0,0,0,0.1)',
          },
          '& .MuiTabs-indicator': { display: 'none' }
        }}
      >
        <Tab value="candidate" label="Je suis Candidat" disableRipple />
        <Tab value="employer" label="Je suis Employeur" disableRipple />
      </Tabs>

      <form onSubmit={handleLogin}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            label="Nom d'utilisateur ou Email"
            variant="outlined"
            placeholder="pseudo"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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

          <TextField
            fullWidth
            label="Mot de passe"
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

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography
              variant="body2"
              color="primary"
              onClick={() => navigate('/forgot-password')}
              sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              Mot de passe oublié ?
            </Typography>
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            className="pressable"
            disabled={loading}
            sx={{
              mt: 1,
              py: 1.5,
              borderRadius: 2.5,
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>

          {needsVerification && (
            <Box sx={{ mt: 1 }}>
              <Button
                variant={resendSuccess ? "outlined" : "contained"}
                color={resendSuccess ? "success" : "secondary"}
                size="large"
                fullWidth
                disabled={resending || resendSuccess}
                onClick={handleResend}
                sx={{
                  py: 1.5,
                  borderRadius: 2.5,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textTransform: 'none'
                }}
              >
                {resending ? <CircularProgress size={24} color="inherit" /> : resendSuccess ? 'Email envoyé !' : 'Renvoyer l\'email de vérification'}
              </Button>
            </Box>
          )}

          {allow_registrations && (
            <Box sx={{ textAlign: 'center', mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Nouveau sur {site_name} ?
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  onClick={() => navigate('/onboarding/jeune')}
                  sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  Créer un compte candidat
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ display: { xs: 'none', sm: 'block' } }}>•</Typography>
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  onClick={() => navigate('/onboarding/employeur')}
                  sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  Créer un compte employeur
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </form>

      {/* Success Dialog */}
      <Dialog 
        open={showDialog} 
        onClose={() => setShowDialog(false)}
        slotProps={{
          paper: { sx: { borderRadius: 3, p: 2, textAlign: 'center', maxWidth: 400 } }
        }}
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CheckCircleOutlined sx={{ fontSize: 64, color: 'success.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            E-mail envoyé avec succès !
          </Typography>
          <Typography color="text.secondary">
            Veuillez consulter votre boîte de réception (et vos spams) pour valider votre compte.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => setShowDialog(false)}
            sx={{ borderRadius: 2, px: 4 }}
          >
            J'ai compris
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
