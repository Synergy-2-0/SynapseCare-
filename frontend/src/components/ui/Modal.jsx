import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Modal Component - Enhanced with Spring Physics & Content Stagger
 *
 * Features:
 * - Subtle spring animation
 * - Enhanced backdrop blur
 * - Content stagger effect
 * - Professional entrance/exit
 *
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {ReactNode} footer - Modal footer (buttons)
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {boolean} showClose - Show close button
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    showClose = true
}) => {
    const sizeStyles = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-[95vw]'
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Enhanced Backdrop with blur animation */}
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-[#0d213a]/55 z-50"
                        style={{ backdropFilter: 'blur(8px)' }}
                    />

                    {/* Modal with spring physics */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            role="dialog"
                            aria-modal="true"
                            className={`bg-white rounded-xl shadow-lg border border-slate-200 w-full ${sizeStyles[size]} my-8`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header with stagger */}
                            {(title || showClose) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="flex justify-between items-center p-6 border-b border-slate-200"
                                >
                                    {title && (
                                        <h2 className="text-2xl font-semibold text-slate-900">
                                            {title}
                                        </h2>
                                    )}
                                    {showClose && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={onClose}
                                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                                            aria-label="Close modal"
                                        >
                                            <X className="w-6 h-6 text-slate-500" />
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}

                            {/* Content with stagger */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.15 }}
                                className="p-6"
                            >
                                {children}
                            </motion.div>

                            {/* Footer with stagger */}
                            {footer && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex justify-end gap-4 p-6 border-t border-slate-200 bg-slate-50"
                                >
                                    {footer}
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Modal;
