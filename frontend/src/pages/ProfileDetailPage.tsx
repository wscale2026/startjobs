import React from 'react';
import {
  Box, Typography, Avatar, Button, Chip, useTheme, alpha, Grid,
  IconButton, Paper, Stack, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShareIcon from '@mui/icons-material/Share';
import PlaceIcon from '@mui/icons-material/Place';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import CategoryIcon from '@mui/icons-material/Category';
import GroupsIcon from '@mui/icons-material/Groups';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_WORKERS } from '../mocks/workers';
import ExperienceCard from '../components/ExperienceCard';
import TikTokShareModal from '../components/TikTokShareModal';
import api from '../utils/api';

export default function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [worker, setWorker] = React.useState<any>(null);
  const [profileType, setProfileType] = React.useState<'candidate' | 'employer' | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showContact, setShowContact] = React.useState(false);
  const [shareOpen, setShareOpen] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);

    api.get(`users/profile/${id}/`)
      .then((res) => {
        const { profile_type, data: c } = res.data;
        setProfileType(profile_type);

        if (profile_type === 'candidate') {
          setWorker({
            id: String(id),
            prenom: c.user?.first_name || 'Candidat',
            nom: c.user?.last_name || '',
            photo: c.photo || null,
            photoColor: theme.palette.secondary.main,
            initials: `${(c.user?.first_name || 'C')[0]}${(c.user?.last_name || '')[0] || ''}`.toUpperCase(),
            quartier: c.neighborhood || 'Non renseigné',
            distance: 1.2,
            score: c.score || 0,
            totalMissions: c.total_missions || 0,
            bio: c.bio || 'Aucune description rédigée.',
            disponible: c.is_available,
            domaines: c.skills?.map((s: any) => s.name) || [],
            competences: c.skills?.map((s: any) => s.name) || [],
            langues: c.languages?.map((l: any) => l.name) || [],
            permis: c.has_license,
            diplome: c.highest_diploma || null,
            etablissement: c.institution || null,
            anneeObtention: c.graduation_year || null,
            experiences: c.experiences?.map((xp: any) => ({
              id: String(xp.id),
              titre: xp.title,
              employeur: xp.employer_name,
              date: xp.date,
              type: xp.exp_type,
              rating: xp.rating,
              commentaire: xp.comment
            })) || [],
            typeProfil: c.profile_type || 'Freelance',
            whatsapp: c.phone || null,
            verified: false,
            role: 'candidate',
          });
        } else {
          // employer profile
          setWorker({
            id: String(id),
            prenom: c.company_name || 'Entreprise',
            nom: '',
            photo: c.logo || null,
            photoColor: theme.palette.primary.main,
            initials: (c.company_name || 'E')[0].toUpperCase(),
            quartier: c.neighborhood || c.city || 'Non renseigné',
            distance: 1.2,
            score: 0,
            totalMissions: 0,
            bio: c.description || 'Aucune description renseignée.',
            disponible: true,
            domaines: [c.industry].filter(Boolean),
            competences: [],
            langues: [],
            permis: false,
            experiences: [],
            typeProfil: 'Employeur',
            whatsapp: c.phone || null,
            phone: c.phone || null,
            address: c.address || null,
            city: c.city || null,
            industry: c.industry || null,
            recruits_per_month: c.recruits_per_month || null,
            verified: c.verified || false,
            role: 'employer',
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching user profile:', err);
        // Fallback: try candidates endpoint
        api.get(`candidates/${id}/`)
          .then((res) => {
            const c = res.data;
            setProfileType('candidate');
            setWorker({
              id: String(id),
              prenom: c.user?.first_name || 'Candidat',
              nom: c.user?.last_name || '',
              photo: c.photo || null,
              photoColor: theme.palette.secondary.main,
              initials: `${(c.user?.first_name || 'C')[0]}${(c.user?.last_name || '')[0] || ''}`.toUpperCase(),
              quartier: c.neighborhood || 'Non renseigné',
              distance: 1.2,
              score: c.score || 0,
              totalMissions: c.total_missions || 0,
              bio: c.bio || 'Aucune description rédigée.',
              disponible: c.is_available,
              domaines: c.skills?.map((s: any) => s.name) || [],
              competences: c.skills?.map((s: any) => s.name) || [],
              langues: c.languages?.map((l: any) => l.name) || [],
              permis: c.has_license,
              diplome: c.highest_diploma || null,
              etablissement: c.institution || null,
              anneeObtention: c.graduation_year || null,
              experiences: c.experiences?.map((xp: any) => ({
                id: String(xp.id),
                titre: xp.title,
                employeur: xp.employer_name,
                date: xp.date,
                type: xp.exp_type,
                rating: xp.rating,
                commentaire: xp.comment
              })) || [],
              typeProfil: c.profile_type || 'Freelance',
              role: 'candidate',
            });
            setLoading(false);
          })
          .catch(() => {
            const mock = MOCK_WORKERS.find((w) => w.id === id);
            if (mock) setWorker(mock);
            setLoading(false);
          });
      });
  }, [id, theme]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <Typography>Chargement du profil...</Typography>
      </Box>
    );
  }

  if (!worker) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Profil introuvable</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)} sx={{ borderRadius: '8px' }}>
          Retour
        </Button>
      </Box>
    );
  }

  const isEmployer = profileType === 'employer' || worker.role === 'employer';
  const whatsappMsg = encodeURIComponent(
    isEmployer
      ? `Bonjour ${worker.prenom}, j'ai trouvé votre profil employeur sur StartJobs. Je souhaite vous contacter.`
      : `Bonjour ${worker.prenom}, j'ai trouvé votre profil sur StartJobs. Je suis intéressé(e) par vos services.`
  );
  const sortedXP = [...(worker.experiences || [])].sort((a: any) => (a.type === 'verified' ? -1 : 1));

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      {/* Back nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
        <IconButton
          onClick={() => navigate(-1)}
          size="small"
          className="pressable"
          sx={{ borderRadius: '8px', border: `1px solid ${theme.palette.divider}`, width: 36, height: 36 }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          Retour
        </Typography>
      </Box>

      {/* Profile header card */}
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Accent bar */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, bgcolor: worker.photoColor }} />

        <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Avatar
            src={worker.photo || undefined}
            sx={{
              width: 80,
              height: 80,
              bgcolor: worker.photoColor,
              fontSize: '1.5rem',
              fontWeight: 800,
              borderRadius: '16px',
              flexShrink: 0,
            }}
          >
            {!worker.photo && worker.initials}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.025em' }}>
                {worker.prenom} {worker.nom}
              </Typography>
              {worker.verified && (
                <VerifiedIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
              )}
              {isEmployer && (
                <Chip
                  icon={<BusinessIcon sx={{ fontSize: '14px !important' }} />}
                  label="Employeur"
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
              <PlaceIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                {worker.quartier}
              </Typography>
            </Box>

            {/* Score + status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {worker.score > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, bgcolor: alpha('#F59E0B', isDark ? 0.15 : 0.1), borderRadius: '6px', px: 1.5, py: 0.5 }}>
                  <StarIcon sx={{ fontSize: 14, color: '#F59E0B' }} />
                  <Typography sx={{ fontSize: '0.9375rem', fontWeight: 800, color: isDark ? '#FDE68A' : '#92400E' }}>
                    {worker.score.toFixed(1)}
                  </Typography>
                </Box>
              )}
              {!isEmployer && (
                <Typography variant="body2" color="text.secondary">
                  {worker.totalMissions} mission{worker.totalMissions > 1 ? 's' : ''} réalisée{worker.totalMissions > 1 ? 's' : ''}
                </Typography>
              )}
              {!isEmployer && (
                worker.disponible ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'secondary.main' }} />
                    <Typography variant="caption" color="secondary.main" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                      Disponible
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem' }}>
                    Non disponible
                  </Typography>
                )
              )}
            </Box>
          </Box>
        </Box>

        {/* Bio */}
        <Typography variant="body1" sx={{ mt: 2.5, lineHeight: 1.75, color: 'text.secondary' }}>
          {worker.bio}
        </Typography>

        {/* CTA row */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 3, flexWrap: 'wrap' }}>
          {!showContact ? (
            <Button
              variant="contained"
              startIcon={<LockOpenIcon />}
              onClick={() => setShowContact(true)}
              className="pressable"
              sx={{ borderRadius: '8px', fontWeight: 700, flex: { xs: 1, sm: 'none' } }}
            >
              Voir le contact
            </Button>
          ) : (
            worker.whatsapp ? (
              <Button
                variant="contained"
                startIcon={<WhatsAppIcon />}
                href={`https://wa.me/${worker.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener"
                className="pressable"
                sx={{ borderRadius: '8px', fontWeight: 700, bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' }, flex: { xs: 1, sm: 'none' } }}
              >
                WhatsApp
              </Button>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Aucun contact disponible</Typography>
            )
          )}
          <Button
            variant="outlined"
            startIcon={<ShareIcon />}
            onClick={() => setShareOpen(true)}
            className="pressable"
            sx={{ borderRadius: '8px', fontWeight: 600 }}
          >
            Partager
          </Button>
        </Box>
      </Box>

      {/* Body grid — adapts based on profile type */}
      <Grid container spacing={3}>
        {isEmployer ? (
          /* ── EMPLOYER LAYOUT ── */
          <>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Informations de l'entreprise</Typography>
                <Stack spacing={2}>
                  {worker.industry && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CategoryIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Secteur d'activité</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{worker.industry}</Typography>
                      </Box>
                    </Box>
                  )}
                  {worker.city && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <LocationCityIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Ville</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{worker.city}</Typography>
                      </Box>
                    </Box>
                  )}
                  {worker.address && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PlaceIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Adresse</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{worker.address}</Typography>
                      </Box>
                    </Box>
                  )}
                  {worker.recruits_per_month && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <GroupsIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Recrutements / mois</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{worker.recruits_per_month}</Typography>
                      </Box>
                    </Box>
                  )}
                  {showContact && worker.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PhoneIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{worker.phone}</Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>À propos de l'entreprise</Typography>
                {worker.bio && worker.bio !== 'Aucune description renseignée.' ? (
                  <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>{worker.bio}</Typography>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    <BusinessIcon sx={{ fontSize: 32, opacity: 0.3, mb: 1 }} />
                    <Typography variant="body2">Aucune description disponible</Typography>
                  </Box>
                )}
                {worker.domaines.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                      Domaines
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                      {worker.domaines.map((d: string) => (
                        <Chip key={d} label={d} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            </Grid>
          </>
        ) : (
          /* ── CANDIDATE LAYOUT ── */
          <>
            <Grid size={{ xs: 12, md: 5 }}>
              {/* Competences */}
              <Box sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Compétences</Typography>
                {worker.competences.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {worker.competences.map((c: string) => (
                      <Typography key={c} variant="caption" sx={{ fontSize: '0.8125rem', fontWeight: 500, px: 1.25, py: 0.5, borderRadius: '6px', border: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.primary.main, isDark ? 0.08 : 0.04), color: 'text.primary' }}>
                        {c}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Non renseignées</Typography>
                )}
              </Box>

              {/* Formation */}
              <Box sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Formation</Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Diplôme le plus élevé</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{worker.diplome || 'Non renseigné'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Établissement</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{worker.etablissement || 'Non renseigné'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Année d'obtention</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{worker.anneeObtention || 'Non renseignée'}</Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Domaines */}
              <Box sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Domaines</Typography>
                {worker.domaines.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {worker.domaines.map((d: string) => (
                      <Typography key={d} variant="caption" sx={{ fontSize: '0.8125rem', fontWeight: 600, px: 1.25, py: 0.5, borderRadius: '6px', bgcolor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.08), color: 'primary.main' }}>
                        {d}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>Non renseignés</Typography>
                )}
              </Box>

              {/* Info */}
              <Box sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Informations</Typography>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Langues</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {worker.langues.length > 0 ? worker.langues.join(', ') : 'Non renseignées'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Permis</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {worker.permis
                        ? <><CheckCircleIcon sx={{ fontSize: 14, color: 'secondary.main' }} /><Typography variant="body2" sx={{ fontWeight: 500 }}>Oui</Typography></>
                        : <><CancelIcon sx={{ fontSize: 14, color: 'text.disabled' }} /><Typography variant="body2" color="text.disabled">Non</Typography></>
                      }
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Type de profil</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{worker.typeProfil}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Grid>

            {/* Right — experiences */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box sx={{ p: 2.5, borderRadius: '12px', border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Expériences</Typography>
                  <Box sx={{ px: 1, py: 0.25, borderRadius: '4px', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>
                    {sortedXP.length}
                  </Box>
                </Box>
                {sortedXP.length > 0 ? (
                  <Stack spacing={1.5}>
                    {sortedXP.map((xp: any) => (
                      <ExperienceCard key={xp.id} experience={xp} />
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    <WorkIcon sx={{ fontSize: 32, opacity: 0.3, mb: 1 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>Aucune expérience déclarée</Typography>
                    <Typography variant="caption" color="text.disabled">Les missions complétées apparaîtront ici</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </>
        )}
      </Grid>

      {/* Share Modal */}
      <TikTokShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareUrl={window.location.href}
        title={`Découvrez le profil de ${worker.prenom} sur StartJobs !`}
      />
    </Box>
  );
}
