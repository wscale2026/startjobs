import React, { useState, useRef } from 'react';
import {
  Box, Typography, Button, Container, Chip, Grid, Avatar,
  useTheme, alpha, Stack, Drawer, IconButton, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Divider, useMediaQuery
} from '@mui/material';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import StarIcon from '@mui/icons-material/Star';
import BoltIcon from '@mui/icons-material/Bolt';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import ThemeToggle from '../components/ThemeToggle';
import TiltCard from '../components/TiltCard';

/* ─── Animation Variants ─────────────────────────────────────────────────── */
const MotionBox = motion.create(Box);
const MotionTypography = motion.create(Typography);
const MotionAvatar = motion.create(Avatar);

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    }
  }
};

const flipUpVariant = {
  hidden: { opacity: 0, y: 60, rotateX: -45 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: "spring" as const, stiffness: 70, damping: 15, mass: 1.2 }
  }
};

const pop3DVariant = {
  hidden: { opacity: 0, scale: 0.8, rotateY: 30 },
  show: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: { type: "spring" as const, stiffness: 80, damping: 15 }
  }
};

const floatingOrbVariant = {
  animate: {
    y: [0, -30, 0],
    rotateX: [0, 15, 0],
    rotateY: [0, -15, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
};

/* ─── Static data ─────────────────────────────────────────────────────────── */
const STATS = [
  { value: '1 200+', label: 'Jeunes inscrits', icon: <GroupsIcon /> },
  { value: '500+', label: 'Offres actives', icon: <BoltIcon /> },
  { value: '4.8★', label: 'Score moyen', icon: <StarIcon /> },
  { value: '20+', label: 'Quartiers couverts', icon: <PlaceIcon /> },
];

const HOW = [
  {
    step: '01',
    title: 'Créez votre profil',
    desc: 'En 5 minutes. Ajoutez vos compétences, vos disponibilités et vos expériences passées.',
  },
  {
    step: '02',
    title: 'Trouvez dans votre quartier',
    desc: 'Le GPS détecte votre zone. Voyez uniquement les offres et les profils qui vous entourent.',
  },
  {
    step: '03',
    title: 'Contactez en 1 clic',
    desc: 'Chaque mission réussie devient une expérience vérifiée sur votre profil. Votre réputation se construit.',
  },
];

const CATEGORIES = [
  { label: 'Construction', color: '#1D4ED8' },
  { label: 'Cuisine', color: '#059669' },
  { label: 'Électricité', color: '#D97706' },
  { label: 'Livraison', color: '#7C3AED' },
  { label: 'Ménage', color: '#0891B2' },
  { label: 'Coiffure', color: '#BE185D' },
  { label: 'Enseignement', color: '#4338CA' },
  { label: 'Informatique', color: '#0F766E' },
  { label: 'Sécurité', color: '#374151' },
  { label: 'Couture', color: '#9D174D' },
];

const TESTIMONIALS = [
  {
    name: 'Arnaud N.',
    role: 'Maçon · New Bell',
    text: "En 48h après mon inscription, j'ai reçu 3 offres dans mon quartier. Avant je cherchais pendant des semaines.",
    score: 4.8,
    photo: 'AN',
    color: '#1D4ED8',
  },
  {
    name: 'Fatima O.',
    role: 'Cuisinière · Akwa',
    text: "Les employeurs voient mes notes laissées par mes anciens clients. Ça m'a évité de devoir me justifier à chaque fois.",
    score: 4.9,
    photo: 'FO',
    color: '#059669',
  },
  {
    name: 'Patrick K.',
    role: 'Livreur · Deido',
    text: "L'application m'a permis de trouver des missions régulières. Mon score monte au fil des livraisons réussies.",
    score: 4.3,
    photo: 'PK',
    color: '#D97706',
  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, status } = useAppSelector((state: any) => state.auth);
  const isAuthenticated = status === 'succeeded' || !!user;
  const isDark = theme.palette.mode === 'dark';
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCandidateNavigate = (path: string) => {
    if (isAuthenticated && user?.role === 'candidate') {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  const handleEmployerNavigate = (path: string) => {
    if (isAuthenticated && user?.role === 'employer') {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  const menuItems = [
    { label: 'Explorer', path: '/search', icon: <SearchIcon /> },
    { label: 'Se connecter', path: '/login', icon: <LoginIcon /> },
    { label: "S'inscrire", path: '/onboarding/jeune', icon: <PersonAddIcon />, variant: 'contained' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', overflowX: 'hidden' }}>

      {/* ══════════════════ NAV ════════════════════════════════════════════ */}
      <Box
        component="nav"
        className="glass-nav"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          px: { xs: 2, md: 6, lg: 10 },
          py: 0,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '9px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: '1rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            S
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em' }}>
            StartJobs
          </Typography>
        </Box>

        {/* Nav right - Desktop */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          <ThemeToggle />

          {/* Desktop Only Buttons */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Button
              variant="text"
              onClick={() => handleEmployerNavigate('/search')}
              sx={{
                color: 'text.secondary', fontWeight: 600,
                fontSize: '0.875rem',
                borderRadius: '8px', px: 2, py: 1, minWidth: 'auto',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06), color: 'text.primary' },
              }}
            >
              Explorer
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate('/login')}
              sx={{
                borderRadius: '8px', fontWeight: 600,
                fontSize: '0.875rem',
                px: 2
              }}
            >
              Se connecter
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/onboarding/jeune')}
              className="pressable"
              sx={{
                borderRadius: '8px', fontWeight: 600,
                fontSize: '0.875rem',
                px: 2
              }}
            >
              S'inscrire
            </Button>
          </Box>

          {/* Mobile Only Hamburger Menu Icon */}
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{
              display: { xs: 'flex', sm: 'none' },
              color: 'text.primary',
              ml: 1
            }}
            aria-label="Menu principal"
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>

      {/* ─── Mobile Navigation Drawer (Frosted Glass Menu) ─── */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 290,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            boxSizing: 'border-box',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
          }
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 800, fontSize: '0.9rem',
              }}
            >
              S
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
              StartJobs
            </Typography>
          </Box>
          <IconButton onClick={() => setMobileOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Drawer Menu List */}
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              {item.variant === 'contained' ? (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    if (item.path === '/search') {
                      handleEmployerNavigate(item.path);
                    } else {
                      navigate(item.path);
                    }
                    setMobileOpen(false);
                  }}
                  startIcon={item.icon}
                  sx={{
                    py: 1.5,
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`
                  }}
                >
                  {item.label}
                </Button>
              ) : (
                <ListItemButton
                  onClick={() => {
                    if (item.path === '/search') {
                      handleEmployerNavigate(item.path);
                    } else {
                      navigate(item.path);
                    }
                    setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: '12px',
                    py: 1.5,
                    px: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.default',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      borderColor: 'primary.main',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {item.label}
                      </Typography>
                    }
                  />
                </ListItemButton>
              )}
            </ListItem>
          ))}
        </List>

        {/* Drawer Footer */}
        <Box sx={{ mt: 'auto', pt: 3, borderTop: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, letterSpacing: '0.05em' }}>
            STARTJOBS V1.0 • DOUALA
          </Typography>
        </Box>
      </Drawer>

      {/* ══════════════════ HERO ═══════════════════════════════════════════ */}
      <MotionBox
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="spotlight dot-grid"
        sx={{
          pt: { xs: 10, md: 16 },
          pb: { xs: 8, md: 14 },
          px: { xs: 2, md: 6, lg: 10 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Abstract 3D Floating Orbs */}
        <MotionBox
          variants={floatingOrbVariant}
          animate="animate"
          sx={{
            position: 'absolute', top: '15%', left: { xs: '-10%', md: '10%' },
            width: { xs: 100, md: 150 }, height: { xs: 100, md: 150 },
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || '#7C3AED'})`,
            boxShadow: `inset 10px 10px 20px rgba(255,255,255,0.2), 0 15px 35px ${alpha(theme.palette.primary.main, 0.3)}`,
            opacity: isDark ? 0.4 : 0.6,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <MotionBox
          variants={floatingOrbVariant}
          animate="animate"
          style={{ animationDelay: '-3s' }}
          sx={{
            position: 'absolute', bottom: '15%', right: { xs: '-10%', md: '15%' },
            width: { xs: 80, md: 120 }, height: { xs: 80, md: 120 },
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            background: `linear-gradient(135deg, ${theme.palette.secondary?.main || '#7C3AED'}, ${theme.palette.primary.light})`,
            boxShadow: `inset -10px -10px 20px rgba(255,255,255,0.2), 0 15px 35px ${alpha(theme.palette.secondary?.main || '#7C3AED', 0.3)}`,
            opacity: isDark ? 0.3 : 0.5,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Content wrapper to stay above orbs */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Announcement badge (Shadcn style) */}
        <MotionBox
          variants={flipUpVariant}
          sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}
        >
          <MotionBox
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              borderRadius: '100px',
              px: 2, py: 0.75,
              cursor: 'pointer',
              transition: 'border-color 150ms ease, box-shadow 150ms ease',
              '&:hover': {
                borderColor: alpha(theme.palette.primary.main, 0.5),
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.08)}`,
              },
            }}
            onClick={() => handleEmployerNavigate('/search')}
          >
            <Box className="status-dot-live" />
            <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: '-0.005em', color: 'text.secondary' }}>
              Disponible à Douala · Yaoundé
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
          </MotionBox>
        </MotionBox>

        {/* H1 */}
        <MotionTypography
          variants={flipUpVariant}
          variant="h1"
          sx={{
            fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem', lg: '4.5rem' },
            fontWeight: 800,
            letterSpacing: { xs: '-0.03em', md: '-0.04em' },
            lineHeight: 1.08,
            mb: 3,
            maxWidth: 800,
            mx: 'auto',
          }}
        >
          Trouvez un{' '}
          <Box
            component="span"
            className="gradient-text"
          >
            emploi local
          </Box>
          {' '}dans votre quartier
        </MotionTypography>

        {/* Subtitle */}
        <MotionTypography
          variants={flipUpVariant}
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: { xs: '1rem', md: '1.125rem' },
            maxWidth: 520,
            mx: 'auto',
            mb: 5,
            lineHeight: 1.7,
          }}
        >
          StartJobs connecte les jeunes travailleurs camerounais avec les
          employeurs de leur quartier. Chaque mission réussie construit
          une réputation vérifiée.
        </MotionTypography>

        {/* CTA buttons */}
        <MotionBox
          variants={flipUpVariant}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
            justifyContent: 'center',
            alignItems: 'center',
            mb: 6,
          }}
        >
          <MotionBox whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              onClick={() => handleCandidateNavigate('/offers')}
              className="pressable"
              fullWidth
              sx={{
                px: 4, py: 1.5,
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              Trouver du travail
            </Button>
          </MotionBox>

          <MotionBox whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/onboarding/employeur')}
              className="pressable"
              fullWidth
              sx={{
                px: 4, py: 1.5,
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Je suis employeur
            </Button>
          </MotionBox>
        </MotionBox>

        {/* Social proof row */}
        <MotionBox
          variants={flipUpVariant}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}
        >
          <Box sx={{ display: 'flex' }}>
            {['#1D4ED8', '#059669', '#D97706', '#7C3AED', '#BE185D'].map((c, i) => (
              <MotionAvatar
                key={i}
                whileHover={{ y: -5 }}
                sx={{
                  width: 28, height: 28,
                  bgcolor: c,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  border: `2px solid ${theme.palette.background.default}`,
                  ml: i === 0 ? 0 : -1,
                  cursor: 'pointer',
                  zIndex: 5 - i,
                }}
              >
                {String.fromCharCode(65 + i)}
              </MotionAvatar>
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <StarIcon key={i} sx={{ fontSize: 14, color: '#F59E0B' }} />
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            <strong style={{ color: theme.palette.text.primary }}>1 200+</strong> jeunes font confiance à StartJobs
          </Typography>
        </MotionBox>
        </Box>
      </MotionBox>

      {/* ══════════════════ STATS ══════════════════════════════════════════ */}
      <Box sx={{ px: { xs: 2, md: 6, lg: 10 }, py: { xs: 6, md: 8 } }}>
        <Box
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {STATS.map((s, i) => (
            <MotionBox key={s.label} variants={pop3DVariant}>
              <TiltCard
                tiltMaxAngleX={15} tiltMaxAngleY={15} scaleOnHover={1.05}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  textAlign: 'center',
                  transition: 'border-color 300ms ease, box-shadow 300ms ease',
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1, '& svg': { fontSize: 28 } }}>
                  {s.icon}
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                  {s.label}
                </Typography>
              </TiltCard>
            </MotionBox>
          ))}
        </Box>
      </Box>

      {/* ══════════════════ HOW IT WORKS ═══════════════════════════════════ */}
      <Box
        sx={{
          px: { xs: 2, md: 6, lg: 10 },
          py: { xs: 8, md: 12 },
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? alpha(theme.palette.primary.main, 0.03) : alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" color="primary" sx={{ letterSpacing: '0.1em', fontSize: '0.75rem', mb: 1, display: 'block' }}>
            Comment ça marche
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.03em' }}>
            Simple, rapide, local
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto' }}>
            De l'inscription à la première mission en moins de 24h.
          </Typography>
        </Box>

        <Box
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 3, md: 4 },
            maxWidth: 900,
            mx: 'auto',
          }}
        >
          {HOW.map((h, i) => (
            <MotionBox key={h.step} variants={flipUpVariant} sx={{ height: '100%' }}>
              <TiltCard
                tiltMaxAngleX={10} tiltMaxAngleY={10} scaleOnHover={1.03}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  bgcolor: 'background.paper',
                  height: '100%',
                }}
              >
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontWeight: 800,
                    fontSize: '1rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: '-0.02em',
                    mb: 2.5,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  {h.step}
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '-0.02em' }}>
                  {h.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {h.desc}
                </Typography>
              </TiltCard>
            </MotionBox>
          ))}
        </Box>
      </Box>

      {/* ══════════════════ CATEGORIES ═════════════════════════════════════ */}
      <Box sx={{ px: { xs: 2, md: 6, lg: 10 }, py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" color="primary" sx={{ letterSpacing: '0.1em', fontSize: '0.75rem', mb: 1, display: 'block' }}>
            Tous les métiers
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
            Votre domaine est ici
          </Typography>
        </Box>

        <Box
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', maxWidth: 700, mx: 'auto' }}
        >
          {CATEGORIES.map((c) => (
            <Box
              key={c.label}
              component={motion.div}
              variants={pop3DVariant}
              whileHover={{ y: -3, scale: 1.05 }}
              onClick={() => handleEmployerNavigate('/search')}
              className="pressable"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: '8px',
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                '&:hover': {
                  borderColor: c.color,
                  bgcolor: alpha(c.color, 0.05),
                  boxShadow: `0 4px 12px ${alpha(c.color, 0.15)}`,
                },
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                {c.label}
              </Typography>
            </Box>
          ))}
          <Box
            component={motion.div}
            variants={pop3DVariant}
            whileHover={{ y: -3, scale: 1.05 }}
            onClick={() => handleEmployerNavigate('/search')}
            className="pressable"
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.75,
              px: 2, py: 1,
              borderRadius: '8px',
              border: `1px solid ${theme.palette.primary.main}`,
              color: 'primary.main',
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              cursor: 'pointer',
              transition: 'all 150ms ease',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              Explorer tout
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      </Box>

      {/* ══════════════════ TESTIMONIALS ═══════════════════════════════════ */}
      <Box
        sx={{
          px: { xs: 2, md: 6, lg: 10 },
          py: { xs: 8, md: 12 },
          bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Typography variant="overline" color="primary" sx={{ letterSpacing: '0.1em', fontSize: '0.75rem', mb: 1, display: 'block' }}>
            Témoignages
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
            Ils ont trouvé du travail
          </Typography>
        </Box>

        <Box
          component={motion.div}
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2.5,
            maxWidth: 1000,
            mx: 'auto',
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <MotionBox key={t.name} variants={flipUpVariant} sx={{ height: '100%' }}>
              <TiltCard
                tiltMaxAngleX={8} tiltMaxAngleY={8} scaleOnHover={1.02}
                sx={{
                  p: 3,
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  bgcolor: 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  transition: 'box-shadow 300ms ease, border-color 300ms ease',
                  '&:hover': {
                    boxShadow: `0 16px 32px ${alpha(t.color, 0.15)}`,
                    borderColor: alpha(t.color, 0.4),
                  }
                }}
              >
                {/* Stars */}
                <Box sx={{ display: 'flex', gap: 0.25 }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <StarIcon key={s} sx={{ fontSize: 14, color: '#F59E0B' }} />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, flex: 1, fontStyle: 'italic' }}>
                  "{t.text}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: t.color, fontSize: '0.75rem', fontWeight: 700 }}>
                    {t.photo}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{t.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{t.role}</Typography>
                  </Box>
                </Box>
              </TiltCard>
            </MotionBox>
          ))}
        </Box>
      </Box>

      {/* ══════════════════ CTA FINAL ══════════════════════════════════════ */}
      <Box
        className="spotlight"
        sx={{
          px: { xs: 2, md: 6, lg: 10 },
          py: { xs: 12, md: 18 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background 3D Orbs */}
        <MotionBox
          variants={floatingOrbVariant}
          animate="animate"
          sx={{
            position: 'absolute', top: '20%', left: '20%',
            width: 200, height: 200,
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary?.light || '#A78BFA'})`,
            filter: 'blur(30px)',
            opacity: 0.3,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        <Box
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95, y: 50, rotateX: -20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          whileHover={{ y: -5, boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}` }}
          sx={{
            maxWidth: 560,
            mx: 'auto',
            p: { xs: 4, md: 6 },
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 300ms ease',
            zIndex: 1,
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Decorative glow */}
          <Box
            sx={{
              position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
              width: 200, height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <CheckCircleIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.03em' }}>
            Commencez gratuitement
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
            Créez votre profil en 5 minutes et commencez à recevoir
            des offres dans votre quartier dès aujourd'hui.
          </Typography>

          <Box component={motion.div} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/onboarding/jeune')}
              className="pressable"
              fullWidth
              sx={{
                borderRadius: '10px', py: 1.5, fontWeight: 700, fontSize: '1rem',
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}` },
              }}
            >
              Créer mon profil
            </Button>
          </Box>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2 }}>
            Gratuit · Sans carte bancaire · En 5 minutes
          </Typography>
        </Box>
      </Box>

      {/* ══════════════════ FOOTER ═════════════════════════════════════════ */}
      <Box
        component="footer"
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          px: { xs: 2, md: 6, lg: 10 },
          py: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 24, height: 24, borderRadius: '6px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 800, fontSize: '0.75rem',
            }}
          >
            S
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>StartJobs</Typography>
        </Box>
        <Typography variant="caption" color="text.disabled">
          © 2024 StartJobs · Douala, Cameroun · Conçu pour les jeunes travailleurs
        </Typography>
      </Box>
    </Box>
  );
}
