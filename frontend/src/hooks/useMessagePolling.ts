import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setUnreadCount } from '../store/slices/messagesSlice';
import { showSnackbar } from '../store/slices/snackbarSlice';
import api from '../utils/api';

// Request browser notification permission (called once on mount)
async function requestNotificationPermission(): Promise<void> {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    try {
      await Notification.requestPermission();
    } catch (e) {
      console.warn('Notification permission request failed:', e);
    }
  }
}

// Show a browser/OS push notification (like WhatsApp Web)
function showPushNotification(senderName: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const notification = new Notification(`📩 ${senderName}`, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'startjobs-message',   // replaces previous notif of same tag
      renotify: true,
      silent: false,               // let the OS play its own notification sound
    } as any);
    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
    // Clicking the notification brings the tab into focus
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (e) {
    // some browsers block Notification on non-HTTPS — silently ignore
    console.warn('Push notification failed:', e);
  }
}

// Play the MP3 fallback; if that also fails, synthesise a soft ding via WebAudio
async function playNotificationSound(): Promise<void> {
  try {
    const audio = new Audio('/notif_alert.mp3');
    audio.volume = 0.7;
    await audio.play();
    return; // success — done
  } catch (_mp3Err) {
    // MP3 blocked (autoplay policy) → fallback to synthesised tone
  }

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const playTone = (freq1: number, freq2: number, delayMs: number, vol: number) => {
      setTimeout(() => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq1, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.35);
        } catch (_) { /* ignore */ }
      }, delayMs);
    };

    // Double-ding (WhatsApp Web style)
    playTone(800, 1200, 0, 0.15);
    playTone(1200, 1600, 130, 0.10);
  } catch (_) { /* ignore */ }
}

export function useMessagePolling(intervalMs = 5000) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const unreadCount = useAppSelector((state) => state.messages.unreadCount);
  const prevUnreadCountRef = useRef(unreadCount);
  const isFirstFetchRef = useRef(true);

  // Ask for notification permission as early as possible
  useEffect(() => {
    if (currentUser) {
      requestNotificationPermission();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchConversations = async () => {
      try {
        const res = await api.get('conversations/');

        // Identify the newest unread message to personalise the notification
        let latestSenderName = 'StartJobs';
        let latestMessageBody = 'Vous avez reçu un nouveau message.';

        const mapped = res.data.map((convo: any) => {
          const mappedMessages = (convo.messages ?? []).map((m: any) => ({
            fromMe: m.sender?.id === currentUser.id,
            isRead: m.is_read,
            senderName: m.sender
              ? `${m.sender.first_name || ''} ${m.sender.last_name || ''}`.trim() || m.sender.username
              : 'Inconnu',
            text: m.text || '',
          }));

          const convoUnread = mappedMessages.filter((m: any) => !m.fromMe && !m.isRead);

          // Capture the most recent unread sender / text for the notification popup
          if (convoUnread.length > 0) {
            const last = convoUnread[convoUnread.length - 1];
            latestSenderName = last.senderName;
            latestMessageBody = last.text.slice(0, 100) || 'Nouveau message';
          }

          return { unread: convoUnread.length };
        });

        const totalUnread: number = mapped.reduce((sum: number, c: any) => sum + c.unread, 0);

        if (!isFirstFetchRef.current && totalUnread > prevUnreadCountRef.current) {
          // 1. In-app snackbar - format as WHATSAPP|sender|message to be parsed by SnackbarProvider
          dispatch(showSnackbar({ message: `WHATSAPP|${latestSenderName}|${latestMessageBody}`, severity: 'info' }));

          // 2. OS push notification (like WhatsApp Web) — works when tab is in background
          showPushNotification(latestSenderName, latestMessageBody);

          // 3. Haptic feedback on mobile
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }

          // 4. Sound
          await playNotificationSound();
        }

        isFirstFetchRef.current = false;
        prevUnreadCountRef.current = totalUnread;
        dispatch(setUnreadCount(totalUnread));

      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    // Initial fetch
    fetchConversations();

    const intervalId = setInterval(fetchConversations, intervalMs);
    return () => clearInterval(intervalId);
  }, [currentUser, dispatch, intervalMs]);
}
