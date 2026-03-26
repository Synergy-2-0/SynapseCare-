import React from 'react';
import { motion } from 'framer-motion';

/**
 * LoadingSpinner Component - Medical Heartbeat Pulse Design
 *
 * Features:
 * - Medical heartbeat pulse animation (ECG-style)
 * - Healthcare-themed design
 * - Professional and memorable loading experience
 * - Accessibility support
 *
 * @param {string} size - 'sm' | 'md' | 'lg' | 'fullscreen'
 * @param {string} variant - 'pulse' | 'dots' | 'ring' (default: 'pulse')
 * @param {string} message - Loading message
 */
const LoadingSpinner = ({
    size = 'md',
    variant = 'pulse',
    message = 'Loading...'
}) => {
    const sizeConfig = {
        sm: {
            dotSize: 'w-2 h-2',
            container: 'gap-1',
            ecgHeight: 'h-6',
            messageSize: 'text-xs'
        },
        md: {
            dotSize: 'w-3 h-3',
            container: 'gap-2',
            ecgHeight: 'h-10',
            messageSize: 'text-sm'
        },
        lg: {
            dotSize: 'w-4 h-4',
            container: 'gap-3',
            ecgHeight: 'h-14',
            messageSize: 'text-base'
        },
        fullscreen: {
            dotSize: 'w-5 h-5',
            container: 'gap-4',
            ecgHeight: 'h-16',
            messageSize: 'text-xl'
        }
    };

    const config = sizeConfig[size] || sizeConfig.md;

    // Medical Heartbeat Pulse Variant (PRIMARY - User's choice)
    const PulseVariant = () => (
        <>
            {/* Three pulsing dots simulating heartbeat */}
            <div className={`flex items-center ${config.container}`}>
                <motion.div
                    className={`${config.dotSize} rounded-full bg-[var(--color-primary)]`}
                    animate={{
                        scale: [1, 1.2, 1, 1.4, 1],
                        opacity: [1, 0.8, 1, 0.6, 1]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className={`${config.dotSize} rounded-full bg-[var(--color-primary)]`}
                    animate={{
                        scale: [1, 1.2, 1, 1.4, 1],
                        opacity: [1, 0.8, 1, 0.6, 1]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.15
                    }}
                />
                <motion.div
                    className={`${config.dotSize} rounded-full bg-[var(--color-primary)]`}
                    animate={{
                        scale: [1, 1.2, 1, 1.4, 1],
                        opacity: [1, 0.8, 1, 0.6, 1]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                    }}
                />
            </div>

            {/* ECG Line Visual (optional, subtle) */}
            <svg
                className={`mt-3 ${config.ecgHeight} w-32 opacity-30`}
                viewBox="0 0 128 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <motion.path
                    d="M0,20 L30,20 L35,10 L40,30 L45,20 L50,20 L55,15 L60,25 L65,20 L128,20"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{
                        pathLength: {
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        },
                        opacity: { duration: 0.3 }
                    }}
                />
            </svg>
        </>
    );

    // Wave Dots Variant (Alternative)
    const DotsVariant = () => (
        <div className={`flex items-center ${config.container}`}>
            {[0, 0.2, 0.4].map((delay, index) => (
                <motion.div
                    key={index}
                    className={`${config.dotSize} rounded-full bg-[var(--color-primary)]`}
                    animate={{
                        y: [0, -8, 0],
                        opacity: [1, 0.5, 1]
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );

    // Gradient Ring Variant (Alternative)
    const RingVariant = () => {
        const ringSize = size === 'sm' ? 24 : size === 'md' ? 40 : size === 'lg' ? 56 : 64;

        return (
            <motion.div
                className="relative"
                style={{ width: ringSize, height: ringSize }}
            >
                <svg width={ringSize} height={ringSize} viewBox="0 0 50 50">
                    <defs>
                        <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
                            <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.4" />
                        </linearGradient>
                    </defs>
                    <motion.circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="url(#spinnerGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        strokeDasharray="80 120"
                    />
                </svg>
            </motion.div>
        );
    };

    const variants = {
        pulse: <PulseVariant />,
        dots: <DotsVariant />,
        ring: <RingVariant />
    };

    const SpinnerContent = variants[variant] || variants.pulse;

    // Fullscreen variant
    if (size === 'fullscreen') {
        return (
            <div
                className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900"
                role="status"
                aria-live="polite"
                aria-busy="true"
                aria-label={message}
            >
                {SpinnerContent}
                {message && (
                    <motion.div
                        className={`mt-6 ${config.messageSize} text-slate-600 font-medium`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {message}
                    </motion.div>
                )}
            </div>
        );
    }

    // Inline variant
    return (
        <div
            className="flex flex-col items-center justify-center p-8"
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label={message}
        >
            {SpinnerContent}
            {message && (
                <div className={`mt-4 ${config.messageSize} text-slate-500 font-medium`}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default LoadingSpinner;
