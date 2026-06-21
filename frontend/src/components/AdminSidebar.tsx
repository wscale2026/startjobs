import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme, alpha, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Badge } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import WorkIcon from '@mui/icons-material/Work';
import CategoryIcon from '@mui/icons-material/Category';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChatIcon from '@mui/icons-material/Chat';
import MailIcon from '@mui/icons-material/Mail';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../store';
import { logoutAdmin } from '../store/slices/adminSlice';

const MENU_CATEGORIES = [
  {
    title: "Vue d'ensemble",
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    ]
  },
  {
    title: "Gestion du Site",
    items: [
      { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/admin/users' },
      { text: "Offres d'emploi", icon: <WorkIcon />, path: '/admin/offers' },
    ]
  },
  {
    title: "Communication",
    items: [
      { text: 'Messagerie Directe', icon: <ChatIcon />, path: '/admin/messages' },
      { text: 'Mailing Groupé', icon: <MailIcon />, path: '/admin/mailing' },
    ]
  },
  {
    title: "Données & Méta",
    items: [
      { text: 'Domaines & Secteurs', icon: <CategoryIcon />, path: '/admin/skills' },
      { text: 'Villes & Quartiers', icon: <LocationCityIcon />, path: '/admin/locations' },
    ]
  },
  {
    title: "Paramètres",
    items: [
      { text: 'Configuration', icon: <SettingsIcon />, path: '/admin/settings' },
      { text: 'Mon Profil', icon: <AccountCircleIcon />, path: '/admin/profile' },
    ]
  }
];

export default function AdminSidebar({ open, onClose }: { open: boolean, onClose: () => void }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector((state: any) => state.messages.unreadCount);
  const { site_name, logo } = useAppSelector((state: any) => state.siteSettings);
  const authRole = useAppSelector((state: any) => state.auth.role);

  const [logoutOpen, setLogoutOpen] = React.useState(false);

  const handleLogout = () => {
    setLogoutOpen(true);
  };

  const confirmLogout = () => {
    dispatch(logoutAdmin());
    setLogoutOpen(false);
    navigate('/admin/login');
  };

  const drawerContent = (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRight: `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
        {logo ? (
          <img src={logo} alt={site_name} style={{ width: 36, height: 36, objectFit: 'contain' }} />
        ) : (
          <Box sx={{ minWidth: 36, width: 36, height: 36, borderRadius: '10px', background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>{site_name.substring(0, 2).toUpperCase()}</Typography>
          </Box>
        )}
        <Typography variant="h6" className="sidebar-logo-text" sx={{ fontWeight: 800, letterSpacing: '-0.02em', background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap', transition: 'all 0.25s' }}>
          {site_name} Admin
        </Typography>
      </Box>

      <List sx={{ px: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {MENU_CATEGORIES.map((category) => {
          // Filtrer les items selon le rôle
          const filteredItems = category.items.filter(item => {
            const role = authRole || 'admin';
            if (role === 'super_admin') return true; // Super admin voit tout
            
            if (role === 'moderator') {
              // Modérateur ne voit que Dashboard, Offres, et Messages
              return ['/admin', '/admin/offers', '/admin/messages'].includes(item.path);
            }
            
            // L'admin classique voit tout SAUF la configuration du site et la gestion des administrateurs (Utilisateurs)
            if (role === 'admin') {
              return !['/admin/settings', '/admin/users'].includes(item.path);
            }
            
            return false;
          });

          if (filteredItems.length === 0) return null;

          return (
            <Box key={category.title}>
              <Typography variant="overline" className="sidebar-category" sx={{ px: 2, color: 'text.secondary', fontWeight: 800, letterSpacing: '0.1em', whiteSpace: 'nowrap', transition: 'all 0.25s' }}>
                {category.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                {filteredItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <ListItem
                    key={item.text}
                    onClick={() => { navigate(item.path); onClose(); }}
                    component={motion.div}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    sx={{
                      borderRadius: '12px',
                      cursor: 'pointer',
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      color: isActive ? 'primary.main' : 'text.primary',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      }
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                      {item.path === '/admin/messages' && unreadCount > 0 ? (
                        <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { right: -2, top: 2 } }}>
                          {item.icon}
                        </Badge>
                      ) : item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} className="sidebar-text" sx={{ whiteSpace: 'nowrap', transition: 'all 0.25s' }} slotProps={{ primary: { sx: { fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' } } }} />
                    {item.path === '/admin/messages' && unreadCount > 0 && (
                      <Box className="sidebar-badge" sx={{ bgcolor: 'error.main', color: 'white', borderRadius: '10px', px: 1, py: 0.25, fontSize: '0.7rem', fontWeight: 700, transition: 'all 0.25s' }}>
                        {unreadCount}
                      </Box>
                    )}
                  </ListItem>
                );
              })}
            </Box>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <ListItem
          onClick={handleLogout}
          component={motion.div}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          sx={{
            borderRadius: '12px',
            cursor: 'pointer',
            color: theme.palette.error.main,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.1),
            }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><ExitToAppIcon /></ListItemIcon>
          <ListItemText primary="Déconnexion" className="sidebar-text" sx={{ whiteSpace: 'nowrap', transition: 'all 0.25s' }} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer variant="temporary" open={open} onClose={onClose} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' } }}>
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer 
        variant="permanent" 
        open 
        sx={{ 
          display: { xs: 'none', md: 'block' }, 
          width: 88, 
          flexShrink: 0, 
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.easeOut,
            duration: 250,
          }),
          '&:hover': {
            width: 280,
          },
          '& .MuiDrawer-paper': { 
            width: 88, 
            boxSizing: 'border-box', 
            overflowX: 'hidden',
            transition: theme.transitions.create(['width', 'box-shadow'], {
              easing: theme.transitions.easing.easeOut,
              duration: 250,
            }),
            '& .sidebar-text, & .sidebar-logo-text, & .sidebar-category, & .sidebar-badge': {
              opacity: 0,
              width: 0,
              pointerEvents: 'none',
              transform: 'translateX(-10px)'
            },
            '&:hover': {
              width: 280,
              boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
              '& .sidebar-text, & .sidebar-logo-text, & .sidebar-category, & .sidebar-badge': {
                opacity: 1,
                width: 'auto',
                pointerEvents: 'auto',
                transform: 'translateX(0)'
              }
            }
          } 
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirmer la déconnexion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir vous déconnecter du panneau d'administration ?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setLogoutOpen(false)} variant="outlined" color="inherit" sx={{ borderRadius: '8px', fontWeight: 700 }}>
            Annuler
          </Button>
          <Button onClick={confirmLogout} variant="contained" color="error" disableElevation sx={{ borderRadius: '8px', fontWeight: 700 }}>
            Déconnexion
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
