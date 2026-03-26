import React from 'react';
import { motion } from 'framer-motion';

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
    const variants = {
        primary: 'btn-primary shadow-xl shadow-indigo-100 disabled:shadow-none',
        secondary: 'btn-secondary shadow-lg shadow-slate-100 disabled:shadow-none',
        danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-100 disabled:shadow-none',
        ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900',
        outline: 'border-2 border-slate-200 bg-white text-slate-700 hover:border-indigo-600 hover:text-indigo-600 shadow-sm'
    };

    const sizes = {
        sm: 'px-6 py-2.5 text-[10px] rounded-xl',
        md: 'px-8 py-3.5 text-xs rounded-2xl',
        lg: 'px-10 py-5 text-sm rounded-3xl',
        xl: 'px-12 py-6 text-base rounded-[2rem]'
    };

    return (
        <motion.button
            type={type}
            whileHover={!disabled && !loading ? { scale: 1.02, y: -2 } : {}}
            whileTap={!disabled && !loading ? { scale: 0.98, y: 0 } : {}}
            onClick={onClick}
            disabled={disabled || loading}
            className={`flex items-center justify-center gap-3 font-black uppercase tracking-widest transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className} shrink-0`}
            {...props}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {Icon && <Icon size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />}
                    {children}
                </>
            )}
        </motion.button>
    );
};

export default Button;
