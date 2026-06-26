import React, { useState } from 'react';
import {
  Box, InputBase, IconButton, Collapse, useTheme, Typography, alpha, Divider,
  Grid, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useAppDispatch, useAppSelector } from '../store';
import { setDomaine, toggleDisponible, setRayon, setQuery, setTypeProfil, resetFilters } from '../store/slices/filtersSlice';
import { DOMAINES } from '../mocks/workers';

const RADIUS_OPTIONS: (1 | 3 | 5 | null)[] = [1, 3, 5, null];

/* ─── Filter Chip ─── */
function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box
      onClick={onClick}
      className="pressable"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.75,
        py: 0.75,
        borderRadius: '10px',
        border: '1px solid',
        borderColor: active
          ? theme.palette.primary.main
          : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        bgcolor: active
          ? alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08)
          : isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
        color: active ? 'primary.main' : 'text.secondary',
        cursor: 'pointer',
        flexShrink: 0,
        boxShadow: active ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: active ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.4),
          bgcolor: active
            ? alpha(theme.palette.primary.main, 0.2)
            : alpha(theme.palette.primary.main, 0.04),
          transform: 'translateY(-1.5px)',
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, active ? 0.2 : 0.05)}`,
        },
      }}
    >
      {active && <CheckIcon sx={{ fontSize: 13, color: 'primary.main' }} />}
      <Typography sx={{ fontSize: '0.8rem', fontWeight: active ? 700 : 500, lineHeight: 1.4 }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ─── SearchBar ─── */
export default function SearchBar() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);
  const [expanded, setExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const activeCount =
    (filters.domaine ? 1 : 0) +
    (filters.disponible ? 1 : 0) +
    (filters.rayon !== null ? 1 : 0) +
    (filters.typeProfil ? 1 : 0);

  return (
    <Box sx={{ mb: 3 }}>
      {/* Search input — Shadcn style: clean, bordered */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'background.paper',
          borderRadius: '12px',
          border: `1px solid ${isFocused ? theme.palette.primary.main : theme.palette.divider}`,
          boxShadow: isFocused ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}` : 'none',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          px: 2,
          py: 0.75,
        }}
      >
        <SearchIcon sx={{ fontSize: 20, color: isFocused ? 'primary.main' : 'text.disabled', mr: 1.5, flexShrink: 0, transition: 'color 150ms ease' }} />
        <InputBase
          placeholder="Métier, compétence (ex: Plomberie, Cuisine…)"
          sx={{ flex: 1, fontSize: '0.9375rem', fontWeight: 500, color: 'text.primary', py: 0.75 }}
          value={filters.query}
          onChange={(e) => dispatch(setQuery(e.target.value))}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {filters.query && (
          <IconButton size="small" onClick={() => dispatch(setQuery(''))} sx={{ color: 'text.disabled', mr: 0.5 }} className="pressable">
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
        <Divider orientation="vertical" flexItem sx={{ mx: 1.5, my: 0.75 }} />
        <IconButton
          onClick={() => setExpanded(!expanded)}
          className="pressable"
          size="small"
          sx={{
            borderRadius: '8px',
            color: activeCount > 0 ? 'primary.main' : 'text.secondary',
            bgcolor: activeCount > 0 ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
            position: 'relative',
            px: 1.5,
            py: 1,
            gap: 0.75,
            border: activeCount > 0 ? `1px solid ${alpha(theme.palette.primary.main, 0.25)}` : '1px solid transparent',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: activeCount > 0 ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.primary.main, 0.04),
            }
          }}
        >
          <TuneIcon sx={{ fontSize: 18 }} />
          <Typography variant="button" sx={{ fontSize: '0.8rem', fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
            Filtres
          </Typography>
          {activeCount > 0 && (
            <Box
              sx={{
                position: 'absolute',
                top: 3,
                right: 3,
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                border: `1.5px solid ${theme.palette.background.paper}`,
              }}
            />
          )}
        </IconButton>
      </Box>

      {/* Expanded filter panel — Premium Grid Style */}
      <Collapse in={expanded}>
        <Box
          sx={{
            mt: 1.5,
            bgcolor: 'background.paper',
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 12px 30px -10px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          <Grid container spacing={3} sx={{ p: 3 }}>
            {/* Left Column — Domains & Availability */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.25 }}>
                {/* Domaine */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                      Domaine d'activité
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1,
                    maxHeight: 130,
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', borderRadius: '4px' }
                  }}>
                    {DOMAINES.map((d) => (
                      <FilterChip
                        key={d}
                        label={d}
                        active={filters.domaine === d}
                        onClick={() => dispatch(setDomaine(filters.domaine === d ? null : d))}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Disponibilité */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                      Disponibilité
                    </Typography>
                  </Box>
                  <FilterChip
                    label="Disponible immédiatement"
                    active={!!filters.disponible}
                    onClick={() => dispatch(toggleDisponible())}
                  />
                </Box>
              </Box>
            </Grid>

            {/* Right Column — Type de Profil & Rayon */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.25 }}>
                {/* Type de profil */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                      Type de profil
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {['Freelance', 'Salarié', 'Apprenti'].map((t) => (
                      <FilterChip
                        key={t}
                        label={t}
                        active={filters.typeProfil === t}
                        onClick={() => dispatch(setTypeProfil(filters.typeProfil === t ? null : t))}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Rayon */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.75 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                      Rayon de recherche (Géoloc)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {RADIUS_OPTIONS.map((r) => (
                      <FilterChip
                        key={r === null ? 'all' : r}
                        label={r === null ? 'Tous' : `${r} km`}
                        active={filters.rayon === r}
                        onClick={() => dispatch(setRayon(r))}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Action Footer */}
          <Box
            sx={{
              px: 3,
              py: 2,
              bgcolor: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)',
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2
            }}
          >
            {/* Left Pill Info */}
            <Box>
              {activeCount > 0 ? (
                <Box
                  sx={{
                    px: 1.5, py: 0.5, borderRadius: '20px',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.75
                  }}
                >
                  <FilterListIcon sx={{ fontSize: 13 }} />
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    {activeCount} filtre{activeCount > 1 ? 's' : ''} actif{activeCount > 1 ? 's' : ''}
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', fontWeight: 600 }}>
                  Aucun filtre sélectionné
                </Typography>
              )}
            </Box>

            {/* Right Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {activeCount > 0 && (
                <Button
                  onClick={() => dispatch(resetFilters())}
                  variant="text"
                  color="error"
                  size="small"
                  startIcon={<RotateLeftIcon fontSize="small" />}
                  sx={{ fontWeight: 700, borderRadius: '8px', fontSize: '0.75rem', textTransform: 'none' }}
                >
                  Réinitialiser
                </Button>
              )}
              <Button
                onClick={() => setExpanded(false)}
                variant="outlined"
                color="primary"
                size="small"
                sx={{ fontWeight: 700, borderRadius: '8px', fontSize: '0.75rem', textTransform: 'none', px: 2 }}
              >
                Fermer
              </Button>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
