import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { ChatMessage } from '../types';
import { useAuth } from './AuthContext';
import { fetchChatMessages, sendChatMessage, fetchChatUnreadCount } from '../services/api';

const UNREAD_POLL_MS = 15000;

interface ChatContextType {
  messages: ChatMessage[];
  unreadCount: number;
  isLoading: boolean;
  isSending: boolean;
  loadThread: () => Promise<void>;
  send: (body: string) => Promise<{ ok: boolean; error?: string }>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      setUnreadCount(await fetchChatUnreadCount());
    } catch {
      // Keep the last known count on a transient error.
    }
  }, [user]);

  useEffect(() => {
    refreshUnreadCount();
    if (!user) return;
    const interval = setInterval(refreshUnreadCount, UNREAD_POLL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshUnreadCount();
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [user, refreshUnreadCount]);

  // Fetching the thread also marks the admin's replies as read server-side,
  // so refresh the badge count right after.
  const loadThread = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const list = await fetchChatMessages();
      setMessages(list);
      setUnreadCount(0);
    } catch {
      // Keep the last known thread on a transient error.
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const send = async (body: string) => {
    setIsSending(true);
    try {
      const { message, aiMessage } = await sendChatMessage(body);
      setMessages((prev) => [...prev, message, ...(aiMessage ? [aiMessage] : [])]);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message || 'Could not send that message.' };
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, unreadCount, isLoading, isSending, loadThread, send }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
};
