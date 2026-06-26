import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Avatar, InputBase, IconButton,
  useTheme, useMediaQuery, alpha, Badge, ClickAwayListener, Slider,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
  Select, MenuItem, FormControl, InputLabel, TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DoneIcon from '@mui/icons-material/Done';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import ContactSearchModal from '../components/ContactSearchModal';
import DownloadIcon from '@mui/icons-material/Download';
import ReplyIcon from '@mui/icons-material/Reply';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicNoneIcon from '@mui/icons-material/MicNone';
import PlaceIcon from '@mui/icons-material/Place';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ImageIcon from '@mui/icons-material/Image';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { setUnreadCount, sendMessage as sendMessageAction, markAsRead, deleteMessage, deleteConversation, broadcastMessage } from '../store/slices/messagesSlice';
import { showSnackbar } from '../store/slices/snackbarSlice';
import api from '../utils/api';

/* ─── Types ─────────────────────────────────────────────────────────────── */
type MessageStatus = 'sent' | 'delivered' | 'read';

interface Message {
  id: string;
  text: string;
  time: string;
  fromMe: boolean;
  status?: MessageStatus;
  isDocument?: boolean;
  docName?: string;
  docSize?: string;
  docType?: string;
  docUrl?: string;
  isAudio?: boolean;
  audioDuration?: string;
  audioUrl?: string;
  isImage?: boolean;
  imageUrl?: string;
  isVideo?: boolean;
  videoUrl?: string;
  isContact?: boolean;
  contactName?: string;
  contactRole?: string;
  contactPic?: string;
  contactId?: string;
  replyToId?: string;
  replyToText?: string;
  isDeleted?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  role: string;
  lastMsg: string;
  time: string;
  unread: number;
  color: string;
  photo: string;
  online: boolean;
  messages: Message[];
  participantId?: number;
}

/* ─── Mock data ─────────────────────────────────────────────────────────── */
const CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    name: 'Claire Fotso',
    role: 'Employeur · Akwa',
    lastMsg: 'Pouvez-vous commencer lundi ?',
    time: '10:32',
    unread: 2,
    color: '#059669',
    photo: 'CF',
    online: true,
    messages: [
      { id: 'm1', text: 'Bonjour, j\'ai vu votre profil sur StartJobs.', time: '09:15', fromMe: false },
      { id: 'm2', text: 'Bonjour Madame Fotso ! Oui, je suis disponible.', time: '09:18', fromMe: true, status: 'read' },
      { id: 'm3', text: 'Parfait. Vous avez de l\'expérience en construction ?', time: '09:20', fromMe: false },
      { id: 'm4', text: 'Oui, 3 ans d\'expérience. J\'ai aussi une référence vérifiée sur mon profil.', time: '09:22', fromMe: true, status: 'read' },
      { id: 'm5', text: 'Excellent ! Le chantier est à Akwa-Nord, durée estimée 2 semaines.', time: '09:45', fromMe: false },
      { id: 'm6', text: 'Pas de problème, je suis mobile. Quel est le budget prévu ?', time: '09:47', fromMe: true, status: 'read' },
      { id: 'm7', text: 'Nous proposons 15 000 FCFA par jour. Est-ce acceptable ?', time: '10:10', fromMe: false },
      { id: 'm8', text: 'Oui, c\'est acceptable. Je suis partant.', time: '10:28', fromMe: true, status: 'delivered' },
      { id: 'm9', text: 'Pouvez-vous commencer lundi ?', time: '10:32', fromMe: false },
    ],
  },
  {
    id: 'c2',
    name: 'Cabinet Nkeng',
    role: 'Recruteur · Bonanjo',
    lastMsg: 'Merci pour votre candidature.',
    time: 'Hier',
    unread: 0,
    color: '#1D4ED8',
    photo: 'CN',
    online: false,
    messages: [
      { id: 'm1', text: 'Bonjour, nous recherchons un secrétaire bilingue.', time: 'Hier 14:00', fromMe: false },
      { id: 'm2', text: 'Bonjour, je suis intéressé. J\'ai 2 ans d\'expérience en secrétariat.', time: 'Hier 14:15', fromMe: true, status: 'read' },
      { id: 'm3', text: 'Merci pour votre candidature. Nous reviendrons vers vous.', time: 'Hier 15:30', fromMe: false },
    ],
  },
  {
    id: 'c3',
    name: 'Construction Mballa',
    role: 'Chantier · Deido',
    lastMsg: 'Le chantier démarre vendredi.',
    time: 'Lundi',
    unread: 0,
    color: '#7C3AED',
    photo: 'CM',
    online: false,
    messages: [
      { id: 'm1', text: 'Nous avons besoin de 3 manœuvres pour la semaine.', time: 'Lundi 08:00', fromMe: false },
      { id: 'm2', text: 'Je suis disponible ! Je peux également amener un collègue.', time: 'Lundi 08:30', fromMe: true, status: 'read' },
      { id: 'm3', text: 'Le chantier démarre vendredi.', time: 'Lundi 09:00', fromMe: false },
    ],
  },
  {
    id: 'c4',
    name: 'Resto Ndambi',
    role: 'Restauration · Bali',
    lastMsg: 'Envoyez-moi votre disponibilité',
    time: 'Dim.',
    unread: 1,
    color: '#EA580C',
    photo: 'RN',
    online: true,
    messages: [
      { id: 'm1', text: 'Nous cherchons une cuisinière pour les weekends.', time: 'Dim. 11:00', fromMe: false },
      { id: 'm2', text: 'Bonjour ! Je suis spécialisée en cuisine camerounaise.', time: 'Dim. 11:20', fromMe: true, status: 'read' },
      { id: 'm3', text: 'Envoyez-moi votre disponibilité', time: 'Dim. 11:45', fromMe: false },
    ],
  },
  {
    id: 'c5',
    name: 'Agence FormaPro',
    role: 'Formation · Douala',
    lastMsg: 'Votre formation commence le 25.',
    time: 'Sam.',
    unread: 0,
    color: '#0891B2',
    photo: 'FP',
    online: false,
    messages: [
      { id: 'm1', text: 'Votre inscription à la formation Électricité est confirmée.', time: 'Sam. 09:00', fromMe: false },
      { id: 'm2', text: 'Super, merci ! Y a-t-il des documents à apporter ?', time: 'Sam. 09:30', fromMe: true, status: 'read' },
      { id: 'm3', text: 'Juste une pièce d\'identité. Votre formation commence le 25.', time: 'Sam. 10:00', fromMe: false },
    ],
  },
];

/* ─── Sub-components ────────────────────────────────────────────────────── */

/** WhatsApp-style read receipt ticks */
function Ticks({ status }: { status?: MessageStatus }) {
  if (!status) return null;
  if (status === 'sent') return <DoneIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }} />;
  if (status === 'delivered') return <DoneAllIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }} />;
  return <DoneAllIcon sx={{ fontSize: 14, color: '#53BDEB' }} />;
}

