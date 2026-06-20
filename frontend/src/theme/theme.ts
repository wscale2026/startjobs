import { createTheme, responsiveFontSizes, alpha } from '@mui/material/styles';

// ─── Motion constants (Shadcn/Magic UI influenced) ──────────────────────────
const EASE_STANDARD  = 'cubic-bezier(0.16, 1, 0.3, 1)';  // expo-out Magic UI signature
const EASE_SPRING    = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
const EASE_SMOOTH    = 'cubic-bezier(0.4, 0, 0.2, 1)';
const T_INSTANT      = '80ms';
const T_FAST         = '150ms';
const T_STANDARD     = '200ms';
const T_COMPLEX      = '300ms';

// ─── Palette ─────────────────────────────────────────────────────────────────
// Tailwind UI inspired: slate scale grays + blue-700 primary + emerald-600 secondary
const SLATE_900  = '#0F172A';
const SLATE_700  = '#334155';
const SLATE_500  = '#64748B';
const SLATE_400  = '#94A3B8';
const SLATE_200  = '#E2E8F0';
const BLUE_700   = '#1D4ED8';
const BLUE_500   = '#3B82F6';
const BLUE_900   = '#1E3A8A';
const EMERALD    = '#059669';
const ZINC_900   = '#18181B';
const ZINC_800   = '#27272A';
const ZINC_400   = '#A1A1AA';

// ─── Shadows ────────────────────────────────────────────────────────────────
const shadows = {
  xs:      '0 1px 2px rgba(15,23,42,0.04)',
  sm:      '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
  md:      '0 4px 6px rgba(15,23,42,0.05), 0 2px 4px rgba(15,23,42,0.04)',
  lg:      '0 10px 15px rgba(15,23,42,0.07), 0 4px 6px rgba(15,23,42,0.04)',
  xl:      '0 20px 25px rgba(15,23,42,0.08), 0 8px 10px rgba(15,23,42,0.04)',
  primary: '0 4px 14px rgba(29,78,216,0.25), 0 1px 3px rgba(29,78,216,0.15)',
} as const;

const shadowsDark = {
  xs:      '0 1px 2px rgba(0,0,0,0.5)',
  sm:      '0 1px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.5)',
  md:      '0 4px 6px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.4)',
  lg:      '0 10px 15px rgba(0,0,0,0.6), 0 4px 6px rgba(0,0,0,0.45)',
  xl:      '0 20px 25px rgba(0,0,0,0.65), 0 8px 10px rgba(0,0,0,0.5)',
  primary: '0 4px 14px rgba(96,165,250,0.3), 0 1px 3px rgba(96,165,250,0.2)',
} as const;

// ─── Shared typography ────────────────────────────────────────────────────────
// Shadcn: clean, slightly tight tracking, strong hierarchy
const typography = {
  fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
  fontWeightLight:   300,
  fontWeightRegular: 400,
  fontWeightMedium:  500,
  fontWeightBold:    700,
  h1: { fontWeight: 800, fontSize: '2.5rem',   lineHeight: 1.1,   letterSpacing: '-0.04em' },
  h2: { fontWeight: 800, fontSize: '1.875rem', lineHeight: 1.15,  letterSpacing: '-0.03em' },
  h3: { fontWeight: 700, fontSize: '1.5rem',   lineHeight: 1.25,  letterSpacing: '-0.025em' },
  h4: { fontWeight: 700, fontSize: '1.25rem',  lineHeight: 1.3,   letterSpacing: '-0.02em' },
  h5: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4,   letterSpacing: '-0.015em' },
  h6: { fontWeight: 600, fontSize: '1rem',     lineHeight: 1.45,  letterSpacing: '-0.01em' },
  body1: { fontWeight: 400, fontSize: '1rem',     lineHeight: 1.65,  letterSpacing: '-0.005em' },
  body2: { fontWeight: 400, fontSize: '0.875rem', lineHeight: 1.6,   letterSpacing: '-0.003em' },
  subtitle1: { fontWeight: 600, fontSize: '1rem',     lineHeight: 1.5, letterSpacing: '-0.01em' },
  subtitle2: { fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.5, letterSpacing: '-0.008em' },
  button:  { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.4, letterSpacing: '-0.01em' },
  caption: { fontWeight: 400, fontSize: '0.75rem',   lineHeight: 1.5, letterSpacing: '0.005em' },
  overline: { fontWeight: 700, fontSize: '0.6875rem', lineHeight: 1.6, letterSpacing: '0.08em',
    textTransform: 'uppercase' as const },
};

