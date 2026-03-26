import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
    title,
    subtitle,
    actions,
    children,
    variant = 'default',
    padding = 'lg',
    hoverable = true,
    onClick,
    className = '',
}) => {
    const variants = {
        default: 'bg-white border-slate-200 shadow-sm hover:shadow-premium hover:border-indigo-100',
        dark: 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-indigo-100',
        glass: 'glass-morphism border-white/50 shadow-2xl backdrop-blur-3xl'
    };

    const paddings = {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-10',
        xl: 'p-16'
    };

    const Component = hoverable || onClick ? motion.div : 'div';
    
    return (
        <Component
            onClick={onClick}
            whileHover={hoverable ? { y: -5 } : {}}
            className={`rounded-[2.5rem] border transition-all duration-500 overflow-hidden relative ${variants[variant]} ${paddings[padding]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
        >
            {(title || subtitle || actions) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                    <div>
                        {title && <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight">{title}</h3>}
                        {subtitle && <p className="text-sm font-medium text-slate-500 mt-2">{subtitle}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
                </div>
            )}
            <div className="relative z-10 font-medium">
                {children}
            </div>
            {/* Subtle background flair */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-0 group-hover:opacity-5 blur-3xl pointer-events-none transition-opacity" />
        </Component>
    );
};

export default Card;
