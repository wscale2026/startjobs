import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, LinearProgress,
  Fade, useTheme, Chip, Stack, FormControlLabel, Switch, Divider, Autocomplete, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { register } from '../store/slices/authSlice';

const QUESTIONS = [
  {
    id: 'identity',
    question: 'Vos informations de connexion',
    type: 'identity_form',
  },
  {
    id: 'secteur',
    question: 'Quel est votre secteur d\'activité ?',
    placeholder: '',
    type: 'chips',
    options: ['Restauration', 'Commerce', 'Construction', 'Services à domicile', 'Événementiel', 'Transport', 'Éducation', 'Autre'],
  },
  {
    id: 'ville',
    question: 'Dans quelle ville êtes-vous situé(e) ?',
    placeholder: 'ex: Douala, Yaoundé…',
    type: 'autocomplete_city',
  },
  {
    id: 'quartier',
    question: 'Dans quel quartier êtes-vous situé(e) ?',
    placeholder: 'ex: Akwa, Bonanjo, New Bell…',
    type: 'autocomplete_neighborhood',
  },
  {
    id: 'recrutements',
    question: 'Combien de personnes comptez-vous recruter par mois ?',
    placeholder: '',
    type: 'chips',
    options: ['1-2', '3-5', '6-10', '10+'],
  },
  {
    id: 'verified',
    question: 'Voulez-vous le badge "Employeur Vérifié" ?',
    placeholder: '',
    type: 'boolean',
    description: 'Les employeurs vérifiés reçoivent 3× plus de réponses. Requiert un document officiel.',
  },
];

