import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, text }: { conversationId: string; text: string }) => {
    const res = await api.post('messages/', { conversation: conversationId, text });
    return res.data;
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (conversationId: string) => {
    const res = await api.post(`conversations/${conversationId}/mark_as_read/`);
    return res.data;
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId: string) => {
    const res = await api.delete(`messages/${messageId}/`);
    return res.data;
  }
);

export const bulkDeleteMessages = createAsyncThunk(
  'messages/bulkDeleteMessages',
  async (messageIds: string[]) => {
    const res = await api.post('messages/bulk_delete/', { message_ids: messageIds });
    return res.data;
  }
);

export const deleteConversation = createAsyncThunk(
  'messages/deleteConversation',
  async (conversationId: string) => {
    const res = await api.post(`conversations/${conversationId}/delete_for_me/`);
    return res.data;
  }
);

interface MessagesState {
  unreadCount: number;
}

// Mock initial unread count (e.g. from 2 unread conversations)
const initialState: MessagesState = {
  unreadCount: 2,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.unreadCount = 0;
    }
  },
});

export const { setUnreadCount, incrementUnreadCount, decrementUnreadCount, markAllAsRead } = messagesSlice.actions;
export default messagesSlice.reducer;
