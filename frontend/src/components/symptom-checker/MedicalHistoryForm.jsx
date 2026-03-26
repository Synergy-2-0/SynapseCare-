import React, { useState } from 'react';
import { Heart, Pill, AlertTriangle, X } from 'lucide-react';
import { MEDICAL_CONDITIONS, COMMON_MEDICATIONS, ALLERGY_TYPES } from '../../constants/symptoms';

/**
 * MedicalHistoryForm Component
 *
 * Medical history collection for better symptom analysis
 * Comprehensive healthcare form with autocomplete features
 */
const MedicalHistoryForm = ({
    conditions = [],
    medications = [],
    allergies = [],
    onConditionsChange,
    onMedicationsChange,
    onAllergiesChange,
    className = ''
}) => {
    const [conditionInput, setConditionInput] = useState('');
    const [medicationInput, setMedicationInput] = useState('');
    const [allergyInput, setAllergyInput] = useState('');

    const addCondition = (condition) => {
        if (condition && !conditions.includes(condition)) {
            onConditionsChange([...conditions, condition]);
            setConditionInput('');
        }
    };

    const removeCondition = (condition) => {
        onConditionsChange(conditions.filter(c => c !== condition));
    };

    const addMedication = (medication) => {
        if (medication && !medications.includes(medication)) {
            onMedicationsChange([...medications, medication]);
            setMedicationInput('');
        }
    };

    const removeMedication = (medication) => {
        onMedicationsChange(medications.filter(m => m !== medication));
    };

    const addAllergy = (allergy) => {
        if (allergy && !allergies.includes(allergy)) {
            onAllergiesChange([...allergies, allergy]);
            setAllergyInput('');
        }
    };

    const removeAllergy = (allergy) => {
        onAllergiesChange(allergies.filter(a => a !== allergy));
    };

    return (
        <div className={className}>
            <div className="space-y-6">
                {/* Medical Conditions */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                        <Heart className="w-4 h-4 text-red-600" />
                        Current Medical Conditions
                    </label>

                    {/* Selected conditions */}
                    {conditions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {conditions.map(condition => (
                                <span
                                    key={condition}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 border border-red-200 rounded-lg text-sm"
                                >
                                    <span className="text-red-700">{condition}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeCondition(condition)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Add condition */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={conditionInput}
                            onChange={(e) => setConditionInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition(conditionInput))}
                            placeholder="Type or select a condition..."
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                            list="conditions-list"
                        />
                        <button
                            type="button"
                            onClick={() => addCondition(conditionInput)}
                            disabled={!conditionInput.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>

                    <datalist id="conditions-list">
                        {MEDICAL_CONDITIONS.map(condition => (
                            <option key={condition} value={condition} />
                        ))}
                    </datalist>

                    <p className="text-xs text-slate-500 mt-1">
                        Include diabetes, heart disease, asthma, etc.
                    </p>
                </div>

                {/* Current Medications */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                        <Pill className="w-4 h-4 text-blue-600" />
                        Current Medications
                    </label>

                    {/* Selected medications */}
                    {medications.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {medications.map(medication => (
                                <span
                                    key={medication}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-sm"
                                >
                                    <span className="text-blue-700">{medication}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeMedication(medication)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Add medication */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={medicationInput}
                            onChange={(e) => setMedicationInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication(medicationInput))}
                            placeholder="Type or select a medication..."
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                            list="medications-list"
                        />
                        <button
                            type="button"
                            onClick={() => addMedication(medicationInput)}
                            disabled={!medicationInput.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>

                    <datalist id="medications-list">
                        {COMMON_MEDICATIONS.map(medication => (
                            <option key={medication} value={medication} />
                        ))}
                    </datalist>

                    <p className="text-xs text-slate-500 mt-1">
                        Include prescription drugs, over-the-counter medications, supplements
                    </p>
                </div>

                {/* Allergies */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Known Allergies
                    </label>

                    {/* Selected allergies */}
                    {allergies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {allergies.map(allergy => (
                                <span
                                    key={allergy}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-sm"
                                >
                                    <span className="text-amber-700">{allergy}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeAllergy(allergy)}
                                        className="text-amber-500 hover:text-amber-700"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Quick allergy selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {ALLERGY_TYPES.map(allergy => (
                            <label key={allergy} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={allergies.includes(allergy)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            addAllergy(allergy);
                                        } else {
                                            removeAllergy(allergy);
                                        }
                                    }}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                                />
                                <span className="text-sm text-slate-700">{allergy}</span>
                            </label>
                        ))}
                    </div>

                    {/* Custom allergy input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={allergyInput}
                            onChange={(e) => setAllergyInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy(allergyInput))}
                            placeholder="Other allergies or specific substances..."
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => addAllergy(allergyInput)}
                            disabled={!allergyInput.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalHistoryForm;