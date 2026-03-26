import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

/**
 * useToast Hook
 *
 * Provides easy access to toast notifications
 *
 * @returns {object} { showToast, hideToast }
 */
const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }

    return context;
};

export default useToast;
