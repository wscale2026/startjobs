import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid,
  Chip, CircularProgress, Alert, useTheme, alpha, IconButton, TextField, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BadgeIcon from '@mui/icons-material/Badge';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../utils/api';

interface AdminKycViewerProps {
  user: any;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export default function AdminKycViewer({ user, onClose, onStatusUpdated }: AdminKycViewerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [kycRejectionReason, setKycRejectionReason] = useState(user.kycRejectionReason || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateAction, setUpdateAction] = useState<'approved' | 'rejected' | null>(null);
  const [rejectMode, setRejectMode] = useState(false);

  const handleUpdate = async (status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !kycRejectionReason.trim()) {
      if (!rejectMode) setRejectMode(true);
      return;
    }
    
    setIsUpdating(true);
    setUpdateAction(status);
    try {
      await api.patch(`/admin/update-user/${user.id}/`, {
        profile: {
          kyc_status: status,
          kyc_rejection_reason: status === 'rejected' ? kycRejectionReason : ''
        }
      });
      onStatusUpdated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const DocumentPreview = ({ url, label }: { url: string | null | undefined, label: string }) => {
    if (!url) return null;
    
    // Ensure URL is https for iframes to work on https sites
    let secureUrl = url;
    if (secureUrl.startsWith('http://')) {
      secureUrl = secureUrl.replace('http://', 'https://');
    }

    const isPdf = secureUrl.toLowerCase().includes('.pdf');

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          {label}
        </Typography>
        <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Button size="small" startIcon={<DownloadIcon />} href={secureUrl} target="_blank" rel="noopener">
              Ouvrir / Télécharger
            </Button>
          </Box>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            {isPdf ? (
              <iframe 
                src={secureUrl} 
                title={label}
                width="100%" 
                style={{ border: 'none', borderRadius: 8, height: 'min(500px, 60vh)' }} 
              />
            ) : (
              <img src={secureUrl} alt={label} style={{ maxWidth: '100%', maxHeight: 'min(500px, 60vh)', objectFit: 'contain', borderRadius: 8 }} />
            )}
          </Box>
        </Card>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', pb: 8 }}>
      {/* HEADER */}
      <Box sx={{ 
        p: { xs: 2, md: 4 }, 
        bgcolor: isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.05),
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex', alignItems: 'center', gap: 2
      }}>
        <IconButton onClick={onClose} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>Examen KYC</Typography>
          <Typography variant="body2" color="text.secondary">
            Vérification de l'identité pour {user.companyName || user.nom}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Chip 
            label={user.kycStatus === 'pending' ? 'En attente' : user.kycStatus === 'approved' ? 'Approuvé' : user.kycStatus === 'rejected' ? 'Rejeté' : 'Non soumis'} 
            color={user.kycStatus === 'pending' ? 'warning' : user.kycStatus === 'approved' ? 'success' : user.kycStatus === 'rejected' ? 'error' : 'default'} 
            sx={{ fontWeight: 700 }}
          />
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 }, pb: { xs: 16, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
        <Grid container spacing={4}>
          {/* DOCUMENTS */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ borderRadius: 4, boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <BadgeIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Documents fournis</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>Type d'employeur :</Typography>
                  <Chip label={user.employerType === 'entreprise' ? 'Entreprise' : 'Particulier'} size="small" color="info" variant="outlined" sx={{ fontWeight: 700 }} />
                </Box>

                {!user.kycMethod && !user.kycSelfie && !user.kycDocument && !user.kycCniRecto ? (
                  <Alert severity="warning">Aucun document n'a été soumis.</Alert>
                ) : (
                  <>
                    {user.employerType === 'particulier' ? (
                      <>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 700 }}>
                          MÉTHODE : {user.kycMethod?.toUpperCase()}
                        </Typography>
                        <DocumentPreview url={user.kycSelfie} label="Selfie / Photo d'identité" />
                        <DocumentPreview url={user.kycCniRecto} label="CNI (Recto)" />
                        <DocumentPreview url={user.kycCniVerso} label="CNI (Verso)" />
                        <DocumentPreview url={user.kycPassportRecepisse} label="Passeport / Récépissé" />
                        {/* Fallback for old data */}
                        <DocumentPreview url={user.kycDocument} label="Document fourni (Ancien format)" />
                      </>
                    ) : (
                      <>
                        <DocumentPreview url={user.kycCniRecto} label="CNI du responsable (Recto)" />
                        <DocumentPreview url={user.kycCniVerso} label="CNI du responsable (Verso)" />
                        <DocumentPreview url={user.kycAttestationFiscale} label="Attestation de conformité fiscale" />
                        <DocumentPreview url={user.kycAttestationImmatriculation} label="Attestation d'immatriculation (RCCM/NUI)" />
                        {/* Fallback for old data */}
                        <DocumentPreview url={user.kycDocument} label="Document fourni (Ancien format)" />
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ACTIONS */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box sx={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <Card sx={{ borderRadius: 4, border: `2px solid ${theme.palette.success.main}` }}>
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Approuver</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Si tous les documents sont conformes et lisibles, approuvez la demande pour débloquer le compte de l'employeur.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    disabled={isUpdating}
                    onClick={() => handleUpdate('approved')}
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                  >
                    {isUpdating && updateAction === 'approved' ? <CircularProgress size={24} color="inherit" /> : 'Approuver la demande'}
                  </Button>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 4, border: `2px solid ${theme.palette.error.main}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CancelIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Rejeter</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Si un document est illisible, manquant ou invalide.
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Précisez le motif du rejet (obligatoire)"
                    value={kycRejectionReason}
                    onChange={(e) => setKycRejectionReason(e.target.value)}
                    sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    disabled={isUpdating || !kycRejectionReason.trim()}
                    onClick={() => handleUpdate('rejected')}
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                  >
                    {isUpdating && updateAction === 'rejected' ? <CircularProgress size={24} color="inherit" /> : 'Rejeter la demande'}
                  </Button>
                </CardContent>
              </Card>

            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* MOBILE STICKY FOOTER ACTIONS */}
      <Box sx={{ 
        display: { xs: 'block', md: 'none' }, 
        position: 'fixed', bottom: 88, left: 0, right: 0, 
        bgcolor: 'background.paper', p: 2, pt: rejectMode ? 2 : 1, pb: 2, 
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', zIndex: 1100,
        borderTop: `1px solid ${theme.palette.divider}`,
        borderRadius: '24px 24px 0 0'
      }}>
        {rejectMode ? (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Motif du rejet :</Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Précisez le motif..."
              value={kycRejectionReason}
              onChange={(e) => setKycRejectionReason(e.target.value)}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button fullWidth variant="outlined" color="inherit" onClick={() => setRejectMode(false)} sx={{ borderRadius: 2, fontWeight: 700 }}>
                Annuler
              </Button>
              <Button fullWidth variant="contained" color="error" disabled={isUpdating || !kycRejectionReason.trim()} onClick={() => handleUpdate('rejected')} sx={{ borderRadius: 2, fontWeight: 700 }}>
                Confirmer
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={() => setRejectMode(true)}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, border: `2px solid ${theme.palette.error.main}` }}
            >
              Rejeter
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="success"
              disabled={isUpdating}
              onClick={() => handleUpdate('approved')}
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
            >
              {isUpdating && updateAction === 'approved' ? <CircularProgress size={24} color="inherit" /> : 'Approuver'}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
