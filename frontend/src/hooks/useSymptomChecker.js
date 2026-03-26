import { useState, useCallback } from 'react';
import { symptomApi, publicDoctorApi } from '../lib/api';

/**
 * useSymptomChecker Hook
 *
 * Handles AI symptom analysis and fetches matching doctors based on recommendations.
 *
 * @returns {object} { result, doctors, loading, error, checkSymptoms, reset }
 */
const useSymptomChecker = () => {
    const [result, setResult] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkSymptoms = useCallback(async (symptoms, ageYears = null, gender = null) => {
        if (!symptoms || symptoms.trim().length < 5) {
            setError('Please describe your symptoms in at least 5 characters');
            return null;
        }

        setLoading(true);
        setError(null);
        setResult(null);
        setDoctors([]);

        try {
            // Step 1: Call AI Symptom Checker
            const payload = { symptoms: symptoms.trim() };
            if (ageYears) payload.ageYears = parseInt(ageYears);
            if (gender) payload.gender = gender.toLowerCase();

            const response = await symptomApi.post('/check', payload);
            const analysisResult = response.data;
            setResult(analysisResult);

            // Step 2: Fetch matching doctors based on recommended specialties
            const specialties = analysisResult.recommendedSpecialties || [];
            if (specialties.length > 0) {
                const doctorPromises = specialties.map(specialty =>
                    publicDoctorApi.get('/search', {
                        params: { specialization: specialty }
                    }).catch(err => {
                        console.warn(`No doctors found for specialty: ${specialty}`, err);
                        return { data: [] };
                    })
                );

                const doctorResults = await Promise.all(doctorPromises);

                // Combine and deduplicate doctors
                const allDoctors = doctorResults.flatMap(r => r.data || []);
                const uniqueDoctors = [...new Map(allDoctors.map(d => [d.id, d])).values()];

                // Sort by consultation fee (lowest first)
                uniqueDoctors.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0));

                setDoctors(uniqueDoctors);
            }

            setLoading(false);
            return analysisResult;

        } catch (err) {
            console.error('Symptom check failed:', err);

            const errorMessage = err.response?.data?.message
                || err.response?.data?.error
                || 'Failed to analyze symptoms. Please try again.';

            setError(errorMessage);
            setLoading(false);
            return null;
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setDoctors([]);
        setError(null);
        setLoading(false);
    }, []);

    return {
        result,
        doctors,
        loading,
        error,
        checkSymptoms,
        reset
    };
};

export default useSymptomChecker;
