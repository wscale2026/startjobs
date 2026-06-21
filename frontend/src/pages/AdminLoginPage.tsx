import React, { useState } from 'react';
import { Box, Typography, TextField, Button, alpha, useTheme, InputAdornment, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { login } from '../store/slices/authSlice';
import { loginAdmin } from '../store/slices/adminSlice';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { useAppSelector } from '../store';

const floatingOrbVariant = {
  animate: {
    y: [0, -30, 0],
    rotateX: [0, 15, 0],
    rotateY: [0, -15, 0],
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" as const }
  }
};

export default function AdminLoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { site_name, logo } = useAppSelector((state: any) => state.siteSettings);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    dispatch(login({ username: email, password }))
      .unwrap()
      .then((user: any) => {
        setLoading(false);
        if (user.role === 'admin' || user.role === 'staff' || user.is_superuser || user.is_staff) {
          dispatch(loginAdmin({ id: user.id, name: user.username }));
          dispatch(showSnackbar({ message: 'Bienvenue dans l\'espace administrateur', severity: 'success' }));
          navigate('/admin');
        } else {
          setErrorMsg('Accès refusé. Vous n\'êtes pas administrateur.');
        }
      })
      .catch((err: any) => {
        setLoading(false);
        setErrorMsg('Identifiants incorrects. Veuillez réessayer.');
      });
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', position: 'relative', overflow: 'hidden' }}>
      {/* 3D Background Elements */}
      <Box component={motion.div} variants={floatingOrbVariant} animate="animate" sx={{ position: 'absolute', top: '10%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, filter: 'blur(80px)', opacity: 0.3, zIndex: 0 }} />
      <Box component={motion.div} variants={floatingOrbVariant} animate="animate" style={{ animationDelay: '-4s' }} sx={{ position: 'absolute', bottom: '10%', right: '15%', width: 250, height: 250, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`, filter: 'blur(70px)', opacity: 0.2, zIndex: 0 }} />

      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        sx={{
          width: '100%', maxWidth: 420, p: 4, borderRadius: '24px',
          bgcolor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.2)}`,
          zIndex: 1,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          {logo ? (
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
              <img src={logo} alt={site_name} style={{ height: 56, objectFit: 'contain' }} />
            </Box>
          ) : (
            <Box sx={{ width: 56, height: 56, mx: 'auto', mb: 2, borderRadius: '16px', background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}` }}>
              <Typography sx={{ color: 'white', fontWeight: 900, fontSize: '1.5rem' }}>{site_name.substring(0, 2).toUpperCase()}</Typography>
            </Box>
          )}
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Administration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Accès réservé au personnel autorisé
          </Typography>
        </Box>

        <form onSubmit={handleLogin}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Adresse Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email color="action" fontSize="small" /></InputAdornment> } }}
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Lock color="action" fontSize="small" /></InputAdornment>,
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
            {errorMsg && (
              <Typography color="error" variant="body2" sx={{ textAlign: 'center', fontWeight: 600 }}>
                {errorMsg}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !email.trim() || !password.trim()}
              sx={{
                mt: 2, py: 1.5, borderRadius: '12px', fontWeight: 700, fontSize: '1rem',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}` }
              }}
            >
              {loading ? 'Connexion...' : 'Accéder au Dashboard'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
