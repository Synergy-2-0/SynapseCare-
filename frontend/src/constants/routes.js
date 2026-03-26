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
    PROFILE_SETUP: '/doctor/profile/setup',
    PROFILE: '/doctor/profile',
    APPOINTMENTS: '/doctor/appointments',
    APPOINTMENT_DETAIL: (id) => `/doctor/appointments/${id}`,
    SCHEDULE: '/doctor/schedule',
    PATIENTS: '/doctor/patients',
    PATIENT_DETAIL: (id) => `/doctor/patients/${id}`,
    PRESCRIPTIONS: '/doctor/prescriptions',
    TELEMEDICINE: '/doctor/telemedicine',
    ANALYTICS: '/doctor/analytics',
    SETTINGS: '/doctor/settings',
};

// Patient routes
export const PATIENT_ROUTES = {
    DASHBOARD: '/dashboard/patient',
    SYMPTOM_CHECKER: '/patient/symptom-checker',
    FIND_DOCTORS: '/patient/find-doctors',
    APPOINTMENTS: '/patient/appointments',
    MEDICAL_RECORDS: '/patient/medical-records',
};

// Admin routes
export const ADMIN_ROUTES = {
    DASHBOARD: '/dashboard/admin',
};
