import React from 'react';
import {
  Box, Typography, Button, TextField, Grid, Chip, Avatar,
  FormControlLabel, Switch, Slider, Stack, Divider, useTheme,
  Select, MenuItem, InputLabel, FormControl, InputAdornment, IconButton,
  FormHelperText, Autocomplete,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { IconButton as MuiIconButton, Paper, CircularProgress } from '@mui/material';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { nextStep, prevStep, updateData, completeWizard, resetWizard } from '../store/slices/wizardSlice';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { register, updateProfile } from '../store/slices/authSlice';
import WizardStepper from '../components/WizardStepper';
import { DOMAINES } from '../mocks/workers';

const STEP_TITLES = [
  'Votre identité',
  'Vos compétences',
  'Votre formation',
  'Vos expériences',
  'Vos disponibilités',
  'Vos atouts',
];

const STEP_SUBTITLES = [
  'Commençons par les bases. Ces informations seront visibles sur votre profil.',
  'Quels métiers exercez-vous ? Sélectionnez tout ce qui vous correspond.',
  'Vos diplômes et certifications renforcent votre crédibilité.',
  'Avez-vous déjà travaillé ? Ajoutez vos précédentes missions.',
  'Quand êtes-vous disponible ? Cela aide les employeurs à vous contacter.',
  'Parlez de vous ! Un bon profil attire 3× plus d\'offres.',
];

const AVAILABILITY_OPTIONS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const LANGUAGES = ['Français', 'Anglais', 'Haoussa', 'Bamiléké', 'Ewondo', 'Bassa', 'Arabe', 'Fulfuldé'];

const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-]+$/;
const PHONE_REGEX = /^(?:\+237\s?)?(6[256789]\d{7}|2[234]\d{7})$/;
const EMAIL_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const USERNAME_REGEX = /^[^\s]+$/;
const TEXT_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s\,\.\-]+$/;

// ─── Step Validation ──────────────────────────────────────────────────────────
function validateStep(step: number, data: any): Record<string, string> {
  const errors: Record<string, string> = {};
  switch (step) {
    case 0: {
      if (!data.typeProfil) errors.typeProfil = 'Veuillez sélectionner un type de profil.';
      if (!data.prenom?.trim()) errors.prenom = 'Le prénom est requis.';
      else if (!NAME_REGEX.test(data.prenom.trim())) errors.prenom = 'Le prénom contient des caractères invalides (lettres uniquement).';
      
      if (!data.nom?.trim()) errors.nom = 'Le nom est requis.';
      else if (!NAME_REGEX.test(data.nom.trim())) errors.nom = 'Le nom contient des caractères invalides (lettres uniquement).';
      
      if (!data.username?.trim()) errors.username = 'Le nom d\'utilisateur est requis.';
      else if (!USERNAME_REGEX.test(data.username)) errors.username = 'Le nom d\'utilisateur ne doit pas contenir d\'espace.';
      
      if (!data.email?.trim()) errors.email = 'L\'adresse email est requise.';
      else if (!EMAIL_REGEX.test(data.email.trim())) errors.email = 'Une adresse email valide est requise.';
      
      if (!data.phone?.trim() || !PHONE_REGEX.test(data.phone.trim())) errors.phone = 'Numéro de téléphone camerounais invalide.';
      if (!data.password || data.password.length < 6) errors.password = 'Le mot de passe doit comporter au moins 6 caractères.';
      if (!data.dateNaissance) errors.dateNaissance = 'La date de naissance est requise.';
      if (!data.ville) errors.ville = 'La ville est requise.';
      break;
    }
    case 1: {
      if (!data.domaines || data.domaines.length === 0) errors.domaines = 'Sélectionnez au moins un domaine.';
      if (data.sousCompetences && data.sousCompetences.length > 0) {
        for (const sc of data.sousCompetences) {
          if (sc.trim() && !TEXT_REGEX.test(sc.trim())) {
            errors.sousCompetences = 'Les sous-compétences contiennent des caractères invalides.';
            break;
          }
        }
      }
      break;
    }
    case 4: {
      if (!data.disponibilites || data.disponibilites.length === 0) errors.disponibilites = 'Sélectionnez au moins un jour de disponibilité.';
      break;
    }
  }
  return errors;
}

