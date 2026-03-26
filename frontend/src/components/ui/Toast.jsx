import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Toast Component - Enhanced with Swipe Dismiss & Progress Bar
 *
 * Features:
 * - Swipe-to-dismiss gesture
 * - Animated progress bar
 * - Icon animations
 * - Professional slide-in from top-right
 *
 * @param {string} id - Toast ID
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 * @param {string} message - Toast message
 * @param {function} onClose - Close handler
 * @param {number} duration - Auto-dismiss duration in ms (default: 5000, 0 = no auto-dismiss)
 */
export const Toast = ({ id, type = 'info', message, onClose, duration = 5000 }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (duration === 0) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    clearInterval(interval);
                    onClose(id);
                    return 0;
                }
                return prev - (100 / (duration / 100));
            });
        }, 100);

        return () => clearInterval(interval);
    }, [duration, id, onClose]);

    const typeStyles = {
        success: {
            bg: 'bg-emerald-50 border-emerald-200',
            text: 'text-emerald-800',
            icon: CheckCircle,
            iconColor: 'text-emerald-600',
            progressBg: 'bg-emerald-500'
        },
        error: {
            bg: 'bg-rose-50 border-rose-200',
            text: 'text-rose-800',
            icon: AlertCircle,
            iconColor: 'text-rose-600',
            progressBg: 'bg-rose-500'
        },
        warning: {
            bg: 'bg-amber-50 border-amber-200',
            text: 'text-amber-700',
            icon: AlertTriangle,
            iconColor: 'text-amber-600',
            progressBg: 'bg-amber-500'
        },
        info: {
            bg: 'bg-blue-50 border-blue-200',
            text: 'text-blue-700',
            icon: Info,
            iconColor: 'text-blue-600',
            progressBg: 'bg-blue-500'
        }
    };

    const style = typeStyles[type];
    const Icon = style.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: 100 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
                if (info.offset.x > 100) {
                    onClose(id);
                }
            }}
            role="status"
            aria-live="polite"
            className={`${style.bg} ${style.text} border px-5 py-4 rounded-2xl shadow-lg flex items-center gap-4 min-w-80 max-w-md relative overflow-hidden cursor-grab active:cursor-grabbing`}
        >
            {/* Icon with animation */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={style.iconColor}
            >
                <Icon className="w-5 h-5 shrink-0" />
            </motion.div>

            <div className="flex-1 text-sm font-medium">
                {message}
            </div>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onClose(id)}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors shrink-0"
            >
                <X className="w-4 h-4" />
            </motion.button>

            {/* Progress bar */}
            {duration > 0 && (
                <motion.div
                    className={`absolute bottom-0 left-0 h-1 ${style.progressBg}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                />
            )}
        </motion.div>
    );
};

export default Toast;
