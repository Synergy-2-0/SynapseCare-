import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingSpinner Component - Premium Clinical Registry Design
 * 
 * Features:
 * - High-fidelity circular glassmorphism
 * - SynapCare themed gradients
 * - Uppercase executive typography
 *
 * @param {string} size - 'sm' | 'md' | 'lg' | 'fullscreen'
 * @param {string} message - Loading message
 */
const LoadingSpinner = ({
    size = 'md',
    message = 'Synchronizing Clinical Shards...'
}) => {
    const isFullscreen = size === 'fullscreen';

    const ringSize = {
        sm: 24,
        md: 48,
        lg: 64,
        fullscreen: 80
    }[size] || 48;

    const textSize = {
        sm: 'text-[8px]',
        md: 'text-[10px]',
        lg: 'text-xs',
        fullscreen: 'text-sm'
    }[size] || 'text-[10px]';

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 bg-white z-[9999]' : 'p-8'} flex flex-col items-center justify-center gap-8 overflow-hidden`}>
            {isFullscreen && (
                <>
                    {/* Medical Grid/Scanline Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                        style={{ backgroundImage: 'linear-gradient(rgba(13,148,136,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                    />
                    <motion.div 
                        className="absolute inset-x-0 h-1/4 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none"
                        animate={{ y: [-500, 1000] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                </>
            )}
            {/* High-Fidelity Clinical Ring */}
            <div className="relative" style={{ width: ringSize, height: ringSize }}>
                {/* Outer Glow */}
                <motion.div 
                    className="absolute inset-0 rounded-full bg-teal-500/10 blur-xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Background Ring */}
                <svg width={ringSize} height={ringSize} viewBox="0 0 100 100" className="absolute inset-0">
                    <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="#f1f5f9" 
                        strokeWidth="8" 
                    />
                </svg>

                {/* Animated Primary Ring */}
                <svg width={ringSize} height={ringSize} viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                    <defs>
                        <linearGradient id="clinicalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0d9488" />
                            <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                    </defs>
                    <motion.circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="url(#clinicalGradient)" 
                        strokeWidth="8" 
                        strokeLinecap="round"
                        strokeDasharray="283"
                        animate={{ 
                            strokeDashoffset: [283, 70, 283],
                            rotate: [0, 360]
                        }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                    />
                </svg>

                {/* Center Core */}
                <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_10px_#14b8a6]" />
                </motion.div>
            </div>

            {/* Premium Message Shard */}
            {message && (
                <div className="flex flex-col items-center gap-2">
                    <motion.p 
                        className={`${textSize} font-black text-slate-900 uppercase tracking-[0.3em] pl-[0.3em]`}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {message}
                    </motion.p>
                    <div className="w-48 h-[1px] bg-slate-100 relative overflow-hidden">
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500 to-transparent"
                            animate={{ x: [-200, 200] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoadingSpinner;
