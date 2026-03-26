import React from 'react';
import { motion } from 'framer-motion';

/**
 * Card Component - Enhanced with Hover Effects
 *
 * Features:
 * - Subtle hover lift
 * - Border glow on hover
 * - Shadow enhancement
 * - Professional transitions
 *
 * @param {string} title - Card title
 * @param {string} subtitle - Card subtitle
 * @param {ReactNode} actions - Action buttons in header
 * @param {ReactNode} children - Card content
 * @param {string} variant - 'default' | 'dark' | 'glass'
 * @param {string} padding - 'none' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} hoverable - Enable hover effects (default: false)
 * @param {function} onClick - Click handler (makes card clickable)
 * @param {string} className - Additional CSS classes
 */
const Card = ({
    title,
    subtitle,
    actions,
    children,
    variant = 'default',
    padding = 'lg',
    hoverable = false,
    onClick,
    className = '',
}) => {
    const variantStyles = {
        default: 'bg-white border border-slate-200 shadow-sm',
        dark: 'bg-[#0f2a45] border border-[#20496f] shadow-sm text-white',
        glass: 'glass'
    };

    const paddingStyles = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-6',
        xl: 'p-8'
    };

    const isInteractive = hoverable || onClick;
    const Component = isInteractive ? motion.div : 'div';

    const interactiveProps = isInteractive ? {
        whileTap: { scale: 0.995 },
        transition: { duration: 0.15 },
        onClick: onClick,
        className: `${variantStyles[variant]} ${paddingStyles[padding]} ${className} rounded-xl overflow-hidden cursor-pointer transition-colors duration-200 hover:border-blue-300`
    } : {
        className: `rounded-xl ${variantStyles[variant]} ${paddingStyles[padding]} ${className} overflow-hidden`
    };

    return (
        <Component {...interactiveProps}>
            {(title || subtitle || actions) && (
                <div className={`flex justify-between items-start gap-4 ${padding !== 'none' ? 'mb-4' : 'p-6 border-b border-slate-200 bg-slate-50'}`}>
                    <div>
                        {title && (
                            <h3 className="text-xl font-semibold text-slate-900">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-slate-500 text-sm mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && (
                        <div className="flex gap-3">
                            {actions}
                        </div>
                    )}
                </div>
            )}
            <div className={padding === 'none' && (title || subtitle || actions) ? 'p-6' : ''}>
                {children}
            </div>
        </Component>
    );
};

export default Card;
