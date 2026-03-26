import axios from 'axios';

const CONFIG = {
    API_GATEWAY: 'http://localhost:8080/api'
};

const createApiInstance = (baseURL, isPublic = false) => {
    const instance = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        timeout: 10000,
        withCredentials: false  // Don't send cookies for CORS
    });

    instance.interceptors.request.use((config) => {
        console.log(`[API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, { isPublic });

        // Don't add auth headers for public endpoints
        if (!isPublic && typeof window !== 'undefined') {
            const userId = localStorage.getItem('user_id');
            const token = localStorage.getItem('auth_token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            if (userId) config.headers['X-User-Id'] = userId;
        }
        return config;
    });

    instance.interceptors.response.use(
        response => {
            console.log(`[API Success] ${response.config.method.toUpperCase()} ${response.config.url}`, response.status);
            return response;
        },
        error => {
            const url = error.config?.url;
            const method = error.config?.method?.toUpperCase();
            const status = error.response?.status;
            const errorMsg = error.message;

            console.error(`[API Error] ${method} ${url}:`, {
                message: errorMsg,
                status,
                data: error.response?.data,
                headers: error.response?.headers
            });

            return Promise.reject(error);
        }
    );

    return instance;
};

export const authApi = createApiInstance(CONFIG.API_GATEWAY + '/auth');
export const doctorApi = createApiInstance(CONFIG.API_GATEWAY + '/doctors');
export const publicDoctorApi = createApiInstance(CONFIG.API_GATEWAY + '/doctors', true); // For public endpoints like /search
export const appointmentApi = createApiInstance(CONFIG.API_GATEWAY + '/appointments');
export const patientApi = createApiInstance(CONFIG.API_GATEWAY + '/patients');
export const medicalHistoryApi = createApiInstance(CONFIG.API_GATEWAY + '/medical-history');
export const integrationApi = createApiInstance(CONFIG.API_GATEWAY + '/integration');
export const adminApi = createApiInstance(CONFIG.API_GATEWAY + '/admin');
export const symptomApi = createApiInstance(CONFIG.API_GATEWAY + '/symptoms');

const api = axios.create({ baseURL: CONFIG.API_GATEWAY, headers: { 'Content-Type': 'application/json' } });
export default api;