// ─── Component overrides ─────────────────────────────────────────────────────
const makeComponents = (isDark: boolean) => {
  const s = isDark ? shadowsDark : shadows;
  const primary = isDark ? '#60A5FA' : BLUE_700;
  const border  = isDark ? ZINC_800  : SLATE_200;

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
        },
      },
    },

    // Shadcn: flat cards with clean borders, no heavy shadows
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${border}`,
          boxShadow: 'none',
          backgroundImage: 'none',
          transition: [
            `transform   ${T_STANDARD} ${EASE_STANDARD}`,
            `box-shadow  ${T_STANDARD} ${EASE_STANDARD}`,
            `border-color ${T_FAST} ${EASE_SMOOTH}`,
          ].join(', '),
        },
      },
    },

    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${border}`,
        },
        elevation0: { boxShadow: 'none' },
        elevation1: { boxShadow: s.sm, border: 'none' },
        elevation2: { boxShadow: s.md, border: 'none' },
      },
    },

    // Tailwind UI: consistent, accessible buttons
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none' as const,
          fontWeight: 600,
          fontSize: '0.9375rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '-0.01em',
          padding: '9px 20px',
          transition: [
            `background-color ${T_FAST} ${EASE_SMOOTH}`,
            `color            ${T_FAST} ${EASE_SMOOTH}`,
            `box-shadow       ${T_FAST} ${EASE_SMOOTH}`,
            `transform        ${T_INSTANT} ${EASE_STANDARD}`,
            `border-color     ${T_FAST} ${EASE_SMOOTH}`,
            `opacity          ${T_FAST} ${EASE_SMOOTH}`,
          ].join(', '),
          '&:active': { transform: 'scale(0.97)' },
          '&.Mui-disabled': { opacity: 0.5 },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          '&:hover': { boxShadow: s.primary },
        },
        outlined: {
          borderColor: border,
          '&:hover': { borderColor: isDark ? '#4B5563' : SLATE_400 },
        },
        sizeLarge: { padding: '11px 28px', fontSize: '1rem', borderRadius: 10 },
        sizeSmall: { padding: '5px 14px', fontSize: '0.8125rem', borderRadius: 6 },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: [
            `background-color ${T_FAST} ${EASE_SMOOTH}`,
            `transform        ${T_INSTANT} ${EASE_STANDARD}`,
          ].join(', '),
          '&:active': { transform: 'scale(0.92)' },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          height: 30,
          fontWeight: 500,
          fontSize: '0.8125rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '-0.005em',
          border: `1px solid ${border}`,
          transition: [
            `background-color ${T_FAST} ${EASE_SMOOTH}`,
            `color            ${T_FAST} ${EASE_SMOOTH}`,
            `border-color     ${T_FAST} ${EASE_SMOOTH}`,
          ].join(', '),
        },
        clickable: {
          '&:hover':  { borderColor: isDark ? '#4B5563' : SLATE_400 },
          '&:active': { transform: 'scale(0.96)' },
        },
        filled: { border: 'none' },
      },
    },

    MuiTextField: {
      defaultProps: { variant: 'outlined' as const },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            transition: [
              `box-shadow   ${T_FAST} ${EASE_SMOOTH}`,
              `border-color ${T_FAST} ${EASE_SMOOTH}`,
            ].join(', '),
            '& fieldset': { borderColor: border },
            '&:hover fieldset': { borderColor: isDark ? '#4B5563' : SLATE_400 },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(primary, 0.15)}`,
            },
            '&.Mui-focused fieldset': { borderColor: primary },
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: border },
        },
      },
    },

    // Tailwind UI nav: glass bottom bar
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 68,
          background: 'transparent',
        },
      },
    },

    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 60,
          padding: '10px 0',
          color: isDark ? ZINC_400 : SLATE_500,
          transition: [
            `color     ${T_FAST} ${EASE_SMOOTH}`,
            `transform ${T_FAST} ${EASE_SPRING}`,
          ].join(', '),
          '&.Mui-selected': {
            color: primary,
            transform: 'translateY(-1px)',
          },
        },
        label: {
          fontSize: '0.625rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          '&.Mui-selected': { fontSize: '0.625rem' },
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          borderRight: `1px solid ${border}`,
        },
      },
    },

    MuiFab: {
      defaultProps: { disableRipple: false },
      styleOverrides: {
        root: {
          borderRadius: 14,
          textTransform: 'none' as const,
          fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.9375rem',
          boxShadow: s.lg,
          transition: [
            `transform  ${T_FAST} ${EASE_SPRING}`,
            `box-shadow ${T_STANDARD} ${EASE_SMOOTH}`,
          ].join(', '),
          '&:active': { transform: 'scale(0.95)', boxShadow: s.md },
          '@media (hover: hover)': {
            '&:hover': { transform: 'scale(1.04) translateY(-2px)', boxShadow: s.primary },
          },
        },
        extended: { padding: '0 22px', height: 52, gap: '8px' },
      },
    },

    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 4, height: 4 } },
    },

    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: [
            `background-color ${T_FAST} ${EASE_SMOOTH}`,
            `transform        ${T_INSTANT} ${EASE_STANDARD}`,
          ].join(', '),
          '&:active': { transform: 'scale(0.99)' },
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.9375rem',
          letterSpacing: '-0.008em',
          minWidth: 'auto',
          padding: '8px 16px',
          color: isDark ? ZINC_400 : SLATE_500,
          transition: `color ${T_FAST} ${EASE_SMOOTH}`,
          '&.Mui-selected': { fontWeight: 600 },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: { height: 2, borderRadius: 2 },
      },
    },

    MuiRating: {
      styleOverrides: {
        icon: { transition: `transform ${T_FAST} ${EASE_SPRING}` },
        iconFilled: { color: '#F59E0B' },
        iconHover:  { color: '#D97706', transform: 'scale(1.15)' },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          backgroundImage: 'none',
          boxShadow: isDark ? shadowsDark.xl : shadows.xl,
          border: `1px solid ${border}`,
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: border },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.75rem',
          fontWeight: 500,
          padding: '4px 10px',
          backgroundColor: isDark ? '#3F3F46' : SLATE_700,
        },
      },
    },
  };
};

// ─── Light Theme ─────────────────────────────────────────────────────────────
let lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: BLUE_700, light: BLUE_500, dark: BLUE_900, contrastText: '#FFF' },
    secondary:  { main: EMERALD,  light: '#34D399', dark: '#047857', contrastText: '#FFF' },
    error:      { main: '#DC2626', light: '#F87171', dark: '#991B1B', contrastText: '#FFF' },
    warning:    { main: '#D97706', light: '#FBBF24', dark: '#92400E', contrastText: '#FFF' },
    info:       { main: BLUE_700, contrastText: '#FFF' },
    success:    { main: EMERALD,  contrastText: '#FFF' },
    background: { default: '#FAFAFA', paper: '#FFFFFF' },
    text:       { primary: SLATE_900, secondary: SLATE_500, disabled: SLATE_400 },
    divider:    SLATE_200,
    action: {
      hover:    alpha(BLUE_700, 0.05),
      selected: alpha(BLUE_700, 0.08),
      focus:    alpha(BLUE_700, 0.10),
      active:   alpha(BLUE_700, 0.12),
    },
  },
  shape: { borderRadius: 8 },  // Shadcn base = 8px
  typography,
  components: makeComponents(false),
});
lightTheme = responsiveFontSizes(lightTheme, { factor: 2.5 });

// ─── Dark Theme ──────────────────────────────────────────────────────────────
let darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#60A5FA', light: '#93C5FD', dark: '#3B82F6', contrastText: '#0F172A' },
    secondary:  { main: '#34D399', light: '#6EE7B7', dark: '#059669', contrastText: '#022C22' },
    error:      { main: '#F87171', light: '#FECACA', dark: '#DC2626', contrastText: '#450A0A' },
    warning:    { main: '#FBBF24', light: '#FDE68A', dark: '#D97706', contrastText: '#451A03' },
    info:       { main: '#60A5FA', contrastText: '#0F172A' },
    success:    { main: '#34D399', contrastText: '#022C22' },
    background: { default: '#09090B', paper: '#18181B' },
    text:       { primary: '#FAFAFA', secondary: ZINC_400, disabled: '#52525B' },
    divider:    ZINC_800,
    action: {
      hover:    alpha('#60A5FA', 0.07),
      selected: alpha('#60A5FA', 0.10),
      focus:    alpha('#60A5FA', 0.12),
      active:   alpha('#60A5FA', 0.14),
    },
  },
  shape: { borderRadius: 8 },
  typography,
  components: makeComponents(true),
});
darkTheme = responsiveFontSizes(darkTheme, { factor: 2.5 });

export { lightTheme, darkTheme };
