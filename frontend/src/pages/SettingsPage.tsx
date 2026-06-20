import React from 'react';
import {
  Box, Typography, List, ListItem, ListItemButton, ListItemText, ListItemSecondaryAction,
  Switch, Divider, Paper, Button, Select, MenuItem, FormControl,
  useTheme, ListItemIcon,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import { useThemeMode } from '../theme/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1, px: 0.5 }}>
        {title}
      </Typography>
      <Paper elevation={0} sx={{ mt: 1, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        {children}
      </Paper>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Paramètres</Typography>

      <Section title="Apparence">
        <List disablePadding>
          <ListItem>
            <ListItemIcon><DarkModeIcon /></ListItemIcon>
            <ListItemText primary="Mode sombre" secondary={mode === 'dark' ? 'Activé' : 'Désactivé'} />
            <ListItemSecondaryAction>
              <Switch checked={mode === 'dark'} onChange={toggleTheme} color="primary" />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Section>

      <Section title="Langue">
        <List disablePadding>
          <ListItem>
            <ListItemIcon><LanguageIcon /></ListItemIcon>
            <ListItemText primary="Langue de l'interface" />
            <ListItemSecondaryAction>
              <FormControl size="small">
                <Select value="fr" sx={{ fontSize: '0.875rem', borderRadius: 2 }}>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Section>

      <Section title="Notifications">
        {[
          { label: 'Nouvelles offres', sub: 'Recevoir des alertes dans votre quartier', on: true },
          { label: 'Évaluations', sub: 'Quand un employeur vous note', on: true },
          { label: 'Rappels de mission', sub: 'La veille et le matin', on: false },
        ].map((item, i, arr) => (
          <React.Fragment key={item.label}>
            <ListItem>
              <ListItemIcon><NotificationsIcon /></ListItemIcon>
              <ListItemText primary={item.label} secondary={item.sub} />
              <ListItemSecondaryAction>
                <Switch defaultChecked={item.on} color="primary" />
              </ListItemSecondaryAction>
            </ListItem>
            {i < arr.length - 1 && <Divider component="li" variant="inset" />}
          </React.Fragment>
        ))}
      </Section>

      <Section title="Compte">
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton className="pressable" sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}
              onClick={() => navigate('/onboarding/jeune')}>
              <ListItemIcon><SecurityIcon /></ListItemIcon>
              <ListItemText primary="Modifier mon profil" secondary="Identité, compétences, disponibilités" />
            </ListItemButton>
          </ListItem>
          <Divider component="li" variant="inset" />
          <ListItem disablePadding>
            <ListItemButton className="pressable" sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
              <ListItemIcon><LogoutIcon sx={{ color: 'error.main' }} /></ListItemIcon>
              <ListItemText primary={<Typography color="error">Se déconnecter</Typography>} />
            </ListItemButton>
          </ListItem>
          <Divider component="li" variant="inset" />
          <ListItem disablePadding>
            <ListItemButton className="pressable" sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
              <ListItemIcon><DeleteIcon sx={{ color: 'error.main' }} /></ListItemIcon>
              <ListItemText primary={<Typography color="error">Supprimer mon compte</Typography>} secondary="Cette action est irréversible" />
            </ListItemButton>
          </ListItem>
        </List>
      </Section>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        StartJobs V1 · © 2024 · Douala, Cameroun
      </Typography>
    </Box>
  );
}
