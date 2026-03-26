import React from 'react';
import { motion } from 'framer-motion';
import useCountUp from '../../hooks/useCountUp';

/**
 * StatCard Component - Enhanced with Count-Up Animation
 *
 * Features:
 * - Animated count-up for numbers
 * - Icon pulse on mount
 * - Subtle hover lift
 * - Trend indicator slide-in
 * - Professional animations
 *
 * @param {string} label - Stat label
 * @param {string|number} value - Stat value
 * @param {Component} icon - Lucide icon component
 * @param {string} color - Icon color class (e.g., 'text-indigo-600')
 * @param {string} bgColor - Icon background color class (e.g., 'bg-indigo-50')
 * @param {object} trend - Trend data ({ value: '+12%', isPositive: true })
 * @param {function} onClick - Click handler
 * @param {boolean} animated - Enable count-up animation (default: true)
 * @param {string} prefix - Prefix for number (e.g., "$")
 * @param {string} suffix - Suffix for number (e.g., "%")
 */
const StatCard = ({
    label,
    value,
    icon: Icon,
    color = 'text-blue-600',
    bgColor = 'bg-blue-50',
    trend,
    onClick,
    animated = true,
    prefix = '',
    suffix = ''
}) => {
    const CardWrapper = onClick ? motion.button : motion.div;

    // Check if value is a number for count-up animation
    const isNumber = !isNaN(parseFloat(value)) && isFinite(value);
    const numericValue = isNumber ? parseFloat(value) : 0;

    // Use count-up animation for numeric values
    const animatedValue = useCountUp(numericValue, {
        duration: 1500,
        enabled: animated && isNumber,
        prefix,
        suffix
    });

    const displayValue = animated && isNumber ? animatedValue : `${prefix}${value}${suffix}`;

    return (
        <CardWrapper
            onClick={onClick}
            className={`bg-white p-5 rounded-xl shadow-sm border border-slate-200 ${onClick ? 'cursor-pointer transition-colors hover:border-blue-300' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex justify-between items-center mb-3">
                {/* Icon */}
                <div className={`p-2.5 ${bgColor} ${color} rounded-lg`}>
                    <Icon className="w-5 h-5" />
                </div>

                {/* Value */}
                <div className="text-2xl font-bold text-slate-900">
                    {displayValue}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="font-medium text-xs text-slate-500">
                    {label}
                </div>

                {/* Trend indicator */}
                {trend && (
                    <div className={`text-xs font-medium ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend.value}
                    </div>
                )}
            </div>
        </CardWrapper>
    );
};

export default StatCard;
