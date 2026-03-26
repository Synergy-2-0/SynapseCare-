/**
 * ICD-10 Diagnosis Codes for Healthcare Platform
 * Common medical conditions with standardized diagnostic codes
 */

// Common ICD-10 diagnosis codes organized by category
export const ICD_10_CODES = [
    // Respiratory System
    { code: 'J06.9', name: 'Acute upper respiratory infection, unspecified', category: 'Respiratory' },
    { code: 'J45.9', name: 'Asthma, unspecified', category: 'Respiratory' },
    { code: 'J44.1', name: 'Chronic obstructive pulmonary disease with acute exacerbation', category: 'Respiratory' },
    { code: 'J18.9', name: 'Pneumonia, unspecified organism', category: 'Respiratory' },
    { code: 'J20.9', name: 'Acute bronchitis, unspecified', category: 'Respiratory' },

    // Cardiovascular System
    { code: 'I10', name: 'Essential (primary) hypertension', category: 'Cardiovascular' },
    { code: 'I25.10', name: 'Atherosclerotic heart disease of native coronary artery without angina pectoris', category: 'Cardiovascular' },
    { code: 'I48.91', name: 'Unspecified atrial fibrillation', category: 'Cardiovascular' },
    { code: 'I50.9', name: 'Heart failure, unspecified', category: 'Cardiovascular' },

    // Endocrine System
    { code: 'E11.9', name: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
    { code: 'E11.65', name: 'Type 2 diabetes mellitus with hyperglycemia', category: 'Endocrine' },
    { code: 'E78.5', name: 'Hyperlipidemia, unspecified', category: 'Endocrine' },
    { code: 'E03.9', name: 'Hypothyroidism, unspecified', category: 'Endocrine' },

    // Musculoskeletal System
    { code: 'M54.5', name: 'Low back pain', category: 'Musculoskeletal' },
    { code: 'M25.50', name: 'Pain in unspecified joint', category: 'Musculoskeletal' },
    { code: 'M79.3', name: 'Panniculitis, unspecified', category: 'Musculoskeletal' },
    { code: 'M06.9', name: 'Rheumatoid arthritis, unspecified', category: 'Musculoskeletal' },

    // Neurological System
    { code: 'G43.909', name: 'Migraine, unspecified, not intractable, without status migrainosus', category: 'Neurological' },
    { code: 'G44.209', name: 'Tension-type headache, unspecified, not intractable', category: 'Neurological' },
    { code: 'G47.00', name: 'Insomnia, unspecified', category: 'Neurological' },
    { code: 'G93.1', name: 'Anoxic brain damage, not elsewhere classified', category: 'Neurological' },

    // Gastrointestinal System
    { code: 'K21.9', name: 'Gastro-esophageal reflux disease without esophagitis', category: 'Gastrointestinal' },
    { code: 'K59.00', name: 'Constipation, unspecified', category: 'Gastrointestinal' },
    { code: 'K30', name: 'Functional dyspepsia', category: 'Gastrointestinal' },
    { code: 'K58.9', name: 'Irritable bowel syndrome without diarrhea', category: 'Gastrointestinal' },

    // Mental Health
    { code: 'F32.9', name: 'Major depressive disorder, single episode, unspecified', category: 'Mental Health' },
    { code: 'F41.9', name: 'Anxiety disorder, unspecified', category: 'Mental Health' },
    { code: 'F43.10', name: 'Post-traumatic stress disorder, unspecified', category: 'Mental Health' },

    // Infections
    { code: 'B99.9', name: 'Unspecified infectious disease', category: 'Infectious Disease' },
    { code: 'A09', name: 'Infectious gastroenteritis and colitis, unspecified', category: 'Infectious Disease' },

    // General Symptoms
    { code: 'R50.9', name: 'Fever, unspecified', category: 'Symptoms' },
    { code: 'R06.02', name: 'Shortness of breath', category: 'Symptoms' },
    { code: 'R51', name: 'Headache', category: 'Symptoms' },
    { code: 'R53', name: 'Malaise and fatigue', category: 'Symptoms' }
];

// Categories for filtering
export const ICD_CATEGORIES = [
    'Respiratory',
    'Cardiovascular',
    'Endocrine',
    'Musculoskeletal',
    'Neurological',
    'Gastrointestinal',
    'Mental Health',
    'Infectious Disease',
    'Symptoms'
];

// Medication database for prescriptions
export const MEDICATIONS_DATABASE = [
    // Analgesics
    { name: 'Paracetamol', genericName: 'Acetaminophen', category: 'Analgesic', commonDosages: ['500mg', '650mg', '1000mg'] },
    { name: 'Ibuprofen', genericName: 'Ibuprofen', category: 'NSAID', commonDosages: ['200mg', '400mg', '600mg', '800mg'] },
    { name: 'Aspirin', genericName: 'Acetylsalicylic acid', category: 'NSAID', commonDosages: ['81mg', '325mg', '500mg'] },
    { name: 'Diclofenac', genericName: 'Diclofenac sodium', category: 'NSAID', commonDosages: ['25mg', '50mg', '75mg'] },
    { name: 'Naproxen', genericName: 'Naproxen', category: 'NSAID', commonDosages: ['220mg', '275mg', '500mg'] },

    // Antibiotics
    { name: 'Amoxicillin', genericName: 'Amoxicillin', category: 'Antibiotic', commonDosages: ['250mg', '500mg', '875mg'] },
    { name: 'Azithromycin', genericName: 'Azithromycin', category: 'Antibiotic', commonDosages: ['250mg', '500mg'] },
    { name: 'Cephalexin', genericName: 'Cephalexin', category: 'Antibiotic', commonDosages: ['250mg', '500mg'] },
    { name: 'Ciprofloxacin', genericName: 'Ciprofloxacin', category: 'Antibiotic', commonDosages: ['250mg', '500mg', '750mg'] },

    // Cardiovascular
    { name: 'Lisinopril', genericName: 'Lisinopril', category: 'ACE Inhibitor', commonDosages: ['5mg', '10mg', '20mg', '40mg'] },
    { name: 'Amlodipine', genericName: 'Amlodipine', category: 'Calcium Channel Blocker', commonDosages: ['2.5mg', '5mg', '10mg'] },
    { name: 'Metoprolol', genericName: 'Metoprolol', category: 'Beta Blocker', commonDosages: ['25mg', '50mg', '100mg'] },
    { name: 'Atorvastatin', genericName: 'Atorvastatin', category: 'Statin', commonDosages: ['10mg', '20mg', '40mg', '80mg'] },

    // Diabetes
    { name: 'Metformin', genericName: 'Metformin', category: 'Antidiabetic', commonDosages: ['500mg', '850mg', '1000mg'] },
    { name: 'Insulin Glargine', genericName: 'Insulin Glargine', category: 'Insulin', commonDosages: ['Units as directed'] },
    { name: 'Glimepiride', genericName: 'Glimepiride', category: 'Antidiabetic', commonDosages: ['1mg', '2mg', '4mg'] },

    // Respiratory
    { name: 'Salbutamol', genericName: 'Albuterol', category: 'Bronchodilator', commonDosages: ['2mg', '4mg', '100mcg inhaler'] },
    { name: 'Prednisolone', genericName: 'Prednisolone', category: 'Corticosteroid', commonDosages: ['5mg', '10mg', '20mg'] },
    { name: 'Montelukast', genericName: 'Montelukast', category: 'Leukotriene Receptor Antagonist', commonDosages: ['4mg', '5mg', '10mg'] },

    // Gastrointestinal
    { name: 'Omeprazole', genericName: 'Omeprazole', category: 'PPI', commonDosages: ['20mg', '40mg'] },
    { name: 'Ranitidine', genericName: 'Ranitidine', category: 'H2 Receptor Antagonist', commonDosages: ['150mg', '300mg'] },
    { name: 'Loperamide', genericName: 'Loperamide', category: 'Antidiarrheal', commonDosages: ['2mg'] },

    // Mental Health
    { name: 'Sertraline', genericName: 'Sertraline', category: 'SSRI', commonDosages: ['25mg', '50mg', '100mg'] },
    { name: 'Lorazepam', genericName: 'Lorazepam', category: 'Benzodiazepine', commonDosages: ['0.5mg', '1mg', '2mg'] },
    { name: 'Fluoxetine', genericName: 'Fluoxetine', category: 'SSRI', commonDosages: ['10mg', '20mg', '40mg'] }
];

// Common dosage frequencies
export const DOSAGE_FREQUENCIES = [
    'Once daily (OD)',
    'Twice daily (BD)',
    'Three times daily (TDS)',
    'Four times daily (QDS)',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed (PRN)',
    'At bedtime (HS)',
    'Before meals (AC)',
    'After meals (PC)',
    'On empty stomach'
];

// Duration options for prescriptions
export const TREATMENT_DURATIONS = [
    '3 days',
    '5 days',
    '7 days',
    '10 days',
    '14 days',
    '21 days',
    '30 days',
    '60 days',
    '90 days',
    'Ongoing',
    'As needed'
];

// Lab tests categories
export const LAB_TESTS = [
    // Blood Tests
    { name: 'Complete Blood Count (CBC)', category: 'Hematology', code: 'CBC' },
    { name: 'Basic Metabolic Panel (BMP)', category: 'Chemistry', code: 'BMP' },
    { name: 'Comprehensive Metabolic Panel (CMP)', category: 'Chemistry', code: 'CMP' },
    { name: 'Lipid Profile', category: 'Chemistry', code: 'LIPID' },
    { name: 'Hemoglobin A1C', category: 'Chemistry', code: 'HBA1C' },
    { name: 'Thyroid Function Tests (TSH, T3, T4)', category: 'Endocrine', code: 'TFT' },
    { name: 'Liver Function Tests (LFT)', category: 'Chemistry', code: 'LFT' },
    { name: 'Kidney Function Tests (RFT)', category: 'Chemistry', code: 'RFT' },

    // Cardiac Tests
    { name: 'Electrocardiogram (ECG)', category: 'Cardiac', code: 'ECG' },
    { name: 'Echocardiogram', category: 'Cardiac', code: 'ECHO' },
    { name: 'Cardiac Enzymes (Troponin)', category: 'Cardiac', code: 'TROP' },

    // Imaging
    { name: 'Chest X-Ray', category: 'Radiology', code: 'CXR' },
    { name: 'Abdominal X-Ray', category: 'Radiology', code: 'AXR' },
    { name: 'CT Scan (specify region)', category: 'Radiology', code: 'CT' },
    { name: 'MRI (specify region)', category: 'Radiology', code: 'MRI' },
    { name: 'Ultrasound (specify region)', category: 'Radiology', code: 'US' },

    // Microbiology
    { name: 'Blood Culture', category: 'Microbiology', code: 'BC' },
    { name: 'Urine Culture', category: 'Microbiology', code: 'UC' },
    { name: 'Throat Swab', category: 'Microbiology', code: 'TS' },

    // Specialized Tests
    { name: 'Vitamin D Level', category: 'Chemistry', code: 'VITD' },
    { name: 'Vitamin B12 Level', category: 'Chemistry', code: 'B12' },
    { name: 'C-Reactive Protein (CRP)', category: 'Inflammation', code: 'CRP' },
    { name: 'Erythrocyte Sedimentation Rate (ESR)', category: 'Inflammation', code: 'ESR' }
];