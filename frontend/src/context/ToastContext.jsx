import React, { createContext, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '../components/ui/Toast';

/**
 * ToastContext
 *
 * Manages global toast notifications
 */
export const ToastContext = createContext({
    showToast: () => {},
    hideToast: () => {}
});

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const toastCounterRef = useRef(0);

    const hideToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    const showToast = (type, message, duration = 5000) => {
        toastCounterRef.current += 1;
        const id = `toast-${toastCounterRef.current}`;
        const newToast = { id, type, message };

        setToasts((prev) => [...prev, newToast]);

        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                hideToast(id);
            }, duration);
        }

        return id;
    };

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-8 right-8 z-100 space-y-4 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <div key={toast.id} className="pointer-events-auto">
                            <Toast
                                id={toast.id}
                                type={toast.type}
                                message={toast.message}
                                onClose={hideToast}
                            />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
