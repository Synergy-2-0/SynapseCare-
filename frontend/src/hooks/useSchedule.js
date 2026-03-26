import { useState, useCallback, useEffect } from 'react';
import { doctorApi } from '../lib/api';

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const DEFAULT_AVAILABILITY = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = {
        startTime: '09:00',
        endTime: '17:00',
        isActive: day !== 'SUNDAY'
    };
    return acc;
}, {});

/**
 * useSchedule Hook
 *
 * Manages doctor availability and schedule overrides.
 *
 * @returns {object} { availability, schedules, loading, error, ... }
 */
const useSchedule = () => {
    const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const fetchAvailability = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await doctorApi.get('/availability');
            const data = response.data || [];

            // Convert array to object keyed by day
            const availabilityMap = { ...DEFAULT_AVAILABILITY };
            data.forEach(slot => {
                if (slot.dayOfWeek && DAYS_OF_WEEK.includes(slot.dayOfWeek)) {
                    availabilityMap[slot.dayOfWeek] = {
                        startTime: slot.startTime || '09:00',
                        endTime: slot.endTime || '17:00',
                        isActive: slot.isActive !== false
                    };
                }
            });

            setAvailability(availabilityMap);
        } catch (err) {
            console.warn('Failed to fetch availability:', err);
            // Use defaults on error
            setAvailability(DEFAULT_AVAILABILITY);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveAvailability = useCallback(async (day, slotData) => {
        setSaving(true);
        setError(null);

        try {
            await doctorApi.post('/availability', {
                dayOfWeek: day,
                startTime: slotData.startTime,
                endTime: slotData.endTime,
                isActive: slotData.isActive
            });

            setAvailability(prev => ({
                ...prev,
                [day]: slotData
            }));

            return true;
        } catch (err) {
            console.error('Failed to save availability:', err);
            setError(err.response?.data?.message || 'Failed to save availability');
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    const saveAllAvailability = useCallback(async (availabilityData) => {
        setSaving(true);
        setError(null);

        try {
            const promises = Object.entries(availabilityData).map(([day, slot]) =>
                doctorApi.post('/availability', {
                    dayOfWeek: day,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isActive: slot.isActive
                })
            );

            await Promise.all(promises);
            setAvailability(availabilityData);
            return true;
        } catch (err) {
            console.error('Failed to save all availability:', err);
            setError(err.response?.data?.message || 'Failed to save schedule');
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    const addScheduleOverride = useCallback(async (scheduleData) => {
        setSaving(true);
        setError(null);

        try {
            const response = await doctorApi.post('/schedule', {
                date: scheduleData.date,
                startTime: scheduleData.startTime || null,
                endTime: scheduleData.endTime || null,
                isAvailable: scheduleData.isAvailable,
                reason: scheduleData.reason || null
            });

            setSchedules(prev => [...prev, response.data]);
            return true;
        } catch (err) {
            console.error('Failed to add schedule override:', err);
            setError(err.response?.data?.message || 'Failed to add schedule');
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    const updateLocalAvailability = useCallback((day, updates) => {
        setAvailability(prev => ({
            ...prev,
            [day]: { ...prev[day], ...updates }
        }));
    }, []);

    const reset = useCallback(() => {
        setAvailability(DEFAULT_AVAILABILITY);
        setSchedules([]);
        setError(null);
    }, []);

    useEffect(() => {
        fetchAvailability();
    }, [fetchAvailability]);

    return {
        availability,
        schedules,
        loading,
        saving,
        error,
        fetchAvailability,
        saveAvailability,
        saveAllAvailability,
        addScheduleOverride,
        updateLocalAvailability,
        reset,
        DAYS_OF_WEEK
    };
};

export default useSchedule;
