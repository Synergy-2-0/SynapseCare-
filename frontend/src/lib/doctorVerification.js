export const VERIFICATION_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

export const normalizeVerificationStatus = (status, isVerified = false) => {
    const normalized = String(status || '').toUpperCase();

    if (normalized === VERIFICATION_STATUS.APPROVED || isVerified) {
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
