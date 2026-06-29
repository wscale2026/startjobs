import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, TextField, MenuItem, CircularProgress, Alert
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import api from '../utils/api';
import { useAppDispatch } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { fetchCurrentUser } from '../store/slices/authSlice';

interface KycSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  employerType: string;
}

export default function KycSubmissionModal({ open, onClose, employerType }: KycSubmissionModalProps) {
  const dispatch = useAppDispatch();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState(employerType || 'particulier');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Veuillez sélectionner un document (CNI, Passeport, RCCM...).');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('kyc_document', file);
    formData.append('employer_type', type);

    try {
      await api.post('/users/submit-kyc/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      dispatch(showSnackbar({ message: 'Documents soumis avec succès. En attente de validation.', severity: 'success' }));
      dispatch(fetchCurrentUser());
      onClose();
    } catch (err: any) {
      setError("Une erreur est survenue lors de l'envoi du document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Vérification d'Identité (KYC)</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Pour garantir la sécurité de notre plateforme, nous devons vérifier votre identité avant que vous puissiez publier des offres d'emploi.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            select
            label="Type d'employeur"
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
          >
            <MenuItem value="particulier">Particulier (CNI, Passeport)</MenuItem>
            <MenuItem value="entreprise">Entreprise (RCCM, NUI)</MenuItem>
          </TextField>

          <Box
            sx={{
              border: '2px dashed',
              borderColor: file ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              bgcolor: file ? 'primary.50' : 'background.default',
              cursor: 'pointer'
            }}
            component="label"
          >
            <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
            <UploadFileIcon sx={{ fontSize: 40, color: file ? 'primary.main' : 'text.secondary', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {file ? file.name : "Cliquez pour uploader votre document"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Formats acceptés : PDF, JPG, PNG (Max 5MB)
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: { xs: 1, sm: 0 } }}>
        <Button onClick={onClose} disabled={loading} color="inherit" sx={{ width: { xs: '100%', sm: 'auto' } }}>Annuler</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          disabled={loading || !file}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Soumettre
        </Button>
      </DialogActions>
    </Dialog>
  );
}
