import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, X, Settings, Clock, Calendar, CreditCard, FileText, Video, User } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

/**
 * NotificationBell
 * 
 * A notification bell icon with dropdown showing recent notifications
 */
const NotificationBell = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        isConnected
    } = useNotifications();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get icon for notification type
    const getNotificationIcon = (type, iconType) => {
        const iconProps = { size: 16, className: 'flex-shrink-0' };
        
        switch (iconType || type) {
            case 'appointment':
            case 'APPOINTMENT_BOOKED':
            case 'APPOINTMENT_CONFIRMED':
            case 'APPOINTMENT_CANCELLED':
            case 'APPOINTMENT_REMINDER':
                return <Calendar {...iconProps} className="text-blue-500" />;
            case 'payment':
            case 'PAYMENT_SUCCESS':
            case 'PAYMENT_FAILED':
                return <CreditCard {...iconProps} className="text-green-500" />;
            case 'prescription':
            case 'PRESCRIPTION_READY':
                return <FileText {...iconProps} className="text-purple-500" />;
            case 'telemedicine':
            case 'TELEMEDICINE_SESSION_CREATED':
            case 'TELEMEDICINE_SESSION_REMINDER':
            case 'TELEMEDICINE_SESSION_ENDED':
                return <Video {...iconProps} className="text-cyan-500" />;
            case 'doctor':
            case 'DOCTOR_APPROVED':
            case 'DOCTOR_REJECTED':
                return <User {...iconProps} className="text-indigo-500" />;
            default:
                return <Bell {...iconProps} className="text-gray-500" />;
        }
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch {
            return '';
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        
        // Navigate to action URL if available
        if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
        }
        
        setIsOpen(false);
    };

    // Get recent notifications (max 10)
    const recentNotifications = notifications.slice(0, 10);

    return (
        <div className={`relative ${className}`}>
            {/* Bell Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            >
                <Bell size={22} className="text-gray-600 dark:text-gray-300" />
                
                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                )}
                
                {/* Connection indicator */}
                {isConnected && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-gray-800" />
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <div className="flex items-center gap-2">
                                <Bell size={18} className="text-primary-600" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Mark all as read"
                                    >
                                        <CheckCheck size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[380px] overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
                                </div>
                            ) : recentNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-3">
                                        <Bell size={24} className="text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-center">
                                        No notifications yet
                                    </p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-1">
                                        We'll notify you when something happens
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {recentNotifications.map((notification) => (
                                        <motion.div
                                            key={notification.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`group relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                                                !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                            }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex gap-3">
                                                {/* Icon */}
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className={`p-2 rounded-lg ${
                                                        !notification.isRead 
                                                            ? 'bg-primary-100 dark:bg-primary-900/30' 
                                                            : 'bg-gray-100 dark:bg-gray-700'
                                                    }`}>
                                                        {getNotificationIcon(notification.type, notification.iconType)}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm ${
                                                            !notification.isRead 
                                                                ? 'font-semibold text-gray-900 dark:text-white' 
                                                                : 'font-medium text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {notification.title || notification.type}
                                                        </p>
                                                        {!notification.isRead && (
                                                            <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-blue-500 rounded-full" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <Clock size={12} className="text-gray-400" />
                                                        <span className="text-xs text-gray-400">
                                                            {formatTime(notification.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Delete button (shows on hover) */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900">
                                <div className="flex items-center justify-between">
                                    <a
                                        href="/notifications"
                                        className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        View all notifications
                                    </a>
                                    <a
                                        href="/notifications/settings"
                                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Notification settings"
                                    >
                                        <Settings size={16} />
                                    </a>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
