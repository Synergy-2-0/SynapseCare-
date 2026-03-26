import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

/**
 * Input Component - Enhanced with Floating Labels & Animations
 *
 * Features:
 * - Floating label animation
 * - Icon scale on focus
 * - Error shake animation
 * - Success state with checkmark
 * - Smooth transitions
 *
 * @param {string} label - Input label
 * @param {string} type - Input type (text, email, password, number, etc.)
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message
 * @param {boolean} success - Success state
 * @param {boolean} disabled - Disabled state
 * @param {boolean} required - Required field
 * @param {Component} icon - Lucide icon component
 * @param {string} className - Additional CSS classes
 */
const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    success = false,
    disabled = false,
    required = false,
    icon: Icon,
    className = '',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.length > 0;
    const shouldFloat = isFocused || hasValue;

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="relative">
                {/* Floating Label */}
                {label && (
                    <motion.label
                        className={`
                            absolute left-${Icon ? '12' : '4'} pointer-events-none
                            font-medium flex items-center gap-1
                            transition-all duration-200
                            ${shouldFloat
                                ? 'top-0 -translate-y-1/2 text-xs bg-white px-2 text-[var(--color-primary)]'
                                : 'top-1/2 -translate-y-1/2 text-sm text-slate-500'
                            }
                            ${error ? '!text-rose-600' : ''}
                        `}
                        animate={{
                            scale: shouldFloat ? 1 : 1,
                            y: shouldFloat ? '-50%' : '-50%'
                        }}
                    >
                        {label}
                        {required && <span className="text-rose-600">*</span>}
                    </motion.label>
                )}

                {/* Icon with animation */}
                {Icon && (
                    <motion.div
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        animate={{ scale: isFocused ? 1.1 : 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Icon className="w-5 h-5" />
                    </motion.div>
                )}

                {/* Success checkmark */}
                {success && !error && (
                    <motion.div
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <CheckCircle2 className="w-5 h-5" />
                    </motion.div>
                )}

                {/* Input field */}
                <motion.input
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={shouldFloat ? placeholder : ''}
                    disabled={disabled}
                    className={`
                        w-full bg-white border
                        rounded-[var(--radius-md)] py-3 px-4
                        ${Icon ? 'pl-12' : ''}
                        ${success ? 'pr-12' : ''}
                        text-slate-900
                        placeholder:text-slate-400
                        outline-none
                        transition-all duration-200
                        disabled:bg-slate-100 disabled:cursor-not-allowed
                        ${error
                            ? 'border-rose-600 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
                            : success
                            ? 'border-emerald-600 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100'
                            : 'border-slate-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100'
                        }
                    `}
                    animate={error ? { x: [0, -3, 3, -3, 3, 0] } : {}}
                    transition={error ? { duration: 0.4 } : {}}
                    {...props}
                />
            </div>

            {/* Error message with shake */}
            {error && (
                <motion.p
                    className="text-xs text-rose-600 font-medium pl-2"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default Input;
