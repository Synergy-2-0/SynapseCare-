import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../lib/api';
import useToast from '../hooks/useToast';

const NotificationContext = createContext({
    notifications: [],
    unreadCount: 0,
    loading: true,
    error: null,
    fetchNotifications: () => { },
    fetchUnreadCount: () => { },
    markAsRead: () => { },
    markAllAsRead: () => { },
    deleteNotification: () => { },
    preferences: null,
    updatePreferences: () => { },
});

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [preferences, setPreferences] = useState(null);
    const [error, setError] = useState(null);
    const { showToast } = useToast();

    // Get user ID from localStorage
    const getUserId = () => {
        const directUserId = localStorage.getItem('user_id');
        if (directUserId) return directUserId;

        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            const user = JSON.parse(userStr);
            return user.id || user.userId || null;
        } catch (e) {
            return null;
        }
    };

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        const userId = getUserId();
        if (!userId) return;

        setLoading(true);
        try {
            const response = await notificationApi.get(`/user/${userId}`);
            setNotifications(response.data || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const response = await notificationApi.get(`/user/${userId}/unread-count`);
            setUnreadCount(response.data?.unreadCount || 0);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    }, []);

    // Fetch notification preferences
    const fetchPreferences = useCallback(async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const response = await notificationApi.get(`/preferences/${userId}`);
            setPreferences(response.data);
        } catch (err) {
            console.error('Failed to fetch notification preferences:', err);
        }
    }, []);

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            await notificationApi.put(`/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            await notificationApi.put(`/user/${userId}/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    };

    // Delete a notification
    const deleteNotification = async (notificationId) => {
        const userId = getUserId();
        if (!userId) return;

        try {
            await notificationApi.delete(`/user/${userId}/${notificationId}`);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            // Recalculate unread count if needed or just fetch again
            fetchUnreadCount();
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    // Update notification preferences
    const updatePreferences = async (newPreferences) => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const response = await notificationApi.put(`/preferences/${userId}`, newPreferences);
            setPreferences(response.data);
            showToast('success', 'Preferences updated successfully');
            return response.data;
        } catch (err) {
            console.error('Failed to update notification preferences:', err);
            showToast('error', 'Failed to update preferences');
            throw err;
        }
    };

    // Initialize on mount
    useEffect(() => {
        const userId = getUserId();
        if (userId) {
            fetchNotifications();
            fetchUnreadCount();
            fetchPreferences();
        }
    }, [fetchNotifications, fetchUnreadCount, fetchPreferences]);

    // Handle authentication state changes
    useEffect(() => {
        const handleAuthChange = () => {
            const userId = getUserId();
            if (userId) {
                fetchNotifications();
                fetchUnreadCount();
                fetchPreferences();
            } else {
                setNotifications([]);
                setUnreadCount(0);
                setPreferences(null);
            }
        };

        window.addEventListener('storage', handleAuthChange);

        // Add Polling Heartbeat (every 30 seconds)
        let pollInterval;
        const userId = getUserId();
        if (userId) {
            pollInterval = setInterval(() => {
                fetchUnreadCount();
            }, 30000);
        }

        return () => {
            window.removeEventListener('storage', handleAuthChange);
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [fetchNotifications, fetchUnreadCount, fetchPreferences]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            error,
            fetchNotifications,
            fetchUnreadCount,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            preferences,
            updatePreferences
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
