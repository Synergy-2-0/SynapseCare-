import React from 'react';
import { motion } from 'framer-motion';

const Badge = ({
    children,
    variant = 'neutral',
    size = 'md',
    rounded = true,
    pulse = false,
    animated = true,
    className = ''
}) => {
    const variants = {
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50',
        warning: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50',
        danger: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/50',
        info: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50',
        primary: 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-200/50',
        neutral: 'bg-slate-50 text-slate-500 border-slate-100 shadow-slate-100/50'
    };

    const sizes = {
        sm: 'px-3 py-1 text-[9px]',
        md: 'px-4 py-1.5 text-[10px]',
        lg: 'px-5 py-2 text-xs'
    };

    const Component = animated ? motion.span : 'span';

    return (
        <Component
            initial={animated ? { opacity: 0, scale: 0.9 } : {}}
            animate={animated ? { opacity: 1, scale: 1 } : {}}
            className={`
                inline-flex items-center justify-center
                ${rounded ? 'rounded-full' : 'rounded-xl'}
                ${variants[variant] || variants.neutral}
                ${sizes[size]}
                border shadow-sm
                font-black uppercase tracking-[0.2em]
                transition-all duration-300
                ${pulse ? 'animate-pulse' : ''}
                ${className}
            `}
        >
            {children}
        </Component>
    );
};

export default Badge;
