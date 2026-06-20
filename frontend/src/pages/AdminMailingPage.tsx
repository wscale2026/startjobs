import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, useTheme, TextField, Grid, Button, alpha, RadioGroup, FormControlLabel, Radio, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider, IconButton, Tabs, Tab, Tooltip, Autocomplete, CircularProgress, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../store';
import { showSnackbar } from '../store/slices/snackbarSlice';
import api from '../utils/api';

export default function AdminMailingPage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [audience, setAudience] = useState('all');
  const [searchUser, setSearchUser] = useState('');
  const [selectedUserObj, setSelectedUserObj] = useState<any>(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [editorTab, setEditorTab] = useState(0);
  const [audienceCounts, setAudienceCounts] = useState({ all: 0, candidates: 0, employers: 0 });
  const [sentCount, setSentCount] = useState(0);

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (audience === 'specific' && users.length === 0) {
      setLoadingUsers(true);
      api.get('/users/')
        .then(res => {
          const data = res.data.results || res.data;
          setUsers(data.filter((u: any) => u.role !== 'admin' && !u.is_superuser));
        })
        .catch(console.error)
        .finally(() => setLoadingUsers(false));
    }
  }, [audience, users.length]);

  useEffect(() => {
    api.get('/admin/mailing/')
      .then(res => setAudienceCounts(res.data))
      .catch(() => {}); // Fail silently — UI still functional
  }, []);

  const DYNAMIC_VARS = [
    { label: 'Nom Complet', value: '{{nom}}' },
    { label: 'Prénom', value: '{{prenom}}' },
    { label: 'Nom de Famille', value: '{{nom_famille}}' },
    { label: "Nom d'utilisateur", value: '{{username}}' },
    { label: 'Email', value: '{{email}}' },
    { label: 'Mot de passe', value: '{{password}}' },
    { label: 'Téléphone', value: '{{telephone}}' },
    { label: 'Ville', value: '{{ville}}' },
    { label: 'Quartier', value: '{{quartier}}' },
    { label: 'Entreprise', value: '{{entreprise}}' },
    { label: 'Titre Profil', value: '{{titre_profil}}' },
  ];

  const handleInsertVar = (val: string) => {
    setContent(prev => prev + (prev.endsWith(' ') ? '' : ' ') + val);
  };

  const getAudienceCount = () => {
    switch (audience) {
      case 'all': return audienceCounts.all;
      case 'candidates': return audienceCounts.candidates;
      case 'employers': return audienceCounts.employers;
      case 'specific': return searchUser ? 1 : 0;
      default: return 0;
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await api.post('/admin/mailing/', {
        audience,
        searchUser: audience === 'specific' ? (selectedUserObj ? selectedUserObj.email : searchUser) : undefined,
        subject,
        content,
      });
      setSentCount(res.data.count || getAudienceCount());
      setConfirmOpen(false);
      setSent(true);
      dispatch(showSnackbar({ message: `Campagne envoyée à ${res.data.count} destinataires !`, severity: 'success' }));
    } catch {
      dispatch(showSnackbar({ message: 'Erreur lors de l\'envoi de la campagne.', severity: 'error' }));
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSent(false);
    setSubject('');
    setContent('');
  };

  if (sent) {
    return (
      <Box sx={{ pb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <CheckCircleIcon sx={{ fontSize: 100, color: 'success.main', mb: 2 }} />
        </motion.div>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Mission Accomplie</Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
          L'email a été expédié à {sentCount} destinataires avec succès. Les serveurs d'envoi s'occupent du reste.
        </Typography>
        <Button variant="outlined" onClick={resetForm} sx={{ borderRadius: '12px', fontWeight: 700, px: 4 }}>
          Nouvelle Campagne
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
            Mailing Groupé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Communiquez des informations importantes à votre communauté
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Colonne de Configuration & Audience */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper component={motion.div} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} sx={{ p: 4, borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.05)}` }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <GroupIcon color="primary" /> Sélection de l'Audience
            </Typography>

            <RadioGroup value={audience} onChange={(e) => setAudience(e.target.value)} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Paper component="label" sx={{ p: 2, borderRadius: '16px', bgcolor: audience === 'all' ? alpha(theme.palette.primary.main, 0.08) : theme.palette.background.paper, border: `2px solid ${audience === 'all' ? theme.palette.primary.main : theme.palette.divider}`, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}` } }}>
                <FormControlLabel value="all" control={<Radio sx={{ display: 'none' }} />} label={<Box><Typography sx={{ fontWeight: 800 }}>Tous</Typography><Typography variant="body2" color="text.secondary">Tous les utilisateurs</Typography></Box>} sx={{ m: 0, width: '100%' }} />
              </Paper>
              <Paper component="label" sx={{ p: 2, borderRadius: '16px', bgcolor: audience === 'candidates' ? alpha(theme.palette.primary.main, 0.08) : theme.palette.background.paper, border: `2px solid ${audience === 'candidates' ? theme.palette.primary.main : theme.palette.divider}`, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}` } }}>
                <FormControlLabel value="candidates" control={<Radio sx={{ display: 'none' }} />} label={<Box><Typography sx={{ fontWeight: 800 }}>Candidats</Typography><Typography variant="body2" color="text.secondary">Chercheurs d'emploi</Typography></Box>} sx={{ m: 0, width: '100%' }} />
              </Paper>
              <Paper component="label" sx={{ p: 2, borderRadius: '16px', bgcolor: audience === 'employers' ? alpha(theme.palette.primary.main, 0.08) : theme.palette.background.paper, border: `2px solid ${audience === 'employers' ? theme.palette.primary.main : theme.palette.divider}`, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}` } }}>
                <FormControlLabel value="employers" control={<Radio sx={{ display: 'none' }} />} label={<Box><Typography sx={{ fontWeight: 800 }}>Employeurs</Typography><Typography variant="body2" color="text.secondary">Recruteurs validés</Typography></Box>} sx={{ m: 0, width: '100%' }} />
              </Paper>
              <Paper component="label" sx={{ p: 2, borderRadius: '16px', bgcolor: audience === 'specific' ? alpha(theme.palette.primary.main, 0.08) : theme.palette.background.paper, border: `2px solid ${audience === 'specific' ? theme.palette.primary.main : theme.palette.divider}`, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}` } }}>
                <FormControlLabel value="specific" control={<Radio sx={{ display: 'none' }} />} label={<Box><Typography sx={{ fontWeight: 800 }}>Spécifique</Typography><Typography variant="body2" color="text.secondary">Un seul profil ciblé</Typography></Box>} sx={{ m: 0, width: '100%' }} />
              </Paper>
            </RadioGroup>

            <AnimatePresence>
              {audience === 'specific' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <Box sx={{ mt: 3 }}>
                    <Autocomplete
                      freeSolo
                      options={users}
                      loading={loadingUsers}
                      getOptionLabel={(option: any) => typeof option === 'string' ? option : `${option.first_name || ''} ${option.last_name || ''}`.trim() || option.username || option.email}
                      inputValue={searchUser}
                      onInputChange={(_, newInputValue) => {
                        setSearchUser(newInputValue);
                        if (!newInputValue) setSelectedUserObj(null);
                      }}
                      onChange={(_, newValue: any) => {
                        if (newValue && typeof newValue !== 'string') {
                          setSelectedUserObj(newValue);
                          setSearchUser(newValue.email);
                        } else {
                          setSelectedUserObj(null);
                        }
                      }}
                      renderOption={(props, option: any) => (
                        <Box component="li" {...props} key={option.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                          <Avatar src={option.profile_pic} sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem' }}>
                            {(option.first_name?.[0] || option.username?.[0] || '?').toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{`${option.first_name || ''} ${option.last_name || ''}`.trim() || option.username}</Typography>
                            <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                          </Box>
                        </Box>
                      )}
                      renderInput={(params) => {
                        const anyParams = params as any;
                        const originalInputProps = anyParams.InputProps || {};
                        return (
                          <TextField
                            {...params}
                            fullWidth 
                            placeholder="Chercher par nom ou email..." 
                            size="small" 
                            slotProps={{
                              input: {
                                ...originalInputProps,
                                startAdornment: (
                                  <>
                                    <InputAdornment position="start" sx={{ pl: 1 }}>
                                      <SearchIcon />
                                    </InputAdornment>
                                    {originalInputProps.startAdornment}
                                  </>
                                ),
                                endAdornment: (
                                  <>
                                    {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                                    {originalInputProps.endAdornment}
                                  </>
                                ),
                                sx: { borderRadius: '10px' }
                              }
                            }}
                          />
                        );
                      }}
                    />
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            <Divider sx={{ my: 4 }} />
            
            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: '16px', border: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Résumé de l'envoi</Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: 'info.main', mb: 0.5 }}>{getAudienceCount()}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Destinataires estimés</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Colonne Éditeur */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper component={motion.div} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.05)}`, display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <TextField 
              fullWidth 
              label="Sujet de l'email" 
              variant="outlined" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '1.2rem', fontWeight: 700 } }} 
            />

            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 1, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { height: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '4px' } }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mr: 1, textTransform: 'uppercase' }}>
                <DataObjectIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                Variables :
              </Typography>
              {DYNAMIC_VARS.map(v => (
                <Chip 
                  key={v.value} 
                  label={v.label} 
                  size="small" 
                  onClick={() => handleInsertVar(v.value)}
                  sx={{ fontWeight: 700, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
                />
              ))}
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: `1px solid ${theme.palette.divider}`, borderRadius: '12px', overflow: 'hidden' }}>
              
              <Tabs value={editorTab} onChange={(_, v) => setEditorTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ bgcolor: alpha(theme.palette.divider, 0.3), borderBottom: `1px solid ${theme.palette.divider}`, minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontWeight: 700, fontSize: '0.8rem', py: 0 } }}>
                <Tab icon={<EditIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Éditeur Visuel" />
                <Tab icon={<CodeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Code HTML" />
                <Tab icon={<VisibilityIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Aperçu Live" />
              </Tabs>

              {/* Fake Rich Text Toolbar for Visual Editor */}
              {editorTab === 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: 1, p: 1, overflowX: 'auto', bgcolor: alpha(theme.palette.divider, 0.2), borderBottom: `1px solid ${theme.palette.divider}`, '&::-webkit-scrollbar': { display: 'none' } }}>
                  <IconButton size="small"><FormatBoldIcon /></IconButton>
                  <IconButton size="small"><FormatItalicIcon /></IconButton>
                  <IconButton size="small"><FormatUnderlinedIcon /></IconButton>
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                  <IconButton size="small"><FormatListBulletedIcon /></IconButton>
                  <IconButton size="small"><LinkIcon /></IconButton>
                </Box>
              )}
              
              {editorTab === 0 && (
                <TextField 
                  multiline fullWidth variant="standard" placeholder="Rédigez votre message ici..."
                  value={content} onChange={(e) => setContent(e.target.value)}
                  slotProps={{ input: { disableUnderline: true, sx: { p: 3, minHeight: 300, alignItems: 'flex-start' } } }}
                  sx={{ flex: 1 }}
                />
              )}

              {editorTab === 1 && (
                <TextField 
                  multiline fullWidth variant="standard" placeholder="<h1>Mon super email</h1>..."
                  value={content} onChange={(e) => setContent(e.target.value)}
                  slotProps={{ input: { disableUnderline: true, sx: { p: 3, minHeight: 300, alignItems: 'flex-start', fontFamily: 'monospace', fontSize: '0.9rem', color: theme.palette.secondary.main } } }}
                  sx={{ flex: 1, bgcolor: alpha(theme.palette.background.default, 0.5) }}
                />
              )}

              {editorTab === 2 && (
                <Box sx={{ p: 4, minHeight: 400, flex: 1, bgcolor: '#f4f6f8', overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
                  <Paper sx={{ width: 375, height: 667, borderRadius: '32px', border: '8px solid #333', boxShadow: '0 24px 48px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ bgcolor: '#eee', p: 2, borderBottom: '1px solid #ddd' }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>StartJobs</Typography>
                      <Typography variant="caption" color="text.secondary">{subject || "Sans Objet"}</Typography>
                    </Box>
                    <Box sx={{ p: 3, flex: 1, overflowY: 'auto', bgcolor: '#fff' }}>
                      <div dangerouslySetInnerHTML={{ __html: content || '<p style="color: #aaa; text-align: center; margin-top: 50%;">Aperçu de l\'email vide</p>' }} />
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>

            {/* Desktop Action Buttons */}
            <Box sx={{ mt: 4, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" color="inherit" onClick={resetForm} sx={{ borderRadius: '12px', fontWeight: 700, px: 3 }}>
                Effacer
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                endIcon={<SendIcon />}
                disabled={!subject || !content || (audience === 'specific' && !searchUser)}
                onClick={() => setConfirmOpen(true)}
                sx={{ borderRadius: '12px', fontWeight: 800, px: 4, boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}` }}
              >
                Lancer la campagne
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Mobile Sticky Action Bar */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, bgcolor: alpha(theme.palette.background.paper, 0.9), backdropFilter: 'blur(10px)', borderTop: `1px solid ${theme.palette.divider}`, zIndex: 10 }}>
        <Button 
          fullWidth
          variant="contained" 
          color="primary" 
          size="large" 
          endIcon={<SendIcon />}
          disabled={!subject || !content || (audience === 'specific' && !searchUser)}
          onClick={() => setConfirmOpen(true)}
          sx={{ borderRadius: '16px', py: 1.5, fontWeight: 800, boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}` }}
        >
          Lancer la campagne
        </Button>
      </Box>

      {/* Dialog de Confirmation de sécurité */}
      <Dialog open={confirmOpen} onClose={() => !sending && setConfirmOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: '24px', p: 2, maxWidth: 500 } }}>
        <DialogTitle sx={{ fontWeight: 900, textAlign: 'center', color: 'error.main', fontSize: '1.5rem' }}>
          Confirmation d'Envoi
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Vous êtes sur le point d'envoyer un email ayant pour sujet :<br/>
            <strong>"{subject}"</strong>
          </Typography>
          <Box sx={{ display: 'inline-block', p: 2, bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: '16px', border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'error.main' }}>
              Attention : Cette action est irréversible.<br/>
              L'email sera délivré à {getAudienceCount()} destinataires.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" color="inherit" disabled={sending} sx={{ borderRadius: '12px', fontWeight: 700 }}>
            Annuler
          </Button>
          <Button onClick={handleSend} variant="contained" color="error" disabled={sending} sx={{ borderRadius: '12px', fontWeight: 800, px: 4, boxShadow: `0 8px 24px ${alpha(theme.palette.error.main, 0.3)}` }}>
            {sending ? <><CircularProgress size={20} color="inherit" sx={{ mr: 1 }} /> Envoi en cours...</> : 'Oui, Envoyer Définitivement'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
