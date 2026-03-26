import React from 'react';
import { AlertTriangle, AlertCircle, Info, AlertOctagon } from 'lucide-react';

/**
 * UrgencyBadge Component
 *
 * Displays urgency level with appropriate color-coding and icon.
 *
 * @param {string} level - 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY'
 * @param {boolean} showIcon - Display icon (default: true)
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} className - Additional CSS classes
 */
const UrgencyBadge = ({
    level = 'LOW',
    showIcon = true,
    size = 'md',
    className = ''
}) => {
    const normalizedLevel = level?.toUpperCase() || 'LOW';

    const levelConfig = {
        LOW: {
            bg: 'bg-emerald-100',
            text: 'text-emerald-700',
            border: 'border-emerald-200',
            icon: Info,
            label: 'Low Urgency'
        },
        MODERATE: {
            bg: 'bg-amber-100',
            text: 'text-amber-700',
            border: 'border-amber-200',
            icon: AlertCircle,
            label: 'Moderate Urgency'
        },
        HIGH: {
            bg: 'bg-orange-100',
            text: 'text-orange-700',
            border: 'border-orange-200',
            icon: AlertTriangle,
            label: 'High Urgency'
        },
        EMERGENCY: {
            bg: 'bg-rose-100',
            text: 'text-rose-700',
            border: 'border-rose-200',
            icon: AlertOctagon,
            label: 'Emergency'
        }
    };

    const config = levelConfig[normalizedLevel] || levelConfig.LOW;
    const Icon = config.icon;

    const sizeStyles = {
        sm: 'px-2 py-0.5 text-[10px] gap-1',
        md: 'px-3 py-1.5 text-xs gap-1.5',
        lg: 'px-4 py-2 text-sm gap-2'
    };

    const iconSize = {
        sm: 10,
        md: 12,
        lg: 14
    };

    return (
        <span
            className={`
                inline-flex items-center justify-center
                ${config.bg} ${config.text} ${config.border}
                ${sizeStyles[size]}
                border rounded-lg
                font-medium shadow-sm
                ${className}
            `}
        >
            {showIcon && <Icon size={iconSize[size]} />}
            {config.label}
        </span>
    );
};

export default UrgencyBadge;
