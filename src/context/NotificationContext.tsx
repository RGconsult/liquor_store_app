import React, { createContext, useContext, useState } from 'react';
import { NotificationItem } from '../types';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAllAsRead: () => void;
  addNotification: (title: string, message: string, type?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const INITIAL_NOTIFS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'PROMO',
    title: 'Weekend Champagne & Cognac Special 🍾',
    message: 'Enjoy 10% off Ruinart & Hennessy V.S.O.P automatically with promo code RESERVE10.',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: 'n-2',
    type: 'ORDER',
    title: 'Order Delivered — #ORD-984210',
    message: 'Your order of Monkey Shoulder & Patrón Silver was delivered safely in Kigali.',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    read: true
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (title: string, message: string, type = 'GENERAL') => {
    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllAsRead, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
