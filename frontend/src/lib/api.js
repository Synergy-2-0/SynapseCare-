import axios from 'axios';

const CONFIG = {
    API_GATEWAY: 'http://localhost:8080/api'
};

const createApiInstance = (baseURL) => {
    const instance = axios.create({
        baseURL,
        headers: { 'Content-Type': 'application/json' }
    });

    instance.interceptors.request.use((config) => {
        if (typeof window !== 'undefined') {
            const userId = localStorage.getItem('user_id');
            const token = localStorage.getItem('auth_token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            if (userId) config.headers['X-User-Id'] = userId;
        }
        return config;
    });

    return instance;
};

export const authApi = createApiInstance(CONFIG.API_GATEWAY + '/auth');
export const doctorApi = createApiInstance(CONFIG.API_GATEWAY + '/doctors');
export const appointmentApi = createApiInstance(CONFIG.API_GATEWAY + '/appointments');
export const patientApi = createApiInstance(CONFIG.API_GATEWAY + '/patients');
export const medicalHistoryApi = createApiInstance(CONFIG.API_GATEWAY + '/medical-history');
export const integrationApi = createApiInstance(CONFIG.API_GATEWAY + '/integration');
export const adminApi = createApiInstance(CONFIG.API_GATEWAY + '/admin');

const api = axios.create({ baseURL: CONFIG.API_GATEWAY, headers: { 'Content-Type': 'application/json' } });
export default api;
