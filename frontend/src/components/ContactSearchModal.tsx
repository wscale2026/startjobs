import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha,
  Tabs,
  Tab,
  Slide
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import api from '../utils/api';

let cachedContacts: any[] | null = null;

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ContactSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (user: any) => void;
  title?: string;
  placeholder?: string;
}

export default function ContactSearchModal({ open, onClose, onSelect, title = "Envoyer un contact", placeholder = "Rechercher un utilisateur..." }: ContactSearchModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>(cachedContacts || []);
  const [loading, setLoading] = useState(!cachedContacts);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!open) return;
    
    const fetchBase = async () => {
      try {
        if (!cachedContacts) setLoading(true);
        const res = await api.get('search-contacts/');
        const data = res.data.results ? res.data.results : res.data;
        cachedContacts = data;
        if (!search.trim()) setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!cachedContacts) {
      fetchBase();
    } else if (!search.trim()) {
      setUsers(cachedContacts);
      fetchBase(); // Refresh cache silently
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!search.trim()) {
      if (cachedContacts) setUsers(cachedContacts);
      return;
    }
    
    const delay = setTimeout(async () => {
      try {
        // We do NOT set loading=true here to keep the current results visible while refining!
        const res = await api.get(`search-contacts/?search=${encodeURIComponent(search)}`);
        const data = res.data.results ? res.data.results : res.data;
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [search, open]);

  const filteredUsers = users.filter((u) => {
    // 0 = Candidats, 1 = Employeurs, 2 = Support
    if (activeTab === 0 && u.role !== 'candidate') return false;
    if (activeTab === 1 && u.role !== 'employer') return false;
    if (activeTab === 2 && u.role !== 'admin' && u.role !== 'super_admin' && !u.is_superuser) return false;
    
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const username = (u.username || '').toLowerCase();
    const query = search.toLowerCase();
    return fullName.includes(query) || username.includes(query);
  });
  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '100%',
          maxWidth: { xs: '100%', sm: 500 },
          height: { xs: '100dvh', sm: '70vh' },
          maxHeight: { xs: '100dvh', sm: '70vh' },
          m: { xs: 0, sm: 2 },
          position: { xs: 'absolute', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          borderTopLeftRadius: { xs: 24, sm: 16 },
          borderTopRightRadius: { xs: 24, sm: 16 },
          borderBottomLeftRadius: { xs: 0, sm: 16 },
          borderBottomRightRadius: { xs: 0, sm: 16 },
          p: 0,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          backgroundImage: 'none',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
        }
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, pb: 0 }}>
        {isMobile && (
          <Box sx={{ width: 40, height: 4, bgcolor: 'text.disabled', borderRadius: 2, mx: 'auto', mb: 2, opacity: 0.5 }} />
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
          <IconButton onClick={onClose} size="small" sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{
          display: 'flex', alignItems: 'center', bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
          borderRadius: 2, px: 2, py: 1
        }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, fontSize: '0.95rem' }}
            autoFocus
          />
        </Box>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', mt: 1, minHeight: 40, '& .MuiTab-root': { minHeight: 40 } }}
        >
          <Tab label="Candidats" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }} />
          <Tab label="Employeurs" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }} />
          <Tab label="Support" sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' }} />
        </Tabs>
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4, opacity: 0.6 }}>
            <PersonIcon sx={{ fontSize: 64, mb: 1, color: 'text.disabled' }} />
            <Typography variant="body1" sx={{ fontWeight: 600 }}>Aucun utilisateur trouvé</Typography>
            <Typography variant="body2" sx={{ textAlign: 'center' }}>Essayez de modifier votre recherche.</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredUsers.map((user) => (
              <ListItem
                key={user.id}
                onClick={() => {
                  onSelect(user);
                  onClose();
                }}
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                  py: 1.5,
                  px: 2
                }}
              >
                <ListItemAvatar>
                  <Avatar src={user.profile_pic} sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontSize: '1.2rem' }}>
                    {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      @{user.username} {user.role === 'employer' ? '• Employeur' : user.role === 'candidate' ? '• Candidat' : '• Administrateur'}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Dialog>
  );
}
