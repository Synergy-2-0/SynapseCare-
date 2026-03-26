import React, { createContext, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * AuthContext
 *
 * Manages global authentication state
 */
export const AuthContext = createContext({
    user: null,
    token: null,
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
    checkAuth: () => {}
});

export const AuthProvider = ({ children }) => {
    const getStoredAuth = () => {
        if (typeof window === 'undefined') {
            return {
                user: null,
                token: null,
                isAuthenticated: false
            };
        }

        const storedToken = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');
        const userName = localStorage.getItem('user_name');
        const userEmail = localStorage.getItem('user_email');
        const userRole = localStorage.getItem('user_role');

        if (storedToken && userId) {
            return {
                token: storedToken,
                user: {
                    id: userId,
                    name: userName || '',
                    email: userEmail || '',
                    role: userRole || ''
                },
                isAuthenticated: true
            };
        }

        return {
            user: null,
            token: null,
            isAuthenticated: false
        };
    };

    const initialAuth = getStoredAuth();
    const [user, setUser] = useState(initialAuth.user);
    const [token, setToken] = useState(initialAuth.token);
    const [isAuthenticated, setIsAuthenticated] = useState(initialAuth.isAuthenticated);
    const router = useRouter();

    const checkAuth = () => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem('auth_token');
            const userId = localStorage.getItem('user_id');
            const userName = localStorage.getItem('user_name');
            const userEmail = localStorage.getItem('user_email');
            const userRole = localStorage.getItem('user_role');

            if (storedToken && userId) {
                setToken(storedToken);
                setUser({
                    id: userId,
                    name: userName || '',
                    email: userEmail || '',
                    role: userRole || ''
                });
                setIsAuthenticated(true);
            } else {
                setToken(null);
                setUser(null);
                setIsAuthenticated(false);
            }
        }
    };

    const login = (userData, authToken) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('user_id', userData.id || userData.userId);
            localStorage.setItem('user_name', userData.name || userData.username || '');
            localStorage.setItem('user_email', userData.email || '');
            localStorage.setItem('user_role', userData.role || '');
        }

        setToken(authToken);
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
        }

        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                login,
                logout,
                checkAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