export default function EmployerOnboardingPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const LOCATIONS = useAppSelector(state => state.locationsGlobal.locations);
  const CITIES = Object.keys(LOCATIONS);
  const { allow_registrations, site_name, logo } = useAppSelector((state: any) => state.siteSettings);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [geolocating, setGeolocating] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleAnswer('latitude', position.coords.latitude);
        handleAnswer('longitude', position.coords.longitude);
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

  const [loading, setLoading] = useState(false);

  const current = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (id: string, val: any) => setAnswers((prev) => ({ ...prev, [id]: val }));

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      
      const profileData = {
        company_name: answers['nom'],
        phone: answers['phone'] || '',
        industry: answers['secteur'] === 'Autre' ? answers['secteur_autre'] : answers['secteur'],
        city: answers['ville'],
        neighborhood: answers['quartier'],
        latitude: answers['latitude'],
        longitude: answers['longitude'],
        recruits_per_month: answers['recrutements'],
        verification_requested: answers['verified'] || false
      };
      
      const data = {
        username: answers['username'],
        email: answers['email'],
        password: answers['password'],
        first_name: answers['nom'],
        role: 'employer',
        profile_data: profileData
      };

      dispatch(register(data))
        .unwrap()
        .then((user: any) => {
          setLoading(false);
          dispatch(showSnackbar({ message: 'Compte employeur créé ! Bienvenue', severity: 'success' }));
          navigate('/employer/dashboard');
        })
        .catch((err: any) => {
          setLoading(false);
          if (err === 'REQUIRES_EMAIL_VERIFICATION') {
             setEmailVerificationSent(true);
          } else {
             dispatch(showSnackbar({ message: 'Erreur: ' + (err.message || err || 'Création impossible'), severity: 'error' }));
          }
        });
    }
  };

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
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Inscriptions employeur fermées</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>Les nouvelles inscriptions sont temporairement désactivées sur cette plateforme.</Typography>
        <Button variant="contained" onClick={() => navigate('/')}>Retour à l'accueil</Button>
      </Box>
    );
  }

  if (emailVerificationSent) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8, p: 3 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Vérifiez votre boîte mail</Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
          Votre compte employeur a été créé avec succès ! Un email de confirmation a été envoyé à <b>{answers['email']}</b>. 
          Veuillez cliquer sur le lien qu'il contient pour activer votre compte avant de vous connecter.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/login')} size="large">
          Aller à la page de connexion
        </Button>
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
            {site_name} · Employeur
          </Typography>
        )}
      </Box>

      {/* Progress dots */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, mb: 1.5 }}>
        {QUESTIONS.map((_, i) => (
          <Box
            key={i}
            sx={{
              width: i === step ? 24 : 8,
              height: 8,
              borderRadius: 4,
              bgcolor: i <= step ? 'primary.main' : 'divider',
              transition: 'width 220ms cubic-bezier(0.2, 0, 0, 1), background-color 220ms cubic-bezier(0.2, 0, 0, 1)',
            }}
          />
        ))}
      </Box>

      <LinearProgress variant="determinate" value={progress} sx={{ mb: 4, borderRadius: 4, height: 4 }} />

      {/* Question */}
      <Fade key={step} in timeout={300}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.75 }}>
            {current.question}
          </Typography>
          {current.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {current.description}
            </Typography>
          )}
          {!current.description && <Box sx={{ mb: 2.5 }} />}

          {/* Answer input */}
          {current.type === 'text' && (
            <TextField
              fullWidth
              autoFocus
              variant="outlined"
              placeholder={current.placeholder}
              value={answers[current.id] || ''}
              onChange={(e) => handleAnswer(current.id, e.target.value)}
              sx={{ mb: 2 }}
            />
          )}

          {current.type === 'autocomplete_city' && current.id === 'ville' && (
            <Autocomplete
              freeSolo
              options={CITIES}
              value={answers[current.id] || ''}
              onChange={(_, newValue) => handleAnswer(current.id, newValue)}
              onInputChange={(_, newInputValue) => handleAnswer(current.id, newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  autoFocus
                  variant="outlined"
                  placeholder={current.placeholder}
                  sx={{ mb: 2 }}
                />
              )}
            />
          )}

          {current.type === 'autocomplete_neighborhood' && current.id === 'quartier' && (
            <Autocomplete
              freeSolo
              options={answers['ville'] ? (LOCATIONS[answers['ville'] as keyof typeof LOCATIONS] || []) : []}
              value={answers[current.id] || ''}
              onChange={(_, newValue) => handleAnswer(current.id, newValue)}
              onInputChange={(_, newInputValue) => handleAnswer(current.id, newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  autoFocus
                  variant="outlined"
                  placeholder={current.placeholder}
                  sx={{ mb: 2 }}
                />
              )}
            />
          )}

          {current.id === 'quartier' && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Button
                variant="outlined"
                color={answers['latitude'] && answers['longitude'] ? "success" : "primary"}
                startIcon={geolocating ? <CircularProgress size={20} /> : <MyLocationIcon />}
                onClick={handleGeolocate}
                disabled={geolocating}
                fullWidth
                sx={{ borderRadius: '12px', py: 1 }}
              >
                {geolocating ? "Recherche en cours..." : answers['latitude'] && answers['longitude'] ? "Position enregistrée ✓" : "Me géolocaliser"}
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                Permet aux candidats de voir à quelle distance vous êtes.
              </Typography>
            </Box>
          )}

          {current.type === 'identity_form' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Nom de l'entreprise ou responsable *"
                variant="outlined"
                value={answers['nom'] || ''}
                onChange={(e) => handleAnswer('nom', e.target.value)}
              />
              <TextField
                fullWidth
                label="Nom d'utilisateur *"
                placeholder="ex: pseudo123"
                variant="outlined"
                value={answers['username'] || ''}
                onChange={(e) => handleAnswer('username', e.target.value)}
              />
              <TextField
                fullWidth
                label="Adresse Email *"
                type="email"
                variant="outlined"
                value={answers['email'] || ''}
                onChange={(e) => handleAnswer('email', e.target.value)}
              />
              <TextField
                fullWidth
                label="Numéro de téléphone *"
                type="tel"
                variant="outlined"
                value={answers['phone'] || ''}
                onChange={(e) => handleAnswer('phone', e.target.value)}
              />
              <TextField
                fullWidth
                label="Mot de passe *"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={answers['password'] || ''}
                onChange={(e) => handleAnswer('password', e.target.value)}
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
            </Box>
          )}

          {current.type === 'chips' && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {current.options?.map((opt) => (
                  <Chip
                    key={opt}
                    label={opt}
                    clickable
                    onClick={() => handleAnswer(current.id, opt)}
                    variant={answers[current.id] === opt ? 'filled' : 'outlined'}
                    color={answers[current.id] === opt ? 'primary' : 'default'}
                    className="pressable"
                    sx={{ fontWeight: answers[current.id] === opt ? 700 : 500 }}
                  />
                ))}
              </Box>
              {answers[current.id] === 'Autre' && current.id === 'secteur' && (
                <TextField
                  fullWidth
                  autoFocus
                  variant="outlined"
                  placeholder="Précisez votre secteur d'activité..."
                  value={answers['secteur_autre'] || ''}
                  onChange={(e) => handleAnswer('secteur_autre', e.target.value)}
                  sx={{ mt: 3 }}
                />
              )}
            </Box>
          )}

          {current.type === 'boolean' && (
            <Box sx={{ mb: 2 }}>
              <Stack spacing={1.5}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Oui, je veux le badge vérifié"
                  clickable
                  onClick={() => handleAnswer(current.id, true)}
                  variant={answers[current.id] === true ? 'filled' : 'outlined'}
                  color={answers[current.id] === true ? 'secondary' : 'default'}
                  className="pressable"
                  sx={{ justifyContent: 'flex-start', height: 44, px: 1.5, fontSize: '0.9375rem', fontWeight: answers[current.id] === true ? 700 : 500 }}
                />
                <Chip
                  label="Plus tard"
                  clickable
                  onClick={() => handleAnswer(current.id, false)}
                  variant={answers[current.id] === false ? 'filled' : 'outlined'}
                  color={answers[current.id] === false ? 'default' : 'default'}
                  className="pressable"
                  sx={{ justifyContent: 'flex-start', height: 44, px: 1.5, fontSize: '0.9375rem', fontWeight: answers[current.id] === false ? 700 : 500 }}
                />
              </Stack>
            </Box>
          )}
        </Box>
      </Fade>

      {/* Navigation */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        {step > 0 && (
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setStep((s) => s - 1)} className="pressable" sx={{ flex: 1 }}>
            Précédent
          </Button>
        )}
        <Button
          variant="contained"
          disabled={loading}
          endIcon={step < QUESTIONS.length - 1 ? <ArrowForwardIcon /> : <CheckIcon />}
          className="pressable"
          onClick={handleNext}
          sx={{ flex: 2 }}
        >
          {loading ? 'Création...' : (step < QUESTIONS.length - 1 ? 'Continuer' : 'Créer mon compte')}
        </Button>
      </Box>

      {step === 0 && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
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
          <Button fullWidth variant="text" onClick={() => navigate('/')} className="pressable" sx={{ mt: 1, color: 'text.secondary' }}>
            Retour à l'accueil
          </Button>
        </Box>
      )}
    </Box>
  );
}
