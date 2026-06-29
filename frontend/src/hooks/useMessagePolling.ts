import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { setUnreadCount } from '../store/slices/messagesSlice';
import { showSnackbar } from '../store/slices/snackbarSlice';
import api from '../utils/api';

export function useMessagePolling(intervalMs = 5000) {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const unreadCount = useAppSelector((state) => state.messages.unreadCount);
  
  // Track previous count to detect new messages
  const prevUnreadCountRef = useRef(unreadCount);

  useEffect(() => {
    if (!currentUser) return;

    // Demander l'autorisation pour les notifications natives (pour le son du téléphone sur mobile)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(console.error);
    }

    const fetchConversations = async () => {
      try {
        const res = await api.get('conversations/');
        const mapped = res.data.map((convo: any) => {
          const mappedMessages = convo.messages.map((m: any) => ({
            fromMe: m.sender?.id === currentUser.id,
            status: m.is_read ? 'read' : 'sent',
          }));
          const convoUnreadCount = mappedMessages.filter((m: any) => !m.fromMe && m.status !== 'read').length;
          return { unread: convoUnreadCount };
        });

        const totalUnread = mapped.reduce((sum: number, c: any) => sum + c.unread, 0);
        
        // If we have more unread messages than before, show a notification!
        if (totalUnread > prevUnreadCountRef.current) {
           // We could find exactly who sent it, but a general notification is safe
           dispatch(showSnackbar({ message: 'Nouveau message reçu !', severity: 'info' }));
           // Play sound and trigger native notifications
           try {
             const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
             
             if (isMobile) {
               // On mobile, try to trigger the native OS notification (which plays the phone's native sound)
               if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
                 try {
                   new Notification('StartJobs', { body: 'Nouveau message reçu', icon: '/vite.svg', silent: false });
                 } catch (e) {
                   // Fallback for Android Chrome which might require Service Worker
                 }
               }
               // Also try to vibrate
               if (navigator.vibrate) {
                 navigator.vibrate([200, 100, 200]);
               }
             }
             
             // Web Audio API for a soft, professional "pop/ding" (WhatsApp style)
             // Works on both PC (primary sound) and mobile (fallback if native sound doesn't trigger)
             const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
             if (AudioContext) {
               const ctx = new AudioContext();
               
               const playTone = (freq1: number, freq2: number, delay: number, volume: number) => {
                 setTimeout(() => {
                   try {
                     const osc = ctx.createOscillator();
                     const gain = ctx.createGain();
                     
                     osc.type = 'sine';
                     osc.frequency.setValueAtTime(freq1, ctx.currentTime);
                     osc.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + 0.1);
                     
                     gain.gain.setValueAtTime(0, ctx.currentTime);
                     gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
                     gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
                     
                     osc.connect(gain);
                     gain.connect(ctx.destination);
                     
                     osc.start(ctx.currentTime);
                     osc.stop(ctx.currentTime + 0.3);
                   } catch (e) {}
                 }, delay);
               };

               // Double soft ding (WhatsApp web style)
               playTone(800, 1200, 0, 0.15);
               playTone(1200, 1600, 120, 0.1);
             }
           } catch(e) {
             console.log('Audio error:', e);
           }
        }
        
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
