import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth Hook
 *
 * Provides easy access to authentication state and methods
 *
 * @returns {object} { user, token, isAuthenticated, login, logout, checkAuth }
 */
const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
};

export default useAuth;
