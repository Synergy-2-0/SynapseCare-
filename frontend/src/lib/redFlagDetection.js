import { RED_FLAG_CONDITIONS } from '../constants/symptoms';

/**
 * Red Flag Detection Utility
 *
 * Detects dangerous symptom combinations and returns appropriate warnings
 * Used for real-time emergency alerts in the symptom checker
 */

/**
 * Check for red flag conditions based on selected symptoms and additional text
 * @param {Array} selectedSymptoms - Array of selected symptom strings
 * @param {string} additionalText - Additional symptom description text
 * @param {number} severity - Severity level 1-10
 * @returns {Object|null} Red flag condition if found, null otherwise
 */
export const detectRedFlags = (selectedSymptoms = [], additionalText = '', severity = 5) => {
    // Combine selected symptoms and additional text for analysis
    const allSymptomsText = [
        ...selectedSymptoms,
        additionalText
    ].join(' ').toLowerCase();

    // Check each red flag condition
    for (const condition of RED_FLAG_CONDITIONS) {
        const matchedSymptoms = condition.symptoms.filter(symptom =>
            allSymptomsText.includes(symptom.toLowerCase())
        );

        // If we have a match and it meets the threshold
        if (matchedSymptoms.length >= Math.min(2, condition.symptoms.length)) {
            // For critical conditions, lower threshold if severity is high
            if (condition.severity === 'critical' ||
                (condition.severity === 'high' && severity >= 8)) {
                return {
                    ...condition,
                    matchedSymptoms,
                    confidence: (matchedSymptoms.length / condition.symptoms.length) * 100
                };
            }
        }
    }

    return null;
};

/**
 * Get urgency level based on red flags and severity
 * @param {Object} redFlag - Red flag condition
 * @param {number} severity - Severity level 1-10
 * @returns {string} Urgency level: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
 */
export const getUrgencyLevel = (redFlag, severity = 5) => {
    if (redFlag) {
        return redFlag.severity === 'critical' ? 'CRITICAL' : 'HIGH';
    }

    if (severity >= 8) return 'HIGH';
    if (severity >= 6) return 'MEDIUM';
    return 'LOW';
};

/**
 * Generate emergency action recommendations
 * @param {Object} redFlag - Red flag condition
 * @returns {Array} Array of action objects
 */
export const getEmergencyActions = (redFlag) => {
    if (!redFlag) return [];

    const actions = [];

    if (redFlag.severity === 'critical') {
        actions.push({
            type: 'emergency_call',
            label: 'Call 119 Emergency',
            priority: 'critical',
            phone: '119'
        });
    }

    actions.push({
        type: 'emergency_center',
        label: 'Find Nearest Emergency Center',
        priority: 'high'
    });

    if (redFlag.severity !== 'critical') {
        actions.push({
            type: 'urgent_care',
            label: 'Visit Urgent Care',
            priority: 'medium'
        });
    }

    return actions;
};

/**
 * Check for medication interactions (basic implementation)
 * @param {Array} medications - Current medications
 * @param {Array} symptoms - Current symptoms
 * @returns {Array} Potential interaction warnings
 */
export const checkMedicationInteractions = (medications = [], symptoms = []) => {
    const interactions = [];

    // Basic medication interaction checks
    const medicationText = medications.join(' ').toLowerCase();
    const symptomText = symptoms.join(' ').toLowerCase();

    // Blood thinner + bleeding symptoms
    if ((medicationText.includes('warfarin') || medicationText.includes('aspirin')) &&
        (symptomText.includes('bleeding') || symptomText.includes('bruising'))) {
        interactions.push({
            type: 'bleeding_risk',
            message: 'Blood thinner with bleeding symptoms - consult doctor immediately',
            severity: 'high'
        });
    }

    // Diabetes medication + dizziness/weakness
    if ((medicationText.includes('insulin') || medicationText.includes('metformin')) &&
        (symptomText.includes('dizziness') || symptomText.includes('weakness'))) {
        interactions.push({
            type: 'hypoglycemia_risk',
            message: 'Diabetes medication with symptoms of low blood sugar',
            severity: 'medium'
        });
    }

    return interactions;
};