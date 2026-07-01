import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Rating, Slider, TextField, Button,
  Paper, Chip, useTheme, CircularProgress, IconButton, alpha,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
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

interface RatingDialogProps {
  open: boolean;
  missionId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RatingDialog({ open, missionId, onClose, onSuccess }: RatingDialogProps) {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const currentUser = useAppSelector((s: any) => s.auth.user);

  const [stars, setStars] = useState<number | null>(null);
  const [sliders, setSliders] = useState({ ponctualite: 3, qualite: 3, communication: 3 });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState<any>(null);
  const [fetchingApp, setFetchingApp] = useState(false);

  // Reset state on open/missionId change
  useEffect(() => {
    if (open && missionId) {
      setStars(null);
      setSliders({ ponctualite: 3, qualite: 3, communication: 3 });
      setComment('');
      setAppData(null);
      setFetchingApp(true);

      api.get(`applications/${missionId}/`)
        .then((res) => setAppData(res.data))
        .catch(() => dispatch(showSnackbar({ message: 'Candidature introuvable.', severity: 'error' })))
        .finally(() => setFetchingApp(false));
    }
  }, [open, missionId, dispatch]);

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
      dispatch(showSnackbar({ message: 'Évaluation soumise avec succès ! ⭐', severity: 'success' }));
      onClose();
      onSuccess?.();
    } catch (err: any) {
      const errData = err?.response?.data;
      const msg = errData?.detail || (typeof errData === 'object' ? JSON.stringify(errData) : "Erreur lors de la soumission de l'évaluation.");
      dispatch(showSnackbar({ message: msg, severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ '& .MuiDialog-paper': { borderRadius: '20px', p: 0.5 } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Évaluer la mission</Typography>
          {appData && (
            <Typography variant="caption" color="text.secondary">
              {appData.candidate?.user?.last_name} {appData.candidate?.user?.first_name} · {appData.job_offer?.title}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderTop: `1px solid ${theme.palette.divider}`, pt: 2 }}>
        {fetchingApp ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Stars */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, mb: 2, textAlign: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Note globale *</Typography>
              <Rating
                size="large"
                value={stars}
                onChange={(_, v) => setStars(v)}
                precision={0.5}
                icon={<StarIcon sx={{ fontSize: 44, color: '#FFC107' }} />}
                emptyIcon={<StarIcon sx={{ fontSize: 44, opacity: 0.35 }} />}
              />
              {stars !== null && (
                <Typography variant="body2" sx={{ mt: 0.75, fontWeight: 700, color: stars >= 4.5 ? 'primary.main' : stars >= 3.5 ? 'secondary.main' : 'text.secondary' }}>
                  {stars >= 4.5 ? 'Excellent !' : stars >= 3.5 ? 'Bon travail' : 'Passable'}
                </Typography>
              )}
            </Paper>

            {/* Sliders */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Détails (optionnel)</Typography>
              {SLIDERS.map((s) => (
                <Box key={s.key} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
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
                    sx={{ py: 0.5 }}
                  />
                </Box>
              ))}
            </Paper>

            {/* Comment */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Commentaire (optionnel)</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                {PRESET_COMMENTS.map((c) => (
                  <Chip
                    key={c} label={c} size="small" clickable onClick={() => setComment(c)}
                    variant={comment === c ? 'filled' : 'outlined'}
                    color={comment === c ? 'primary' : 'default'}
                    sx={{ fontSize: '0.6875rem' }}
                  />
                ))}
              </Box>
              <TextField
                fullWidth multiline rows={3}
                placeholder="Décrivez l'expérience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                slotProps={{ htmlInput: { maxLength: 200 } }}
                helperText={`${comment.length}/200`}
              />
            </Paper>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderRadius: '12px', fontWeight: 700 }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
          onClick={handleSubmit}
          disabled={loading || fetchingApp || !stars}
          sx={{ borderRadius: '12px', fontWeight: 700, flex: 1 }}
        >
          {loading ? 'Envoi...' : 'Soumettre l\'évaluation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
