import { useState, useEffect, useCallback } from 'react';
import { appointmentApi } from '../lib/api';

/**
 * useAppointments Hook
 *
 * Fetches and manages doctor appointments
 *
 * @param {string} userId - Doctor user ID
 * @returns {object} { appointments, loading, error, refreshAppointments, filterAppointments }
 */
const useAppointments = (userId) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAppointments = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await appointmentApi.get(`/doctor/${userId}`);
            const apptData = response.data || [];
            setAppointments(apptData);
            setLoading(false);
        } catch (err) {
            // Appointment service endpoints not yet implemented - gracefully handle 404/500 errors
            if (err.response?.status === 404 || err.response?.status === 500) {
                console.warn('Appointment service endpoints not yet implemented');
                setAppointments([]);
                setError(null);
            } else {
                console.error('Failed to fetch appointments:', err);
                setError(err.response?.data?.message || 'Failed to fetch appointments');
            }
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchAppointments();
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [fetchAppointments]);

    const refreshAppointments = () => {
        return fetchAppointments();
    };

    const filterAppointments = (filters) => {
        let filtered = [...appointments];

        // Filter by status
        if (filters.status && filters.status.length > 0) {
            filtered = filtered.filter(appt =>
                filters.status.includes(appt.status)
            );
        }

        // Filter by date range
        if (filters.startDate) {
            filtered = filtered.filter(appt =>
                new Date(appt.appointmentDate) >= new Date(filters.startDate)
            );
        }

        if (filters.endDate) {
            filtered = filtered.filter(appt =>
                new Date(appt.appointmentDate) <= new Date(filters.endDate)
            );
        }

        // Filter by patient search
        if (filters.patientSearch) {
            const searchTerm = filters.patientSearch.toLowerCase();
            filtered = filtered.filter(appt =>
                appt.patientId?.toString().includes(searchTerm) ||
                appt.patientName?.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    };

    return {
        appointments,
        loading,
        error,
        refreshAppointments,
        filterAppointments
    };
};

export default useAppointments;