/** Beautiful interactive simulation of WhatsApp Audio Player */
function AudioPlayer({ msg, isDark }: { msg: Message; isDark: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (msg.audioUrl && !audioRef.current) {
      audioRef.current = new Audio(msg.audioUrl);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      };
      
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }
      };
    }
  }, [msg.audioUrl]);

  const durationStr = msg.audioDuration || '0:05';
  const parts = durationStr.split(':');
  const durationSec = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);

  useEffect(() => {
    if (!msg.audioUrl) {
      if (isPlaying) {
        const step = 0.1;
        playIntervalRef.current = setInterval(() => {
          setCurrentTime((prev) => {
            const next = prev + step;
            if (next >= durationSec) {
              setIsPlaying(false);
              setProgress(0);
              if (playIntervalRef.current) clearInterval(playIntervalRef.current);
              return 0;
            }
            setProgress((next / durationSec) * 100);
            return next;
          });
        }, 100);
      } else {
        if (playIntervalRef.current) {
          clearInterval(playIntervalRef.current);
          playIntervalRef.current = null;
        }
      }

      return () => {
        if (playIntervalRef.current) {
          clearInterval(playIntervalRef.current);
        }
      };
    } else {
      if (isPlaying && audioRef.current) {
        audioRef.current.play().catch(e => console.error("Error playing audio", e));
      } else if (!isPlaying && audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, durationSec, msg.audioUrl]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (_: any, value: number | number[]) => {
    const val = value as number;
    setProgress(val);
    const newTime = (val / 100) * (msg.audioUrl && audioRef.current && !isNaN(audioRef.current.duration) ? audioRef.current.duration : durationSec);
    setCurrentTime(newTime);
    if (msg.audioUrl && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 0.5,
        px: 0.5,
        minWidth: { xs: 230, sm: 270 },
      }}
    >
      <IconButton
        onClick={handlePlayPause}
        size="small"
        sx={{
          bgcolor: 'transparent',
          color: msg.fromMe
            ? isDark ? '#E9EDEF' : '#111B21'
            : '#00A884',
          p: 0.5,
          '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
        }}
      >
        {isPlaying ? (
          <PauseIcon sx={{ fontSize: 28 }} />
        ) : (
          <PlayArrowIcon sx={{ fontSize: 28 }} />
        )}
      </IconButton>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        <Slider
          size="small"
          value={progress}
          onChange={handleSliderChange}
          sx={{
            color: msg.fromMe
              ? isDark ? '#00A884' : '#25D366'
              : '#00A884',
            height: 3,
            padding: '10px 0',
            '& .MuiSlider-thumb': {
              width: 8,
              height: 8,
              transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
              '&:before': {
                boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
              },
              '&:hover, &.Mui-focusVisible': {
                boxShadow: 'none',
              },
              '&.Mui-active': {
                width: 12,
                height: 12,
              },
            },
            '& .MuiSlider-rail': {
              opacity: 0.28,
              bgcolor: 'text.secondary',
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', fontWeight: 500 }}>
            {isPlaying ? formatSeconds(currentTime) : durationStr}
          </Typography>
          <GraphicEqIcon sx={{ fontSize: 15, color: isPlaying ? '#25D366' : 'text.disabled', opacity: isPlaying ? 1 : 0.5 }} />
        </Box>
      </Box>

      <Box sx={{ position: 'relative', flexShrink: 0, ml: 0.5 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: msg.fromMe ? '#25D366' : '#3B82F6',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {msg.fromMe ? 'Moi' : 'Rec'}
        </Avatar>
        <Box
          sx={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 16,
            height: 16,
            borderRadius: '50%',
            bgcolor: '#25D366',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            border: `1.5px solid ${msg.fromMe ? (isDark ? '#005C4B' : '#DCF8C6') : (isDark ? '#1F2C34' : '#FFFFFF')}`,
          }}
        >
          <MicNoneIcon sx={{ fontSize: 10 }} />
        </Box>
      </Box>
    </Box>
  );
}

/** Individual message bubble */
function Bubble({ msg, isDark, onContextMenu, selected, selectionMode, onToggle, onNavigateProfile }: { msg: Message; isDark: boolean; onContextMenu: (e: React.MouseEvent, msgId: string) => void; selected?: boolean; selectionMode?: boolean; onToggle?: (msgId: string) => void; onNavigateProfile?: (contactId: string) => void; }) {
  const handleClick = () => {
    if (selectionMode && onToggle) onToggle(msg.id);
  };

  const renderReplyPreview = () => {
    if (!msg.replyToId) return null;
    return (
      <Box sx={{ 
        bgcolor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', 
        borderLeft: `4px solid ${msg.fromMe ? '#0284c7' : '#25D366'}`, 
        borderRadius: 1, 
        p: 1, 
        mb: 1, 
        display: 'flex', 
        flexDirection: 'column'
      }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: msg.fromMe ? (isDark ? '#38bdf8' : '#0284c7') : '#25D366' }}>
          {msg.fromMe ? 'Vous' : 'Contact'}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {msg.replyToText || 'Media'}
        </Typography>
      </Box>
    );
  };

  if (msg.isDeleted) {
    return (
      <Box
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, msg.id)}
        sx={{ display: 'flex', justifyContent: msg.fromMe ? 'flex-end' : 'flex-start', mb: 0.5, px: 2 }}
      >
        <Typography sx={{ fontSize: '0.8125rem', fontStyle: 'italic', color: 'text.disabled', bgcolor: 'rgba(0,0,0,0.05)', px: 1, py: 0.5, borderRadius: 1 }}>
          Message supprimé
        </Typography>
      </Box>
    );
  }

  if (msg.isAudio) {
    return (
      <Box
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, msg.id)}
        sx={{
          display: 'flex',
          justifyContent: msg.fromMe ? 'flex-end' : 'flex-start',
          mb: 0.5,
          px: 2,
        }}
      >
        <Box
          className="animate-in"
          sx={{
            maxWidth: { xs: '85%', md: '60%' },
            borderRadius: msg.fromMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
            bgcolor: selected 
              ? isDark ? 'rgba(37,211,102,0.2)' : 'rgba(37,211,102,0.1)'
              : msg.fromMe
              ? isDark ? '#005C4B' : '#DCF8C6'
              : isDark ? '#1F2C34' : '#FFFFFF',
            boxShadow: isDark
              ? '0 1px 2px rgba(0,0,0,0.4)'
              : '0 1px 2px rgba(0,0,0,0.1)',
            position: 'relative',
            p: 0.5,
          }}
        >
          {renderReplyPreview()}
          <AudioPlayer msg={msg} isDark={isDark} />

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25, px: 1, pt: 0.25 }}>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                color: isDark
                  ? msg.fromMe ? 'rgba(233,237,239,0.6)' : 'rgba(233,237,239,0.5)'
                  : msg.fromMe ? 'rgba(17,27,33,0.5)' : 'rgba(17,27,33,0.45)',
                lineHeight: 1,
              }}
            >
              {msg.time}
            </Typography>
            {msg.fromMe && (
              <Box sx={{
                ml: 0.25, display: 'flex', alignItems: 'center',
                color: msg.status === 'read' ? '#53BDEB' : isDark ? 'rgba(233,237,239,0.6)' : 'rgba(17,27,33,0.5)'
              }}>
                <Ticks status={msg.status} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  if (msg.isImage) {
    return (
      <Box onClick={handleClick} onContextMenu={(e) => onContextMenu(e, msg.id)} sx={{ display: 'flex', justifyContent: msg.fromMe ? 'flex-end' : 'flex-start', mb: 0.5, px: 2 }}>
        <Box className="animate-in" sx={{ position: 'relative', maxWidth: { xs: '80%', md: '60%' }, borderRadius: msg.fromMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px', bgcolor: selected ? (isDark ? 'rgba(37,211,102,0.2)' : 'rgba(37,211,102,0.1)') : (msg.fromMe ? (isDark ? '#005C4B' : '#DCF8C6') : (isDark ? '#1F2C34' : '#FFFFFF')), boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.1)', p: 0.5 }}>
          {renderReplyPreview()}
          <Box sx={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <img src={msg.imageUrl} alt="img" style={{ display: 'block', width: '100%', maxHeight: '350px', objectFit: 'cover' }} />
            {msg.imageUrl && (
              <IconButton 
                component="a" 
                href={msg.imageUrl} 
                download 
                onClick={(e) => e.stopPropagation()}
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                size="small"
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            )}
            <Box sx={{ position: 'absolute', bottom: 4, right: 8, display: 'flex', alignItems: 'center', gap: 0.25, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '10px', px: 0.75, py: 0.25, pointerEvents: 'none' }}>
              <Typography sx={{ fontSize: '0.625rem', color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.5)', lineHeight: 1 }}>{msg.time}</Typography>
              {msg.fromMe && <Box sx={{ ml: 0.25, display: 'flex', alignItems: 'center', color: msg.status === 'read' ? '#53BDEB' : 'rgba(255,255,255,0.7)' }}><Ticks status={msg.status} /></Box>}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (msg.isVideo) {
    return (
      <Box onClick={handleClick} onContextMenu={(e) => onContextMenu(e, msg.id)} sx={{ display: 'flex', justifyContent: msg.fromMe ? 'flex-end' : 'flex-start', mb: 0.5, px: 2 }}>
        <Box className="animate-in" sx={{ position: 'relative', maxWidth: { xs: '80%', md: '60%' }, borderRadius: msg.fromMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px', bgcolor: selected ? (isDark ? 'rgba(37,211,102,0.2)' : 'rgba(37,211,102,0.1)') : (msg.fromMe ? (isDark ? '#005C4B' : '#DCF8C6') : (isDark ? '#1F2C34' : '#FFFFFF')), boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.1)', p: 0.5 }}>
          {renderReplyPreview()}
          <Box sx={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', bgcolor: '#000' }}>
            <video src={msg.videoUrl} controls controlsList="nodownload" style={{ display: 'block', width: '100%', maxHeight: '350px', objectFit: 'contain' }} />
            {msg.videoUrl && (
              <IconButton 
                component="a" 
                href={msg.videoUrl} 
                download 
                onClick={(e) => e.stopPropagation()}
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }, zIndex: 10 }}
                size="small"
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            )}
            <Box sx={{ position: 'absolute', bottom: 12, right: 8, display: 'flex', alignItems: 'center', gap: 0.25, bgcolor: 'rgba(0,0,0,0.5)', borderRadius: '10px', px: 0.75, py: 0.25, pointerEvents: 'none' }}>
              <Typography sx={{ fontSize: '0.625rem', color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.5)', lineHeight: 1 }}>{msg.time}</Typography>
              {msg.fromMe && <Box sx={{ ml: 0.25, display: 'flex', alignItems: 'center', color: msg.status === 'read' ? '#53BDEB' : 'rgba(255,255,255,0.7)' }}><Ticks status={msg.status} /></Box>}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (msg.isContact) {
    return (
      <Box onClick={handleClick} onContextMenu={(e) => onContextMenu(e, msg.id)} sx={{ display: 'flex', justifyContent: msg.fromMe ? 'flex-end' : 'flex-start', mb: 0.5, px: 2 }}>
        <Box className="animate-in" sx={{ position: 'relative', minWidth: 220, maxWidth: { xs: '80%', md: '60%' }, borderRadius: msg.fromMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px', bgcolor: selected ? (isDark ? 'rgba(37,211,102,0.2)' : 'rgba(37,211,102,0.1)') : (msg.fromMe ? (isDark ? '#005C4B' : '#DCF8C6') : (isDark ? '#1F2C34' : '#FFFFFF')), boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.1)', overflow: 'hidden', pt: 0.5, pb: 0.5 }}>
          {msg.replyToId && <Box sx={{ px: 1, pt: 0.5 }}>{renderReplyPreview()}</Box>}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1 }}>
            <Avatar src={msg.contactPic} sx={{ width: 44, height: 44, bgcolor: '#A6A6A6' }}>
              {!msg.contactPic && <PersonIcon />}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.95rem', color: isDark ? '#E9EDEF' : '#111B21', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {msg.contactName}
              </Typography>
              {msg.contactRole && (
                <Typography sx={{ fontSize: '0.75rem', color: isDark ? 'rgba(233,237,239,0.7)' : 'rgba(17,27,33,0.7)' }}>
                  {msg.contactRole === 'employer' ? 'Employeur' : 'Candidat'}
                </Typography>
              )}
            </Box>
          </Box>
          <Box 
            className="pressable" 
            onClick={() => {
              if (msg.contactId && onNavigateProfile) {
                onNavigateProfile(msg.contactId);
              }
            }}
            sx={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`, px: 2, py: 1.25, display: 'flex', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' } }}
          >
            <Typography sx={{ color: '#00A884', fontWeight: 600, fontSize: '0.875rem' }}>Voir le profil</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1.5, pb: 0.5 }}>
            <Typography sx={{ fontSize: '0.625rem', color: isDark ? 'rgba(233,237,239,0.6)' : 'rgba(17,27,33,0.5)', lineHeight: 1 }}>{msg.time}</Typography>
            {msg.fromMe && <Box sx={{ ml: 0.25, display: 'flex', alignItems: 'center', color: msg.status === 'read' ? '#53BDEB' : isDark ? 'rgba(233,237,239,0.6)' : 'rgba(17,27,33,0.5)' }}><Ticks status={msg.status} /></Box>}
          </Box>
        </Box>
      </Box>
    );
  }

  if (msg.isDocument) {
    return (
      <Box
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, msg.id)}
        sx={{
          display: 'flex',
          justifyContent: msg.fromMe ? 'flex-end' : 'flex-start',
          mb: 0.5,
          px: 2,
        }}
      >
        <Box
          className="animate-in"
          sx={{
            maxWidth: { xs: '82%', md: '60%' },
            borderRadius: msg.fromMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
            bgcolor: selected 
              ? isDark ? 'rgba(37,211,102,0.2)' : 'rgba(37,211,102,0.1)'
              : msg.fromMe
              ? isDark ? '#005C4B' : '#DCF8C6'
              : isDark ? '#1F2C34' : '#FFFFFF',
            boxShadow: isDark
              ? '0 1px 2px rgba(0,0,0,0.4)'
              : '0 1px 2px rgba(0,0,0,0.1)',
            position: 'relative',
            p: 0.5,
          }}
        >
          {renderReplyPreview()}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.25,
              borderRadius: '8px',
              bgcolor: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '6px',
                bgcolor: '#EA4335',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
              }}
            >
              <InsertDriveFileIcon />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: isDark ? '#E9EDEF' : '#111B21',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {msg.docName}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: isDark ? 'rgba(233,237,239,0.6)' : 'rgba(17,27,33,0.6)',
                  mt: 0.25,
                }}
              >
                {msg.docSize ? `${msg.docSize} • ` : ''}{msg.docType?.toUpperCase()}
              </Typography>
            </Box>
            
            {msg.docUrl && (
              <IconButton 
                component="a" 
                href={msg.docUrl} 
                download 
                onClick={(e) => e.stopPropagation()}
                sx={{ color: 'text.secondary' }}
              >
                <DownloadIcon />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25, px: 1, pt: 0.5 }}>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                color: isDark
                  ? msg.fromMe ? 'rgba(233,237,239,0.6)' : 'rgba(233,237,239,0.5)'
                  : msg.fromMe ? 'rgba(17,27,33,0.5)' : 'rgba(17,27,33,0.45)',
                lineHeight: 1,
              }}
            >
              {msg.time}
            </Typography>
            {msg.fromMe && (
              <Box sx={{
                ml: 0.25, display: 'flex', alignItems: 'center',
                color: msg.status === 'read' ? '#53BDEB' : isDark ? 'rgba(233,237,239,0.6)' : 'rgba(17,27,33,0.5)'
              }}>
                <Ticks status={msg.status} />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      onClick={handleClick}
      onContextMenu={(e) => onContextMenu(e, msg.id)}
      sx={{
        display: 'flex',
        justifyContent: msg.fromMe ? 'flex-end' : 'flex-start',
        mb: 0.5,
        px: 2,
      }}
    >
      <Box
        className="animate-in"
        sx={{
          maxWidth: { xs: '78%', md: '60%' },
          px: 1.5,
          pt: 1,
          pb: 0.75,
          borderRadius: msg.fromMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
          bgcolor: selected 
            ? isDark ? 'rgba(37,211,102,0.2)' : 'rgba(37,211,102,0.1)'
            : msg.fromMe
            ? isDark ? '#005C4B' : '#DCF8C6'
            : isDark ? '#1F2C34' : '#FFFFFF',
          boxShadow: isDark
            ? '0 1px 2px rgba(0,0,0,0.4)'
            : '0 1px 2px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        {renderReplyPreview()}
        <Typography
          sx={{
            fontSize: '0.9375rem',
            lineHeight: 1.55,
            color: isDark
              ? msg.fromMe ? '#E9EDEF' : '#E9EDEF'
              : msg.fromMe ? '#111B21' : '#111B21',
            wordBreak: 'break-word',
          }}
        >
          {msg.text}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25, mt: 0.25 }}>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              color: isDark
                ? msg.fromMe ? 'rgba(233,237,239,0.6)' : 'rgba(233,237,239,0.5)'
                : msg.fromMe ? 'rgba(17,27,33,0.5)' : 'rgba(17,27,33,0.45)',
              lineHeight: 1,
            }}
          >
            {msg.time}
          </Typography>
          {msg.fromMe && (
            <Box sx={{
              ml: 0.25, display: 'flex', alignItems: 'center',
              color: msg.status === 'read' ? '#53BDEB' : isDark ? 'rgba(233,237,239,0.6)' : 'rgba(17,27,33,0.5)'
            }}>
              <Ticks status={msg.status} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

/** Conversation list item */
function ConvoItem({ conv, active, onClick, onDelete }: { conv: Conversation; active: boolean; onClick: () => void; onDelete: (e: React.MouseEvent) => void }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      onClick={onClick}
      className="pressable convo-item"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        bgcolor: active
          ? isDark ? alpha('#005C4B', 0.3) : alpha('#DCF8C6', 0.5)
          : 'transparent',
        borderRight: active ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
        transition: 'background-color 120ms ease',
        '& .delete-btn': { opacity: 0 },
        '&:hover': {
          bgcolor: active
            ? isDark ? alpha('#005C4B', 0.35) : alpha('#DCF8C6', 0.6)
            : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          '& .delete-btn': { opacity: 1 },
        },
      }}
    >
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: conv.color,
            fontSize: '0.875rem',
            fontWeight: 700,
            borderRadius: '50%',
          }}
        >
          {conv.photo}
        </Avatar>
        {conv.online && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 1,
              right: 1,
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: '#25D366',
              border: `2px solid ${isDark ? '#111B21' : '#F0F2F5'}`,
            }}
          />
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.25 }}>
          <Typography
            sx={{
              fontSize: '0.9375rem',
              fontWeight: conv.unread > 0 ? 700 : 500,
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              mr: 1,
            }}
          >
            {conv.name}
            {conv.role && (
              <Typography component="span" sx={{ fontSize: '0.7rem', color: 'text.secondary', ml: 1, fontWeight: 500, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', px: 0.5, py: 0.25, borderRadius: 1 }}>
                {conv.role}
              </Typography>
            )}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.6875rem',
              flexShrink: 0,
              color: conv.unread > 0 ? '#25D366' : 'text.secondary',
              fontWeight: conv.unread > 0 ? 700 : 400,
            }}
          >
            {conv.time}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              fontWeight: conv.unread > 0 ? 500 : 400,
            }}
          >
            {conv.lastMsg}
          </Typography>
          {conv.unread > 0 && (
            <Box
              sx={{
                minWidth: 20,
                height: 20,
                borderRadius: '10px',
                bgcolor: '#25D366',
                color: '#fff',
                fontSize: '0.6875rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 0.75,
                ml: 1,
                flexShrink: 0,
              }}
            >
              {conv.unread}
            </Box>
          )}
          <IconButton
            className="delete-btn"
            size="small"
            onClick={(e) => { e.stopPropagation(); onDelete(e); }}
            sx={{
              ml: 1,
              flexShrink: 0,
              color: 'text.secondary',
              transition: 'all 0.2s',
              bgcolor: 'transparent',
              '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) },
            }}
          >
            <DeleteIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '✊', '👊',
  '👋', '👏', '🙌', '👐', '🤲', '🙏', '🤝', '✍️', '💅', '🤳',
  '🛠️', '👷', '💼', '📝', '📂', '📄', '🚀', '🔥', '🎉', '💯'
];

/* ─── Main component ────────────────────────────────────────────────────── */
let cachedAdminConversations: Conversation[] | null = null;

export default function AdminMessagesPage() {
  const theme = useTheme();
  const location = useLocation();
  const routerNavigate = useNavigate();
  const dispatch = useAppDispatch();
  const isDark = theme.palette.mode === 'dark';
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentUser = useAppSelector((state) => state.auth.user);
  const authStatus = useAppSelector((state) => state.auth.status);
  const [activeId, setActiveId] = useState<string | null>(location.state?.openChatId || null);
  const [conversations, setConversations] = useState<Conversation[]>(cachedAdminConversations || []);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  
  // Deletion logic
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convoToDelete, setConvoToDelete] = useState<string | null>(null);

  // New Chat logic
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState<'all'|'candidates'|'employers'>('all');
  const [broadcastText, setBroadcastText] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  const broadcastInputRef = useRef<HTMLTextAreaElement>(null);
  const insertVariable = (variable: string) => {
    if (broadcastInputRef.current) {
      const start = broadcastInputRef.current.selectionStart;
      const end = broadcastInputRef.current.selectionEnd;
      const newText = broadcastText.substring(0, start) + variable + broadcastText.substring(end);
      setBroadcastText(newText);
      setTimeout(() => {
        broadcastInputRef.current?.focus();
        broadcastInputRef.current?.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      setBroadcastText(prev => prev + variable);
    }
  };

  const hasFetched = useRef(false);

  useEffect(() => {
    const total = conversations.reduce((sum, c) => sum + c.unread, 0);
    dispatch(setUnreadCount(total));
  }, [conversations, dispatch]);

  useEffect(() => {
    if (!currentUser && (authStatus === 'succeeded' || authStatus === 'failed')) {
      return;
    }
    if (!currentUser || hasFetched.current) return;
    hasFetched.current = true;
    const loadData = async () => {
      try {
        const res = await api.get('conversations/');
        const mapped = res.data.map((convo: any) => {
          const participants = convo.participants || [];
          const otherParticipant = participants.find((p: any) => p.id !== currentUser.id) || participants[0];
          const mappedMessages = (convo.messages || []).map((m: any) => {
            let isContact = false;
            let contactData = null;
            let actualText = m.text;
            let replyToId = undefined;
            let replyToText = undefined;
            let isDocument = false;
            let isAudio = false;
            let isImage = false;
            let isVideo = false;
            let attachmentUrl = m.attachment;
            
            if (attachmentUrl) {
              if (m.is_audio) isAudio = true;
              else if (attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i)) isImage = true;
              else if (attachmentUrl.match(/\.(mp4|webm|ogg)$/i)) isVideo = true;
              else isDocument = true;
            }

            if (actualText && actualText.startsWith('[REPLY:')) {
               try {
                 const closeBracketIdx = actualText.indexOf(']');
                 if (closeBracketIdx !== -1) {
                   const jsonStr = actualText.substring(7, closeBracketIdx).trim();
                   const replyData = JSON.parse(jsonStr);
                   replyToId = replyData.id;
                   replyToText = replyData.text;
                   actualText = actualText.substring(closeBracketIdx + 1).trim();
                 }
               } catch(e) {}
            }
            if (actualText && actualText.startsWith('[CONTACT_SHARE:')) {
               isContact = true;
               try {
                 const jsonStr = actualText.replace('[CONTACT_SHARE:', '').replace(/]$/, '');
                 contactData = JSON.parse(jsonStr);
               } catch(e) {}
            }

            return {
              id: String(m.id),
              text: isContact ? '' : actualText,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              fromMe: m.sender?.id === currentUser.id,
              status: m.is_read ? 'read' as MessageStatus : 'sent' as MessageStatus,
              isDeleted: m.is_deleted,
              isImage,
              imageUrl: isImage ? attachmentUrl : undefined,
              isVideo,
              videoUrl: isVideo ? attachmentUrl : undefined,
              isDocument,
              docName: isDocument ? attachmentUrl.split('/').pop() : undefined,
              docUrl: isDocument ? attachmentUrl : undefined,
              docType: isDocument ? attachmentUrl.split('.').pop() : undefined,
              isAudio,
              audioUrl: isAudio ? attachmentUrl : undefined,
              isContact,
              contactName: isContact ? (contactData ? contactData.name : m.text.replace('[CONTACT]', '').trim()) : undefined,
              contactRole: contactData ? contactData.role : undefined,
              contactPic: contactData ? contactData.pic : undefined,
              contactId: contactData ? contactData.id : undefined,
              replyToId,
              replyToText,
            };
          });
          let lastMessageText = 'Aucun message';
          if (mappedMessages.length > 0) {
            const lastM = mappedMessages[mappedMessages.length - 1];
            if (lastM.isDeleted) lastMessageText = '🚫 Ce message a été supprimé';
            else if (lastM.isContact) lastMessageText = `👤 Contact`;
            else if (lastM.isImage) lastMessageText = `📷 Photo`;
            else if (lastM.isVideo) lastMessageText = `🎥 Vidéo`;
            else if (lastM.isAudio) lastMessageText = `🎤 Message vocal`;
            else if (lastM.isDocument) lastMessageText = `📄 Document`;
            else lastMessageText = lastM.text;
          }
          const lastMessageTime = mappedMessages.length > 0 ? mappedMessages[mappedMessages.length - 1].time : '12:00';
          
          const convoUnreadCount = mappedMessages.filter((m: any) => !m.fromMe && m.status !== 'read').length;

          return {
            id: String(convo.id),
            name: (otherParticipant ? `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() || otherParticipant.username : 'StartJobs User') || 'Utilisateur',
            role: otherParticipant?.employer_profile ? 'Employeur' : 'Candidat',
            lastMsg: lastMessageText || 'Aucun message',
            time: lastMessageTime,
            unread: convoUnreadCount,
            color: '#1D4ED8',
            photo: (otherParticipant?.username || otherParticipant?.first_name || 'US').substring(0, 2).toUpperCase(),
            online: true,
            messages: mappedMessages,
            participantId: otherParticipant?.id
          };
        });
        
        const pending = localStorage.getItem('pending_application');
        if (pending) {
          try {
            const { employerName, jobTitle, isEmployerContact, candidateId } = JSON.parse(pending);
            if (employerName && jobTitle && candidateId) {
              const existing = mapped.find(
                (c: any) => c.participantId === candidateId || 
                           (c.name || '').toLowerCase().includes(employerName.toLowerCase()) || 
                           employerName.toLowerCase().includes((c.name || '').toLowerCase())
              );
              
              let targetId = existing?.id;
              
              if (!targetId) {
                const createRes = await api.post('conversations/', { participants: [candidateId] });
                targetId = String(createRes.data.id);
              }
              
              if (!isEmployerContact) {
                const autoMsgText = `Bonjour ! Je souhaite vivement postuler à votre offre "${jobTitle}" sur StartJobs. Mon profil candidat est à jour, n'hésitez pas à le consulter. Je reste à votre entière disposition pour un échange.`;
                await dispatch(sendMessageAction({ conversationId: targetId, text: autoMsgText })).unwrap();
              }
              
              // Refetch conversations to ensure everything is perfectly synced with the backend
              const refetchRes = await api.get('conversations/');
              const finalMapped = refetchRes.data.map((convo: any) => {
                const participants = convo.participants || [];
                const otherParticipant = participants.find((p: any) => p.id !== currentUser.id) || participants[0];
                const mappedMessages = (convo.messages || []).map((m: any) => {
                  let isContact = false;
                  let contactData = null;
                  let actualText = m.text;
                  let replyToId = undefined;
                  let replyToText = undefined;
                  let isDocument = false;
                  let isAudio = false;
                  let isImage = false;
                  let isVideo = false;
                  let attachmentUrl = m.attachment;
                  
                  if (attachmentUrl) {
                    if (m.is_audio) isAudio = true;
                    else if (attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i)) isImage = true;
                    else if (attachmentUrl.match(/\.(mp4|webm|ogg)$/i)) isVideo = true;
                    else isDocument = true;
                  }

                  if (actualText && actualText.startsWith('[REPLY:')) {
                    try {
                      const closeBracketIdx = actualText.indexOf(']');
                      if (closeBracketIdx !== -1) {
                        const jsonStr = actualText.substring(7, closeBracketIdx).trim();
                        const replyData = JSON.parse(jsonStr);
                        replyToId = replyData.id;
                        replyToText = replyData.text;
                        actualText = actualText.substring(closeBracketIdx + 1).trim();
                      }
                    } catch(e) {}
                  }
                  if (actualText && actualText.startsWith('[CONTACT_SHARE:')) {
                    isContact = true;
                    try {
                      const jsonStr = actualText.replace('[CONTACT_SHARE:', '').replace(/]$/, '');
                      contactData = JSON.parse(jsonStr);
                    } catch(e) {}
                  }

                  return {
                    id: String(m.id),
                    text: isContact ? '' : actualText,
                    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    fromMe: m.sender?.id === currentUser.id,
                    status: m.is_read ? 'read' as MessageStatus : 'sent' as MessageStatus,
                    isDeleted: m.is_deleted,
                    isImage,
                    imageUrl: isImage ? attachmentUrl : undefined,
                    isVideo,
                    videoUrl: isVideo ? attachmentUrl : undefined,
                    isDocument,
                    docName: isDocument ? attachmentUrl.split('/').pop() : undefined,
                    docUrl: isDocument ? attachmentUrl : undefined,
                    docType: isDocument ? attachmentUrl.split('.').pop() : undefined,
                    isAudio,
                    audioUrl: isAudio ? attachmentUrl : undefined,
                    isContact,
                    contactName: isContact ? (contactData ? contactData.name : m.text.replace('[CONTACT]', '').trim()) : undefined,
                    contactRole: contactData ? contactData.role : undefined,
                    contactPic: contactData ? contactData.pic : undefined,
                    contactId: contactData ? contactData.id : undefined,
                    replyToId,
                    replyToText,
                  };
                });
                
                let lastMessageText = 'Aucun message';
                if (mappedMessages.length > 0) {
                  const lastM = mappedMessages[mappedMessages.length - 1];
                  if (lastM.isDeleted) lastMessageText = '🚫 Ce message a été supprimé';
                  else if (lastM.isContact) lastMessageText = `👤 Contact`;
                  else if (lastM.isImage) lastMessageText = `📷 Photo`;
                  else if (lastM.isVideo) lastMessageText = `🎥 Vidéo`;
                  else if (lastM.isAudio) lastMessageText = `🎤 Message vocal`;
                  else if (lastM.isDocument) lastMessageText = `📄 Document`;
                  else lastMessageText = lastM.text;
                }
                const lastMessageTime = mappedMessages.length > 0 ? mappedMessages[mappedMessages.length - 1].time : '12:00';
                
                const convoUnreadCount = mappedMessages.filter((m: any) => !m.fromMe && m.status !== 'read').length;

                return {
                  id: String(convo.id),
                  name: (otherParticipant ? `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() || otherParticipant.username : 'StartJobs User') || 'Utilisateur',
                  role: otherParticipant?.employer_profile ? 'Employeur' : 'Candidat',
                  lastMsg: lastMessageText || 'Aucun message',
                  time: lastMessageTime,
                  unread: convoUnreadCount,
                  color: '#1D4ED8',
                  photo: (otherParticipant?.username || otherParticipant?.first_name || 'US').substring(0, 2).toUpperCase(),
                  online: true,
                  messages: mappedMessages,
                  participantId: otherParticipant?.id
                };
              });
              
              cachedAdminConversations = finalMapped;
              setConversations(finalMapped);
              const totalUnread = finalMapped.reduce((sum: number, c: Conversation) => sum + c.unread, 0);
              dispatch(setUnreadCount(totalUnread));
              setActiveId(targetId);
              setLoading(false);
              return; // End execution early since we handled everything via refetch
            }
          } catch (e) {
            console.error('Error processing pending application', e);
          } finally {
            localStorage.removeItem('pending_application');
          }
        }

        cachedAdminConversations = mapped;
        setConversations(mapped);
        const totalUnread = mapped.reduce((sum: number, c: Conversation) => sum + c.unread, 0);
        dispatch(setUnreadCount(totalUnread));
        if (isDesktop && mapped.length > 0 && !activeId) {
          setActiveId(mapped[0].id);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentUser, authStatus, isDesktop, dispatch, activeId]);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      api.get('conversations/')
        .then((res) => {
          setConversations(prev => {
            let hasChanges = false;
            const newConvos = [...prev];
            
            res.data.forEach((convo: any) => {
              const otherParticipant = convo.participants.find((p: any) => p.id !== currentUser.id) || convo.participants[0];
              const mappedMessages = convo.messages.map((m: any) => {
                let isImage = false, isVideo = false, isDocument = false, isAudio = m.is_audio, isContact = false;
                let attachmentUrl = m.attachment;
                let contactData = null;
                let replyToId;
                let replyToText;
                let actualText = m.text;
                
                if (actualText && actualText.startsWith('[REPLY:')) {
                   try {
                     const match = actualText.match(/^\[REPLY:\s*({.*?})\]\s*(.*)$/);
                     if (match) {
                        const replyData = JSON.parse(match[1]);
                        replyToId = replyData.id;
                        replyToText = replyData.text;
                        actualText = match[2];
                     }
                   } catch(e) {}
                }

                if (actualText && actualText.startsWith('[CONTACT_SHARE:')) {
                   isContact = true;
                   try {
                     const jsonStr = actualText.replace('[CONTACT_SHARE:', '').replace(/]$/, '');
                     contactData = JSON.parse(jsonStr);
                   } catch(e) {}
                } else if (actualText && actualText.startsWith('[CONTACT]')) {
                   isContact = true;
                }
                
                if (attachmentUrl && !isAudio) {
                   const ext = attachmentUrl.split('.').pop()?.toLowerCase();
                   if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) isImage = true;
                   else if (['mp4', 'webm', 'ogg'].includes(ext)) isVideo = true;
                   else isDocument = true;
                }

                return {
                  id: String(m.id),
                  text: isContact ? '' : actualText,
                  time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  fromMe: m.sender?.id === currentUser.id,
                  status: m.is_read ? 'read' as MessageStatus : 'sent' as MessageStatus,
                  isDeleted: m.is_deleted,
                  isImage,
                  imageUrl: isImage ? attachmentUrl : undefined,
                  isVideo,
                  videoUrl: isVideo ? attachmentUrl : undefined,
                  isDocument,
                  docName: isDocument ? attachmentUrl.split('/').pop() : undefined,
                  docUrl: isDocument ? attachmentUrl : undefined,
                  docType: isDocument ? attachmentUrl.split('.').pop() : undefined,
                  isAudio,
                  audioUrl: isAudio ? attachmentUrl : undefined,
                  isContact,
                  contactName: isContact ? (contactData ? contactData.name : m.text.replace('[CONTACT]', '').trim()) : undefined,
                  contactRole: contactData ? contactData.role : undefined,
                  contactPic: contactData ? contactData.pic : undefined,
                  contactId: contactData ? contactData.id : undefined,
                  replyToId,
                  replyToText,
                };
              });
              
              const existingIdx = newConvos.findIndex(c => c.id === String(convo.id));
              if (existingIdx >= 0) {
                const existingC = newConvos[existingIdx];
                let unusedIncoming = [...mappedMessages];
                let updatedMessages = existingC.messages.map(m => {
                  if (String(m.id).startsWith('m_')) {
                    const matchIdx = unusedIncoming.findIndex((incM: any) => 
                      incM.fromMe === m.fromMe && 
                      (m.isContact ? incM.isContact && incM.contactId === m.contactId : 
                       m.isImage ? incM.isImage : 
                       m.isVideo ? incM.isVideo : 
                       m.isDocument ? incM.isDocument && incM.docName === m.docName : 
                       incM.text === m.text)
                    );
                    if (matchIdx >= 0) {
                      const realMatch = unusedIncoming.splice(matchIdx, 1)[0];
                      return { ...realMatch, status: m.status === 'read' ? 'read' : realMatch.status };
                    }
                  } else {
                    const freshMatchIdx = unusedIncoming.findIndex((incM: any) => incM.id === String(m.id));
                    if (freshMatchIdx >= 0) {
                      const freshMatch = unusedIncoming.splice(freshMatchIdx, 1)[0];
                      return freshMatch;
                    }
                  }
                  return m;
                });

                const newIncoming = unusedIncoming;
                const idsChanged = existingC.messages.some((m, i) => updatedMessages[i] && m.id !== updatedMessages[i].id);
                
                if (newIncoming.length > 0 || idsChanged) {
                  hasChanges = true;
                  updatedMessages = [...updatedMessages, ...newIncoming];
                  let lastMessageText = 'Aucun message';
                  const lastM = updatedMessages[updatedMessages.length - 1];
                  if (lastM) {
                    if (lastM.isDeleted) lastMessageText = '🚫 Ce message a été supprimé';
                    else if (lastM.isContact) lastMessageText = `👤 Contact`;
                    else if (lastM.isImage) lastMessageText = `📷 Photo`;
                    else if (lastM.isVideo) lastMessageText = `🎥 Vidéo`;
                    else if (lastM.isAudio) lastMessageText = `🎤 Message vocal`;
                    else if (lastM.isDocument) lastMessageText = `📄 Document`;
                    else lastMessageText = lastM.text;
                  }
                  
                  newConvos[existingIdx] = {
                    ...existingC,
                    messages: updatedMessages,
                    lastMsg: lastMessageText,
                    time: lastM ? lastM.time : existingC.time,
                    unread: existingC.id === activeId ? 0 : updatedMessages.filter(m => !m.fromMe && m.status !== 'read').length
                  };
                  if (existingC.id === activeId) {
                    dispatch(markAsRead(activeId));
                  }
                }
              } else {
                hasChanges = true;
                const convoUnreadCount = mappedMessages.filter((m: any) => !m.fromMe && m.status !== 'read').length;
                newConvos.unshift({
                  id: String(convo.id),
                  name: otherParticipant ? `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() || otherParticipant.username : 'StartJobs User',
                  role: otherParticipant?.employer_profile ? 'Employeur' : 'Candidat',
                  lastMsg: mappedMessages.length > 0 ? mappedMessages[mappedMessages.length - 1].text : 'Aucun message',
                  time: mappedMessages.length > 0 ? mappedMessages[mappedMessages.length - 1].time : '12:00',
                  unread: convoUnreadCount,
                  color: '#1D4ED8',
                  photo: otherParticipant?.username?.substring(0, 2).toUpperCase() || 'US',
                  online: true,
                  messages: mappedMessages,
                  participantId: otherParticipant?.id
                });
              }
            });
            if (hasChanges) {
              cachedAdminConversations = newConvos;
              return newConvos;
            }
            return prev;
          });
        })
        .catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser, activeId, dispatch]);

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; type: 'message' | 'bulk' | 'conversation'; action: () => void } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ mouseX: number, mouseY: number, msgId: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const metaViewport = document.querySelector('meta[name="viewport"]');
    const original = metaViewport?.getAttribute('content') || '';
    metaViewport?.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover, interactive-widget=resizes-content'
    );
    return () => {
      metaViewport?.setAttribute('content', original);
    };
  }, []);

  const handleCloseContext = () => setContextMenu(null);

  const handleReplyMessage = () => {
    if (contextMenu?.msgId && activeId) {
      const convo = conversations.find(c => c.id === activeId);
      const msg = convo?.messages.find(m => m.id === contextMenu.msgId);
      if (msg) setReplyToMessage(msg);
    }
    setContextMenu(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      setEmojiOpen(false);
      setAttachOpen(false);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Erreur d'accès au microphone:", err);
      alert("Impossible d'accéder au microphone.");
    }
  };

  const formatRecordTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const sendVoiceNote = () => {
    if (!activeId) return;
    setIsRecording(false);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    if (mediaRecorderRef.current) {
      const currentDuration = recordSeconds;
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const durationStr = formatRecordTime(currentDuration === 0 ? 1 : currentDuration);
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const newMsg: Message = {
          id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: `🎤 Message vocal (${durationStr})`,
          time,
          fromMe: true,
          status: 'sent',
          isAudio: true,
          audioDuration: durationStr,
          audioUrl
        };

        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === activeId
              ? { ...c, messages: [...c.messages, newMsg], lastMsg: `🎤 Message vocal (${durationStr})`, time }
              : c
          );
          const idx = updated.findIndex((c) => c.id === activeId);
          if (idx > 0) {
            const [activeC] = updated.splice(idx, 1);
            updated.unshift(activeC);
          }
          return updated;
        });

        const formData = new FormData();
        formData.append('conversation', activeId);
        formData.append('attachment', audioBlob, 'voice_message.webm');
        formData.append('is_audio', 'True');
        
        api.post('messages/', formData)
          .then((res) => {
            setConversations(prev => prev.map(c => c.id === activeId ? {
              ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, id: String(res.data.id) } : m)
            } : c));
          })
          .catch(err => console.error('Audio upload error', err));
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
  };

  const cancelRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
    setRecordSeconds(0);
  };



  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newMsg: Message = {
      id: `m_${Date.now()}`,
      text: file.name,
      time,
      fromMe: true,
      status: 'sent',
      isDocument: true,
      docName: file.name,
      docSize: `${(file.size / 1024).toFixed(0)} KB`,
      docType: file.name.split('.').pop() || 'pdf'
    };

    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMsg: `📄 ${file.name}`, time }
          : c
      );
      const idx = updated.findIndex((c) => c.id === activeId);
      if (idx > 0) {
        const [activeC] = updated.splice(idx, 1);
        updated.unshift(activeC);
      }
      return updated;
    });

    setAttachOpen(false);

    try {
      const formData = new FormData();
      formData.append('conversation', activeId);
      formData.append('attachment', file);
      api.post('messages/', formData)
        .then((res) => {
          setConversations(prev => prev.map(c => c.id === activeId ? {
            ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, id: String(res.data.id) } : m)
          } : c));
        })
        .catch(err => console.error('File upload error', err));
    } catch (err) {
      console.error('File upload error', err);
    }
  };

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;

    const isVideo = file.type.startsWith('video/');
    const url = URL.createObjectURL(file);
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newMsg: Message = {
      id: `m_${Date.now()}`,
      text: '',
      time,
      fromMe: true,
      status: 'sent',
      isImage: !isVideo,
      imageUrl: !isVideo ? url : undefined,
      isVideo: isVideo,
      videoUrl: isVideo ? url : undefined
    };

    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMsg: isVideo ? '🎥 Vidéo' : '📷 Photo', time }
          : c
      );
      const idx = updated.findIndex((c) => c.id === activeId);
      if (idx > 0) {
        const [activeC] = updated.splice(idx, 1);
        updated.unshift(activeC);
      }
      return updated;
    });

    setAttachOpen(false);

    try {
      const formData = new FormData();
      formData.append('conversation', activeId);
      formData.append('attachment', file);
      api.post('messages/', formData)
        .then((res) => {
          setConversations(prev => prev.map(c => c.id === activeId ? {
            ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, id: String(res.data.id) } : m)
          } : c));
        })
        .catch(err => console.error('Media upload error', err));
    } catch (err) {
      console.error('Media upload error', err);
    }
  };

  const handleDeleteMessage = () => {
    if (contextMenu?.msgId) {
      const msgId = contextMenu.msgId;
      setConfirmDelete({
        open: true,
        type: 'message',
        action: () => {
          dispatch(deleteMessage(msgId));
          setConversations(prev => prev.map(c => c.id === activeId ? {
            ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, isDeleted: true } : m)
          } : c));
        }
      });
    }
    handleCloseContext();
  };

  const handleDeleteConversation = () => {
    if (activeId) {
      setConfirmDelete({
        open: true,
        type: 'conversation',
        action: () => {
          dispatch(deleteConversation(activeId));
          setConversations(prev => prev.filter(c => c.id !== activeId));
          setActiveId(null);
        }
      });
    }
  };

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;

  const filtered = conversations.filter(
    (c) =>
      (c.name || '').toLowerCase().includes((search || '').toLowerCase()) ||
      (c.lastMsg || '').toLowerCase().includes((search || '').toLowerCase()),
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeId, activeConv?.messages.length]);

  // Mark as read when opening
  useEffect(() => {
    if (activeId) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c)),
      );
      if (/^\d+$/.test(activeId)) {
        dispatch(markAsRead(activeId));
      }
    }
  }, [activeId, dispatch]);



  const sendMessage = () => {
    if (!input.trim() || !activeId) return;
    
    const isBackendConvo = /^\d+$/.test(activeId);
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const sentText = input;
    
    let textToBackend = sentText;
    if (replyToMessage) {
      const replyJson = JSON.stringify({
         id: replyToMessage.id,
         text: replyToMessage.text ? replyToMessage.text.substring(0, 50) : (replyToMessage.isImage ? 'Photo' : replyToMessage.isVideo ? 'Vidéo' : 'Fichier')
      });
      textToBackend = `[REPLY: ${replyJson}] ${sentText}`;
    }

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      text: sentText,
      time,
      fromMe: true,
      status: 'sent',
      replyToId: replyToMessage?.id,
      replyToText: replyToMessage?.text ? replyToMessage.text.substring(0, 50) : undefined
    };
    
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMsg: newMsg.text, time }
          : c,
      );
      // Move active conversation to the top
      const activeIdx = updated.findIndex((c) => c.id === activeId);
      if (activeIdx > 0) {
        const [activeC] = updated.splice(activeIdx, 1);
        updated.unshift(activeC);
      }
      return updated;
    });
    
    setInput('');
    setReplyToMessage(null);
    setEmojiOpen(false);
    
    if (isBackendConvo) {
      dispatch(sendMessageAction({ conversationId: activeId, text: textToBackend }))
        .unwrap()
        .then((res) => {
          // Update status to delivered
          setConversations(prev => prev.map(c => c.id === activeId ? {
            ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, id: String(res.id || res.data?.id || res.id), status: 'delivered' } : m)
          } : c));
          
          // Simulate read receipt if online
          const targetConvo = conversations.find(c => c.id === activeId);
          if (targetConvo?.online) {
            setTimeout(() => {
              setConversations(prev => prev.map(c => c.id === activeId ? {
                ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m)
              } : c));
            }, 2000);
          }
        })
        .catch((err) => {
          console.error('Error sending message:', err);
        });
    } else {
      const activeConvo = conversations.find(c => c.id === activeId);
      if (activeConvo && activeConvo.participantId) {
        api.post('conversations/', { participants: [activeConvo.participantId] })
          .then((res) => {
            const realId = String(res.data.id);
            dispatch(sendMessageAction({ conversationId: realId, text: textToBackend }))
              .unwrap()
              .then((sentMsg: any) => {
                setConversations(prev => prev.map(c => c.id === realId ? {
                  ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, id: String(sentMsg.id || newMsg.id), status: 'delivered' } : m)
                } : c));
                if (activeConvo.online) {
                  setTimeout(() => {
                    setConversations(prev => prev.map(c => c.id === realId ? {
                      ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: 'read' } : m)
                    } : c));
                  }, 2000);
                }
              });
            setActiveId(realId);
            setConversations(prev => prev.map(c => c.id === activeId ? { ...c, id: realId } : c));
          })
          .catch(err => console.error("Error creating convo", err));
      }
    }
  };

  const handleDeleteConvo = (e: React.MouseEvent, convoId: string) => {
    e.stopPropagation();
    setConvoToDelete(convoId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteConvo = () => {
    if (convoToDelete) {
      api.post(`conversations/${convoToDelete}/delete_for_me/`)
        .then(() => {
          setConversations(prev => prev.filter(c => c.id !== convoToDelete));
          if (activeId === convoToDelete) {
            setActiveId(null);
          }
          dispatch(showSnackbar({ message: 'Discussion supprimée', severity: 'success' }));
        })
        .catch(err => console.error("Error deleting conversation", err));
    }
    setDeleteDialogOpen(false);
    setConvoToDelete(null);
  };

  const handleStartNewChat = (user: any) => {
    setNewChatModalOpen(false);
    api.post('conversations/', { participants: [user.id] })
      .then(res => {
        const newConvoId = String(res.data.id);
        const existingConvo = conversations.find(c => c.participantId === user.id || c.id === newConvoId);
        if (!existingConvo) {
          const newConvoItem: Conversation = {
            id: newConvoId,
            name: user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : user.username,
            role: user.role === 'employer' ? 'Employeur' : 'Candidat',
            lastMsg: 'Nouvelle discussion',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: 0,
            color: '#1D4ED8',
            photo: (user.username || user.first_name || 'U').substring(0, 2).toUpperCase(),
            online: true,
            messages: [],
            participantId: user.id
          };
          setConversations([newConvoItem, ...conversations]);
        }
        setActiveId(newConvoId);
      })
      .catch(err => {
        console.error("Erreur création discussion", err);
        dispatch(showSnackbar({ message: 'Erreur lors de la création de la discussion', severity: 'error' }));
      });
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;
    setIsBroadcasting(true);
    try {
      const res = await dispatch(broadcastMessage({ target: broadcastTarget, text: broadcastText })).unwrap();
      dispatch(showSnackbar({ message: `Message diffusé avec succès (${res.count} destinataires)`, severity: 'success' }));
      setBroadcastModalOpen(false);
      setBroadcastText('');
      // Force refresh of conversations to show newly created ones
      hasFetched.current = false;
    } catch (err) {
      dispatch(showSnackbar({ message: 'Erreur lors de la diffusion du message', severity: 'error' }));
    } finally {
      setIsBroadcasting(false);
    }
  };

  // WhatsApp-like bg pattern
  const chatBg = isDark
    ? 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%23111B21\'/%3E%3C/svg%3E")'
    : 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%23E5DDD5\'/%3E%3C/svg%3E")';

  const SIDEBAR_W = 360;
  const showList = isDesktop || !activeId;
  const showChat = isDesktop || !!activeId;

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        bgcolor: isDark ? '#111B21' : '#FFFFFF',
      }}
    >
      {/* ══════ LEFT PANEL: Conversation list ══════ */}
      {showList && (
        <Box
          sx={{
            width: isDesktop ? SIDEBAR_W : '100%',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            pb: isMobile ? '80px' : 0,
            borderRight: isDesktop ? `1px solid ${theme.palette.divider}` : 'none',
            bgcolor: isDark ? '#111B21' : '#FFFFFF',
          }}
        >
          {/* List header */}
          <Box
            sx={{
              px: 2,
              pt: 2,
              pb: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Messages
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                  size="small"
                  title="Diffusion Globale"
                  onClick={() => setBroadcastModalOpen(true)}
                  sx={{ 
                    bgcolor: 'secondary.main', 
                    color: 'white', 
                    '&:hover': { bgcolor: 'secondary.dark' },
                    borderRadius: '8px'
                  }}
                >
                  <CampaignIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small"
                  onClick={() => setNewChatModalOpen(true)}
                  title="Nouvelle discussion"
                  sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    '&:hover': { bgcolor: 'primary.dark' },
                    borderRadius: '8px'
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" className="pressable" sx={{ borderRadius: '8px' }}>
                  <MoreVertIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Search */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.05),
                borderRadius: '10px',
                px: 1.5,
                py: 0.75,
              }}
            >
              <SearchIcon sx={{ fontSize: 17, color: 'text.disabled', flexShrink: 0 }} />
              <InputBase
                placeholder="Rechercher une conversation"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ flex: 1, fontSize: '1rem', color: 'text.primary' }}
              />
            </Box>
          </Box>

          {/* List */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {filtered.map((conv, i) => (
              <React.Fragment key={conv.id}>
                <ConvoItem
                  conv={conv}
                  active={activeId === conv.id}
                  onClick={() => setActiveId(conv.id)}
                  onDelete={(e) => handleDeleteConvo(e, conv.id)}
                />
                {i < filtered.length - 1 && (
                  <Box sx={{ mx: 2, height: '1px', bgcolor: theme.palette.divider }} />
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      )}

      {/* ══════ RIGHT PANEL: Chat view ══════ */}
      {showChat && (
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            minWidth: 0,
            ...(isMobile ? {
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1200,
              bgcolor: isDark ? '#111B21' : '#FFFFFF',
            } : {})
          }}
        >
          {activeConv ? (
            <>
              {/* Chat header */}
              <Box
                className="glass-nav"
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.25,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  bgcolor: isDark ? '#202C33' : '#F0F2F5',
                  backdropFilter: 'none',
                  border: 'none',
                }}
              >
                {!isDesktop && (
                  <IconButton color="inherit" size="small" onClick={() => setActiveId(null)} className="pressable" sx={{ mr: 0.5 }}>
                    <ArrowBackIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                )}
                <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: activeConv.color,
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                    }}
                  >
                    {activeConv.photo}
                  </Avatar>
                  {activeConv.online && (
                    <Box
                      sx={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 11, height: 11, borderRadius: '50%',
                        bgcolor: '#25D366',
                        border: `2px solid ${isDark ? '#202C33' : '#F0F2F5'}`,
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                    {activeConv.name}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: activeConv.online ? '#25D366' : 'text.secondary' }}>
                    {activeConv.online ? 'En ligne' : activeConv.role}
                  </Typography>
                </Box>
                <IconButton size="small" className="pressable" sx={{ borderRadius: '8px' }}>
                  <MoreVertIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </IconButton>
              </Box>

              {/* Messages area */}
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                  overscrollBehavior: 'none',
                  py: 2,
                  backgroundImage: chatBg,
                  backgroundSize: '400px 400px',
                  backgroundBlendMode: 'overlay',
                  bgcolor: isDark ? '#0B141A' : '#E5DDD5',
                }}
              >
                {/* Spacer pushes content to bottom */}
                <Box sx={{ flex: 1, minHeight: '10px' }} />
                
                {/* Date separator */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      px: 2, py: 0.5, borderRadius: '8px',
                      bgcolor: isDark ? 'rgba(17,27,33,0.85)' : 'rgba(225,221,217,0.95)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: isDark ? '#8696A0' : '#54656F' }}>
                      Aujourd'hui
                    </Typography>
                  </Box>
                </Box>

                {activeConv.messages.map((msg) => (
                  <Bubble
                    key={msg.id}
                    msg={msg}
                    isDark={isDark}
                    onContextMenu={(e) => e.preventDefault()}
                    onNavigateProfile={(id) => routerNavigate(`/admin/search/${id}`)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input bar wrapper with relative positioning for WhatsApp popovers */}
              <Box sx={{ flexShrink: 0, position: 'relative', bgcolor: isDark ? '#202C33' : '#F0F2F5', borderTop: `1px solid ${theme.palette.divider}` }}>
                
                {/* Emoji Picker Popover */}
                {emojiOpen && (
                  <ClickAwayListener onClickAway={() => setEmojiOpen(false)}>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 16,
                        width: 310,
                        height: 240,
                        bgcolor: isDark ? '#222E35' : '#FFFFFF',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        border: `1px solid ${theme.palette.divider}`,
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        p: 1.5,
                        mb: 1.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.6875rem' }}>
                        Emojis Populaires
                      </Typography>
                      <Box
                        sx={{
                          flex: 1,
                          overflowY: 'auto',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(8, 1fr)',
                          gap: 0.75,
                          pr: 0.5,
                          '&::-webkit-scrollbar': { width: '4px' },
                          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '4px' }
                        }}
                      >
                        {EMOJIS.map((emoji) => (
                          <Box
                            key={emoji}
                            onClick={() => setInput((prev) => prev + emoji)}
                            className="pressable"
                            sx={{
                              fontSize: '1.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              p: 0.5,
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                transform: 'scale(1.2)'
                              },
                              transition: 'transform 0.15s ease'
                            }}
                          >
                            {emoji}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </ClickAwayListener>
                )}

                {/* Attachment Menu Popover */}
                {attachOpen && (
                  <ClickAwayListener onClickAway={() => setAttachOpen(false)}>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 48,
                        bgcolor: isDark ? '#233138' : '#FFFFFF',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        border: `1px solid ${theme.palette.divider}`,
                        zIndex: 10,
                        p: 1.25,
                        mb: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.75,
                      }}
                    >
                      {/* Document Item */}
                      <Box
                        onClick={() => fileInputRef.current?.click()}
                        className="pressable"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          cursor: 'pointer',
                          p: 1,
                          borderRadius: '10px',
                          width: 170,
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: '#7F66FF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                          }}
                        >
                          <DescriptionIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>
                          Document
                        </Typography>
                      </Box>

                      {/* Image Item */}
                      <Box
                        onClick={() => mediaInputRef.current?.click()}
                        className="pressable"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          cursor: 'pointer',
                          p: 1,
                          borderRadius: '10px',
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: '#D3396D',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>
                          Photos & Vidéos
                        </Typography>
                      </Box>

                      {/* Contact Item */}
                      <Box
                        onClick={() => {
                          setAttachOpen(false);
                          setContactSearchOpen(true);
                        }}
                        className="pressable"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          cursor: 'pointer',
                          p: 1,
                          borderRadius: '10px',
                          '&:hover': {
                            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                          }
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            bgcolor: '#009DE2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                          }}
                        >
                          <ContactPageIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.primary' }}>
                          Contact
                        </Typography>
                      </Box>
                    </Box>
                  </ClickAwayListener>
                )}

                {/* Reply Preview Box */}
                {replyToMessage && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: -60, 
                    left: 0, 
                    right: 0, 
                    height: 60, 
                    bgcolor: isDark ? '#2A3942' : '#F0F2F5', 
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, 
                    px: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    zIndex: 10 
                  }}>
                    <Box sx={{ 
                      flex: 1, 
                      bgcolor: isDark ? 'rgba(0,0,0,0.2)' : '#fff', 
                      borderRadius: 1, 
                      borderLeft: `4px solid ${replyToMessage.fromMe ? '#0284c7' : '#25D366'}`, 
                      p: 1, 
                      display: 'flex', 
                      flexDirection: 'column' 
                    }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: replyToMessage.fromMe ? '#0284c7' : '#25D366' }}>
                        {replyToMessage.fromMe ? 'Vous' : 'Contact'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {replyToMessage.text || 'Media'}
                      </Typography>
                    </Box>
                    <IconButton onClick={() => setReplyToMessage(null)} size="small" sx={{ ml: 1 }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                {/* Hidden input file element */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.txt"
                />
                <input
                  type="file"
                  ref={mediaInputRef}
                  style={{ display: 'none' }}
                  accept="image/*,video/*"
                  onChange={handleMediaChange}
                />

                {isRecording ? (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2,
                      py: 1.25,
                      pb: 'calc(10px + env(safe-area-inset-bottom))',
                      width: '100%',
                      bgcolor: isDark ? '#202C33' : '#F0F2F5',
                      animation: 'slideUp 0.2s ease-out',
                    }}
                  >
                    {/* Cancel Recording */}
                    <IconButton
                      onClick={cancelRecording}
                      size="small"
                      sx={{
                        color: '#EA4335',
                        borderRadius: '50%',
                        bgcolor: isDark ? 'rgba(234,67,53,0.1)' : 'rgba(234,67,53,0.06)',
                        p: 1,
                        '&:hover': { bgcolor: 'rgba(234,67,53,0.2)' },
                      }}
                    >
                      <DeleteIcon sx={{ fontSize: 20 }} />
                    </IconButton>

                    {/* Recording Time and Blinker */}
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        bgcolor: isDark ? '#2A3942' : '#FFFFFF',
                        borderRadius: '24px',
                        px: 2.5,
                        py: 1,
                        boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.08)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: '#EA4335',
                          animation: 'blink 1.2s infinite alternate',
                          '@keyframes blink': {
                            '0%': { opacity: 0.3, transform: 'scale(0.8)' },
                            '100%': { opacity: 1, transform: 'scale(1.2)' }
                          }
                        }}
                      />
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', flex: 1 }}>
                        Enregistrement en cours...
                      </Typography>
                      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#EA4335', minWidth: 40, textAlign: 'right' }}>
                        {formatRecordTime(recordSeconds)}
                      </Typography>
                    </Box>

                    {/* Instruction */}
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        display: { xs: 'none', md: 'block' },
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Glisser pour annuler
                    </Typography>

                    {/* Send Voice Note */}
                    <IconButton
                      onClick={sendVoiceNote}
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        bgcolor: '#25D366',
                        color: '#fff',
                        flexShrink: 0,
                        transition: 'all 150ms ease',
                        '&:hover': { bgcolor: '#22C55E', transform: 'scale(1.05)' },
                        '&:active': { transform: 'scale(0.95)' },
                      }}
                    >
                      <SendIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 1,
                      px: 1.5,
                      pt: 1,
                      pb: 'calc(8px + env(safe-area-inset-bottom))',
                    }}
                  >
                    <IconButton
                      onClick={() => { setEmojiOpen(!emojiOpen); setAttachOpen(false); }}
                      size="small"
                      className="pressable"
                      sx={{
                        color: emojiOpen ? '#25D366' : 'text.secondary',
                        borderRadius: '50%',
                        mb: 0.5,
                        bgcolor: emojiOpen ? 'rgba(37,211,102,0.08)' : 'transparent',
                      }}
                    >
                      <EmojiEmotionsOutlinedIcon sx={{ fontSize: 22 }} />
                    </IconButton>
                    
                    <IconButton
                      onClick={() => { setAttachOpen(!attachOpen); setEmojiOpen(false); }}
                      size="small"
                      className="pressable"
                      sx={{
                        color: attachOpen ? '#25D366' : 'text.secondary',
                        borderRadius: '50%',
                        mb: 0.5,
                        bgcolor: attachOpen ? 'rgba(37,211,102,0.08)' : 'transparent',
                        transform: attachOpen ? 'rotate(45deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <AttachFileIcon sx={{ fontSize: 22 }} />
                    </IconButton>

                    <Box
                      sx={{
                        flex: 1,
                        bgcolor: isDark ? '#2A3942' : '#FFFFFF',
                        borderRadius: '24px',
                        px: 2,
                        py: 1,
                        display: 'flex',
                        alignItems: 'center',
                        boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.08)',
                      }}
                    >
                      <InputBase
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Tapez un message"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        sx={{
                          fontSize: '1rem',
                          color: 'text.primary',
                          '& .MuiInputBase-input::placeholder': { color: 'text.disabled', opacity: 1 },
                        }}
                      />
                    </Box>

                    <IconButton
                      onClick={input.trim() ? sendMessage : startRecording}
                      className="pressable"
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        bgcolor: '#25D366',
                        color: '#fff',
                        flexShrink: 0,
                        mb: 0.5,
                        transition: 'all 150ms ease',
                        '&:hover': { bgcolor: '#22C55E', transform: 'scale(1.05)' },
                        '&:active': { transform: 'scale(0.95)' },
                      }}
                    >
                      {input.trim() ? (
                        <SendIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <MicNoneIcon sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>
                  </Box>
                )}
              </Box>
            </>
          ) : (
            /* Empty state (desktop only) */
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: isDark ? '#0B141A' : '#F0F2F5',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 80, height: 80, borderRadius: '50%',
                  bgcolor: isDark ? alpha('#25D366', 0.15) : alpha('#25D366', 0.12),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <PlaceIcon sx={{ fontSize: 36, color: '#25D366', opacity: 0.7 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#E9EDEF' : '#111B21' }}>
                StartJobs Messages
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#8696A0' : '#54656F', textAlign: 'center', maxWidth: 280 }}>
                Sélectionnez une conversation pour commencer à discuter avec un employeur.
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDelete?.open || false}
        onClose={() => setConfirmDelete(null)}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {confirmDelete?.type === 'message' ? 'Supprimer ce message ?' : 
           confirmDelete?.type === 'bulk' ? 'Supprimer les messages sélectionnés ?' : 
           'Supprimer la conversation ?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.95rem' }}>
            {confirmDelete?.type === 'conversation' 
              ? 'Êtes-vous sûr de vouloir supprimer définitivement cette conversation ? Cette action est irréversible.' 
              : 'Êtes-vous sûr de vouloir supprimer ces messages ? Ils seront marqués comme supprimés pour vous et le destinataire.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDelete(null)} color="inherit" sx={{ fontWeight: 600 }}>
            Annuler
          </Button>
          <Button 
            onClick={() => {
              confirmDelete?.action();
              setConfirmDelete(null);
            }} 
            variant="contained" 
            color="error" 
            sx={{ fontWeight: 700, borderRadius: '8px' }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* NEW CHAT MODAL */}
      <ContactSearchModal
        open={newChatModalOpen}
        onClose={() => setNewChatModalOpen(false)}
        onSelect={handleStartNewChat}
        title="Nouvelle discussion"
        placeholder="Chercher un utilisateur..."
      />

      {/* DELETE CONVO DIALOG */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: '16px' } }}>
        <DialogTitle sx={{ fontWeight: 800, color: 'error.main' }}>Supprimer la discussion ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment supprimer cette conversation ? Elle disparaîtra de votre liste, mais restera visible pour l'autre participant.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Annuler</Button>
          <Button onClick={confirmDeleteConvo} variant="contained" color="error" disableElevation sx={{ borderRadius: '8px', fontWeight: 600 }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={broadcastModalOpen} onClose={() => setBroadcastModalOpen(false)} sx={{ '& .MuiDialog-paper': { borderRadius: 3, width: '100%', maxWidth: 500 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Diffusion Globale</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <DialogContentText>
            Envoyez un message direct à plusieurs utilisateurs. Ce message apparaîtra comme une nouvelle discussion ou s'ajoutera à une discussion existante avec chaque destinataire.
          </DialogContentText>
          <FormControl fullWidth size="small">
            <InputLabel>Destinataires</InputLabel>
            <Select
              value={broadcastTarget}
              label="Destinataires"
              onChange={(e) => setBroadcastTarget(e.target.value as any)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="all">Tous les utilisateurs</MenuItem>
              <MenuItem value="candidates">Candidats uniquement</MenuItem>
              <MenuItem value="employers">Employeurs uniquement</MenuItem>
            </Select>
          </FormControl>
          <TextField
            inputRef={broadcastInputRef}
            fullWidth
            multiline
            rows={4}
            label="Message"
            placeholder="Rédigez votre message ici..."
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            slotProps={{ input: { sx: { borderRadius: 2 } } }}
          />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}>
              Variables disponibles (cliquez pour insérer) :
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button size="small" variant="outlined" onClick={() => insertVariable('{prenom}')} sx={{ textTransform: 'none', borderRadius: 2, py: 0.25 }}>{`{prenom}`}</Button>
              <Button size="small" variant="outlined" onClick={() => insertVariable('{nom}')} sx={{ textTransform: 'none', borderRadius: 2, py: 0.25 }}>{`{nom}`}</Button>
              <Button size="small" variant="outlined" onClick={() => insertVariable('{nom_complet}')} sx={{ textTransform: 'none', borderRadius: 2, py: 0.25 }}>{`{nom_complet}`}</Button>
              <Button size="small" variant="outlined" onClick={() => insertVariable('{email}')} sx={{ textTransform: 'none', borderRadius: 2, py: 0.25 }}>{`{email}`}</Button>
              <Button size="small" variant="outlined" onClick={() => insertVariable('{telephone}')} sx={{ textTransform: 'none', borderRadius: 2, py: 0.25 }}>{`{telephone}`}</Button>
              
              {broadcastTarget === 'candidates' && (
                <Button size="small" variant="outlined" color="secondary" onClick={() => insertVariable('{profil_type}')} sx={{ textTransform: 'none', borderRadius: 2, py: 0.25 }}>{`{profil_type}`}</Button>
              )}
              
              {broadcastTarget === 'employers' && (
                <Button size="small" variant="outlined" color="success" onClick={() => insertVariable('{entreprise}')} sx={{ textTransform: 'none', borderRadius: 2, py: 0.25 }}>{`{entreprise}`}</Button>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setBroadcastModalOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Annuler</Button>
          <Button 
            onClick={handleBroadcast} 
            color="primary" 
            variant="contained" 
            disabled={!broadcastText.trim() || isBroadcasting}
            disableElevation 
            sx={{ fontWeight: 700, borderRadius: '8px' }}
          >
            {isBroadcasting ? 'Envoi en cours...' : 'Envoyer'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
