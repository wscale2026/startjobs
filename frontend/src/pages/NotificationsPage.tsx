import React from 'react';
import {
  Box, Typography, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, Chip, Divider, Paper, useTheme, ListItemButton,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import VerifiedIcon from '@mui/icons-material/Verified';

const NOTIFICATIONS = [
  { id: 'n1', icon: WorkIcon, color: '#0066CC', title: 'Nouvelle offre près de vous', body: 'Aide cuisinière recherchée à Akwa · Il y a 2h', read: false },
  { id: 'n2', icon: StarIcon, color: '#F59E0B', title: 'Vous avez reçu une évaluation', body: 'Mme Claire vous a donné 4.8 – "Ponctuel et sérieux"', read: false },
  { id: 'n3', icon: VerifiedIcon, color: '#00A86B', title: 'Expérience vérifiée créée', body: 'Ouvrier de chantier chez Construction Mballa est maintenant vérifiée', read: true },
  { id: 'n4', icon: WorkIcon, color: '#0066CC', title: '3 nouvelles offres dans New Bell', body: 'Voir les offres disponibles ce matin', read: true },
  { id: 'n5', icon: NotificationsIcon, color: '#7B1FA2', title: 'Rappel de mission', body: 'Votre mission de demain chez Cabinet Nkeng commence à 8h', read: true },
];

export default function NotificationsPage() {
  const theme = useTheme();
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Notifications</Typography>
        {unread > 0 && <Chip label={`${unread} nouvelles`} color="primary" size="small" sx={{ fontWeight: 600 }} />}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <List disablePadding>
          {NOTIFICATIONS.map((n, i) => {
            const IconComp = n.icon;
            return (
              <React.Fragment key={n.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    className="pressable"
                    sx={{
                      py: 2,
                      px: 2.5,
                      bgcolor: !n.read ? `${n.color}08` : 'transparent',
                      transition: 'background-color 160ms cubic-bezier(0.2, 0, 0, 1)',
                      '&:hover': { bgcolor: theme.palette.action.hover },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `${n.color}18`, color: n.color }}>
                        <IconComp />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: !n.read ? 700 : 500 }}>
                            {n.title}
                          </Typography>
                          {!n.read && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', flexShrink: 0 }} />}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">{n.body}</Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {i < NOTIFICATIONS.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      </Paper>
    </Box>
  );
}
