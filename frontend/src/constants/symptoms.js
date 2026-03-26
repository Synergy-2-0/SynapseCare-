/**
 * Symptom Checker Constants
 * Healthcare symptom data, body regions, and red flag conditions
 */

// Quick symptom selection chips
export const COMMON_SYMPTOMS = [
    'Headache',
    'Chest Pain',
    'Fever',
    'Fatigue',
    'Nausea',
    'Cough',
    'Shortness of Breath',
    'Dizziness',
    'Back Pain',
    'Stomach Pain',
    'Joint Pain',
    'Skin Rash'
];

// Duration options
export const DURATION_OPTIONS = [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: '1-day', label: '1 Day' },
    { value: '2-3-days', label: '2-3 Days' },
    { value: '1-week', label: '1 Week' },
    { value: '2-weeks', label: '2 Weeks' },
    { value: '1-month', label: '1 Month' },
    { value: '3-months', label: '3+ Months' },
    { value: 'chronic', label: 'Chronic (Ongoing)' }
];

// Onset types
export const ONSET_TYPES = [
    { value: 'sudden', label: 'Sudden' },
    { value: 'gradual', label: 'Gradual' }
];

// Body regions for symptom location
export const BODY_REGIONS = [
    { id: 'head', label: 'Head/Face' },
    { id: 'neck', label: 'Neck' },
    { id: 'chest', label: 'Chest' },
    { id: 'abdomen', label: 'Abdomen' },
    { id: 'back', label: 'Back' },
    { id: 'arms', label: 'Arms' },
    { id: 'legs', label: 'Legs' },
    { id: 'skin', label: 'Skin (General)' },
    { id: 'whole-body', label: 'Whole Body' }
];

// Red flag symptom combinations for emergency warnings
export const RED_FLAG_CONDITIONS = [
    {
        id: 'cardiac-emergency',
        symptoms: ['chest pain', 'shortness of breath'],
        warning: '⚠️ Possible cardiac emergency - Call 119 immediately',
        severity: 'critical',
        color: 'rose'
    },
    {
        id: 'stroke-warning',
        symptoms: ['severe headache', 'vision changes'],
        warning: '⚠️ Possible stroke symptoms - Seek immediate medical care',
        severity: 'critical',
        color: 'rose'
    },
    {
        id: 'stroke-warning-2',
        symptoms: ['headache', 'confusion', 'weakness'],
        warning: '⚠️ Possible neurological emergency - Seek immediate care',
        severity: 'critical',
        color: 'rose'
    },
    {
        id: 'severe-allergic',
        symptoms: ['skin rash', 'shortness of breath', 'swelling'],
        warning: '⚠️ Possible severe allergic reaction - Call 119',
        severity: 'critical',
        color: 'rose'
    },
    {
        id: 'chest-breathing',
        symptoms: ['chest pain', 'difficulty breathing'],
        warning: '⚠️ Respiratory emergency - Seek immediate medical attention',
        severity: 'critical',
        color: 'rose'
    },
    {
        id: 'severe-abdominal',
        symptoms: ['severe stomach pain', 'vomiting', 'fever'],
        warning: '⚠️ Possible serious abdominal condition - Seek medical care',
        severity: 'high',
        color: 'amber'
    },
    {
        id: 'high-fever',
        symptoms: ['high fever', 'headache', 'neck stiffness'],
        warning: '⚠️ Possible serious infection - Seek immediate medical care',
        severity: 'high',
        color: 'amber'
    }
];

// Common medical conditions for autocomplete
export const MEDICAL_CONDITIONS = [
    'Diabetes',
    'Hypertension (High Blood Pressure)',
    'Asthma',
    'Heart Disease',
    'Arthritis',
    'Depression',
    'Anxiety',
    'COPD',
    'Thyroid Disease',
    'Kidney Disease',
    'Liver Disease',
    'Cancer',
    'Migraine',
    'Epilepsy',
    'Allergies'
];

// Common medications for autocomplete
export const COMMON_MEDICATIONS = [
    'Aspirin',
    'Ibuprofen',
    'Paracetamol',
    'Metformin',
    'Lisinopril',
    'Atorvastatin',
    'Omeprazole',
    'Salbutamol',
    'Insulin',
    'Warfarin',
    'Sertraline',
    'Lorazepam'
];

// Allergy types
export const ALLERGY_TYPES = [
    'Food allergies',
    'Drug/Medication allergies',
    'Environmental allergies (pollen, dust)',
    'Latex allergy',
    'Insect sting allergies',
    'No known allergies'
];