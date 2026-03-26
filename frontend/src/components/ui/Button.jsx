import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

/**
 * Button Component - Enhanced with Professional Animations
 *
 * Features:
 * - Subtle hover lift effect
 * - Medical pulse loading state
 * - Professional press animation
 * - Icon slide animations
 *
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} loading - Shows medical pulse spinner when true
 * @param {boolean} disabled - Disables button
 * @param {ReactNode} icon - Lucide icon component
 * @param {ReactNode} children - Button text
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 */
const Button = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    children,
    onClick,
    className = '',
    type = 'button',
    ...props
}) => {
    const baseStyles = 'relative overflow-hidden font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed rounded-[var(--radius-md)]';

    const variantStyles = {
        primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-strong)] shadow-[var(--shadow-soft)] hover:shadow-md',
        secondary: 'bg-[var(--color-surface)] text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-[var(--color-bg-soft)]',
        danger: 'bg-[var(--color-danger)] text-white hover:brightness-95 shadow-[var(--shadow-soft)] hover:shadow-md',
        ghost: 'bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)]',
        outline: 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3.5 text-base',
        xl: 'px-9 py-5 text-lg'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
        xl: 'w-6 h-6'
    };

    return (
        <motion.button
            type={type}
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            onClick={onClick}
            disabled={disabled || loading}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.1 }}
            {...props}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    {/* Medical pulse dots */}
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: variant === 'primary' ? 'white' : 'var(--color-primary)' }}
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [1, 0.6, 1]
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: index * 0.15
                            }}
                        />
                    ))}
                </div>
            ) : (
                <>
                    {Icon && <Icon className={iconSizes[size]} />}
                    {children}
                </>
            )}
        </motion.button>
    );
};

export default Button;
