import React from 'react';
import {
  Box, BottomNavigation, BottomNavigationAction, Paper,
  useMediaQuery, useTheme, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Typography, Badge, alpha,
  Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
  Divider, SwipeableDrawer, InputBase, Tooltip, Menu, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import WorkIcon from '@mui/icons-material/Work';
import SearchRoundedIcon from '@mui/icons-material/Search';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ChatBubbleIcon from '@mui/icons-material/ChatBubbleRounded';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import PersonIcon from '@mui/icons-material/Person';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import PlaceIcon from '@mui/icons-material/Place';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { setQuartier } from '../store/slices/locationSlice';
import { getFullMediaUrl } from '../utils/api';
import { useThemeMode } from '../theme/ThemeContext';
import LocationChip from '../components/LocationChip';
import ThemeToggle from '../components/ThemeToggle';
import FloatingChat from '../components/FloatingChat';
import SnackbarProvider from '../components/SnackbarProvider';
import { useMessagePolling } from '../hooks/useMessagePolling';
import { AvatarViewerProvider } from '../components/AvatarViewer';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  iconActive: React.ReactNode;
  path: string;
  badge?: number;
}

const CANDIDATE_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <DashboardOutlinedIcon />,
    iconActive: <DashboardIcon />,
    path: '/candidate/dashboard',
  },
  {
    label: 'Recherche',
    icon: <SearchIcon />,
    iconActive: <SearchRoundedIcon />,
    path: '/offers',
  },
  {
    label: 'Messages',
    icon: <ChatBubbleOutlineIcon />,
    iconActive: <ChatBubbleIcon />,
    path: '/messages',
  },
  {
    label: 'Profil',
    icon: <PersonOutlineIcon />,
    iconActive: <PersonIcon />,
    path: '/profile',
  },
];

const EMPLOYER_NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <DashboardOutlinedIcon />,
    iconActive: <DashboardIcon />,
    path: '/employer/dashboard',
  },
  {
    label: 'Candidats',
    icon: <SearchIcon />,
    iconActive: <SearchRoundedIcon />,
    path: '/search',
  },
  {
    label: 'Mes Annonces',
    icon: <WorkOutlineIcon />,
    iconActive: <WorkIcon />,
    path: '/offers',
  },
  {
    label: 'Messages',
    icon: <ChatBubbleOutlineIcon />,
    iconActive: <ChatBubbleIcon />,
    path: '/messages',
  },
  {
    label: 'Profil',
    icon: <PersonOutlineIcon />,
    iconActive: <PersonIcon />,
    path: '/profile',
  },
];

const DRAWER_WIDTH = 264;
const MIN_DRAWER_WIDTH = 88;

