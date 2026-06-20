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
           
           // Play sound if supported
           try {
             const audio = new Audio('/notification.mp3');
             audio.play().catch(e => console.log('Audio autoplay blocked'));
           } catch(e) {}
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
