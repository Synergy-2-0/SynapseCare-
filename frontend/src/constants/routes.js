/**
 * Route constants for SynapseCare
 */

// Public routes
export const PUBLIC_ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
};

// Doctor routes
export const DOCTOR_ROUTES = {
    DASHBOARD: '/doctor/dashboard',
    PROFILE_SETUP: '/doctor/setup',
    PROFILE: '/doctor/setup',
    APPOINTMENTS: '/doctor/appointments',
    APPOINTMENT_DETAIL: (id) => `/doctor/appointments/${id}`,
    CASE_NEW: '/doctor/cases/new',
    CASE_DETAIL: (id) => `/doctor/cases/${id}`,
    SCHEDULE: '/doctor/schedule',
    PATIENTS: '/doctor/patients',
    PATIENT_DETAIL: (id) => `/doctor/patients/${id}`,
    PRESCRIPTIONS: '/doctor/prescriptions',
    TELEMEDICINE: '/doctor/consultations',
    ANALYTICS: '/doctor/analytics',
    SETTINGS: '/doctor/settings',
};

// Patient routes
export const PATIENT_ROUTES = {
    DASHBOARD: '/dashboard/patient',
    PROFILE: '/patient/profile',
    SYMPTOM_CHECKER: '/patient/symptom-checker',
    FIND_DOCTORS: '/patient/find-doctors',
    APPOINTMENTS: '/patient/appointments',
    MEDICAL_RECORDS: '/patient/medical-records',
    TELEMEDICINE: '/patient/telemedicine-center',
};

// Admin routes
export const ADMIN_ROUTES = {
    DASHBOARD: '/dashboard/admin',
};

// Notification routes (accessible by all roles)
export const NOTIFICATION_ROUTES = {
    LIST: '/notifications',
    SETTINGS: '/notification-settings',
};
