import React, { createContext, useState } from 'react';
import { doctorApi } from '../lib/api';

/**
 * DoctorContext
 *
 * Manages doctor profile state and caching
 */
export const DoctorContext = createContext({
    profile: null,
    loading: false,
    error: null,
    fetchProfile: () => {},
    updateProfile: () => {},
    refreshProfile: () => {},
    clearProfile: () => {}
});

export const DoctorProvider = ({ children }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProfile = async () => {
        // Return cached profile if exists
        if (profile) {
            return profile;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await doctorApi.get('/profile/me');
            const profileData = response.data;
            setProfile(profileData);
            setLoading(false);
            return profileData;
        } catch (err) {
            // 404 means profile doesn't exist (new doctor)
            if (err.response?.status === 404) {
                setProfile(null);
            } else {
                setError(err.response?.data?.message || 'Failed to fetch profile');
            }
            setLoading(false);
            throw err;
        }
    };

    const updateProfile = async (profileData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await doctorApi.put('/profile', profileData);
            const updatedProfile = response.data;
            setProfile(updatedProfile);
            setLoading(false);
            return updatedProfile;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
            setLoading(false);
            throw err;
        }
    };

    const refreshProfile = async () => {
        setProfile(null); // Clear cache
        return await fetchProfile();
    };

    const clearProfile = () => {
        setProfile(null);
        setLoading(false);
        setError(null);
    };

    return (
        <DoctorContext.Provider
            value={{
                profile,
                loading,
                error,
                fetchProfile,
                updateProfile,
                refreshProfile,
                clearProfile
            }}
        >
            {children}
        </DoctorContext.Provider>
    );
};