export default function AppLayout() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const quartier = useAppSelector((s) => s.location.quartier);
  const globalLocations = useAppSelector((s) => s.locationsGlobal.locations);
  const { user } = useAppSelector((s) => s.auth);
  
  // Determine user city
  const userCity = React.useMemo(() => {
    if (user?.employer_profile?.city) return user.employer_profile.city;
    return 'Douala'; // fallback
  }, [user]);

  // Derived list of dynamic quartiers
  const dynamicQuartiers = React.useMemo(() => {
    const list = globalLocations[userCity] || [];
    return ['Tous les quartiers', ...list];
  }, [globalLocations, userCity]);

  const role = useAppSelector((state) => state.auth.role);
  const unreadCount = useAppSelector((state) => state.messages?.unreadCount || 0);
  const { site_name, logo } = useAppSelector((state) => state.siteSettings);

  // Start polling messages for global notifications and badges
  useMessagePolling(5000);

  const { mode, toggleTheme } = useThemeMode();
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [profileMenuAnchor, setProfileMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [quartierSearch, setQuartierSearch] = React.useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setLogoutOpen(false);
  };

  const isEmployer = role === 'employer';
  const suspendEmployerFeatures = useAppSelector((state: any) => state.siteSettings.suspend_employer_features);
  const kycStatus = user?.employer_profile?.kyc_status;
  
  // Filter base nav items for employer
  let baseNavItems = isEmployer ? EMPLOYER_NAV_ITEMS : CANDIDATE_NAV_ITEMS;
  
  if (isEmployer) {
    const isRestricted = suspendEmployerFeatures || (kycStatus !== 'approved');
    if (isRestricted) {
      baseNavItems = baseNavItems.filter(item => !['/search', '/offers'].includes(item.path));
    }
  }

  const navItems = baseNavItems.map(item => 
    item.path === '/messages' ? { ...item, badge: unreadCount > 0 ? unreadCount : undefined } : item
  );

  const activeTab = navItems.findIndex((item) => location.pathname.startsWith(item.path));
  const isFullBleed = location.pathname.startsWith('/messages');

  // Redirection for Admin users trying to access candidate profiles in AppLayout
  React.useEffect(() => {
    if (role === 'admin' && location.pathname.startsWith('/search/')) {
      navigate('/admin' + location.pathname, { replace: true });
    }
  }, [role, location.pathname, navigate]);

  return (
    <AvatarViewerProvider>
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      '&:has(aside:hover) main': isDesktop ? {
        ml: `${DRAWER_WIDTH}px`,
        maxWidth: `calc(100vw - ${DRAWER_WIDTH}px)`
      } : {}
    }}>

      {/* ─── Desktop Sidebar (Tailwind UI: clean, minimal sidebar) ─── */}
      {isDesktop && (
        <Box
          component="aside"
          sx={{
            width: MIN_DRAWER_WIDTH,
            flexShrink: 0,
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            zIndex: 200,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            pt: 3,
            overflowX: 'hidden',
            transition: theme.transitions.create(['width', 'box-shadow', 'padding'], {
              easing: theme.transitions.easing.easeOut,
              duration: 250,
            }),
            '&:hover': {
              width: DRAWER_WIDTH,
              p: 3,
              boxShadow: isDark ? '4px 0 24px rgba(0,0,0,0.5)' : '4px 0 24px rgba(0,0,0,0.08)',
              '& .sidebar-text': { opacity: 1, pointerEvents: 'auto', transform: 'translateX(0)', width: 'auto' },
              '& .sidebar-logo-text': { opacity: 1, transform: 'translateX(0)', width: 'auto' },
              '& .sidebar-widget': { 
                opacity: 1, 
                pointerEvents: 'auto', 
                width: 'auto',
                height: 'auto',
                mb: 3.5,
                py: 1.5,
                px: 1.75,
                borderWidth: 1,
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
              },
              '& .sidebar-header-label': { opacity: 1 },
              '& .MuiListItemButton-root': { px: 2, justifyContent: 'flex-start' },
              '& .MuiListItemIcon-root': { minWidth: 40, mr: 2, justifyContent: 'flex-start' },
              '& .logout-btn': { opacity: 1, pointerEvents: 'auto' },
              '& .sidebar-logo-container': { px: 1, justifyContent: 'flex-start', gap: 1.5 },
              '& .sidebar-user-container': {
                p: 1.5,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                justifyContent: 'flex-start',
              },
              '& .sidebar-badge': {
                opacity: 1,
                transform: 'scale(1)',
                width: 'auto',
              },
              '& .sidebar-icon-badge .MuiBadge-badge': {
                opacity: 0,
                transform: 'scale(0)',
              },
            },
            '& .sidebar-text': {
              opacity: 0,
              pointerEvents: 'none',
              transition: 'all 0.25s ease',
              whiteSpace: 'nowrap',
              transform: 'translateX(-10px)',
              width: 0,
              overflow: 'hidden',
            },
            '& .sidebar-logo-text': {
              opacity: 0,
              transition: 'all 0.25s ease',
              whiteSpace: 'nowrap',
              transform: 'translateX(-10px)',
              width: 0,
              overflow: 'hidden',
            },
            '& .sidebar-widget': {
              opacity: '1 !important',
              pointerEvents: 'auto !important',
              transition: 'all 0.25s ease !important',
              width: '100% !important',
              height: 'auto !important',
              mb: '3.5px !important',
              py: '0 !important',
              px: '0 !important',
              bgcolor: 'transparent !important',
              borderWidth: '0 !important',
              borderColor: 'transparent !important',
              display: 'flex !important',
              flexDirection: 'row !important',
              justifyContent: 'center !important',
              alignItems: 'center !important',
              gap: '6px !important',
            },
            '& .sidebar-header-label': {
              opacity: 0,
              transition: 'opacity 0.2s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            },
            '& .MuiListItemButton-root': {
              px: 1,
              justifyContent: 'center',
              transition: 'all 0.25s ease',
            },
            '& .MuiListItemIcon-root': {
              minWidth: 0,
              mr: 0,
              justifyContent: 'center',
              transition: 'all 0.25s ease',
            },
            '& .logout-btn': {
              opacity: 0,
              pointerEvents: 'none',
              transition: 'opacity 0.25s ease',
            },
            '& .sidebar-logo-container': {
              px: 0.5,
              justifyContent: 'center',
              gap: 0,
              transition: 'all 0.25s ease',
            },
            '& .sidebar-user-container': {
              p: 0.5,
              bgcolor: 'transparent',
              borderColor: 'transparent',
              justifyContent: 'center',
              transition: 'all 0.25s ease',
            },
            '& .sidebar-badge': {
              opacity: 0,
              pointerEvents: 'none',
              transform: 'scale(0.5)',
              width: 0,
              overflow: 'hidden',
              transition: 'all 0.25s ease',
            }
          }}
        >
          {/* Logo — Shadcn style: wordmark + badge */}
          <Box className="sidebar-logo-container" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6, px: 1 }}>
            {logo ? (
              <img src={logo} alt={site_name} style={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }} />
            ) : (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: '-0.04em',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  flexShrink: 0,
                }}
              >
                {site_name.substring(0, 2).toUpperCase()}
              </Box>
            )}
            <Box className="sidebar-logo-text" sx={{ flexShrink: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                {site_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem', letterSpacing: '0.02em', fontWeight: 600 }}>
                Douala · Cameroun
              </Typography>
            </Box>
          </Box>

          {/* Location & Theme Unified Premium Widget Row - Restored & Tidied Up */}
          <Box
            className="sidebar-widget"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              mb: 3,
              px: 1.75,
              py: 1.5,
              borderRadius: '16px',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
              transition: 'border-color 0.25s ease',
              '&:hover': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              }
            }}
          >
            {/* Left part: Localisation Interactive Area */}
            <Box
              onClick={() => setLocationOpen(true)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                minWidth: 0,
                flex: 1,
                '&:hover': {
                  transform: 'translateX(3px)',
                  '& .localisation-icon-btn': {
                    color: 'primary.main',
                    bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    borderColor: 'primary.main',
                  }
                }
              }}
            >
              <IconButton
                className="localisation-icon-btn"
                size="small"
                sx={{
                  color: 'text.secondary',
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  p: 0.75,
                  borderRadius: '10px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <PlaceIcon sx={{ fontSize: '1.15rem' }} />
              </IconButton>
              
              <Box className="sidebar-text" sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.625rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>
                  Secteur
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                  {quartier}
                </Typography>
              </Box>
            </Box>

            {/* Right part: Theme Toggle Button */}
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{
                color: isDark ? 'warning.light' : 'text.secondary',
                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                p: 0.75,
                borderRadius: '10px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                flexShrink: 0,
                '&:hover': {
                  color: isDark ? '#fbbf24' : 'primary.main',
                  bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  borderColor: isDark ? 'warning.light' : 'primary.main',
                  transform: 'scale(1.08) rotate(8deg)',
                }
              }}
              aria-label="Changer de thème"
            >
              {isDark ? <LightModeIcon sx={{ fontSize: '1.15rem' }} /> : <DarkModeIcon sx={{ fontSize: '1.15rem' }} />}
            </IconButton>
          </Box>

          {/* Nav label */}
          <Typography
            className="sidebar-header-label"
            variant="overline"
            sx={{ px: 2, mb: 2, color: 'text.disabled', fontSize: '0.625rem', letterSpacing: '0.15em', fontWeight: 700 }}
          >
            Navigation
          </Typography>

          {/* Nav Items — Premium style with sliding & scale effects */}
          <List disablePadding sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {navItems.map((item, i) => {
              const isActive = i === activeTab;
              return (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => navigate(item.path)}
                    className="pressable"
                    sx={{
                      borderRadius: '12px',
                      py: 1.25,
                      px: 2,
                      mb: 0.5,
                      position: 'relative',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        transform: 'translateX(4px)',
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                          transform: 'scale(1.1)',
                        }
                      },
                      '&.Mui-selected': {
                        bgcolor: isDark
                          ? alpha(theme.palette.primary.main, 0.15)
                          : alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.25) : alpha(theme.palette.primary.main, 0.1)}`,
                        boxShadow: isDark 
                          ? `0px 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`
                          : `0px 4px 20px ${alpha(theme.palette.primary.main, 0.05)}`,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '15%',
                          bottom: '15%',
                          width: '4px',
                          borderRadius: '0 4px 4px 0',
                          background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                          boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.8)}`,
                        }
                      },
                      '&.Mui-selected:hover': {
                        bgcolor: isDark
                          ? alpha(theme.palette.primary.main, 0.18)
                          : alpha(theme.palette.primary.main, 0.08),
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                        color: isActive ? 'primary.main' : 'text.secondary',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Badge 
                        badgeContent={item.badge} 
                        color="error" 
                        className="sidebar-icon-badge"
                        sx={{ 
                          '& .MuiBadge-badge': { 
                            right: -2, 
                            top: 2, 
                            transition: 'all 0.25s ease' 
                          } 
                        }}
                      >
                        {isActive ? item.iconActive : item.icon}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      className="sidebar-text"
                      primary={
                        <Typography
                          sx={{
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.9rem',
                            letterSpacing: '-0.008em',
                            color: isActive ? 'primary.main' : 'text.primary',
                            transition: 'color 150ms ease, font-weight 150ms ease',
                          }}
                        >
                          {item.label}
                        </Typography>
                      }
                    />
                    {item.badge && (
                      <Box
                        className="sidebar-badge"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderRadius: '10px',
                          minWidth: 20,
                          height: 20,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          px: 0.75,
                        }}
                      >
                        {item.badge}
                      </Box>
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {/* User Profile Footer with Logout Button */}
          <Box
            sx={{
              mt: 'auto',
              pt: 2,
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box
              className="sidebar-user-container"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                transition: 'all 0.25s ease',
              }}
            >
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  src={isEmployer 
                    ? getFullMediaUrl(user?.employer_profile?.logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&q=80')
                    : getFullMediaUrl(user?.candidate_profile?.photo || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80')}
                  sx={{ width: 40, height: 40, borderRadius: '12px' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    border: `2px solid ${theme.palette.background.paper}`,
                    boxShadow: `0 0 8px ${theme.palette.success.main}`,
                  }}
                />
              </Box>
              
              <Box className="sidebar-text" sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: 0.25 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.primary' }}>
                  {isEmployer 
                    ? (user?.employer_profile?.company_name || user?.first_name || user?.username || 'Cabinet Nkeng')
                    : (user?.first_name || user?.last_name ? `${user.last_name || ''} ${user.first_name || ''}`.trim() : user?.username || 'Christian Kamga')}
                </Typography>
                
                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.5 }}>
                  {user?.email || 'contact@entreprise.com'}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.1), px: 1, py: 0.25, borderRadius: '6px' }}>
                    {isEmployer 
                      ? (user?.employer_profile?.verified ? 'Certifié' : 'PRO')
                      : 'Vérifié'}
                  </Typography>
                  
                  <Tooltip title="Déconnexion" placement="top">
                    <IconButton 
                      onClick={() => setLogoutOpen(true)}
                      size="small"
                      sx={{
                        color: 'error.main',
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        borderRadius: '6px',
                        p: 0.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.error.main, 0.2),
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      <LogoutIcon sx={{ fontSize: '0.9rem' }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            <Typography
              variant="caption"
              color="text.disabled"
              sx={{
                textAlign: 'center',
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
                fontWeight: 600,
              }}
            >
              {site_name.toUpperCase()} V1.0 • DOUALA
            </Typography>
          </Box>
        </Box>
      )}

      {/* ─── Main content area ─── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: isDesktop ? `${MIN_DRAWER_WIDTH}px` : 0,
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create(['margin-left', 'max-width'], {
            easing: theme.transitions.easing.easeOut,
            duration: 250,
          }),
          ...(isFullBleed
            ? {
                p: 0,
                overflow: 'hidden',
                height: '100vh',
                maxWidth: isDesktop ? `calc(100vw - ${MIN_DRAWER_WIDTH}px)` : '100vw',
              }
            : {
                pb: isDesktop ? 4 : 14, // Increased padding to prevent overlap with floating pill
                pt: { xs: 2, md: 4 },
                px: { xs: 2, sm: 3, md: 4 },
                maxWidth: isDesktop ? `calc(100vw - ${MIN_DRAWER_WIDTH}px)` : '100%',
                minHeight: '100vh',
              }),
        }}
      >
        {/* Mobile header */}
        {!isDesktop && !isFullBleed && (
          <Box
            className="glass-nav"
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              {logo ? (
                <img src={logo} alt={site_name} style={{ width: 28, height: 28, objectFit: 'contain' }} />
              ) : (
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {site_name.substring(0, 1).toUpperCase()}
                </Box>
              )}
              <Typography sx={{ fontWeight: 800, fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>
                {site_name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <LocationChip />
              <ThemeToggle />
            </Box>
          </Box>
        )}

        <Box
          sx={{
            flex: 1,
            overflow: isFullBleed ? 'hidden' : 'visible',
            mt: isFullBleed ? 0 : (isDesktop ? 0 : 7),
            display: isFullBleed ? 'flex' : 'block',
            flexDirection: 'column',
            minHeight: isFullBleed ? 0 : undefined,
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* ─── Floating Chat ─── */}
      {!isFullBleed && <FloatingChat />}

      {/* ─── Premium Mobile bottom nav (Floating Pill) ─── */}
      {!isDesktop && (
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 16, sm: 24 },
            left: { xs: 16, sm: '50%' },
            right: { xs: 16, sm: 'auto' },
            transform: { sm: 'translateX(-50%)' },
            zIndex: 100,
            borderRadius: '24px',
            bgcolor: isDark ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
            p: 0.75,
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <BottomNavigation
            showLabels={false}
            value={activeTab !== -1 ? activeTab : 0}
            onChange={(_, v) => navigate(navItems[v].path)}
            sx={{ bgcolor: 'transparent', height: 56, gap: 1 }}
          >
            {navItems.map((item, i) => {
              const isActive = i === activeTab;
              return (
                <BottomNavigationAction
                  key={item.label}
                  label={item.label}
                  icon={
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: 0.5,
                      color: isActive ? (isDark ? '#fff' : 'primary.main') : 'text.secondary',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: isActive ? 'translateY(-2px)' : 'none',
                    }}>
                      {item.badge ? (
                        <Badge badgeContent={item.badge} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16 } }}>
                          {isActive ? item.iconActive : item.icon}
                        </Badge>
                      ) : (
                        isActive ? item.iconActive : item.icon
                      )}
                    </Box>
                  }
                  className="pressable"
                  sx={{ 
                    minWidth: '60px',
                    p: 0,
                    borderRadius: '16px',
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    transition: 'all 0.25s ease',
                    '& .MuiBottomNavigationAction-label': {
                      fontSize: '0.65rem',
                      fontWeight: isActive ? 800 : 500,
                      opacity: isActive ? 1 : 0,
                      mt: 0.5,
                      transition: 'all 0.25s ease',
                      display: isActive ? 'block' : 'none'
                    }
                  }}
                />
              );
            })}
          </BottomNavigation>
        </Box>
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Se déconnecter ?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.95rem' }}>
            Êtes-vous sûr de vouloir fermer votre session active sur StartJobs ?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLogoutOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>
            Annuler
          </Button>
          <Button onClick={handleLogout} variant="contained" color="error" sx={{ fontWeight: 700, borderRadius: '8px' }}>
            Déconnexion
          </Button>
        </DialogActions>
      </Dialog>

      {/* Location Selector Drawer Premium UI */}
      <SwipeableDrawer
        anchor="bottom"
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        onOpen={() => setLocationOpen(true)}
        disableSwipeToOpen
        sx={{ 
          '& .MuiDrawer-paper': { 
            borderRadius: '24px 24px 0 0', 
            maxHeight: '85vh',
            height: 'auto',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
          } 
        }}
      >
        {/* Drag Handle Indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }} />
        </Box>

        <Box sx={{ px: 3, pt: 1, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                Où cherchez-vous ?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <PlaceIcon sx={{ fontSize: 16 }} /> {userCity}, Cameroun
              </Typography>
            </Box>
            <IconButton onClick={() => setLocationOpen(false)} size="small" sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Search Input for Quartiers */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: '16px',
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F0F2F5',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
              transition: 'all 0.2s',
              '&:focus-within': {
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                borderColor: 'primary.main',
                boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}
          >
            <SearchIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
            <InputBase
              placeholder="Rechercher un quartier..."
              value={quartierSearch}
              onChange={(e) => setQuartierSearch(e.target.value)}
              fullWidth
              sx={{ fontSize: '0.95rem', fontWeight: 500 }}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
        
        <List sx={{ overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {dynamicQuartiers.filter(q => q.toLowerCase().includes(quartierSearch.toLowerCase())).map((q) => {
            const isSelected = (q === 'Tous les quartiers' && (!quartier || quartier === 'Tous les quartiers')) || q === quartier;
            return (
              <ListItem key={q} disablePadding>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => { dispatch(setQuartier(q === 'Tous les quartiers' ? '' : q)); setLocationOpen(false); }}
                  sx={{
                    borderRadius: '16px',
                    py: 1.5,
                    px: 2.5,
                    border: `1px solid ${isSelected ? theme.palette.primary.main : 'transparent'}`,
                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { 
                      bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.12) : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                      transform: isSelected ? 'none' : 'translateX(4px)'
                    },
                    '&.Mui-selected': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) }
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ 
                        fontWeight: isSelected ? 800 : 500, 
                        fontSize: '0.95rem',
                        color: isSelected ? 'primary.main' : 'text.primary'
                      }}>
                        {q}
                      </Typography>
                    }
                  />
                  {isSelected && (
                    <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 22, ml: 2 }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
          
          {dynamicQuartiers.filter(q => q.toLowerCase().includes(quartierSearch.toLowerCase())).length === 0 && (
            <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
              <SearchIcon sx={{ fontSize: 40, mb: 1, color: 'text.secondary' }} />
              <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>Aucun quartier trouvé</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>Essayez une autre orthographe</Typography>
            </Box>
          )}
        </List>
      </SwipeableDrawer>
      <SnackbarProvider />
    </Box>
    </AvatarViewerProvider>
  );
}