// ─── Step 1: Identity ───────────────────────────────────────────────────────
function Step1({ data, onChange, setPhotoFile, errors }: any) {
  const LOCATIONS = useAppSelector(state => state.locationsGlobal.locations);
  const CITIES = Object.keys(LOCATIONS);
  const [showPassword, setShowPassword] = React.useState(false);

  const neighborhoodOptions: string[] = data.ville
    ? (LOCATIONS[data.ville as keyof typeof LOCATIONS] || [])
    : [];

  const [geolocating, setGeolocating] = React.useState(false);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setGeolocating(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        alert("Impossible d'obtenir votre position. Veuillez vérifier vos permissions.");
        setGeolocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      if (setPhotoFile) setPhotoFile(file);
      onChange({ photoPreview: previewUrl });
    }
  };

  return (
    <Grid container spacing={2.5}>
      {/* Photo */}
      <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ position: 'relative', cursor: 'pointer' }} component="label">
          <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
          <Avatar src={data.photoPreview} sx={{ width: 96, height: 96, bgcolor: 'primary.main', fontSize: '2rem', fontWeight: 700 }}>
            {!data.photoPreview && (data.prenom ? data.prenom[0].toUpperCase() : '?')}
          </Avatar>
          <Box
            sx={{
              position: 'absolute', bottom: 0, right: 0,
              bgcolor: 'primary.main', borderRadius: '50%', p: 0.6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 2,
            }}
          >
            <CameraAltIcon sx={{ fontSize: 16, color: 'white' }} />
          </Box>
        </Box>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <FormControl fullWidth error={!!errors?.typeProfil}>
          <InputLabel>Type de profil *</InputLabel>
          <Select value={data.typeProfil || ''} label="Type de profil *" onChange={(e) => onChange({ typeProfil: e.target.value })}>
            <MenuItem value="Freelance">Freelance / Indépendant</MenuItem>
            <MenuItem value="Salarié">Salarié / CDD / CDI</MenuItem>
            <MenuItem value="Apprenti">Apprenti / Stagiaire</MenuItem>
            <MenuItem value="Elève">Elève</MenuItem>
            <MenuItem value="Etudiant">Etudiant</MenuItem>
          </Select>
          {errors?.typeProfil && <FormHelperText>{errors.typeProfil}</FormHelperText>}
        </FormControl>
      </Grid>

      <Grid size={{ xs: 6 }}>
        <TextField fullWidth label="Prénom *" value={data.prenom || ''} onChange={(e) => onChange({ prenom: e.target.value })} error={!!errors?.prenom} helperText={errors?.prenom} />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField fullWidth label="Nom *" value={data.nom || ''} onChange={(e) => onChange({ nom: e.target.value })} error={!!errors?.nom} helperText={errors?.nom} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField fullWidth label="Nom d'utilisateur *" placeholder="ex: pseudo123" value={data.username || ''} onChange={(e) => onChange({ username: e.target.value })} error={!!errors?.username} helperText={errors?.username} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField fullWidth label="Adresse Email *" type="email" placeholder="votre@email.com" value={data.email || ''} onChange={(e) => onChange({ email: e.target.value })} error={!!errors?.email} helperText={errors?.email} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField fullWidth label="Numéro de téléphone *" type="tel" placeholder="+237 6XX XX XX XX" value={data.phone || ''} onChange={(e) => onChange({ phone: e.target.value })} error={!!errors?.phone} helperText={errors?.phone} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Mot de passe *"
          type={showPassword ? 'text' : 'password'}
          value={data.password || ''}
          onChange={(e) => onChange({ password: e.target.value })}
          error={!!errors?.password}
          helperText={errors?.password}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )
            }
          }}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField fullWidth type="date" label="Date de naissance *" slotProps={{ inputLabel: { shrink: true } }} value={data.dateNaissance || ''} onChange={(e) => onChange({ dateNaissance: e.target.value })} error={!!errors?.dateNaissance} helperText={errors?.dateNaissance} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <FormControl fullWidth error={!!errors?.ville}>
          <InputLabel>Ville *</InputLabel>
          <Select value={data.ville || ''} label="Ville *" onChange={(e) => onChange({ ville: e.target.value, quartier: '' })}>
            {CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
          {errors?.ville && <FormHelperText>{errors.ville}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Autocomplete
          freeSolo
          options={neighborhoodOptions}
          value={data.quartier || ''}
          onChange={(_, newValue) => onChange({ quartier: newValue || '' })}
          onInputChange={(_, newInputValue) => onChange({ quartier: newInputValue })}
          disabled={!data.ville}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              label="Quartier"
              placeholder={data.ville ? 'Tapez ou sélectionnez un quartier…' : 'Sélectionnez d\'abord une ville'}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Button
          variant="outlined"
          color={data.latitude && data.longitude ? "success" : "primary"}
          startIcon={geolocating ? <CircularProgress size={20} /> : <MyLocationIcon />}
          onClick={handleGeolocate}
          disabled={geolocating}
          fullWidth
          sx={{ borderRadius: '12px', py: 1 }}
        >
          {geolocating ? "Recherche en cours..." : data.latitude && data.longitude ? "Position enregistrée ✓" : "Me géolocaliser"}
        </Button>
        <FormHelperText sx={{ textAlign: 'center' }}>
          Permet aux recruteurs de voir à quelle distance vous êtes.
        </FormHelperText>
      </Grid>
    </Grid>
  );
}

