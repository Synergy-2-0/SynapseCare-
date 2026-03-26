import { useContext } from 'react';
import { DoctorContext } from '../context/DoctorContext';

/**
 * useDoctorProfile Hook
 *
 * Provides easy access to doctor profile state and methods
 *
 * @returns {object} { profile, loading, error, fetchProfile, updateProfile, refreshProfile, clearProfile }
 */
const useDoctorProfile = () => {
    const context = useContext(DoctorContext);

    if (!context) {
        throw new Error('useDoctorProfile must be used within DoctorProvider');
    }

    return context;
};

export default useDoctorProfile;
