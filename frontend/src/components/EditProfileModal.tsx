import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Typography, Avatar, IconButton, useTheme,
  useMediaQuery, Grid, InputAdornment, Autocomplete, Chip,
  alpha, Badge, Divider, Paper, Stack, Switch, FormControlLabel,
  Slider, FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import TranslateIcon from '@mui/icons-material/Translate';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';
import { useAppDispatch, useAppSelector } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import { updateProfile } from '../store/slices/authSlice';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  isEmployer: boolean;
  initialData?: any;
}

const ALL_DOMAINES = [
  'BTP & Construction', 'Vente & Commerce', 'Restauration',
  'Marketing', 'IT & Tech', 'Design', 'Assistance Administrative',
  'Plomberie', 'Électricité', 'Mécanique', 'Transport', 'Sécurité',
  'Nettoyage', 'Coiffure & Beauté', 'Agriculture', 'Couture & Mode'
];

const ALL_LANGUAGES = ['Français', 'Anglais', 'Haoussa', 'Bamiléké', 'Ewondo', 'Bassa', 'Arabe', 'Fulfuldé', 'Allemand', 'Espagnol'];

const VILLES_CAMEROUN = [
  'Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Maroua',
  'Bamenda', 'Ngaoundéré', 'Kribi', 'Limbe', 'Buea',
  'Ebolowa', 'Bertoua', 'Kumba', 'Dschang', 'Foumban'
];

const SECTIONS = ['identity', 'contact', 'location', 'professional', 'experiences', 'languages'] as const;
type Section = typeof SECTIONS[number];

