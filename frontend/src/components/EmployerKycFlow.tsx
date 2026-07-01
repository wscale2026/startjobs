import React, { useState } from 'react';
import {
  Box, Typography, Button, Stepper, Step, StepLabel,
  Card, CardContent, FormControl, RadioGroup, FormControlLabel, Radio,
  CircularProgress, Alert, useTheme, alpha, IconButton
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../utils/api';
import { useAppDispatch } from '../store';
import { fetchCurrentUser } from '../store/slices/authSlice';

interface EmployerKycFlowProps {
  employerType: string;
  onClose: () => void;
}

const FileDropzone = ({ 
  file, 
  setFile, 
  label, 
  id,
  isDark,
  theme
}: { 
  file: File | null, 
  setFile: (f: File) => void, 
  label: string,
  id: string,
  isDark: boolean,
  theme: any
}) => (
  <Box
    component="label"
    htmlFor={id}
    sx={{
      border: '2px dashed',
      borderColor: file ? 'primary.main' : 'divider',
      borderRadius: '16px',
      p: 4,
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: 180,
      boxSizing: 'border-box',
      bgcolor: file ? alpha(theme.palette.primary.main, 0.05) : (isDark ? 'rgba(255,255,255,0.02)' : 'white'),
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.02) }
    }}
  >
    <input 
      id={id}
      type="file" 
      style={{ display: 'none' }} 
      accept=".pdf,.jpg,.jpeg,.png" 
      onChange={(e) => {
        if (e.target.files && e.target.files[0]) {
          setFile(e.target.files[0]);
          e.target.value = ''; // Reset so the same file can be selected again
        }
      }} 
    />
    {file ? (
      <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
    ) : (
      <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
    )}
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
      {label}
    </Typography>
    <Typography variant="body2" color={file ? 'text.primary' : 'text.secondary'} sx={{ fontWeight: file ? 600 : 400, mb: file ? 0 : 1 }}>
      {file ? file.name : "Cliquez ou glissez-déposez le fichier ici"}
    </Typography>
    {!file && (
      <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>
        Formats acceptés : JPG, JPEG, PNG, PDF (Max. 5 MB)
      </Typography>
    )}
  </Box>
);

