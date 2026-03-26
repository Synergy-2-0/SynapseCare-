/**
 * Appointment status constants for SynapseCare
 */

export const APPOINTMENT_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PAID: 'PAID',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};

export const APPOINTMENT_STATUS_LABELS = {
    [APPOINTMENT_STATUS.PENDING]: 'Pending',
    [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmed',
    [APPOINTMENT_STATUS.PAID]: 'Paid',
    [APPOINTMENT_STATUS.COMPLETED]: 'Completed',
    [APPOINTMENT_STATUS.CANCELLED]: 'Cancelled',
};

export const VERIFICATION_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};

export const VERIFICATION_STATUS_LABELS = {
    [VERIFICATION_STATUS.PENDING]: 'Verification Pending',
    [VERIFICATION_STATUS.APPROVED]: 'Verified',
    [VERIFICATION_STATUS.REJECTED]: 'Verification Rejected',
};

export const DAYS_OF_WEEK = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
];

export const DAYS_OF_WEEK_LABELS = {
    MONDAY: 'Monday',
    TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday',
    FRIDAY: 'Friday',
    SATURDAY: 'Saturday',
    SUNDAY: 'Sunday',
};
