import axios from 'axios';

const CONFIG = {
    API_GATEWAY_PATIENT: 'http://localhost:8081/api',
    API_GATEWAY_DOCTOR: 'http://localhost:8082/api',
    API_GATEWAY_APPOINTMENT: 'http://localhost:8083/api',
    API_GATEWAY_INTEGRATION: 'http://localhost:8084/api',
    API_GATEWAY_ADMIN: 'http://localhost:8085/api'
};

const api = axios.create({
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const userId = localStorage.getItem('user_id');
        const token = localStorage.getItem('auth_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        if (userId) config.headers['X-User-Id'] = userId;
    }
    return config;
});

export const patientApi = axios.create({ baseURL: CONFIG.API_GATEWAY_PATIENT, ...api.defaults });
export const doctorApi = axios.create({ baseURL: CONFIG.API_GATEWAY_DOCTOR, ...api.defaults });
export const appointmentApi = axios.create({ baseURL: CONFIG.API_GATEWAY_APPOINTMENT, ...api.defaults });
export const integrationApi = axios.create({ baseURL: CONFIG.API_GATEWAY_INTEGRATION, ...api.defaults });
export const adminApi = axios.create({ baseURL: CONFIG.API_GATEWAY_ADMIN, ...api.defaults });

// Interceptors for all instances
[patientApi, doctorApi, appointmentApi, integrationApi, adminApi].forEach(instance => {
    instance.interceptors.request.use((config) => {
        if (typeof window !== 'undefined') {
            const userId = localStorage.getItem('user_id');
            const token = localStorage.getItem('auth_token');
            if (token) config.headers.Authorization = `Bearer ${token}`;
            if (userId) config.headers['X-User-Id'] = userId;
        }
        return config;
    });
});

export default api;
