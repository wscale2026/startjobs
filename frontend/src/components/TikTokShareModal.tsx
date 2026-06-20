import React, { useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
  Slide,
  Snackbar,
  Alert
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';

// Slide transition from bottom
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface TikTokShareModalProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
  title?: string;
}

export default function TikTokShareModal({ open, onClose, shareUrl, title = 'Découvrez ce profil sur StartJobs !' }: TikTokShareModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const shareOptions = [
    { name: 'WhatsApp', icon: <WhatsAppIcon sx={{ fontSize: 28 }} />, color: '#25D366', action: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + shareUrl)}`) },
    { name: 'Facebook', icon: <FacebookIcon sx={{ fontSize: 28 }} />, color: '#1877F2', action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`) },
    { name: 'X (Twitter)', icon: <TwitterIcon sx={{ fontSize: 28 }} />, color: isDark ? '#FFF' : '#000', iconColor: isDark ? '#000' : '#FFF', action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`) },
    { name: 'LinkedIn', icon: <LinkedInIcon sx={{ fontSize: 28 }} />, color: '#0A66C2', action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`) },
    { name: 'Email', icon: <EmailIcon sx={{ fontSize: 28 }} />, color: '#EA4335', action: () => window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`) },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '100%',
          maxWidth: { xs: '100%', sm: 400 },
          m: { xs: 0, sm: 2 },
          position: { xs: 'absolute', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          borderTopLeftRadius: { xs: 24, sm: 24 },
          borderTopRightRadius: { xs: 24, sm: 24 },
          borderBottomLeftRadius: { xs: 0, sm: 24 },
          borderBottomRightRadius: { xs: 0, sm: 24 },
          p: 3,
          bgcolor: isDark ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
          backgroundImage: 'none',
        }
      }}
    >
      {/* Handle bar for mobile */}
      {isMobile && (
        <Box sx={{ width: 40, height: 4, bgcolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', borderRadius: 2, mx: 'auto', mb: 2 }} />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
          Partager ce profil
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Share Social Row */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1.5, fontWeight: 600 }}>Partager via</Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          overflowX: 'auto', 
          pb: 1,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}>
          {shareOptions.map((option, idx) => (
            <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
              <IconButton 
                onClick={option.action}
                sx={{ 
                  bgcolor: option.color, 
                  color: option.iconColor || '#fff', 
                  width: 56, 
                  height: 56, 
                  mb: 1,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  '&:hover': {
                    bgcolor: option.color,
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {option.icon}
              </IconButton>
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 500, color: 'text.primary' }}>
                {option.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Copy Link Section */}
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>Lien du profil</Typography>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        bgcolor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.04)', 
        borderRadius: 2, 
        p: 1,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
      }}>
        <Box sx={{ flex: 1, overflow: 'hidden', mr: 1, px: 1 }}>
          <Typography sx={{ 
            fontSize: '0.85rem', 
            color: 'text.primary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {shareUrl}
          </Typography>
        </Box>
        <Button 
          variant={copied ? 'contained' : 'text'} 
          color={copied ? 'success' : 'primary'}
          onClick={handleCopy}
          startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
          sx={{ 
            borderRadius: 1.5, 
            textTransform: 'none', 
            fontWeight: 600,
            bgcolor: copied ? 'success.main' : isDark ? 'rgba(255,255,255,0.1)' : '#fff',
            color: copied ? '#fff' : 'primary.main',
            boxShadow: copied ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
            '&:hover': {
              bgcolor: copied ? 'success.main' : isDark ? 'rgba(255,255,255,0.15)' : '#f5f5f5',
            }
          }}
        >
          {copied ? 'Copié' : 'Copier'}
        </Button>
      </Box>
      
      {copied && (
        <Snackbar open autoHideDuration={2000} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="success" variant="filled" sx={{ width: '100%', borderRadius: 2 }}>
            Lien copié dans le presse-papier !
          </Alert>
        </Snackbar>
      )}
    </Dialog>
  );
}
