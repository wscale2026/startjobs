import React, { useState } from 'react';
import {
  Chip, SwipeableDrawer, List, ListItem, ListItemButton,
  ListItemText, Typography, Box, Divider, IconButton, InputBase, alpha, useTheme
} from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppDispatch, useAppSelector } from '../store';
import { setQuartier } from '../store/slices/locationSlice';
import QUARTIERS from '../mocks/quartiers';

export default function LocationChip() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const quartier = useAppSelector((s) => s.location.quartier);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = theme.palette.mode === 'dark';

  return (
    <>
      <Chip
        icon={<PlaceIcon sx={{ fontSize: '16px !important' }} />}
        label={quartier}
        onClick={() => setOpen(true)}
        size="small"
        sx={{
          bgcolor: 'rgba(255,255,255,0.15)',
          color: 'inherit',
          border: '1px solid rgba(255,255,255,0.3)',
          fontWeight: 500,
          cursor: 'pointer',
          '& .MuiChip-icon': { color: 'inherit' },
        }}
      />

      {/* Location Selector Drawer Premium UI */}
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
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
                <PlaceIcon sx={{ fontSize: 16 }} /> Douala, Cameroun
              </Typography>
            </Box>
            <IconButton onClick={() => setOpen(false)} size="small" sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{ fontSize: '0.95rem', fontWeight: 500 }}
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
        
        <List sx={{ overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {QUARTIERS.filter(q => q.toLowerCase().includes(searchQuery.toLowerCase())).map((q) => {
            const isSelected = q === quartier;
            return (
              <ListItem key={q} disablePadding>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => { dispatch(setQuartier(q)); setOpen(false); }}
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
          
          {QUARTIERS.filter(q => q.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
            <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
              <SearchIcon sx={{ fontSize: 40, mb: 1, color: 'text.secondary' }} />
              <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>Aucun quartier trouvé</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>Essayez une autre orthographe</Typography>
            </Box>
          )}
        </List>
      </SwipeableDrawer>
    </>
  );
}