export default function EditProfileModal({ open, onClose, isEmployer }: EditProfileModalProps) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';
  const user = useAppSelector((state) => state.auth.user);

  // Form State
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [telephone, setTelephone] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [diplome, setDiplome] = useState('');
  const [etablissement, setEtablissement] = useState('');
  const [anneeObtention, setAnneeObtention] = useState('');
  const [ville, setVille] = useState('');
  const [bio, setBio] = useState('');
  const [quartier, setQuartier] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [recrutements, setRecrutements] = useState('');
  const [domaines, setDomaines] = useState<string[]>([]);
  const [secteur, setSecteur] = useState('');
  const [langues, setLangues] = useState<string[]>([]);
  const [hasLicense, setHasLicense] = useState(false);
  const [distanceMax, setDistanceMax] = useState(3);
  const [isAvailable, setIsAvailable] = useState(true);
  const [profileType, setProfileType] = useState('Freelance');
  const [experiences, setExperiences] = useState<any[]>([]);

  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [geolocating, setGeolocating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
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

  // Sync state with Redux when opened
  React.useEffect(() => {
    if (open && user) {
      if (isEmployer) {
        setNom(user.employer_profile?.company_name || '');
        setPrenom('');
        setTelephone(user.employer_profile?.phone || '');
        setVille(user.employer_profile?.city || 'Douala');
        setQuartier(user.employer_profile?.neighborhood || '');
        setSecteur(user.employer_profile?.industry || '');
        setLatitude(user.employer_profile?.latitude);
        setLongitude(user.employer_profile?.longitude);
        setRecrutements(user.employer_profile?.recruits_per_month || '');
        setBio(user.employer_profile?.description || '');
        setImagePreview(user.employer_profile?.logo || null);
      } else {
        setNom(user.last_name || '');
        setPrenom(user.first_name || '');
        setUsername(user.username || '');
        setTelephone(user.candidate_profile?.phone || '');
        setDateNaissance(user.candidate_profile?.date_of_birth || '');
        setVille('Douala');
        setQuartier(user.candidate_profile?.neighborhood || '');
        setLatitude(user.candidate_profile?.latitude);
        setLongitude(user.candidate_profile?.longitude);
        setBio(user.candidate_profile?.bio || '');
        setImagePreview(user.candidate_profile?.photo || null);
        setDomaines(user.candidate_profile?.skills?.map((s: any) => s.name) || []);
        setLangues(user.candidate_profile?.languages?.map((l: any) => l.name) || []);
        setHasLicense(user.candidate_profile?.has_license || false);
        setDistanceMax(user.candidate_profile?.distance_max || 3);
        setIsAvailable(user.candidate_profile?.is_available ?? true);
        setProfileType(user.candidate_profile?.profile_type || 'Freelance');
        setDiplome(user.candidate_profile?.highest_diploma || '');
        setEtablissement(user.candidate_profile?.institution || '');
        setAnneeObtention(user.candidate_profile?.graduation_year || '');
        setExperiences(
          (user.candidate_profile?.experiences || []).map((e: any) => ({
            id: String(e.id),
            titre: e.title || '',
            employeur: e.employer_name || '',
            annee: e.date || '',
          }))
        );
      }
      setEmail(user.email || '');
      setPassword('');
      setImageFile(null);
    }
  }, [open, user, isEmployer]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, { id: Date.now().toString(), titre: '', employeur: '', annee: '' }]);
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setExperiences(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeExperience = (id: string) => {
    setExperiences(prev => prev.filter(e => e.id !== id));
  };

  const handleSave = () => {
    if (!user) return;
    setLoading(true);

    const userData: any = {};
    if (email !== user.email) userData.email = email;
    if (username !== user.username && !isEmployer) userData.username = username;
    if (isEmployer) {
      if (nom !== user.employer_profile?.company_name) userData.first_name = nom;
    } else {
      if (prenom !== user.first_name) userData.first_name = prenom;
      if (nom !== user.last_name) userData.last_name = nom;
    }
    if (password) userData.password = password;

    const profileData: any = {};
    if (isEmployer) {
      profileData.company_name = nom;
      profileData.phone = telephone;
      profileData.city = ville;
      profileData.neighborhood = quartier;
      if (latitude) profileData.latitude = latitude;
      if (longitude) profileData.longitude = longitude;
      profileData.industry = secteur;
      profileData.recruits_per_month = recrutements;
      profileData.description = bio;
    } else {
      profileData.phone = telephone;
      profileData.date_of_birth = dateNaissance || null;
      profileData.highest_diploma = diplome;
      profileData.institution = etablissement;
      profileData.graduation_year = anneeObtention;
      profileData.neighborhood = quartier;
      if (latitude) profileData.latitude = latitude;
      if (longitude) profileData.longitude = longitude;
      profileData.bio = bio;
      profileData.skills = domaines;
      profileData.languages = langues;
      profileData.has_license = hasLicense;
      profileData.distance_max = distanceMax;
      profileData.is_available = isAvailable;
      profileData.profile_type = profileType;
      profileData.experiences = experiences;
    }

    dispatch(updateProfile({
      userId: user.id,
      role: isEmployer ? 'employer' : 'candidate',
      userData,
      profileData,
      profileFile: imageFile
    }))
      .unwrap()
      .then(() => {
        dispatch(showSnackbar({ message: 'Profil mis à jour avec succès !', severity: 'success' }));
        onClose();
      })
      .catch((err) => {
        dispatch(showSnackbar({ message: 'Erreur lors de la mise à jour: ' + (err.message || 'Inconnue'), severity: 'error' }));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const sectionStyle = {
    p: 2.5,
    borderRadius: '16px',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    mb: 2,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          sx: {
            borderRadius: fullScreen ? 0 : 4,
            maxWidth: '680px',
            width: '100%',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.6)' : '0 24px 48px rgba(0,0,0,0.1)',
          }
        }
      }}
    >
      {/* ─── Header ─── */}
      <DialogTitle sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography component="span" sx={{ fontWeight: 800, fontSize: '1.25rem' }}>
          {isEmployer ? 'Modifier le profil entreprise' : 'Modifier mon profil'}
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ─── Content ─── */}
      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>

          {/* Photo */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton
                  component="label"
                  size="small"
                  sx={{ bgcolor: 'primary.main', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'primary.dark' } }}
                >
                  <input hidden accept="image/*" type="file" onChange={handleImageChange} />
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              }
            >
              <Avatar
                src={imagePreview || undefined}
                sx={{ width: 88, height: 88, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: '2.5rem', fontWeight: 800 }}
              >
                {!imagePreview && (isEmployer ? <BusinessIcon sx={{ fontSize: 44 }} /> : (prenom || nom).charAt(0))}
              </Avatar>
            </Badge>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Cliquez sur l'appareil photo pour modifier la photo
            </Typography>
          </Box>

          {/* ── Section: Identité ── */}
          <Box sx={sectionStyle}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
              <PersonIcon fontSize="small" /> Informations personnelles
            </Typography>
            <Grid container spacing={2}>
              {isEmployer ? (
                <Grid size={{ xs: 12 }}>
                  <TextField label="Nom de l'entreprise" value={nom} onChange={e => setNom(e.target.value)} fullWidth variant="outlined" />
                </Grid>
              ) : (
                <>
                  <Grid size={{ xs: 12 }}>
                    <FormControl fullWidth>
                      <InputLabel>Type de profil</InputLabel>
                      <Select value={profileType} label="Type de profil" onChange={e => setProfileType(e.target.value)}>
                        {['Freelance', 'Salarié', 'Apprenti', 'Elève', 'Etudiant'].map(t => (
                          <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} fullWidth variant="outlined"
                      slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment> } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Nom" value={nom} onChange={e => setNom(e.target.value)} fullWidth variant="outlined" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField label="Nom d'utilisateur" value={username} onChange={e => setUsername(e.target.value)} fullWidth variant="outlined" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField type="date" label="Date de naissance" slotProps={{ inputLabel: { shrink: true } }} value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} fullWidth variant="outlined" />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                      control={<Switch checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} color="success" />}
                      label="Disponible pour missions"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>

          {/* ── Section: Formation ── */}
          {!isEmployer && (
            <Box sx={sectionStyle}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                <SchoolIcon fontSize="small" /> Formation
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControl fullWidth>
                    <InputLabel>Diplôme le plus élevé</InputLabel>
                    <Select value={diplome} label="Diplôme le plus élevé" onChange={e => setDiplome(e.target.value)}>
                      {['CAP', 'BEP', 'Baccalauréat', 'BTS', 'Licence', 'Master', 'Doctorat', 'Certificat professionnel', 'Sans diplôme'].map(d => (
                        <MenuItem key={d} value={d}>{d}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField label="Établissement" value={etablissement} onChange={e => setEtablissement(e.target.value)} fullWidth variant="outlined" placeholder="ex: Lycée Technique de Douala" />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField label="Année" type="number" value={anneeObtention} onChange={e => setAnneeObtention(e.target.value)} fullWidth variant="outlined" slotProps={{ htmlInput: { min: 2000, max: 2025 } }} />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ── Section: Contact & Sécurité ── */}
          <Box sx={sectionStyle}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              📞 Contact & Sécurité
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Adresse Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth variant="outlined" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Numéro de téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} fullWidth variant="outlined" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Nouveau Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Laisser vide pour ne pas modifier"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  fullWidth
                  variant="outlined"
                  helperText="Au moins 8 caractères recommandés."
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
            </Grid>
          </Box>

          {/* ── Section: Localisation ── */}
          <Box sx={sectionStyle}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
              <LocationOnIcon fontSize="small" /> Localisation
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={VILLES_CAMEROUN}
                  value={ville}
                  onChange={(_, v) => setVille(v || '')}
                  freeSolo
                  renderInput={params => <TextField {...params} label="Ville" variant="outlined" onChange={e => setVille(e.target.value)} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Quartier" value={quartier} onChange={e => setQuartier(e.target.value)} fullWidth variant="outlined" placeholder="ex: Akwa, Bonanjo…" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button
                  variant="outlined"
                  color={latitude && longitude ? "success" : "primary"}
                  startIcon={geolocating ? <CircularProgress size={20} /> : <MyLocationIcon />}
                  onClick={handleGeolocate}
                  disabled={geolocating}
                  fullWidth
                  sx={{ borderRadius: '12px', py: 1 }}
                >
                  {geolocating ? "Recherche en cours..." : latitude && longitude ? "Position enregistrée ✓" : "Me géolocaliser"}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Permet {isEmployer ? "aux candidats" : "aux recruteurs"} de voir à quelle distance vous êtes.
                </Typography>
              </Grid>
              {!isEmployer && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Rayon de déplacement: {distanceMax} km</Typography>
                  <Slider
                    value={distanceMax}
                    min={1} max={10} step={1}
                    marks={[{ value: 1, label: '1km' }, { value: 5, label: '5km' }, { value: 10, label: '10km' }]}
                    onChange={(_, v) => setDistanceMax(v as number)}
                  />
                </Grid>
              )}
            </Grid>
          </Box>

          {/* ── Section: Profil Professionnel ── */}
          <Box sx={sectionStyle}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
              <BuildIcon fontSize="small" /> Profil Professionnel
            </Typography>
            {isEmployer ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Secteur d'activité" value={secteur} onChange={e => setSecteur(e.target.value)} fullWidth variant="outlined" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Autocomplete
                    options={['1-2', '3-5', '6-10', '10+']}
                    value={recrutements}
                    onChange={(_, v) => setRecrutements(v || '')}
                    renderInput={params => <TextField {...params} label="Recrutements par mois" variant="outlined" />}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Présentation de l'entreprise"
                    value={bio} onChange={e => setBio(e.target.value)}
                    fullWidth multiline rows={3} variant="outlined"
                  />
                </Grid>
              </Grid>
            ) : (
              <>
                <Autocomplete
                  multiple
                  options={ALL_DOMAINES}
                  value={domaines}
                  onChange={(_: React.SyntheticEvent, v: string[]) => setDomaines(v)}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Domaines de compétence" placeholder="Ajouter un domaine" />
                  )}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Bio / Présentation"
                  value={bio} onChange={e => setBio(e.target.value)}
                  fullWidth multiline rows={3} variant="outlined"
                  helperText={`${bio.length}/280 caractères`}
                  slotProps={{ htmlInput: { maxLength: 280 } }}
                />
                <FormControlLabel
                  sx={{ mt: 1 }}
                  control={<Switch checked={hasLicense} onChange={e => setHasLicense(e.target.checked)} color="primary" />}
                  label="Je possède un permis de conduire"
                />
              </>
            )}
          </Box>

          {/* ── Section: Langues (candidat seulement) ── */}
          {!isEmployer && (
            <Box sx={sectionStyle}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                <TranslateIcon fontSize="small" /> Langues parlées
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {ALL_LANGUAGES.map(l => (
                  <Chip
                    key={l}
                    label={l}
                    clickable
                    onClick={() => setLangues(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])}
                    variant={langues.includes(l) ? 'filled' : 'outlined'}
                    color={langues.includes(l) ? 'secondary' : 'default'}
                    size="small"
                    sx={{ fontWeight: langues.includes(l) ? 700 : 500 }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* ── Section: Expériences (candidat seulement) ── */}
          {!isEmployer && (
            <Box sx={sectionStyle}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                <WorkHistoryIcon fontSize="small" /> Expériences professionnelles
              </Typography>
              <Stack spacing={2} sx={{ mb: 2 }}>
                {experiences.map((exp, index) => (
                  <Paper key={exp.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, position: 'relative' }}>
                    <IconButton
                      size="small"
                      onClick={() => removeExperience(exp.id)}
                      sx={{ position: 'absolute', top: 8, right: 8, color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1.5, display: 'block' }}>
                      Expérience {index + 1}
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12 }}>
                        <TextField fullWidth size="small" label="Titre du poste" value={exp.titre} onChange={e => updateExperience(exp.id, 'titre', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 8 }}>
                        <TextField fullWidth size="small" label="Employeur / Client" value={exp.employeur} onChange={e => updateExperience(exp.id, 'employeur', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 4 }}>
                        <TextField fullWidth size="small" label="Année" value={exp.annee} onChange={e => updateExperience(exp.id, 'annee', e.target.value)} />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addExperience}
                fullWidth
                sx={{ borderStyle: 'dashed', borderRadius: '10px' }}
              >
                Ajouter une expérience
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* ─── Footer ─── */}
      <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, gap: 1.5 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600, px: 3, borderRadius: '10px' }} disabled={loading}>
          Annuler
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" disabled={loading} sx={{ minWidth: 160, fontWeight: 700, px: 4, borderRadius: '10px', boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}` }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Enregistrer les modifications'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
