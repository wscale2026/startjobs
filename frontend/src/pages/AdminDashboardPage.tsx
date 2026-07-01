import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, alpha, useTheme, Chip, IconButton, Paper, CircularProgress } from '@mui/material';
import TiltCard from '../components/TiltCard';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BadgeIcon from '@mui/icons-material/Badge';
import VerifiedIcon from '@mui/icons-material/Verified';
import useSWR from 'swr';
import { fetcher } from '../utils/api';



const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme();
  if (active && payload && payload.length) {
    return (
      <Box sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(16px)',
        p: 2,
        borderRadius: '16px',
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.1)}`,
      }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>{label}</Typography>
        {payload.map((p: any) => (
          <Box key={p.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: p.color || p.fill }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'capitalize' }}>{p.name}:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 800 }}>{p.value}</Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const theme = useTheme();
  
  const { data: stats, error } = useSWR('/admin/dashboard/', fetcher, { refreshInterval: 10000 });
  const loading = !stats && !error;

  if (loading || !stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const kpis = [
    { title: 'Total Candidats', value: stats.total_candidates.toString(), sub: 'Inscrits sur la plateforme', color: theme.palette.primary.main, icon: <PeopleIcon /> },
    { title: 'Employeurs Actifs', value: stats.total_employers.toString(), sub: 'Entreprises & Particuliers', color: theme.palette.info.main, icon: <WorkIcon /> },
    { title: 'Offres d\'emploi', value: stats.total_offers.toString(), sub: 'Missions publiées', color: theme.palette.success.main, icon: <DescriptionIcon /> },
    { title: 'Candidatures', value: stats.total_applications.toString(), sub: 'CV envoyés', color: theme.palette.secondary.main, icon: <CheckCircleIcon /> },
    { title: 'Demandes KYC', value: stats.pending_kyc_requests?.toString() || '0', sub: 'Identités en attente', color: theme.palette.warning.main, icon: <BadgeIcon /> },
    { title: 'Demandes de Badge', value: stats.pending_badge_requests?.toString() || '0', sub: 'Badges "Vérifié"', color: theme.palette.error.main, icon: <VerifiedIcon /> },
  ];

  const dataUsers = [
    { name: 'Candidats', value: stats.total_candidates },
    { name: 'Employeurs', value: stats.total_employers },
  ];
  
  // Provide fallback for chart data
  const dataGrowth = stats.chart_data && stats.chart_data.length > 0 ? stats.chart_data : [
    { date: 'Lun', inscrits: 0 },
    { date: 'Mar', inscrits: 0 },
    { date: 'Mer', inscrits: 0 },
    { date: 'Jeu', inscrits: 0 },
    { date: 'Ven', inscrits: 0 },
    { date: 'Sam', inscrits: 0 },
    { date: 'Dim', inscrits: 0 },
  ];

  const dataOffersByDay = stats.offers_by_day && stats.offers_by_day.length > 0 ? stats.offers_by_day : [
    { name: 'Lun', offres: 0 },
    { name: 'Mar', offres: 0 },
    { name: 'Mer', offres: 0 },
    { name: 'Jeu', offres: 0 },
    { name: 'Ven', offres: 0 },
    { name: 'Sam', offres: 0 },
    { name: 'Dim', offres: 0 },
  ];

  const dataSectors = stats.sectors_data && stats.sectors_data.length > 0 ? stats.sectors_data : [
    { name: 'Aucun secteur', value: 100 }
  ];

  const dataRadar = stats.radar_data && stats.radar_data.length > 0 ? stats.radar_data : [
    { subject: 'Aucune donnée', A: 0, B: 0, fullMark: 100 }
  ];

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
            Tableau de Bord Pro
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Suivi macroscopique et micro-analytique de la plateforme
          </Typography>
        </Box>
        <Chip label="Mise à jour en direct" color="success" size="small" icon={<OnlinePredictionIcon />} sx={{ fontWeight: 700 }} />
      </Box>

      {/* Grille dense de KPIs */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {kpis.map((kpi, i) => (
          <Grid size={{ xs: 6, sm: 6, md: 4, lg: 4 }} key={kpi.title}>
            <Box component={motion.div} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <TiltCard
                scaleOnHover={1.02}
                sx={{
                  p: { xs: 1.5, md: 2.5 },
                  borderRadius: '20px',
                  bgcolor: 'background.paper',
                  border: `1px solid ${alpha(kpi.color, 0.2)}`,
                  boxShadow: `0 8px 24px ${alpha(kpi.color, 0.08)}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.08, transform: 'scale(2.5)', color: kpi.color, pointerEvents: 'none' }}>
                  {kpi.icon}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: alpha(kpi.color, 0.1), color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {kpi.icon}
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: { xs: '0.65rem', md: '0.875rem' }, lineHeight: 1.2 }}>
                    {kpi.title}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary', mb: 0.5, letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: kpi.color, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.65rem', md: '0.75rem' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <TrendingUpIcon fontSize="small" /> {kpi.sub}
                </Typography>
              </TiltCard>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Graphiques Complexes */}
      <Grid container spacing={3}>
        {/* Courbe Principale */}
        <Grid size={{ xs: 12, xl: 8 }}>
          <Paper component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} sx={{ p: 4, borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, height: 420, display: 'flex', flexDirection: 'column', boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.06)}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexShrink: 0 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Trafic & Inscriptions</Typography>
                <Typography variant="body2" color="text.secondary">Nouvelles inscriptions vs Utilisateurs actifs</Typography>
              </Box>
              <IconButton size="small"><MoreVertIcon /></IconButton>
            </Box>
            
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <AreaChart data={dataGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInscr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                  <filter id="shadowInscr" height="200%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor={theme.palette.primary.main} floodOpacity="0.3"/>
                  </filter>
                </defs>
                <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fontWeight: 700, fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke={theme.palette.text.secondary} tick={{ fontWeight: 700, fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="inscrits" name="Inscriptions" stroke={theme.palette.primary.main} strokeWidth={4} fillOpacity={1} fill="url(#colorInscr)" style={{ filter: 'url(#shadowInscr)' }} />
              </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Volume des offres en Barres */}
        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <Paper component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} sx={{ p: 4, borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, height: 420, display: 'flex', flexDirection: 'column', boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.06)}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexShrink: 0 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Volume d'offres</Typography>
                <Typography variant="body2" color="text.secondary">Nouvelles annonces postées par jour</Typography>
              </Box>
            </Box>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={dataOffersByDay} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOffres" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.palette.success.main} stopOpacity={1}/>
                    <stop offset="100%" stopColor={theme.palette.success.dark} stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                <XAxis dataKey="name" stroke={theme.palette.text.secondary} tick={{ fontWeight: 700, fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke={theme.palette.text.secondary} tick={{ fontWeight: 700, fontSize: 12 }} axisLine={false} tickLine={false} dx={-5} />
                <RechartsTooltip cursor={{ fill: alpha(theme.palette.divider, 0.3) }} content={<CustomTooltip />} />
                <Bar dataKey="offres" name="Offres Postées" fill="url(#colorOffres)" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Radar Chart (Demande vs Offre par domaine) */}
        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <Paper component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} sx={{ p: 4, borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, height: 420, display: 'flex', flexDirection: 'column', boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.06)}` }}>
            <Box sx={{ mb: 2, flexShrink: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Activité par Domaine</Typography>
              <Typography variant="body2" color="text.secondary">Candidats vs Offres d'emploi</Typography>
            </Box>
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dataRadar}>
                <PolarGrid stroke={alpha(theme.palette.divider, 0.8)} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: theme.palette.text.secondary, fontSize: 12, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Candidats (Demande)" dataKey="A" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.5} />
                <Radar name="Offres (Offre)" dataKey="B" stroke={theme.palette.warning.main} fill={theme.palette.warning.main} fillOpacity={0.5} />
                <RechartsTooltip content={<CustomTooltip />} />
              </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Donut Chart Secteurs */}
        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <Paper component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} sx={{ p: 4, borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, height: 420, display: 'flex', flexDirection: 'column', boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.06)}` }}>
            <Box sx={{ mb: 1, flexShrink: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Répartition des Secteurs</Typography>
              <Typography variant="body2" color="text.secondary">Volume d'offres par catégorie</Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                <defs>
                  <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <Pie data={dataSectors} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={6} dataKey="value" stroke="none" style={{ filter: 'url(#pieShadow)' }}>
                  {dataSectors.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2, flexShrink: 0 }}>
              {dataSectors.slice(0, 3).map((s: any, i: number) => (
                <Box key={s.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: COLORS[i % COLORS.length] }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.name}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>{s.value}%</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Donut Chart Utilisateurs */}
        <Grid size={{ xs: 12, md: 6, xl: 4 }}>
          <Paper component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }} sx={{ p: 4, borderRadius: '24px', border: `1px solid ${theme.palette.divider}`, height: 420, display: 'flex', flexDirection: 'column', boxShadow: `0 24px 64px ${alpha(theme.palette.common.black, 0.06)}` }}>
            <Box sx={{ mb: 1, flexShrink: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Répartition Utilisateurs</Typography>
              <Typography variant="body2" color="text.secondary">Candidats vs Employeurs</Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                <defs>
                  <filter id="pieShadow2" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000" floodOpacity="0.15"/>
                  </filter>
                </defs>
                <Pie data={dataUsers} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={6} dataKey="value" stroke="none" style={{ filter: 'url(#pieShadow2)' }}>
                  {dataUsers.map((entry: any, index: number) => (
                    <Cell key={`cell-user-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
              </PieChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2, flexShrink: 0 }}>
              {dataUsers.map((s: any, i: number) => (
                <Box key={s.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: COLORS[(i + 2) % COLORS.length] }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.name}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>{s.value}%</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}
