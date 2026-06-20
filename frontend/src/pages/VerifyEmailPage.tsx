import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, useTheme, Fade } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAppSelector } from '../store';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

export default function VerifyEmailPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification de votre compte en cours...');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResend = () => {
    if (!uid) return;
    setResending(true);
    api.post('resend-verification/', { uid })
      .then((res) => {
        setResending(false);
        setResendSuccess(true);
        setMessage(res.data.detail || 'Un nouveau lien a été envoyé à votre adresse e-mail.');
      })
      .catch((err) => {
        setResending(false);
        setMessage(err.response?.data?.detail || 'Erreur lors du renvoi de l\'e-mail.');
      });
  };

  useEffect(() => {
    if (!uid || !token) {
      setStatus('error');
      setMessage('Lien de vérification invalide ou incomplet.');
      return;
    }

    api.post(`verify-email/${uid}/${token}/`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.detail || 'Votre e-mail a été vérifié avec succès.');
      })
      .catch((err) => {
        setStatus('error');
        if (!err.response) {
          // Network/CORS error — backend unreachable from this device
          setMessage('Impossible de joindre le serveur. Assurez-vous d\'ouvrir ce lien depuis un appareil connecté au même réseau que le serveur, ou contactez le support.');
        } else {
          setMessage(err.response?.data?.detail || 'Le lien est invalide ou a expiré.');
        }
      });
  }, [uid, token]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'center', py: 2 }}>
      
      {/* LOADING STATE */}
      {status === 'loading' && (
        <Fade in={true} timeout={500}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', p: 2 }}>
              <CircularProgress size={80} thickness={3} sx={{ color: 'primary.light', opacity: 0.3, position: 'absolute' }} variant="determinate" value={100} />
              <CircularProgress size={80} thickness={3} sx={{ color: 'primary.main', strokeLinecap: 'round' }} disableShrink />
              <Box
                sx={{
                  top: 0, left: 0, bottom: 0, right: 0,
                  position: 'absolute',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <MarkEmailReadRoundedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              </Box>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
                Vérification en cours
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Veuillez patienter pendant que nous validons votre accès sécurisé...
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}

      {/* SUCCESS STATE */}
      {status === 'success' && (
        <Fade in={true} timeout={500}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.1)' : 'success.50', 
              color: 'success.main',
              p: 3, 
              borderRadius: '50%', 
              mb: 3,
              boxShadow: theme.palette.mode === 'dark' ? '0 8px 32px rgba(52, 211, 153, 0.15)' : '0 8px 32px rgba(16, 185, 129, 0.15)'
            }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 64 }} />
            </Box>
            
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
              Compte activé
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4, fontSize: '0.95rem' }}>
              {message}
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate('/login')}
              sx={{ 
                borderRadius: 2.5, 
                fontWeight: 700, 
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'none'
              }}
            >
              Accéder à mon espace
            </Button>
          </Box>
        </Fade>
      )}

      {/* ERROR STATE */}
      {status === 'error' && (
        <Fade in={true} timeout={500}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ 
              bgcolor: resendSuccess 
                ? (theme.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.1)' : 'success.50') 
                : (theme.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.1)' : 'error.50'), 
              color: resendSuccess ? 'success.main' : 'error.main',
              p: 3, 
              borderRadius: '50%', 
              mb: 3,
              boxShadow: resendSuccess 
                ? (theme.palette.mode === 'dark' ? '0 8px 32px rgba(52, 211, 153, 0.15)' : '0 8px 32px rgba(16, 185, 129, 0.15)') 
                : (theme.palette.mode === 'dark' ? '0 8px 32px rgba(248, 113, 113, 0.15)' : '0 8px 32px rgba(239, 68, 68, 0.15)'),
              transition: 'all 0.3s ease'
            }}>
              {resendSuccess ? (
                <CheckCircleRoundedIcon sx={{ fontSize: 64 }} />
              ) : (
                <ErrorRoundedIcon sx={{ fontSize: 64 }} />
              )}
            </Box>
            
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 2 }}>
              {resendSuccess ? 'Lien envoyé' : 'Lien expiré'}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 4, fontSize: '0.95rem', lineHeight: 1.6 }}>
              {message}
            </Typography>
            
            {!resendSuccess ? (
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleResend}
                  disabled={resending}
                  sx={{ 
                    borderRadius: 2.5, 
                    fontWeight: 700, 
                    py: 1.5,
                    fontSize: '1rem',
                    textTransform: 'none'
                  }}
                >
                  {resending ? <CircularProgress size={26} color="inherit" /> : 'M\'envoyer un nouveau lien'}
                </Button>
                <Button
                  variant="text"
                  size="large"
                  fullWidth
                  onClick={() => navigate('/login')}
                  startIcon={<ArrowBackRoundedIcon />}
                  sx={{ borderRadius: 2.5, fontWeight: 600, color: 'text.secondary', textTransform: 'none' }}
                >
                  Retour à la connexion
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate('/login')}
                sx={{ 
                  borderRadius: 2.5, 
                  fontWeight: 700, 
                  py: 1.5,
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                Retour à la connexion
              </Button>
            )}
          </Box>
        </Fade>
      )}
    </Box>
  );
}
