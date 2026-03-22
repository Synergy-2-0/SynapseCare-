import axios from 'axios';

const CONFIG = {
    API_GATEWAY_PATIENT: 'http://localhost:8081/api/v1',
    API_GATEWAY_DOCTOR: 'http://localhost:8082/api/v1',
    API_GATEWAY_APPOINTMENT: 'http://localhost:8083/api/v1',
    API_GATEWAY_INTEGRATION: 'http://localhost:8084/api/v1',
    API_GATEWAY_ADMIN: 'http://localhost:8085/api/v1'
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

export const patientApi = createApiInstance(CONFIG.API_GATEWAY_PATIENT);
export const doctorApi = createApiInstance(CONFIG.API_GATEWAY_DOCTOR);
export const appointmentApi = createApiInstance(CONFIG.API_GATEWAY_APPOINTMENT);
export const integrationApi = createApiInstance(CONFIG.API_GATEWAY_INTEGRATION);
export const adminApi = createApiInstance(CONFIG.API_GATEWAY_ADMIN);

const api = axios.create({ headers: { 'Content-Type': 'application/json' } });
export default api;
