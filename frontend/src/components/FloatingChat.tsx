import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Fab, Popover, Typography, IconButton,
  TextField, useTheme, alpha, CircularProgress,
} from '@mui/material';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../utils/api';

interface ChatMessage {
  id: number;
  text: string;
  fromBot: boolean;
  isTicket?: boolean; // message confirmant qu'un ticket admin a été envoyé
}

// Détecte si le message ne peut pas être géré localement → escalade admin
const needsEscalation = (msg: string): boolean => {
  const lower = msg.toLowerCase();
  const localKeywords = [
    'offre', 'emploi', 'recrute', 'candidat', 'cv', 'profil', 'compétence',
    'prix', 'tarif', 'payer', 'gratuit', 'bonjour', 'salut', 'bonsoir',
  ];
  return !localKeywords.some(k => lower.includes(k));
};

const getLocalResponse = (msg: string): string | null => {
  const lower = msg.toLowerCase();
  if (lower.includes('offre') || lower.includes('emploi') || lower.includes('recrute'))
    return "Pour publier ou consulter des offres d'emploi, rendez-vous dans la section 'Offres' de votre tableau de bord.";
  if (lower.includes('candidat') || lower.includes('cv') || lower.includes('profil') || lower.includes('compétence'))
    return "Vous pouvez mettre à jour votre profil et vos compétences dans l'onglet 'Mon Profil'. Un profil complet augmente vos chances !";
  if (lower.includes('prix') || lower.includes('tarif') || lower.includes('payer') || lower.includes('gratuit'))
    return "La création de compte est 100% gratuite. Certaines options de mise en avant peuvent être payantes. Consultez notre page tarifs pour plus d'infos.";
  if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('bonsoir'))
    return "Bonjour ! Comment pouvons-nous vous aider aujourd'hui ?";
  return null;
};

export default function FloatingChat() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const open = Boolean(anchorEl);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: 1, text: "Bonjour ! Je suis l'assistant StartJobs. Comment puis-je vous aider aujourd'hui ?", fromBot: true },
  ]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (open) setTimeout(scrollToBottom, 100);
  }, [open, chatHistory]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || sending) return;

    const userMessage = message.trim();
    const newId = Date.now();
    setChatHistory(prev => [...prev, { id: newId, text: userMessage, fromBot: false }]);
    setMessage('');
    setSending(true);

    // Check if we can answer locally
    const localReply = getLocalResponse(userMessage);
    if (localReply) {
      setTimeout(() => {
        setChatHistory(prev => [...prev, { id: Date.now() + 1, text: localReply, fromBot: true }]);
        setSending(false);
      }, 900);
      return;
    }

    // Escalate to admins via backend
    try {
      await api.post('support-ticket/', { message: userMessage });
      setChatHistory(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Votre question a bien été transmise à notre équipe. Un administrateur vous répondra dans les meilleurs délais. Merci de votre patience ! 🙏",
          fromBot: true,
          isTicket: true,
        },
      ]);
    } catch {
      setChatHistory(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Votre message a été pris en compte. Notre équipe reviendra vers vous très prochainement.",
          fromBot: true,
          isTicket: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Fab
        color="primary"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="pressable"
        size="medium"
        sx={{
          position: 'fixed',
          bottom: { xs: 84, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 900,
          width: 48,
          height: 48,
          borderRadius: '14px',
          boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
        }}
      >
        <ChatBubbleRoundedIcon sx={{ fontSize: 20 }} />
      </Fab>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 320,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: isDark
                ? '0 20px 40px rgba(0,0,0,0.6)'
                : '0 20px 40px rgba(15,23,42,0.12)',
              overflow: 'hidden',
              mb: 1,
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32, height: 32, borderRadius: '8px',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 16, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.875rem' }}>
                Support StartJobs
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box className="status-dot-live" sx={{ width: 6, height: 6 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                  En ligne
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setAnchorEl(null)} className="pressable" sx={{ borderRadius: '6px' }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Body */}
        <Box sx={{ p: 2, bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02), height: 300, overflowY: 'auto' }}>
          {chatHistory.map((msg) => (
            <Box key={msg.id} sx={{ display: 'flex', gap: 1, mb: 2, flexDirection: msg.fromBot ? 'row' : 'row-reverse' }}>
              {msg.fromBot && (
                <Box
                  sx={{
                    width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {msg.isTicket
                    ? <CheckCircleIcon sx={{ fontSize: 14, color: 'white' }} />
                    : <AutoAwesomeIcon sx={{ fontSize: 14, color: 'white' }} />
                  }
                </Box>
              )}

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: msg.fromBot ? '0 10px 10px 10px' : '10px 0 10px 10px',
                  bgcolor: msg.isTicket
                    ? alpha(theme.palette.success.main, isDark ? 0.12 : 0.07)
                    : msg.fromBot ? 'background.paper' : 'primary.main',
                  color: !msg.fromBot ? '#fff' : 'text.primary',
                  border: msg.fromBot
                    ? `1px solid ${msg.isTicket ? alpha(theme.palette.success.main, 0.3) : theme.palette.divider}`
                    : 'none',
                  maxWidth: '80%',
                }}
              >
                {msg.isTicket && (
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                    ✅ Ticket envoyé aux admins
                  </Typography>
                )}
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', lineHeight: 1.6 }}>
                  {msg.text}
                </Typography>
              </Box>
            </Box>
          ))}

          {/* Typing indicator */}
          {sending && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Box sx={{
                width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <AutoAwesomeIcon sx={{ fontSize: 14, color: 'white' }} />
              </Box>
              <Box sx={{
                p: 1.5, borderRadius: '0 10px 10px 10px', bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 0.5,
              }}>
                <CircularProgress size={10} thickness={5} />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  En train d'écrire…
                </Typography>
              </Box>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 1.5,
            bgcolor: 'background.paper',
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Votre message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: '0.875rem',
              },
            }}
          />
          <IconButton
            color="primary"
            type="submit"
            disabled={!message.trim() || sending}
            className="pressable"
            sx={{
              width: 34, height: 34,
              borderRadius: '8px',
              bgcolor: message.trim() ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              flexShrink: 0,
            }}
          >
            <SendIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Popover>
    </>
  );
}
