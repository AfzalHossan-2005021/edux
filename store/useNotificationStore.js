/**
 * Notification Store - Zustand state management for notifications
 */
import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  socket: null,

  // Actions
  addNotification: (notification) => set((state) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    return {
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
      unreadCount: state.unreadCount + 1,
    };
  }),

  markAsRead: (notificationId) => set((state) => {
    const notifications = state.notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    const unreadCount = notifications.filter((n) => !n.read).length;
    return { notifications, unreadCount };
  }),

  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  removeNotification: (notificationId) => set((state) => {
    const notifications = state.notifications.filter((n) => n.id !== notificationId);
    const unreadCount = notifications.filter((n) => !n.read).length;
    return { notifications, unreadCount };
  }),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

  setConnected: (connected) => set({ isConnected: connected }),
  setSocket: (socket) => set({ socket }),

  // Helper to show toast-like notifications
  showToast: (type, message, title = '') => {
    const notification = {
      type, // 'success', 'error', 'info', 'warning'
      message,
      title,
      isToast: true,
    };
    get().addNotification(notification);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      const latestNotifications = get().notifications;
      if (latestNotifications.length > 0) {
        const toastId = latestNotifications[0]?.id;
        if (latestNotifications[0]?.isToast) {
          get().markAsRead(toastId);
        }
      }
    }, 5000);
  },

  // Get unread notifications
  getUnreadNotifications: () => get().notifications.filter((n) => !n.read),

  // Get notifications by type
  getNotificationsByType: (type) => get().notifications.filter((n) => n.type === type),
}));

export default useNotificationStore;
