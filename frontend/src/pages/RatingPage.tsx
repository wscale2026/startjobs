import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Rating, Slider, TextField, Button,
  Paper, Chip, useTheme, CircularProgress,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import api from '../utils/api';

const SLIDERS = [
  { key: 'ponctualite', label: 'Ponctualité' },
  { key: 'qualite', label: 'Qualité du travail' },
  { key: 'communication', label: 'Communication' },
];

const PRESET_COMMENTS = [
  'Excellent travail, très professionnel',
  'Ponctuel et sérieux',
  'Bon travail dans l\'ensemble',
  'À améliorer sur certains points',
];

export default function RatingPage() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const currentUser = useAppSelector((s: any) => s.auth.user);

  const [stars, setStars] = useState<number | null>(null);
  const [sliders, setSliders] = useState({ ponctualite: 3, qualite: 3, communication: 3 });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState<any>(null);
  const [fetchingApp, setFetchingApp] = useState(true);

  useEffect(() => {
    if (missionId) {
      api.get(`applications/${missionId}/`)
        .then((res) => setAppData(res.data))
        .catch(() => dispatch(showSnackbar({ message: 'Candidature introuvable.', severity: 'error' })))
        .finally(() => setFetchingApp(false));
    }
  }, [missionId, dispatch]);

  const handleSubmit = async () => {
    if (!stars) {
      dispatch(showSnackbar({ message: 'Veuillez donner une note en étoiles', severity: 'warning' }));
      return;
    }

    const iAmCandidate = currentUser?.role === 'candidate';
    const revieweeId = iAmCandidate
      ? appData?.job_offer?.employer?.user?.id
      : appData?.candidate?.user?.id;

    if (!revieweeId) {
      dispatch(showSnackbar({ message: "Impossible de trouver l'utilisateur à évaluer.", severity: 'error' }));
      return;
    }

    setLoading(true);
    const avgSliders = (sliders.ponctualite + sliders.qualite + sliders.communication) / 3;
    const finalScore = parseFloat((stars * 0.6 + avgSliders * 0.4).toFixed(1));

    try {
      await api.post('reviews/', {
        reviewee_id: revieweeId,
        job_offer_id: appData?.job_offer?.id || undefined,
        rating: finalScore,
        comment: comment || undefined,
      });
      dispatch(showSnackbar({ message: 'Évaluation soumise ! Expérience vérifiée créée. ⭐', severity: 'success' }));
      navigate(iAmCandidate ? '/candidate/dashboard' : '/employer/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Erreur lors de la soumission de l'évaluation.";
      dispatch(showSnackbar({ message: msg, severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  if (fetchingApp) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Évaluer la mission</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Mission #{missionId} · Votre évaluation crée une expérience vérifiée automatiquement.
      </Typography>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, mb: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Note globale *</Typography>
        <Rating
          size="large" value={stars} onChange={(_, v) => setStars(v)} precision={0.5}
          icon={<StarIcon sx={{ fontSize: 48, color: '#FFC107' }} />}
          emptyIcon={<StarIcon sx={{ fontSize: 48, opacity: 0.35 }} />}
        />
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            fontWeight: 700,
            color: (stars ?? 0) >= 4.5 ? 'primary.main' : (stars ?? 0) >= 3.5 ? 'secondary.main' : 'text.secondary'
          }}
        >
          {(stars ?? 0) >= 4.5 ? 'Excellent !' : (stars ?? 0) >= 3.5 ? 'Bon travail' : 'Passable'}
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5 }}>Détails (optionnel)</Typography>
        {SLIDERS.map((s) => (
          <Box key={s.key} sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>{s.label}</Typography>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
                {sliders[s.key as keyof typeof sliders]}/5
              </Typography>
            </Box>
            <Slider
              value={sliders[s.key as keyof typeof sliders]}
              min={1} max={5} step={0.5}
              onChange={(_, v) => setSliders((prev) => ({ ...prev, [s.key]: v as number }))}
              color="primary"
            />
          </Box>
        ))}
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>Commentaire (optionnel)</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          {PRESET_COMMENTS.map((c) => (
            <Chip key={c} label={c} size="small" clickable onClick={() => setComment(c)}
              variant={comment === c ? 'filled' : 'outlined'} color={comment === c ? 'primary' : 'default'}
              sx={{ fontSize: '0.6875rem' }} />
          ))}
        </Box>
        <TextField fullWidth multiline rows={3} placeholder="Décrivez l'expérience…"
          value={comment} onChange={(e) => setComment(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 200 } }} helperText={`${comment.length}/200`} />
      </Paper>

      <Button
        variant="contained" fullWidth size="large"
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckIcon />}
        onClick={handleSubmit} disabled={loading} className="pressable" sx={{ py: 1.75 }}
      >
        {loading ? 'Envoi...' : "Soumettre l'évaluation"}
      </Button>
      <Button fullWidth variant="text" className="pressable" sx={{ mt: 1 }} onClick={() => navigate(-1)}>
        Annuler
      </Button>
    </Box>
  );
}