// ─── Step 2: Skills ──────────────────────────────────────────────────────────
function Step2({ data, onChange, errors }: any) {
  const selected: string[] = data.domaines || [];
  const toggle = (d: string) => {
    const next = selected.includes(d) ? selected.filter((x) => x !== d) : [...selected, d];
    onChange({ domaines: next });
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sélectionnez jusqu'à 5 domaines
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {DOMAINES.map((d) => (
          <Chip
            key={d}
            label={d}
            clickable
            onClick={() => toggle(d)}
            variant={selected.includes(d) ? 'filled' : 'outlined'}
            color={selected.includes(d) ? 'primary' : 'default'}
            icon={selected.includes(d) ? <CheckIcon /> : undefined}
            className="pressable"
            sx={{ fontWeight: selected.includes(d) ? 600 : 500 }}
          />
        ))}
      </Box>
      {errors?.domaines && (
        <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>{errors.domaines}</Typography>
      )}

      <TextField
        fullWidth
        label="Sous-compétences (optionnel)"
        placeholder="ex: Maçonnerie, Carrelage, Plomberie basique…"
        multiline
        rows={2}
        sx={{ mt: 2.5 }}
        value={data.sousCompetences?.join(', ') || ''}
        onChange={(e) => onChange({ sousCompetences: e.target.value.split(',').map((s: string) => s.trim()) })}
      />
    </Box>
  );
}

// ─── Step 3: Education ───────────────────────────────────────────────────────
function Step3({ data, onChange }: any) {
  const DIPLOMES = ['CAP', 'BEP', 'Baccalauréat', 'BTS', 'Licence', 'Master', 'Doctorat', 'Certificat professionnel', 'Sans diplôme'];

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12 }}>
        <FormControl fullWidth>
          <InputLabel>Diplôme le plus élevé</InputLabel>
          <Select value={data.diplome || ''} label="Diplôme le plus élevé" onChange={(e) => onChange({ diplome: e.target.value })}>
            {DIPLOMES.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField fullWidth label="Établissement" placeholder="ex: Lycée Technique de Douala" value={data.etablissement || ''} onChange={(e) => onChange({ etablissement: e.target.value })} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField fullWidth label="Année d'obtention" type="number" slotProps={{ htmlInput: { min: 2000, max: 2025 } }} value={data.annee || ''} onChange={(e) => onChange({ annee: e.target.value })} />
      </Grid>
    </Grid>
  );
}

