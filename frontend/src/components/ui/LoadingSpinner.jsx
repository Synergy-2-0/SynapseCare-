import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingSpinner Component - Premium Heartbeat ECG Design
 * 
 * Features:
 * - High-fidelity clinical heartbeat (ECG) pulse
 * - SynapCare themed teal/indigo gradient path
 * - Premium executive typography with minimalist tracking
 */
const LoadingSpinner = ({
    size = 'md',
    message = 'Synchronizing Clinical Shards...'
}) => {
    const isFullscreen = size === 'fullscreen';

    const ecgWidth = {
        sm: 120,
        md: 200,
        lg: 280,
        fullscreen: 360
    }[size] || 200;

    const ecgHeight = {
        sm: 40,
        md: 60,
        lg: 80,
        fullscreen: 100
    }[size] || 60;

    const textSize = {
        sm: 'text-[8px]',
        md: 'text-[10px]',
        lg: 'text-xs',
        fullscreen: 'text-sm'
    }[size] || 'text-[10px]';

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 bg-white z-[9999]' : 'p-8'} flex flex-col items-center justify-center gap-12 overflow-hidden`}>
            {/* High-Fidelity Heartbeat (ECG) Shard */}
            <div className="relative flex items-center justify-center">
                <svg
                    width={ecgWidth}
                    height={ecgHeight}
                    viewBox="0 0 200 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative z-10"
                >
                    <defs>
                        <linearGradient id="heartbeatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.2" />
                            <stop offset="50%" stopColor="#0d9488" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>
                    
                    {/* Background Static Path Shard */}
                    <path
                        d="M0,30 L40,30 L45,10 L50,50 L55,30 L100,30 L105,20 L110,40 L115,30 L200,30"
                        stroke="#f1f5f9"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    {/* Animated Heartbeat Path Shard */}
                    <motion.path
                        d="M0,30 L40,30 L45,10 L50,50 L55,30 L100,30 L105,20 L110,40 L115,30 L200,30"
                        stroke="url(#heartbeatGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        animate={{ 
                            pathLength: [0, 1, 1],
                            pathOffset: [0, 0, 1],
                            opacity: [0, 1, 0.5, 0]
                        }}
                        transition={{ 
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </svg>

                {/* Subtle Clinical Glow */}
                <motion.div 
                    className="absolute inset-0 bg-teal-500/5 blur-3xl rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            {/* Premium Message Shard */}
            {message && (
                <div className="flex flex-col items-center gap-4">
                    <motion.p 
                        className={`${textSize} font-black text-slate-900 uppercase tracking-[0.4em] pl-[0.4em] text-center max-w-xs`}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                    >
                        {message}
                    </motion.p>
                    <div className="w-16 h-[2px] bg-slate-50 relative overflow-hidden">
                        <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500 to-transparent"
                            animate={{ x: [-80, 80] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoadingSpinner;
