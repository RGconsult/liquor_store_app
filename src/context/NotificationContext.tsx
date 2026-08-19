import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types';
import { useAuth } from './AuthContext';
import { fetchNotifications } from '../services/api';
import { getItem, setItem } from '../services/storage';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  markAllAsRead: () => void;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function readSeenIds(): Set<string> {
  try {
    const raw = getItem('rv_seen_notifications');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    setIsLoading(true);
    try {
      const list = await fetchNotifications();
      const seen = readSeenIds();
      setNotifications(list.map((n) => ({ ...n, read: seen.has(n.id) })));
    } catch (e) {
      // Keep the last known list on a transient error.
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // The backend doesn't track read state for customer-facing notifications
  // (only admin ones), so "read" is tracked locally on-device.
  const markAllAsRead = () => {
    const seen = readSeenIds();
    notifications.forEach((n) => seen.add(n.id));
    setItem('rv_seen_notifications', JSON.stringify(Array.from(seen))).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, isLoading, markAllAsRead, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