// ─── Step 4: Experiences ─────────────────────────────────────────────────────
function Step4({ data, onChange }: any) {
  const experiences = data.experiences || [];

  const addExperience = () => {
    onChange({ experiences: [...experiences, { id: Date.now().toString(), titre: '', employeur: '', annee: '' }] });
  };

  const updateExperience = (id: string, field: string, value: string) => {
    const next = experiences.map((e: any) => e.id === id ? { ...e, [field]: value } : e);
    onChange({ experiences: next });
  };

  const removeExperience = (id: string) => {
    onChange({ experiences: experiences.filter((e: any) => e.id !== id) });
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Optionnel, mais fortement recommandé.
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {experiences.map((exp: any, index: number) => (
          <Paper key={exp.id} elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
            <MuiIconButton
              size="small"
              onClick={() => removeExperience(exp.id)}
              className="pressable"
              sx={{ position: 'absolute', top: 8, right: 8, color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" />
            </MuiIconButton>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Expérience {index + 1}</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth size="small" label="Titre du poste" placeholder="ex: Manœuvre" value={exp.titre} onChange={(e) => updateExperience(exp.id, 'titre', e.target.value)} />
              </Grid>
              <Grid size={{ xs: 8 }}>
                <TextField fullWidth size="small" label="Employeur / Client" placeholder="ex: Chantier Bonanjo" value={exp.employeur} onChange={(e) => updateExperience(exp.id, 'employeur', e.target.value)} />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField fullWidth size="small" label="Année" placeholder="2023" value={exp.annee} onChange={(e) => updateExperience(exp.id, 'annee', e.target.value)} />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Stack>

      <Button variant="outlined" startIcon={<AddIcon />} onClick={addExperience} className="pressable" fullWidth sx={{ borderStyle: 'dashed' }}>
        Ajouter une expérience
      </Button>
    </Box>
  );
}

// ─── Step 5: Availability ────────────────────────────────────────────────────
function Step5({ data, onChange, errors }: any) {
  const selected: string[] = data.disponibilites || [];

  const toggle = (d: string) => {
    const next = selected.includes(d) ? selected.filter((x) => x !== d) : [...selected, d];
    onChange({ disponibilites: next });
  };

  const toggleAll = () => {
    if (selected.length === AVAILABILITY_OPTIONS.length) {
      onChange({ disponibilites: [] });
    } else {
      onChange({ disponibilites: [...AVAILABILITY_OPTIONS] });
    }
  };

  const allSelected = selected.length === AVAILABILITY_OPTIONS.length;

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Jours disponibles</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        {/* All days toggle */}
        <Chip
          label="Tous les jours"
          clickable
          onClick={toggleAll}
          variant={allSelected ? 'filled' : 'outlined'}
          color={allSelected ? 'secondary' : 'default'}
          className="pressable"
          icon={allSelected ? <CheckIcon /> : undefined}
          sx={{ fontWeight: allSelected ? 700 : 600, borderStyle: allSelected ? 'solid' : 'dashed' }}
        />
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        {AVAILABILITY_OPTIONS.map((d) => (
          <Chip
            key={d}
            label={d}
            clickable
            onClick={() => toggle(d)}
            variant={selected.includes(d) ? 'filled' : 'outlined'}
            color={selected.includes(d) ? 'primary' : 'default'}
            className="pressable"
            sx={{ fontWeight: selected.includes(d) ? 700 : 500 }}
          />
        ))}
      </Box>
      {errors?.disponibilites && (
        <Typography color="error" variant="caption" sx={{ mb: 2, display: 'block' }}>{errors.disponibilites}</Typography>
      )}

      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, mt: 2 }}>
        Rayon de déplacement : {data.rayon ?? 3} km
      </Typography>
      <Slider
        value={data.rayon ?? 3}
        min={1}
        max={10}
        step={1}
        marks={[{ value: 1, label: '1 km' }, { value: 5, label: '5 km' }, { value: 10, label: '10 km' }]}
        onChange={(_, v) => onChange({ rayon: v })}
        color="primary"
        sx={{ mb: 2 }}
      />
    </Box>
  );
}

// ─── Step 6: Assets ──────────────────────────────────────────────────────────
function Step6({ data, onChange }: any) {
  const selected: string[] = data.langues || [];
  const toggle = (l: string) => {
    const next = selected.includes(l) ? selected.filter((x) => x !== l) : [...selected, l];
    onChange({ langues: next });
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="À propos de vous"
        placeholder="Décrivez votre expérience, votre motivation et ce qui vous démarque…"
        multiline
        rows={4}
        value={data.bio || ''}
        onChange={(e) => onChange({ bio: e.target.value })}
        sx={{ mb: 2.5 }}
        slotProps={{ htmlInput: { maxLength: 280 } }}
        helperText={`${(data.bio || '').length}/280 caractères`}
      />

      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Langues parlées</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
        {LANGUAGES.map((l) => (
          <Chip
            key={l}
            label={l}
            clickable
            onClick={() => toggle(l)}
            variant={selected.includes(l) ? 'filled' : 'outlined'}
            color={selected.includes(l) ? 'secondary' : 'default'}
            size="small"
            className="pressable"
            sx={{ fontWeight: selected.includes(l) ? 700 : 500 }}
          />
        ))}
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={data.permis || false}
            onChange={(e) => onChange({ permis: e.target.checked })}
            color="primary"
          />
        }
        label="Je possède un permis de conduire"
      />
    </Box>
  );
}

// ─── Main Wizard ─────────────────────────────────────────────────────────────
export default function WizardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentStep, totalSteps, data, completed } = useAppSelector((s) => s.wizard);
  const { allow_registrations, site_name, logo } = useAppSelector((s: any) => s.siteSettings);
  const [loading, setLoading] = React.useState(false);
  const [stepErrors, setStepErrors] = React.useState<Record<string, string>>({});
  const [emailVerificationSent, setEmailVerificationSent] = React.useState(false);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);

  const handleChange = (patch: any) => {
    dispatch(updateData(patch));
    const field = Object.keys(patch)[0];
    if (field && stepErrors[field]) {
       const newErrors = { ...stepErrors };
       delete newErrors[field];
       setStepErrors(newErrors);
    }
  };

  const handleNext = () => {
    const errs = validateStep(currentStep, data);
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs);
      return;
    }
    setStepErrors({});
    if (currentStep < totalSteps - 1) {
      dispatch(nextStep());
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setLoading(true);
    
    const profileData = {
      bio: data.bio || '',
      phone: data.phone || '',
      date_of_birth: data.dateNaissance || null,
      highest_diploma: data.diplome || '',
      institution: data.etablissement || '',
      graduation_year: data.annee || '',
      neighborhood: data.quartier || '',
      city: data.ville || '',
      distance_max: data.rayon || 3,
      is_available: true,
      has_license: data.permis || false,
      profile_type: data.typeProfil || 'Freelance',
      skills: data.domaines || [],
      languages: data.langues || [],
      experiences: data.experiences || [],
      latitude: data.latitude,
      longitude: data.longitude,
    };

    const registerData: any = {
      username: data.username,
      email: data.email,
      password: data.password,
      first_name: data.prenom,
      last_name: data.nom,
      role: 'candidate',
      profile_data: profileData
    };

    if (photoFile) {
      registerData.photoFile = photoFile;
    }

    dispatch(register(registerData))
      .unwrap()
      .then((user: any) => {
        setLoading(false);
        dispatch(resetWizard());
        dispatch(showSnackbar({ message: 'Profil créé avec succès ! Bienvenue.', severity: 'success' }));
        navigate('/profile');
      })
      .catch((err: any) => {
        setLoading(false);
        if (err === 'REQUIRES_EMAIL_VERIFICATION') {
           dispatch(resetWizard());
           setEmailVerificationSent(true);
        } else {
           dispatch(showSnackbar({ message: 'Erreur: ' + (err.message || err || 'Création impossible'), severity: 'error' }));
        }
      });
  };

  if (emailVerificationSent) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8, p: 3 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Vérifiez votre boîte mail</Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          Votre compte a été créé avec succès ! Un email de confirmation a été envoyé à <b>{data.email}</b>. 
          Veuillez cliquer sur le lien qu'il contient pour activer votre compte avant de vous connecter.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/login')} size="large">
          Aller à la page de connexion
        </Button>
      </Box>
    );
  }

  const steps = [
    <Step1 data={data} onChange={handleChange} setPhotoFile={setPhotoFile} errors={stepErrors} />,
    <Step2 data={data} onChange={handleChange} errors={stepErrors} />,
    <Step3 data={data} onChange={handleChange} errors={stepErrors} />,
    <Step4 data={data} onChange={handleChange} errors={stepErrors} />,
    <Step5 data={data} onChange={handleChange} errors={stepErrors} />,
    <Step6 data={data} onChange={handleChange} errors={stepErrors} />,
  ];

  if (!allow_registrations) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        {logo ? (
          <img src={logo} alt={site_name} style={{ height: 48, objectFit: 'contain', marginBottom: 24 }} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 3 }}>
            {site_name}
          </Typography>
        )}
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Inscriptions fermées</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Les nouvelles inscriptions sont temporairement désactivées sur cette plateforme.</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </Box>
    );
  }



  return (
    <Box>
      {/* Logo */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        {logo ? (
          <img src={logo} alt={site_name} style={{ height: 40, objectFit: 'contain' }} />
        ) : (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {site_name}
          </Typography>
        )}
      </Box>

      {/* Stepper */}
      <WizardStepper currentStep={currentStep} totalSteps={totalSteps} />

      <Box sx={{ mt: 4, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {STEP_TITLES[currentStep]}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {STEP_SUBTITLES[currentStep]}
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />



      {/* Step content */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column' }}>
        {steps[currentStep]}
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          className="pressable"
          onClick={() => {
            if (currentStep === 0) navigate('/');
            else dispatch(prevStep());
            setStepErrors({});
          }}
          sx={{ flex: 1 }}
        >
          {currentStep === 0 ? 'Accueil' : 'Précédent'}
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : (currentStep < totalSteps - 1 ? <ArrowForwardIcon /> : <CheckIcon />)}
          className="pressable"
          onClick={handleNext}
          sx={{ flex: 2 }}
        >
          {loading ? 'Création...' : (currentStep < totalSteps - 1 ? 'Continuer' : 'Créer mon profil')}
        </Button>
      </Box>

      {/* Login Link */}
      {currentStep === 0 && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Déjà un compte ?{' '}
            <Typography
              component="span"
              variant="body2"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              Se connecter
            </Typography>
          </Typography>
        </Box>
      )}
    </Box>
  );
}
