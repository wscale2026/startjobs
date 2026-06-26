import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, useTheme, Button, TextField, InputAdornment, Tabs, Tab, Avatar, alpha, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Divider, Stack, TablePagination, MenuItem, Select, FormControl, InputLabel, FormHelperText, CircularProgress, Menu, Autocomplete } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ChatIcon from '@mui/icons-material/Chat';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedIcon from '@mui/icons-material/Verified';
import PlaceIcon from '@mui/icons-material/Place';
import StarIcon from '@mui/icons-material/Star';
import BusinessIcon from '@mui/icons-material/Business';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import BadgeIcon from '@mui/icons-material/Badge';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SchoolIcon from '@mui/icons-material/School';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import api, { fetcher } from '../utils/api';
import useSWR from 'swr';

// Utility: generate a random password
function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#!';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Utility: generate username from first + last name
function generateUsername(prenom: string, nom: string): string {
  const base = (prenom.trim().toLowerCase().replace(/\s+/g, '') + nom.trim().toLowerCase().replace(/\s+/g, '')).substring(0, 14);
  const suffix = Math.floor(100 + Math.random() * 900);
  return base + suffix;
}

export default function AdminUsersPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const LOCATIONS = useAppSelector(state => state.locationsGlobal.locations);
  const CITIES = Object.keys(LOCATIONS);
  const [tabIndex, setTabIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [addCandidateOpen, setAddCandidateOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editCandidateOpen, setEditCandidateOpen] = useState(false);
  const [editAdminOpen, setEditAdminOpen] = useState(false);
  const [candidateFormLoading, setCandidateFormLoading] = useState(false);
  const [adminForm, setAdminForm] = useState({ nom: '', email: '', phone: '', password: '', role: 'moderator' });
  const { data: rawUsers, error, mutate: fetchUsers } = useSWR('/users/', fetcher);

  const allUsers = React.useMemo(() => {
    if (!rawUsers) return [];
    const formatted = rawUsers.map((u: any) => {
      let profile = u.candidate_profile;
      if (u.role === 'employer') profile = u.employer_profile;
      if (['admin', 'super_admin', 'moderator'].includes(u.role)) profile = u.admin_profile;

      const candidateProfile = u.role === 'candidate' ? u.candidate_profile : null;

      return {
        id: String(u.id),
        nom: [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.username,
        prenom: u.first_name || '',
        nom_famille: u.last_name || '',
        role: u.role,
        email: u.email,
        phone: profile?.phone || '',
        statut: profile?.statut || (u.is_active ? 'Actif' : 'Inactif'),
        online: false,
        date: new Date(u.date_joined).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        rawDate: new Date(u.date_joined),
        avatar: u.username ? u.username[0].toUpperCase() : 'U',
        offresTotal: profile?.offresTotal || 0,
        username: u.username,
        generatedPassword: profile?.generated_password || '',
        neighborhood: profile?.neighborhood || '',
        companyName: profile?.company_name || '',
        city: profile?.city || '',
        industry: profile?.industry || '',
        address: profile?.address || '',
        description: profile?.description || '',
        recruitsPerMonth: profile?.recruits_per_month || '',
        verificationRequested: profile?.verification_requested || false,
        // ── Candidate-specific fields ──────────────────
        bio: candidateProfile?.bio || '',
        photo: candidateProfile?.photo || null,
        profileType: candidateProfile?.profile_type || '',
        skills: candidateProfile?.skills || [],
        languages: candidateProfile?.languages || [],
        experiences: candidateProfile?.experiences || [],
        score: candidateProfile?.score || 0,
        totalMissions: candidateProfile?.total_missions || 0,
        isAvailable: candidateProfile?.is_available ?? true,
        hasLicense: candidateProfile?.has_license ?? false,
        profileViews: candidateProfile?.profile_views || 0,
        distanceMax: candidateProfile?.distance_max || 10,
        dateOfBirth: candidateProfile?.date_of_birth || '',
        highestDiploma: candidateProfile?.highest_diploma || '',
        institution: candidateProfile?.institution || '',
        graduationYear: candidateProfile?.graduation_year || '',
      };
    });

    formatted.sort((a: any, b: any) => b.rawDate.getTime() - a.rawDate.getTime());
    return formatted;
  }, [rawUsers]);

  const loading = !rawUsers && !error;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [toggleBadgeUser, setToggleBadgeUser] = useState<any>(null);
  const [isTogglingBadge, setIsTogglingBadge] = useState(false);

  // Candidate form state
  const [candForm, setCandForm] = useState({
    prenom: '', nom: '', email: '', phone: '', dateNaissance: '', diplome: '', etablissement: '', anneeObtention: '',
    ville: '', quartier: '', typeProfil: 'Freelance',
    username: '', password: '', bio: '',
  });

  const generateCandidateCredentials = () => {
    const pwd = generatePassword();
    const uname = generateUsername(candForm.prenom, candForm.nom);
    setCandForm(prev => ({ ...prev, username: uname, password: pwd }));
  };

  const handleCreateCandidate = async () => {
    if (!candForm.prenom || !candForm.nom || !candForm.email || !candForm.username || !candForm.password) {
      dispatch(showSnackbar({ message: 'Veuillez remplir tous les champs obligatoires.', severity: 'warning' }));
      return;
    }
    setCandidateFormLoading(true);
    try {
      const res = await api.post('register/', {
        username: candForm.username,
        email: candForm.email,
        password: candForm.password,
        first_name: candForm.prenom,
        last_name: candForm.nom,
        role: 'candidate',
      });
      const newUserId = res.data.id;
      // Save profile details using the admin endpoint
      await api.patch(`admin/update-user/${newUserId}/`, {
        profile: {
          generated_password: candForm.password,
          phone: candForm.phone,
          ville: candForm.ville,
          quartier: candForm.quartier
        }
      });

      const newUser = {
        id: String(newUserId),
        nom: `${candForm.prenom} ${candForm.nom}`,
        role: 'candidate',
        email: candForm.email,
        phone: candForm.phone,
        statut: 'Nouveau',
        online: false,
        date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        avatar: candForm.prenom[0]?.toUpperCase() || 'C',
        offresTotal: 0,
        username: candForm.username,
        generatedPassword: candForm.password,
      };
      fetchUsers();
      setCreatedCredentials({ username: candForm.username, password: candForm.password });
      setCandidateFormLoading(false);
    } catch (err: any) {
      setCandidateFormLoading(false);
      dispatch(showSnackbar({ message: 'Erreur: ' + (err.response?.data?.username?.[0] || err.message || 'Création échouée'), severity: 'error' }));
    }
  };

  const handleUpdateCandidate = async () => {
    if (!candForm.prenom || !candForm.nom || !candForm.email || !candForm.username) {
      dispatch(showSnackbar({ message: 'Veuillez remplir tous les champs obligatoires.', severity: 'warning' }));
      return;
    }
    setCandidateFormLoading(true);
    try {
      const payload: any = {
        username: candForm.username,
        email: candForm.email,
        first_name: candForm.prenom,
        last_name: candForm.nom,
        profile: {
          phone: candForm.phone,
          ville: candForm.ville,
          quartier: candForm.quartier,
          bio: candForm.bio,
          profile_type: candForm.typeProfil,
          date_of_birth: candForm.dateNaissance || null,
          highest_diploma: candForm.diplome || '',
          institution: candForm.etablissement || '',
          graduation_year: candForm.anneeObtention || '',
        }
      };
      if (candForm.password) {
        payload.password = candForm.password;
        payload.profile.generated_password = candForm.password;
      }
      await api.patch(`/admin/update-user/${selectedUser.id}/`, payload);

      dispatch(showSnackbar({ message: 'Candidat modifié avec succès', severity: 'success' }));
      setEditCandidateOpen(false);
      fetchUsers();
    } catch (err: any) {
      dispatch(showSnackbar({ message: 'Erreur lors de la modification', severity: 'error' }));
    } finally {
      setCandidateFormLoading(false);
    }
  };

  const handleUpdateAdmin = async () => {
    if (!adminForm.nom || !adminForm.email) {
      dispatch(showSnackbar({ message: 'Veuillez remplir tous les champs obligatoires.', severity: 'warning' }));
      return;
    }
    setCandidateFormLoading(true);
    try {
      await api.patch(`/admin/update-user/${selectedUser.id}/`, {
        email: adminForm.email,
        password: adminForm.password || undefined,
        first_name: adminForm.nom.split(' ')[0],
        last_name: adminForm.nom.split(' ').slice(1).join(' ') || '',
        role: adminForm.role,
        profile: {
          phone: adminForm.phone,
          generated_password: adminForm.password || undefined
        }
      });

      dispatch(showSnackbar({ message: 'Administrateur modifié avec succès', severity: 'success' }));
      setEditAdminOpen(false);
      fetchUsers();
    } catch (err: any) {
      dispatch(showSnackbar({ message: 'Erreur lors de la modification', severity: 'error' }));
    } finally {
      setCandidateFormLoading(false);
    }
  };

  const copyCredentials = (username: string, password: string) => {
    const text = `Identifiants StartJobs\nNom d'utilisateur: ${username}\nMot de passe: ${password}`;
    navigator.clipboard.writeText(text).then(() => {
      dispatch(showSnackbar({ message: 'Identifiants copiés dans le presse-papiers !', severity: 'success' }));
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: any) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  const handleWhatsApp = (user: any) => {
    handleMenuClose();
    if (!user.phone) {
      dispatch(showSnackbar({ message: 'Aucun numéro de téléphone pour cet utilisateur.', severity: 'warning' }));
      return;
    }

    const isAdmin = ['admin', 'super_admin', 'moderator'].includes(user.role);
    let roleDisplay = "Administrateur";
    if (user.role === 'super_admin') roleDisplay = "Super Administrateur";
    if (user.role === 'moderator') roleDisplay = "Modérateur";

    const message = isAdmin
      ? `Bonjour ${user.nom}, \n\nVotre accès ${roleDisplay} a été créé ou réinitialisé avec succès par l'administration. Voici vos identifiants pour vous connecter au back-office :\n\nE-mail : ${user.email}\nMot de passe : ${user.generatedPassword || '(Modifiez votre mot de passe à la première connexion)'}\n\nÀ très bientôt !`
      : `Bienvenue sur StartJobs\n«Trouver un travail Facilement dans les villes de Douala et Yaoundé»\n\nVous êtes bien enregistré, utilisez vos identifiants pour vous connecter\n\nNom d'utilisateur : ${user.username}\nMot de passe : ${user.generatedPassword || '****'}\n\nLiens de connexion : ${window.location.origin}/login`;

    // Nettoyer le numéro
    let phoneStr = user.phone.replace(/[^0-9]/g, '');
    if (phoneStr.length === 9) phoneStr = '237' + phoneStr;

    window.open(`https://wa.me/${phoneStr}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmail = async (user: any) => {
    handleMenuClose();
    if (!user.email) {
      dispatch(showSnackbar({ message: 'Cet utilisateur n\'a pas d\'adresse email.', severity: 'warning' }));
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await api.post('/admin/send-credentials/', { user_id: user.id });
      dispatch(showSnackbar({ message: res.data.message || 'Email envoyé avec succès !', severity: 'success' }));
    } catch (err: any) {
      dispatch(showSnackbar({ message: err.response?.data?.error || 'Erreur lors de l\'envoi de l\'email.', severity: 'error' }));
    } finally {
      setIsSendingEmail(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    
    // Optimistic UI Update: Retirer immédiatement l'utilisateur de l'affichage
    const prevUsers = rawUsers;
    const optimisticData = rawUsers?.filter((u: any) => String(u.id) !== String(deleteTarget.id));
    fetchUsers(optimisticData, { revalidate: false });

    try {
      await api.delete(`users/${deleteTarget.id}/`);
      dispatch(showSnackbar({ message: 'Utilisateur supprimé avec succès.', severity: 'success' }));
    } catch (err) {
      // Revenir à l'état précédent en cas d'erreur
      fetchUsers(prevUsers, { revalidate: false });
      dispatch(showSnackbar({ message: 'Erreur lors de la suppression.', severity: 'error' }));
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
      setDeleteConfirmText('');
      // Synchroniser avec le serveur en arrière-plan
      fetchUsers();
    }
  };

  const handleToggleBadge = async () => {
    if (!toggleBadgeUser) return;
    setIsTogglingBadge(true);
    try {
      const isVerified = toggleBadgeUser.statut === 'Vérifié';
      await api.patch(`/admin/update-user/${toggleBadgeUser.id}/`, {
        profile: { verified: !isVerified, verification_requested: false }
      });
      dispatch(showSnackbar({ message: `Badge ${isVerified ? 'désactivé' : 'activé'} avec succès`, severity: 'success' }));
      setToggleBadgeUser(null);
      fetchUsers();
    } catch (err) {
      dispatch(showSnackbar({ message: 'Erreur lors de la modification du badge', severity: 'error' }));
    } finally {
      setIsTogglingBadge(false);
    }
  };

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    setPage(0);
  };

  const getRoleFilter = () => {
    if (tabIndex === 0) return ['candidate'];
    if (tabIndex === 1) return ['employer'];
    return ['admin', 'super_admin', 'moderator'];
  };

  const isEmployerTab = tabIndex === 1;
  const isCandidateTab = tabIndex === 0;

  const filteredUsers = allUsers.filter((u: any) => {
    const roleMatch = getRoleFilter().includes(u.role);
    const s = search.toLowerCase();
    const nomStr = (u.nom || '').toLowerCase();
    const emailStr = (u.email || '').toLowerCase();
    const phoneStr = u.phone || '';

    return roleMatch && (nomStr.includes(s) || emailStr.includes(s) || phoneStr.includes(search));
  });

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Utilisateurs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez tous les acteurs de la plateforme
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {tabIndex === 0 && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => { setCreatedCredentials(null); setCandForm({ prenom: '', nom: '', email: '', phone: '', dateNaissance: '', diplome: '', etablissement: '', anneeObtention: '', ville: '', quartier: '', typeProfil: 'Freelance', username: '', password: '', bio: '' }); setAddCandidateOpen(true); }}
              sx={{ borderRadius: '12px', fontWeight: 700, px: 3, boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.3)}`, bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
            >
              Nouveau Candidat
            </Button>
          )}
          {tabIndex === 2 && (
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setAddAdminOpen(true)}
              sx={{ borderRadius: '12px', fontWeight: 700, px: 3, boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}` }}
            >
              Nouvel Admin
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '1.05rem', minWidth: 120 }
          }}
        >
          <Tab label="Jeunes (Candidats)" />
          <Tab label="Employeurs" />
          <Tab label="Administrateurs" />
        </Tabs>

        <TextField
          placeholder="Nom, Email, Téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: { xs: '100%', md: 320 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>, sx: { borderRadius: '12px', bgcolor: 'background.paper' } } }}
        />
      </Box>

      <Paper sx={{ borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.05)}`, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.divider, 0.5) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Utilisateur</TableCell>
                {isCandidateTab && <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Nom d'utilisateur</TableCell>}
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Téléphone</TableCell>
                {isEmployerTab && <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Offres postées</TableCell>}
                {tabIndex === 2 && <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Rôle</TableCell>}
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Date d'inscription</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Activité</TableCell>
                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Statut</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', py: 2 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((row: any) => (
                <TableRow
                  key={row.id}
                  component={motion.tr}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main, fontWeight: 700 }}>
                        {row.avatar}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{row.nom}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {isCandidateTab && (
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{(row as any).username || '—'}</Typography>
                        {(row as any).generatedPassword && (
                          <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>••••••••</Typography>
                        )}
                      </Box>
                    </TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{row.phone || '—'}</TableCell>

                  {isEmployerTab && (
                    <TableCell>
                      <Chip label={`${row.offresTotal} offres`} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: '6px' }} />
                    </TableCell>
                  )}

                  {tabIndex === 2 && (
                    <TableCell>
                      <Chip
                        label={row.role === 'super_admin' ? 'Super Admin' : row.role === 'admin' ? 'Administrateur' : 'Modérateur'}
                        size="small"
                        color={row.role === 'super_admin' ? 'error' : row.role === 'admin' ? 'primary' : 'warning'}
                        variant="outlined"
                        sx={{ fontWeight: 700, borderRadius: '6px' }}
                      />
                    </TableCell>
                  )}

                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>{row.date}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: row.online ? theme.palette.success.main : theme.palette.text.disabled, boxShadow: row.online ? `0 0 10px ${theme.palette.success.main}` : 'none' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: row.online ? 'success.main' : 'text.secondary' }}>
                        {row.online ? 'En ligne' : 'Hors ligne'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {row.role === 'employer' && row.verificationRequested ? (
                      <Chip
                        size="small"
                        label="Demande Badge"
                        color="warning"
                        variant="filled"
                        sx={{ fontWeight: 700, borderRadius: '8px' }}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label={row.statut}
                        icon={row.statut === 'Vérifié' || row.statut === 'Actif' ? <CheckCircleIcon /> : <CancelIcon />}
                        color={row.statut === 'Actif' || row.statut === 'Vérifié' ? 'success' : 'default'}
                        variant={row.statut === 'Actif' || row.statut === 'Vérifié' ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 700, borderRadius: '8px' }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600 }}>Aucun utilisateur trouvé.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          labelRowsPerPage="Utilisateurs par page:"
        />
      </Paper>

      {/* Dialog Profil Utilisateur */}
      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': { borderRadius: '24px', p: 1 }
        }}
      >
        {selectedUser && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography variant="h5" component="span" sx={{ fontWeight: 900 }}>Dossier Utilisateur</Typography>
              <IconButton onClick={() => setSelectedUser(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ borderBottom: 'none', p: 0, bgcolor: 'background.default' }}>
              {selectedUser.role === 'candidate' ? (
                <Box sx={{ bgcolor: 'background.paper' }}>
                  {/* ── HEADER CANDIDAT ── */}
                  <Box sx={{ p: { xs: 2.5, md: 3 }, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.07)}, ${alpha(theme.palette.secondary.main, 0.04)})`, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <Avatar
                        src={selectedUser.photo || undefined}
                        sx={{ width: 80, height: 80, bgcolor: theme.palette.primary.main, fontSize: '2rem', fontWeight: 700, borderRadius: '16px', flexShrink: 0, border: `3px solid ${alpha(theme.palette.primary.main, 0.3)}` }}
                      >
                        {!selectedUser.photo && selectedUser.avatar}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.25 }}>{selectedUser.nom}</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          {selectedUser.profileType && <Chip label={selectedUser.profileType} size="small" color="primary" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />}
                          <Chip label={selectedUser.isAvailable ? 'Disponible' : 'Indisponible'} size="small" color={selectedUser.isAvailable ? 'success' : 'default'} sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                          {selectedUser.hasLicense && <Chip label="Permis ✓" size="small" color="info" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          📅 Inscrit le {selectedUser.date} · @{selectedUser.username}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 64 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: alpha('#F59E0B', 0.12), borderRadius: '8px', px: 1.5, py: 0.5 }}>
                          <StarIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                          <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#92400E' }}>{selectedUser.score || '0'}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Score</Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                    {/* ── STATISTIQUES ── */}
                    <Grid container spacing={1.5}>
                      {[
                        { label: 'Missions', value: selectedUser.totalMissions },
                        { label: 'Vues profil', value: selectedUser.profileViews },
                        { label: 'Rayon max', value: `${selectedUser.distanceMax} km` },
                      ].map(s => (
                        <Grid size={{ xs: 4 }} key={s.label}>
                          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '10px', textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>{s.value}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{s.label}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>

                    {/* ── BIO ── */}
                    {selectedUser.bio && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Biographie</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7, p: 1.5, borderRadius: '10px', bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${theme.palette.divider}` }}>
                          {selectedUser.bio}
                        </Typography>
                      </Box>
                    )}

                    {/* ── CONTACT & LOCALISATION ── */}
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', mb: 1.5 }}>📋 Contact & Localisation</Typography>
                      <Stack spacing={1.5}>
                        {selectedUser.dateOfBirth && (
                          <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><BadgeIcon sx={{ fontSize: 15, color: 'text.disabled' }} /><Typography variant="body2" color="text.secondary">Date de naissance</Typography></Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(selectedUser.dateOfBirth).toLocaleDateString('fr-FR')}</Typography>
                            </Box>
                            <Divider />
                          </>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><MailIcon sx={{ fontSize: 15, color: 'text.disabled' }} /><Typography variant="body2" color="text.secondary">Email</Typography></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.email}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><PhoneIcon sx={{ fontSize: 15, color: 'text.disabled' }} /><Typography variant="body2" color="text.secondary">Téléphone</Typography></Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.phone || 'Non renseigné'}</Typography>
                        </Box>
                        {selectedUser.neighborhood && (
                          <>
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><PlaceIcon sx={{ fontSize: 15, color: 'text.disabled' }} /><Typography variant="body2" color="text.secondary">Quartier</Typography></Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.neighborhood}</Typography>
                            </Box>
                          </>
                        )}
                      </Stack>
                    </Paper>

                    {/* ── FORMATION ── */}
                    {selectedUser.role === 'candidate' && (
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px' }}>
                        <Typography variant="caption" color="primary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', mb: 1.5 }}>🎓 Formation</Typography>
                        <Stack spacing={1.5}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">Diplôme le plus élevé</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.highestDiploma || 'Non renseigné'}</Typography>
                          </Box>
                          <Divider />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">Établissement</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.institution || 'Non renseigné'}</Typography>
                          </Box>
                          <Divider />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">Année d'obtention</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.graduationYear || 'Non renseignée'}</Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    )}

                    {/* ── COMPÉTENCES ── */}
                    {selectedUser.skills?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', mb: 1 }}>🛠 Compétences ({selectedUser.skills.length})</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {selectedUser.skills.map((s: any) => (
                            <Chip key={s.id} label={s.name} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* ── LANGUES ── */}
                    {selectedUser.languages?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', mb: 1 }}>🌍 Langues</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {selectedUser.languages.map((l: any) => (
                            <Chip key={l.id} label={l.name} size="small" color="secondary" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* ── EXPÉRIENCES ── */}
                    {selectedUser.experiences?.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', mb: 1 }}>💼 Expériences ({selectedUser.experiences.length})</Typography>
                        <Stack spacing={1}>
                          {selectedUser.experiences.map((exp: any) => (
                            <Paper key={exp.id} variant="outlined" sx={{ p: 1.5, borderRadius: '10px' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{exp.title}</Typography>
                                  <Typography variant="caption" color="text.secondary">{exp.employer_name} · {exp.date}</Typography>
                                </Box>
                                <Chip label={exp.exp_type === 'verified' ? 'Vérifiée' : 'Déclarée'} size="small" color={exp.exp_type === 'verified' ? 'success' : 'default'} sx={{ fontSize: '0.65rem', fontWeight: 700 }} />
                              </Box>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* ── IDENTIFIANTS ── */}
                    {selectedUser.username && (
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(theme.palette.secondary.main, 0.04), border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em' }}>🔑 Identifiants</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', mt: 0.5 }}>Nom d'utilisateur : {selectedUser.username}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>Mot de passe : {selectedUser.generatedPassword || '••••••••'}</Typography>
                          </Box>
                          <IconButton size="small" color="secondary" onClick={() => copyCredentials(selectedUser.username, selectedUser.generatedPassword || '')}>
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                </Box>
              ) : selectedUser.role === 'employer' ? (
                <Box sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: 'background.paper' }}>
                  <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', mb: 2 }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: theme.palette.primary.main, color: 'white', borderRadius: '16px' }}>
                      <BusinessIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{selectedUser.companyName || selectedUser.nom}</Typography>
                        {selectedUser.statut === 'Vérifié' && <VerifiedIcon sx={{ color: 'secondary.main', fontSize: 18 }} />}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PlaceIcon sx={{ fontSize: 16 }} />
                        {selectedUser.city ? `${selectedUser.city}${selectedUser.neighborhood ? ` · ${selectedUser.neighborhood}` : ''}` : 'Localisation non renseignée'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={selectedUser.statut === 'Vérifié' ? 'Employeur Vérifié' : 'Non Vérifié'} size="small" color={selectedUser.statut === 'Vérifié' ? 'primary' : 'default'} sx={{ fontWeight: 600, height: 20, fontSize: '0.7rem' }} />
                        {selectedUser.industry && <Chip label={selectedUser.industry} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600, height: 20, fontSize: '0.7rem' }} />}
                      </Box>
                      {selectedUser.verificationRequested && (
                        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}` }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'warning.dark', mb: 1 }}>Cet employeur a demandé le badge Vérifié</Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '6px' }}
                              onClick={async () => {
                                try {
                                  await api.patch(`/admin/update-user/${selectedUser.id}/`, {
                                    profile: { verified: true, verification_requested: false }
                                  });
                                  dispatch(showSnackbar({ message: 'Badge accordé avec succès', severity: 'success' }));
                                  fetchUsers();
                                  setSelectedUser(null);
                                } catch (e) {
                                  dispatch(showSnackbar({ message: 'Erreur lors de la validation', severity: 'error' }));
                                }
                              }}
                            >
                              Accorder
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              sx={{ fontWeight: 700, textTransform: 'none', borderRadius: '6px' }}
                              onClick={async () => {
                                try {
                                  await api.patch(`/admin/update-user/${selectedUser.id}/`, {
                                    profile: { verified: false, verification_requested: false }
                                  });
                                  dispatch(showSnackbar({ message: 'Demande refusée', severity: 'info' }));
                                  fetchUsers();
                                  setSelectedUser(null);
                                } catch (e) {
                                  dispatch(showSnackbar({ message: 'Erreur', severity: 'error' }));
                                }
                              }}
                            >
                              Refuser
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
                    {selectedUser.description || `Entreprise partenaire inscrite depuis le ${selectedUser.date}.`}
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Contact Email</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Téléphone Pro</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.phone || 'Non renseigné'}</Typography>
                      </Box>
                      {selectedUser.address && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Adresse</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{selectedUser.address}</Typography>
                        </Box>
                      )}
                      {selectedUser.recruitsPerMonth && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Besoins de recrutement</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.recruitsPerMonth} pers/mois</Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                        <Typography variant="body2" color="text.secondary">Volume de recrutement (Total)</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.offresTotal} annonces publiées</Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  {selectedUser.username && (
                    <Paper variant="outlined" sx={{ p: 2, mt: 3, borderRadius: '12px', bgcolor: alpha(theme.palette.secondary.main, 0.05), border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 700 }}>🔑 Identifiants d'accès</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>Nom d'utilisateur: {selectedUser.username}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>Mot de passe: {selectedUser.generatedPassword || '••••••••'}</Typography>
                        </Box>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => copyCredentials(selectedUser.username, selectedUser.generatedPassword || '')}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  )}
                </Box>
              ) : (
                <Box sx={{ p: { xs: 2.5, md: 3.5 }, bgcolor: 'background.paper' }}>
                  <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', mb: 3 }}>
                    <Avatar sx={{ width: 80, height: 80, bgcolor: selectedUser.role === 'super_admin' ? 'error.main' : (selectedUser.role === 'admin' ? 'primary.main' : 'warning.main'), color: 'white', borderRadius: '16px', fontSize: '2rem', fontWeight: 800 }}>
                      {selectedUser.avatar}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{selectedUser.nom}</Typography>
                      <Chip
                        label={selectedUser.role === 'super_admin' ? 'Super Admin' : selectedUser.role === 'admin' ? 'Administrateur' : 'Modérateur'}
                        size="small"
                        color={selectedUser.role === 'super_admin' ? 'error' : selectedUser.role === 'admin' ? 'primary' : 'warning'}
                        sx={{ fontWeight: 700, borderRadius: '6px' }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Membre de l'équipe de gestion depuis le {selectedUser.date}.
                      </Typography>
                    </Box>
                  </Box>
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Contact Email</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">Téléphone</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedUser.phone || 'Non renseigné'}</Typography>
                      </Box>
                      {selectedUser.generatedPassword && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">Mot de passe temporaire</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{selectedUser.generatedPassword}</Typography>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => copyCredentials(selectedUser.username, selectedUser.generatedPassword || '')}
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
              <Button
                onClick={async () => {
                  if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${selectedUser?.nom} ? Cette action est irréversible.`)) {
                    try {
                      await api.delete(`users/${selectedUser?.id}/`);
                      fetchUsers();
                      setSelectedUser(null);
                      dispatch(showSnackbar({ message: 'Utilisateur supprimé avec succès.', severity: 'success' }));
                    } catch (err) {
                      dispatch(showSnackbar({ message: 'Erreur lors de la suppression de l\'utilisateur.', severity: 'error' }));
                    }
                  }
                }}
                variant="outlined"
                color="error"
                sx={{ borderRadius: '12px', fontWeight: 700 }}
              >
                Supprimer
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={() => setSelectedUser(null)} variant="outlined" color="inherit" sx={{ borderRadius: '12px', fontWeight: 700 }}>
                Fermer
              </Button>
              <Button
                onClick={async () => {
                  const targetUserId = selectedUser.id;
                  setSelectedUser(null);
                  try {
                    const res = await api.post('conversations/', { participants: [targetUserId] });
                    navigate('/admin/messages', { state: { openChatId: String(res.data.id) } });
                  } catch (err) {
                    dispatch(showSnackbar({ message: 'Erreur lors du démarrage de la discussion', severity: 'error' }));
                  }
                }}
                variant="contained"
                startIcon={<ChatIcon />}
                sx={{ borderRadius: '12px', fontWeight: 700, boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}` }}
              >
                Envoyer un message
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ════════ Dialog Ajouter Administrateur ════════ */}
      <Dialog
        open={addAdminOpen || editAdminOpen}
        onClose={() => { setAddAdminOpen(false); setEditAdminOpen(false); }}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: { xs: '20px', sm: '24px' }, p: { xs: 0.5, sm: 1 }, mx: { xs: 1.5 } } }}
      >
        {/* Header */}
        <DialogTitle sx={{ p: { xs: 2.5, sm: 3 }, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha(theme.palette.primary.main, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AdminPanelSettingsIcon sx={{ color: 'primary.main', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {editAdminOpen ? "Modifier l'Administrateur" : "Nouvel Administrateur"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {editAdminOpen ? "Mettre à jour les informations d'accès" : "Créer un accès administrateur sécurisé"}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => { setAddAdminOpen(false); setEditAdminOpen(false); }} size="small" sx={{ bgcolor: alpha(theme.palette.text.secondary, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            {/* Nom complet */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Nom complet"
                fullWidth
                placeholder="Ex : Jean-Paul Mbarga"
                value={adminForm.nom}
                onChange={e => setAdminForm({ ...adminForm, nom: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Avatar sx={{ width: 22, height: 22, fontSize: '0.65rem', bgcolor: 'primary.main' }}>{adminForm.nom?.[0]?.toUpperCase() || '?'}</Avatar></InputAdornment> } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Adresse email"
                type="email"
                fullWidth
                placeholder="admin@startjobs.cm"
                value={adminForm.email}
                onChange={e => setAdminForm({ ...adminForm, email: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            {/* Téléphone */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Téléphone (optionnel)"
                fullWidth
                placeholder="+237 6XX XX XX XX"
                value={adminForm.phone}
                onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            {/* Rôle */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={adminForm.role}
                  label="Rôle"
                  onChange={e => setAdminForm({ ...adminForm, role: e.target.value })}
                  startAdornment={<InputAdornment position="start"><VpnKeyIcon sx={{ fontSize: 18, color: 'text.secondary', ml: 1, mr: -0.5 }} /></InputAdornment>}
                >
                  <MenuItem value="moderator">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip size="small" label="Modérateur" color="info" variant="outlined" sx={{ fontWeight: 700, borderRadius: '6px', height: 22 }} />
                      <Typography variant="caption" color="text.secondary">Accès limité</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="admin">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip size="small" label="Administrateur" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: '6px', height: 22 }} />
                      <Typography variant="caption" color="text.secondary">Accès complet</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="super_admin">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip size="small" label="Super Admin" color="error" variant="outlined" sx={{ fontWeight: 700, borderRadius: '6px', height: 22 }} />
                      <Typography variant="caption" color="text.secondary">Tous les droits</Typography>
                    </Box>
                  </MenuItem>
                </Select>
                <FormHelperText>Définit les droits d'accès à l'interface</FormHelperText>
              </FormControl>
            </Grid>

            {/* Mot de passe */}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Mot de passe temporaire"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                placeholder="Min. 8 caractères"
                value={adminForm.password}
                onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                helperText="L'administrateur devra changer ce mot de passe à sa première connexion."
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOffIcon sx={{ fontSize: 18 }} /> : <VisibilityIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>

            {/* Info box */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(theme.palette.warning.main, 0.08), border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <AdminPanelSettingsIcon sx={{ color: 'warning.main', mt: 0.1, flexShrink: 0 }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.dark', display: 'block' }}>Accès administrateur</Typography>
                  <Typography variant="caption" color="text.secondary">Cet utilisateur aura accès au panneau d'administration. Assurez-vous de faire confiance à cette personne avant de lui accorder des droits.</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2.5, sm: 3 }, pb: { xs: 2.5, sm: 3 }, pt: 1, gap: 1.5, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
          <Button
            onClick={() => { setAddAdminOpen(false); setEditAdminOpen(false); setAdminForm({ nom: '', email: '', phone: '', password: '', role: 'moderator' }); }}
            variant="outlined"
            color="inherit"
            fullWidth
            sx={{ borderRadius: '12px', fontWeight: 700, py: 1.2 }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            startIcon={candidateFormLoading ? <CircularProgress size={20} color="inherit" /> : (editAdminOpen ? <AutoFixHighIcon /> : <PersonAddIcon />)}
            fullWidth
            disabled={!adminForm.nom || !adminForm.email || !adminForm.password || candidateFormLoading}
            onClick={async () => {
              if (editAdminOpen) {
                await handleUpdateAdmin();
                return;
              }
              setCandidateFormLoading(true);
              try {
                // Determine username from email or name
                const baseUsername = adminForm.email.split('@')[0] || adminForm.nom.split(' ')[0].toLowerCase();
                const username = baseUsername.replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000);

                const res = await api.post('register/', {
                  username: username,
                  email: adminForm.email,
                  password: adminForm.password,
                  first_name: adminForm.nom.split(' ')[0],
                  last_name: adminForm.nom.split(' ').slice(1).join(' ') || '',
                  role: adminForm.role,
                });

                const newUserId = res.data.id;
                await api.patch(`admin/update-user/${newUserId}/`, {
                  profile: {
                    generated_password: adminForm.password,
                    phone: adminForm.phone
                  }
                });

                const newAdmin = {
                  id: String(newUserId),
                  nom: adminForm.nom,
                  role: adminForm.role,
                  email: adminForm.email,
                  phone: adminForm.phone,
                  statut: 'Actif',
                  online: false,
                  date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
                  avatar: adminForm.nom[0]?.toUpperCase() || 'A',
                  offresTotal: 0,
                  username: username,
                  generatedPassword: adminForm.password,
                };

                fetchUsers();
                setCreatedCredentials({ username, password: adminForm.password });
                setAddAdminOpen(false);
                setAdminForm({ nom: '', email: '', phone: '', password: '', role: 'moderator' });
                dispatch(showSnackbar({ message: 'Administrateur créé avec succès', severity: 'success' }));
              } catch (err: any) {
                dispatch(showSnackbar({ message: err.response?.data?.error || 'Erreur lors de la création de l\'administrateur', severity: 'error' }));
              } finally {
                setCandidateFormLoading(false);
              }
            }}
            sx={{ borderRadius: '12px', fontWeight: 800, py: 1.2, boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}` }}
          >
            {candidateFormLoading ? 'Enregistrement...' : (editAdminOpen ? 'Enregistrer les modifications' : 'Créer l\'administrateur')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════════ Dialog Créer un Candidat ════════ */}
      <Dialog
        open={addCandidateOpen}
        onClose={() => { if (!candidateFormLoading) setAddCandidateOpen(false); }}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: { xs: '20px', sm: '24px' }, p: { xs: 0.5, sm: 1 }, mx: { xs: 1.5 } } }}
      >
        <DialogTitle sx={{ p: { xs: 2.5, sm: 3 }, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: alpha(theme.palette.secondary.main, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PersonAddIcon sx={{ color: 'secondary.main', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Nouveau Candidat</Typography>
                <Typography variant="caption" color="text.secondary">Créer un compte candidat depuis l'administration</Typography>
              </Box>
            </Box>
            {!createdCredentials && (
              <IconButton onClick={() => setAddCandidateOpen(false)} size="small" sx={{ bgcolor: alpha(theme.palette.text.secondary, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {/* ─── Success: credentials display ─── */}
          {createdCredentials ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: alpha(theme.palette.success.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Compte créé avec succès !</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Partagez ces identifiants au candidat. Ils pourront les modifier après connexion.
              </Typography>

              <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: `2px dashed ${theme.palette.secondary.main}`, bgcolor: alpha(theme.palette.secondary.main, 0.04), mb: 2 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nom d'utilisateur</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'secondary.main' }}>{createdCredentials.username}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mot de passe temporaire</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main', letterSpacing: '0.1em' }}>{createdCredentials.password}</Typography>
                  </Box>
                </Stack>
              </Paper>

              <Button
                variant="contained"
                fullWidth
                startIcon={<ContentCopyIcon />}
                onClick={() => copyCredentials(createdCredentials.username, createdCredentials.password)}
                sx={{ borderRadius: '12px', fontWeight: 700, py: 1.4, mb: 1.5, boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.35)}`, bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}
              >
                Copier les identifiants
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setAddCandidateOpen(false)}
                sx={{ borderRadius: '12px', fontWeight: 600 }}
              >
                Fermer
              </Button>
            </Box>
          ) : (
            /* ─── Candidate creation form ─── */
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              {/* Type de profil */}
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                  <InputLabel>Type de profil *</InputLabel>
                  <Select
                    value={candForm.typeProfil}
                    label="Type de profil *"
                    onChange={e => setCandForm({ ...candForm, typeProfil: e.target.value })}
                  >
                    {['Freelance', 'Salarié', 'Apprenti', 'Elève', 'Etudiant'].map(t => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Nom + Prénom */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Nom *" fullWidth placeholder="Ex : Mbarga"
                  value={candForm.nom}
                  onChange={e => setCandForm({ ...candForm, nom: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Prénom *" fullWidth placeholder="Ex : Jean-Paul"
                  value={candForm.prenom}
                  onChange={e => setCandForm({ ...candForm, prenom: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              {/* Email */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Adresse email *" type="email" fullWidth placeholder="candidat@email.com"
                  value={candForm.email}
                  onChange={e => setCandForm({ ...candForm, email: e.target.value })}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              {/* Téléphone + Date naissance */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Téléphone" fullWidth placeholder="+237 6XX XX XX XX"
                  value={candForm.phone}
                  onChange={e => setCandForm({ ...candForm, phone: e.target.value })}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Date de naissance" type="date" fullWidth
                  value={candForm.dateNaissance}
                  onChange={e => setCandForm({ ...candForm, dateNaissance: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              {/* Ville + Quartier */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                  <InputLabel>Ville</InputLabel>
                  <Select
                    value={candForm.ville}
                    label="Ville"
                    onChange={e => setCandForm({ ...candForm, ville: e.target.value, quartier: '' })}
                  >
                    {CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  freeSolo
                  options={candForm.ville ? (LOCATIONS[candForm.ville as keyof typeof LOCATIONS] || []) : []}
                  value={candForm.quartier}
                  onChange={(_, newValue) => setCandForm({ ...candForm, quartier: newValue || '' })}
                  onInputChange={(_, newInputValue) => setCandForm({ ...candForm, quartier: newInputValue })}
                  disabled={!candForm.ville}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Quartier"
                      placeholder={candForm.ville ? 'Sélectionner ou taper…' : 'Choisissez une ville'}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                    />
                  )}
                />
              </Grid>

              {/* Identifiants auto-générés */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(theme.palette.secondary.main, 0.06), border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`, mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main' }}>🔑 Identifiants de connexion</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      startIcon={<AutoFixHighIcon />}
                      onClick={generateCandidateCredentials}
                      disabled={!candForm.prenom && !candForm.nom}
                      sx={{ borderRadius: '8px', fontWeight: 600, fontSize: '0.75rem' }}
                    >
                      Générer auto
                    </Button>
                  </Box>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Nom d'utilisateur *" fullWidth size="small"
                        value={candForm.username}
                        onChange={e => setCandForm({ ...candForm, username: e.target.value })}
                        slotProps={{ input: { sx: { fontFamily: 'monospace', fontWeight: 700 } } }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Mot de passe *" fullWidth size="small"
                        type={showPassword ? 'text' : 'password'}
                        value={candForm.password}
                        onChange={e => setCandForm({ ...candForm, password: e.target.value })}
                        slotProps={{
                          input: {
                            sx: { fontFamily: 'monospace', fontWeight: 700 },
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                                  {showPassword ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                      />
                    </Grid>
                  </Grid>
                  {candForm.username && candForm.password && (
                    <Button
                      size="small" fullWidth
                      startIcon={<ContentCopyIcon />}
                      onClick={() => copyCredentials(candForm.username, candForm.password)}
                      sx={{ mt: 1.5, borderRadius: '8px', fontWeight: 600, color: 'secondary.main' }}
                    >
                      Copier les identifiants
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        {!createdCredentials && (
          <DialogActions sx={{ px: { xs: 2.5, sm: 3 }, pb: { xs: 2.5, sm: 3 }, pt: 1, gap: 1.5, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
            <Button
              onClick={() => setAddCandidateOpen(false)}
              variant="outlined" color="inherit" fullWidth
              sx={{ borderRadius: '12px', fontWeight: 700, py: 1.2 }}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={candidateFormLoading ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
              fullWidth
              disabled={candidateFormLoading || !candForm.prenom || !candForm.nom || !candForm.email || !candForm.username || !candForm.password}
              onClick={handleCreateCandidate}
              sx={{ borderRadius: '12px', fontWeight: 800, py: 1.2, boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.35)}` }}
            >
              {candidateFormLoading ? 'Création en cours…' : 'Créer le candidat'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* ════════ Dialog Modifier Candidat ════════ */}
      <Dialog
        open={editCandidateOpen}
        onClose={() => !candidateFormLoading && setEditCandidateOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: '20px', p: { xs: 1, sm: 2 } } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          <AutoFixHighIcon color="warning" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Modifier le candidat</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, py: 2 }}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Prénom *" fullWidth
                value={candForm.prenom}
                onChange={e => setCandForm({ ...candForm, prenom: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Nom *" fullWidth
                value={candForm.nom}
                onChange={e => setCandForm({ ...candForm, nom: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Nom d'utilisateur *" fullWidth
                value={candForm.username}
                onChange={e => setCandForm({ ...candForm, username: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Adresse email *" type="email" fullWidth
                value={candForm.email}
                onChange={e => setCandForm({ ...candForm, email: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><MailIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Téléphone" fullWidth
                value={candForm.phone}
                onChange={e => setCandForm({ ...candForm, phone: e.target.value })}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="date"
                label="Date de naissance"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={candForm.dateNaissance}
                onChange={e => setCandForm({ ...candForm, dateNaissance: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                <InputLabel>Diplôme le plus élevé</InputLabel>
                <Select
                  value={candForm.diplome}
                  label="Diplôme le plus élevé"
                  onChange={e => setCandForm({ ...candForm, diplome: e.target.value })}
                >
                  <MenuItem value=""><em>Non renseigné</em></MenuItem>
                  {['CAP', 'BEP', 'Baccalauréat', 'BTS', 'Licence', 'Master', 'Doctorat', 'Certificat professionnel', 'Sans diplôme'].map(d => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Établissement" fullWidth
                value={candForm.etablissement}
                onChange={e => setCandForm({ ...candForm, etablissement: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                label="Année d'obtention" fullWidth
                slotProps={{ htmlInput: { min: 2000, max: 2025 } }}
                value={candForm.anneeObtention}
                onChange={e => setCandForm({ ...candForm, anneeObtention: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                <InputLabel>Type de profil</InputLabel>
                <Select
                  value={candForm.typeProfil}
                  label="Type de profil"
                  onChange={e => setCandForm({ ...candForm, typeProfil: e.target.value })}
                >
                  <MenuItem value="Freelance">Freelance / Indépendant</MenuItem>
                  <MenuItem value="Salarié">Salarié / CDD / CDI</MenuItem>
                  <MenuItem value="Apprenti">Apprenti / Stagiaire</MenuItem>
                  <MenuItem value="Elève">Élève</MenuItem>
                  <MenuItem value="Etudiant">Étudiant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                <InputLabel>Ville</InputLabel>
                <Select
                  value={candForm.ville}
                  label="Ville"
                  onChange={e => setCandForm({ ...candForm, ville: e.target.value, quartier: '' })}
                >
                  {CITIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                freeSolo
                options={candForm.ville ? (LOCATIONS[candForm.ville as keyof typeof LOCATIONS] || []) : []}
                value={candForm.quartier}
                onChange={(_, newValue) => setCandForm({ ...candForm, quartier: newValue || '' })}
                onInputChange={(_, newInputValue) => setCandForm({ ...candForm, quartier: newInputValue })}
                disabled={!candForm.ville}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Quartier"
                    placeholder={candForm.ville ? 'Sélectionner ou taper…' : 'Choisissez une ville'}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Biographie" fullWidth multiline rows={3}
                placeholder="Décrivez brièvement le candidat..."
                value={candForm.bio}
                onChange={e => setCandForm({ ...candForm, bio: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: alpha(theme.palette.secondary.main, 0.06), border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main', mb: 1.5 }}>🔑 Identifiants de connexion</Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Nom d'utilisateur *" fullWidth size="small"
                      value={candForm.username}
                      onChange={e => setCandForm({ ...candForm, username: e.target.value })}
                      slotProps={{ input: { sx: { fontFamily: 'monospace', fontWeight: 700 } } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Mot de passe" fullWidth size="small" placeholder="Laisser vide pour ne pas modifier"
                      type={showPassword ? 'text' : 'password'}
                      value={candForm.password}
                      onChange={e => setCandForm({ ...candForm, password: e.target.value })}
                      slotProps={{
                        input: {
                          sx: { fontFamily: 'monospace', fontWeight: 700 },
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <VisibilityOffIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2.5, sm: 3 }, pb: { xs: 2.5, sm: 3 }, pt: 1, gap: 1.5, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
          <Button
            onClick={() => setEditCandidateOpen(false)}
            variant="outlined" color="inherit" fullWidth
            sx={{ borderRadius: '12px', fontWeight: 700, py: 1.2 }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={candidateFormLoading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
            fullWidth
            disabled={candidateFormLoading || !candForm.prenom || !candForm.nom || !candForm.email || !candForm.username}
            onClick={handleUpdateCandidate}
            sx={{ borderRadius: '12px', fontWeight: 800, py: 1.2, boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.35)}` }}
          >
            {candidateFormLoading ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* ════════ Menu 3 points ════════ */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          '& .MuiMenu-paper': { borderRadius: '12px', minWidth: 200, mt: 1, boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}` }
        }}
      >
        <MenuItem onClick={() => { handleMenuClose(); setSelectedUser(menuUser); }}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1.5, color: 'info.main' }} />
          Voir le profil
        </MenuItem>
        {menuUser && menuUser.role === 'candidate' && (
          <MenuItem onClick={() => {
            handleMenuClose();
            const parts = menuUser.nom.split(' ');
            let v = '';
            let q = '';
            if (menuUser.neighborhood) {
              const nParts = menuUser.neighborhood.split(' - ');
              if (nParts.length > 1) {
                v = nParts[0];
                q = nParts[1];
              } else {
                if (CITIES.includes(menuUser.neighborhood)) v = menuUser.neighborhood;
                else q = menuUser.neighborhood;
              }
            }
            setCandForm({
              nom: parts[0] || '',
              prenom: parts.slice(1).join(' ') || '',
              email: menuUser.email || '',
              phone: menuUser.phone || '',
              dateNaissance: menuUser.dateOfBirth || '',
              diplome: menuUser.highestDiploma || '',
              etablissement: menuUser.institution || '',
              anneeObtention: menuUser.graduationYear || '',
              ville: v,
              quartier: q,
              typeProfil: menuUser.profileType || 'Freelance',
              username: menuUser.username || '',
              password: menuUser.generatedPassword || '',
              bio: menuUser.bio || '',
            });
            setSelectedUser(menuUser);
            setEditCandidateOpen(true);
          }}>
            <AutoFixHighIcon fontSize="small" sx={{ mr: 1.5, color: 'warning.main' }} />
            Modifier le candidat
          </MenuItem>
        )}

        {menuUser && menuUser.role === 'employer' && (
          <MenuItem onClick={() => { handleMenuClose(); setToggleBadgeUser(menuUser); }}>
            {menuUser.statut === 'Vérifié' ? (
              <CancelIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
            ) : (
              <VerifiedIcon fontSize="small" sx={{ mr: 1.5, color: 'success.main' }} />
            )}
            {menuUser.statut === 'Vérifié' ? 'Désactiver le badge' : 'Activer le badge'}
          </MenuItem>
        )}

        {menuUser && ['admin', 'super_admin', 'moderator'].includes(menuUser.role) && (
          <MenuItem onClick={() => {
            handleMenuClose();
            setAdminForm({
              nom: menuUser.nom || '',
              email: menuUser.email || '',
              phone: menuUser.phone || '',
              password: menuUser.generatedPassword || '',
              role: menuUser.role || 'moderator'
            });
            setSelectedUser(menuUser);
            setEditAdminOpen(true);
          }}>
            <AutoFixHighIcon fontSize="small" sx={{ mr: 1.5, color: 'warning.main' }} />
            Modifier l'administrateur
          </MenuItem>
        )}

        <MenuItem onClick={() => {
          handleMenuClose();
          api.post('conversations/', { participants: [menuUser.id] })
            .then(res => navigate('/admin/messages', { state: { openChatId: String(res.data.id) } }))
            .catch(() => dispatch(showSnackbar({ message: 'Erreur discussion', severity: 'error' })));
        }}>
          <ChatIcon fontSize="small" sx={{ mr: 1.5, color: 'primary.main' }} />
          Contacter
        </MenuItem>

        {menuUser && ['candidate', 'admin', 'super_admin', 'moderator'].includes(menuUser.role) && (
          <Divider sx={{ my: 1 }} />
        )}

        {menuUser && ['candidate', 'admin', 'super_admin', 'moderator'].includes(menuUser.role) && (
          <MenuItem onClick={() => handleWhatsApp(menuUser)}>
            <ChatIcon fontSize="small" sx={{ mr: 1.5, color: '#25D366' }} /> {/* WhatsApp color */}
            Identifiants via WhatsApp
          </MenuItem>
        )}
        {menuUser && ['candidate', 'admin', 'super_admin', 'moderator'].includes(menuUser.role) && (
          <MenuItem onClick={() => handleEmail(menuUser)} disabled={isSendingEmail}>
            <MailIcon fontSize="small" sx={{ mr: 1.5, color: 'secondary.main' }} />
            Identifiants par E-mail
          </MenuItem>
        )}

        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={() => { handleMenuClose(); setDeleteTarget(menuUser); setDeleteConfirmText(''); }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Supprimer
        </MenuItem>
      </Menu>

      {/* ════════ Dialog Suppression Sécurisée (Vercel Style) ════════ */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'error.main', pb: 1 }}>
          <WarningAmberIcon color="error" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Supprimer l'utilisateur</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Cette action est <strong>irréversible</strong>. L'utilisateur <strong>{deleteTarget?.nom}</strong> et toutes ses données associées seront supprimés définitivement.
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
            Pour confirmer, veuillez taper le nom d'utilisateur exact : <span style={{ fontFamily: 'monospace', color: theme.palette.error.main }}>{deleteTarget?.username || deleteTarget?.nom}</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            error={deleteConfirmText.length > 0 && deleteConfirmText !== (deleteTarget?.username || deleteTarget?.nom)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" color="inherit" sx={{ borderRadius: '10px', fontWeight: 700 }} disabled={isDeleting}>
            Annuler
          </Button>
          <Button
            onClick={executeDelete}
            variant="contained"
            color="error"
            disabled={isDeleting || deleteConfirmText !== (deleteTarget?.username || deleteTarget?.nom)}
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ════════ Dialog Activer/Désactiver Badge ════════ */}
      <Dialog
        open={Boolean(toggleBadgeUser)}
        onClose={() => setToggleBadgeUser(null)}
        maxWidth="xs"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: toggleBadgeUser?.statut === 'Vérifié' ? 'warning.main' : 'success.main', pb: 1 }}>
          {toggleBadgeUser?.statut === 'Vérifié' ? <WarningAmberIcon /> : <VerifiedIcon />}
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {toggleBadgeUser?.statut === 'Vérifié' ? 'Désactiver le badge' : 'Activer le badge'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir {toggleBadgeUser?.statut === 'Vérifié' ? 'désactiver' : 'activer'} le badge <strong>Employeur Vérifié</strong> pour l'entreprise <strong>{toggleBadgeUser?.companyName || toggleBadgeUser?.nom}</strong> ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setToggleBadgeUser(null)} variant="outlined" color="inherit" sx={{ borderRadius: '10px', fontWeight: 700 }} disabled={isTogglingBadge}>
            Annuler
          </Button>
          <Button
            onClick={handleToggleBadge}
            variant="contained"
            color={toggleBadgeUser?.statut === 'Vérifié' ? 'warning' : 'success'}
            disabled={isTogglingBadge}
            startIcon={isTogglingBadge ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            {isTogglingBadge ? 'Validation...' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
