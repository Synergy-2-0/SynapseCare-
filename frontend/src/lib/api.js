import axios from 'axios';

const defaultGatewayBase = typeof window === 'undefined'
    ? 'http://localhost:8080/api'
    : '/backend-api';

const CONFIG = {
    API_GATEWAY: process.env.NEXT_PUBLIC_API_GATEWAY_BASE || defaultGatewayBase
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
            const userRole = localStorage.getItem('user_role');
            const token = localStorage.getItem('auth_token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            if (userId) config.headers['X-User-Id'] = userId;
            if (userRole) config.headers['X-User-Role'] = userRole;
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

            if (status === 401 && typeof window !== 'undefined') {
                if (!window.location.pathname.startsWith('/login')) {
                    localStorage.clear();
                    window.location.href = '/login?expired=true';
                }
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

// Create a special instance for file uploads (multipart/form-data)
export const createFileUploadInstance = (baseURL) => {
    const instance = axios.create({
        baseURL,
        timeout: 60000, // Longer timeout for file uploads
        withCredentials: false
    });

    instance.interceptors.request.use((config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            const userId = localStorage.getItem('user_id');
            const userRole = localStorage.getItem('user_role');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            if (userId) config.headers['X-User-Id'] = userId;
            if (userRole) config.headers['X-User-Role'] = userRole;
        }
        return config;
    });

    instance.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401 && typeof window !== 'undefined') {
                if (!window.location.pathname.startsWith('/login')) {
                    localStorage.clear();
                    window.location.href = '/login?expired=true';
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

export const authApi = createApiInstance(CONFIG.API_GATEWAY + '/auth');
export const doctorApi = createApiInstance(CONFIG.API_GATEWAY + '/doctors');
export const doctorFileApi = createFileUploadInstance(CONFIG.API_GATEWAY + '/doctors');
export const publicDoctorApi = createApiInstance(CONFIG.API_GATEWAY + '/doctors', true);
export const appointmentApi = createApiInstance(CONFIG.API_GATEWAY + '/appointments');
export const patientApi = createApiInstance(CONFIG.API_GATEWAY + '/patients');
export const medicalHistoryApi = createApiInstance(CONFIG.API_GATEWAY + '/medical-history');
export const integrationApi = createApiInstance(CONFIG.API_GATEWAY + '/integration');
export const adminApi = createApiInstance(CONFIG.API_GATEWAY + '/admin');
export const symptomApi = createApiInstance(CONFIG.API_GATEWAY + '/symptoms');
export const paymentApi = createApiInstance(CONFIG.API_GATEWAY + '/payments');
paymentApi.defaults.timeout = 30000;
export const telemedicineApi = createApiInstance(CONFIG.API_GATEWAY + '/telemedicine');
export const prescriptionApi = createApiInstance(CONFIG.API_GATEWAY + '/prescriptions');
export const notificationApi = createApiInstance(CONFIG.API_GATEWAY + '/notifications');
export const caseApi = createApiInstance(CONFIG.API_GATEWAY + '/doctors/cases');

export const fileUploadApi = createFileUploadInstance(CONFIG.API_GATEWAY + '/patients');

const api = axios.create({ baseURL: CONFIG.API_GATEWAY, headers: { 'Content-Type': 'application/json' } });
export default api;