export default function EmployerKycFlow({ employerType, onClose }: EmployerKycFlowProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isDark = theme.palette.mode === 'dark';
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Particulier state
  const [kycMethod, setKycMethod] = useState('cni');
  const [selfie, setSelfie] = useState<File | null>(null);
  const [cniRecto, setCniRecto] = useState<File | null>(null);
  const [cniVerso, setCniVerso] = useState<File | null>(null);
  const [passport, setPassport] = useState<File | null>(null);
  
  // Entreprise state
  const [attestationFiscale, setAttestationFiscale] = useState<File | null>(null);
  const [attestationImmatriculation, setAttestationImmatriculation] = useState<File | null>(null);

  const particulierSteps = ["Photo d'identité (Selfie)", "Choix du document", "Upload du document"];
  const entrepriseSteps = ["Carte Nationale d'Identité", "Attestation de conformité fiscale", "Attestation d'immatriculation"];
  
  const steps = employerType === 'particulier' ? particulierSteps : entrepriseSteps;

  const handleNext = () => {
    // Validation
    if (employerType === 'particulier') {
      if (activeStep === 0 && !selfie) return setError("Veuillez uploader votre photo (Selfie).");
      if (activeStep === 1 && !kycMethod) return setError("Veuillez choisir un document.");
    } else {
      if (activeStep === 0 && (!cniRecto || !cniVerso)) return setError("Veuillez uploader le recto et le verso de votre CNI.");
      if (activeStep === 1 && !attestationFiscale) return setError("Veuillez uploader l'attestation de conformité fiscale.");
    }
    
    setError('');
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError('');
  };

  const handleSubmit = async () => {
    if (employerType === 'particulier') {
      if (kycMethod === 'cni' && (!cniRecto || !cniVerso)) return setError("Veuillez uploader le recto et le verso.");
      if (kycMethod !== 'cni' && !passport) return setError("Veuillez uploader le document.");
    } else {
      if (!attestationImmatriculation) return setError("Veuillez uploader l'attestation d'immatriculation.");
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('employer_type', employerType);

    if (employerType === 'particulier') {
      formData.append('kyc_method', kycMethod);
      if (selfie) formData.append('kyc_selfie', selfie);
      if (kycMethod === 'cni') {
        if (cniRecto) formData.append('kyc_cni_recto', cniRecto);
        if (cniVerso) formData.append('kyc_cni_verso', cniVerso);
      } else {
        if (passport) formData.append('kyc_passport_recepisse', passport);
      }
    } else {
      if (cniRecto) formData.append('kyc_cni_recto', cniRecto);
      if (cniVerso) formData.append('kyc_cni_verso', cniVerso);
      if (attestationFiscale) formData.append('kyc_attestation_fiscale', attestationFiscale);
      if (attestationImmatriculation) formData.append('kyc_attestation_immatriculation', attestationImmatriculation);
    }

    try {
      await api.post('/users/submit-kyc/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      dispatch(fetchCurrentUser());
      setActiveStep(steps.length); // Move to success screen
    } catch (err: any) {
      setError("Une erreur est survenue lors de l'envoi du document.");
    } finally {
      setLoading(false);
    }
  };

  // FileDropzone component extracted above

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Card sx={{ position: 'relative', maxWidth: 800, mx: 'auto', borderRadius: 4, overflow: 'visible', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)' }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10, bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
        >
          <CloseIcon />
        </IconButton>
        <CardContent sx={{ p: { xs: 3, md: 6 } }}>
          <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
            Vérification d'Identité
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 6 }}>
            Sécurisons votre compte {employerType === 'particulier' ? 'Particulier' : 'Entreprise'}
          </Typography>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>}

          {activeStep === steps.length ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                Documents Soumis avec Succès !
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                Vos documents ont été transmis de manière sécurisée à notre équipe. Nous les examinerons dans les plus brefs délais. Vous recevrez une notification une fois votre compte validé.
              </Typography>
              <Button variant="contained" size="large" onClick={onClose} sx={{ px: 4, borderRadius: '10px', fontWeight: 700 }}>
                Fermer et Retourner au Tableau de bord
              </Button>
            </Box>
          ) : (
            <Box sx={{ minHeight: 300 }}>
              {/* PARTICULIER STEPS */}
              {employerType === 'particulier' && activeStep === 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Uploadez une photo de vous (Selfie)</Typography>
                  <FileDropzone file={selfie} setFile={setSelfie} label="Votre Selfie" id="file-selfie" theme={theme} isDark={isDark} />
                </Box>
              )}
              {employerType === 'particulier' && activeStep === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Quelle pièce souhaitez-vous soumettre ?</Typography>
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup value={kycMethod} onChange={(e) => setKycMethod(e.target.value)}>
                      {['cni', 'recepisse', 'passport'].map(val => (
                        <Card key={val} variant="outlined" sx={{ mb: 2, borderRadius: 3, borderColor: kycMethod === val ? 'primary.main' : 'divider', bgcolor: kycMethod === val ? alpha(theme.palette.primary.main, 0.05) : 'transparent' }}>
                          <FormControlLabel 
                            value={val} 
                            control={<Radio color="primary" />} 
                            label={<Typography sx={{ fontWeight: 600 }}>{val === 'cni' ? 'Carte Nationale d\'Identité (CNI)' : val === 'recepisse' ? 'Récépissé' : 'Passeport'}</Typography>} 
                            sx={{ width: '100%', m: 0, p: 2 }}
                          />
                        </Card>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Box>
              )}
              {employerType === 'particulier' && activeStep === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Uploadez votre document</Typography>
                  {kycMethod === 'cni' ? (
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                      <Box sx={{ flex: 1 }}>
                        <FileDropzone file={cniRecto} setFile={setCniRecto} label="CNI (Recto)" id="file-cni-recto" theme={theme} isDark={isDark} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <FileDropzone file={cniVerso} setFile={setCniVerso} label="CNI (Verso)" id="file-cni-verso" theme={theme} isDark={isDark} />
                      </Box>
                    </Box>
                  ) : (
                    <FileDropzone file={passport} setFile={setPassport} label={kycMethod === 'recepisse' ? 'Récépissé' : 'Passeport'} id="file-passport" theme={theme} isDark={isDark} />
                  )}
                </Box>
              )}

              {/* ENTREPRISE STEPS */}
              {employerType === 'entreprise' && activeStep === 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Uploadez la CNI du responsable</Typography>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                      <FileDropzone file={cniRecto} setFile={setCniRecto} label="CNI (Recto)" id="file-entreprise-cni-recto" theme={theme} isDark={isDark} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <FileDropzone file={cniVerso} setFile={setCniVerso} label="CNI (Verso)" id="file-entreprise-cni-verso" theme={theme} isDark={isDark} />
                    </Box>
                  </Box>
                </Box>
              )}
              {employerType === 'entreprise' && activeStep === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Attestation de conformité fiscale</Typography>
                  <FileDropzone file={attestationFiscale} setFile={setAttestationFiscale} label="Attestation Fiscale" id="file-att-fiscale" theme={theme} isDark={isDark} />
                </Box>
              )}
              {employerType === 'entreprise' && activeStep === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Attestation d'immatriculation (NUI/RCCM)</Typography>
                  <FileDropzone file={attestationImmatriculation} setFile={setAttestationImmatriculation} label="Attestation d'immatriculation" id="file-att-immat" theme={theme} isDark={isDark} />
                </Box>
              )}
            </Box>
          )}

          {activeStep < steps.length && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button disabled={activeStep === 0 || loading} onClick={handleBack} sx={{ fontWeight: 600 }}>
                Précédent
              </Button>
              <Button 
                variant="contained" 
                onClick={handleNext} 
                disabled={loading}
                sx={{ borderRadius: '8px', px: 4, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : (activeStep === steps.length - 1 ? 'Soumettre les documents' : 'Suivant')}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
