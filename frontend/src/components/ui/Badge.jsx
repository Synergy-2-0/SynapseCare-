import React from 'react';
import { motion } from 'framer-motion';

/**
 * Badge Component - Enhanced with Appear Animation
 *
 * Features:
 * - Fade-in scale animation
 * - Pulse for notifications
 * - Smooth color transitions
 * - Professional appearance
 *
 * @param {ReactNode} children - Badge text
 * @param {string} variant - 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} rounded - Use rounded-full instead of rounded-lg
 * @param {boolean} pulse - Enable pulse animation for notifications
 * @param {boolean} animated - Enable appear animation (default: true)
 * @param {string} className - Additional CSS classes
 */
const Badge = ({
    children,
    variant = 'neutral',
    size = 'md',
    rounded = false,
    pulse = false,
    animated = true,
    className = ''
}) => {
    const variantStyles = {
        success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-100 text-amber-700 border-amber-200',
        danger: 'bg-rose-100 text-rose-700 border-rose-200',
        info: 'bg-blue-100 text-blue-700 border-blue-200',
        neutral: 'bg-slate-100 text-slate-700 border-slate-200'
    };

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-4 py-1.5 text-xs',
        lg: 'px-5 py-2 text-sm'
    };

    const BadgeComponent = animated ? motion.span : 'span';

    const animationProps = animated ? {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: {
            duration: 0.25,
            ease: [0.25, 0.1, 0.25, 1]
        }
    } : {};

    return (
        <BadgeComponent
            {...animationProps}
            className={`
                inline-flex items-center justify-center
                ${rounded ? 'rounded-full' : 'rounded-lg'}
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                border shadow-sm
                font-medium
                transition-colors duration-200
                ${pulse ? 'animate-pulse-subtle' : ''}
                ${className}
            `}
        >
            {children}
        </BadgeComponent>
    );
};

export default Badge;
