export const VERIFICATION_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

const getStoredVerificationStatus = () => {
    if (typeof window === 'undefined') {
        return '';
    }

    return String(localStorage.getItem('user_verificationStatus') || '').toUpperCase();
};

export const normalizeVerificationStatus = (status, isVerified = false) => {
    const normalized = String(status || '').toUpperCase();
    const stored = getStoredVerificationStatus();

    if (normalized === VERIFICATION_STATUS.APPROVED || stored === VERIFICATION_STATUS.APPROVED || isVerified) {
        return VERIFICATION_STATUS.APPROVED;
    }

    if (normalized === VERIFICATION_STATUS.REJECTED) {
        return VERIFICATION_STATUS.REJECTED;
    }

    return VERIFICATION_STATUS.PENDING;
};

export const isDoctorApproved = (status, isVerified = false) => {
    return normalizeVerificationStatus(status, isVerified) === VERIFICATION_STATUS.APPROVED;
};
