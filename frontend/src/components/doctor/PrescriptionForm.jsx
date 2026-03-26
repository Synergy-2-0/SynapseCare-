import React, { useState } from 'react';
import { Pill, Plus, X, AlertTriangle, Search } from 'lucide-react';
import { MEDICATIONS_DATABASE, DOSAGE_FREQUENCIES, TREATMENT_DURATIONS } from '../../constants/icdCodes';

/**
 * PrescriptionForm Component
 *
 * Digital prescription management with medication search, dosage, and instructions
 * Professional medical prescription writing with validation
 */
const PrescriptionForm = ({
    prescriptions = [],
    onChange,
    className = ''
}) => {
    const [medications, setMedications] = useState(prescriptions.length > 0 ? prescriptions : [createEmptyPrescription()]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMedications, setShowMedications] = useState(false);

    function createEmptyPrescription() {
        return {
            id: Date.now() + Math.random(),
            medication: '',
            genericName: '',
            dosage: '',
            frequency: '',
            duration: '',
            instructions: '',
            warnings: ''
        };
    }

    const handleMedicationChange = (id, field, value) => {
        const updated = medications.map(med => {
            if (med.id === id) {
                const newMed = { ...med, [field]: value };

                // If medication name is selected, auto-fill generic name
                if (field === 'medication') {
                    const foundMed = MEDICATIONS_DATABASE.find(m => m.name === value);
                    if (foundMed) {
                        newMed.genericName = foundMed.genericName;
                    }
                }

                return newMed;
            }
            return med;
        });

        setMedications(updated);
        if (onChange) {
            onChange(updated);
        }
    };

    const addMedication = () => {
        const newMedications = [...medications, createEmptyPrescription()];
        setMedications(newMedications);
        if (onChange) {
            onChange(newMedications);
        }
    };

    const removeMedication = (id) => {
        if (medications.length > 1) {
            const filtered = medications.filter(med => med.id !== id);
            setMedications(filtered);
            if (onChange) {
                onChange(filtered);
            }
        }
    };

    const selectMedication = (medicationData, prescriptionId) => {
        handleMedicationChange(prescriptionId, 'medication', medicationData.name);
        handleMedicationChange(prescriptionId, 'genericName', medicationData.genericName);
        setSearchQuery('');
        setShowMedications(false);
    };

    const filteredMedications = searchQuery
        ? MEDICATIONS_DATABASE.filter(med =>
            med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            med.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <div className={className}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-blue-600" />
                        Digital Prescriptions
                    </h2>
                    <p className="text-sm text-slate-600">
                        Add medications with dosage, frequency, and instructions
                    </p>
                </div>
                <button
                    type="button"
                    onClick={addMedication}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Medicine
                </button>
            </div>

            <div className="space-y-6">
                {medications.map((prescription, index) => (
                    <div key={prescription.id} className="border border-slate-200 rounded-lg p-5 bg-white">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900">
                                Medication #{index + 1}
                            </h3>
                            {medications.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeMedication(prescription.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Medication Details */}
                            <div className="space-y-4">
                                {/* Medication Search */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Medication Name *
                                    </label>
                                    <div className="relative">
                                        <div className="flex">
                                            <input
                                                type="text"
                                                value={prescription.medication}
                                                onChange={(e) => {
                                                    handleMedicationChange(prescription.id, 'medication', e.target.value);
                                                    setSearchQuery(e.target.value);
                                                    setShowMedications(e.target.value.length > 1);
                                                }}
                                                placeholder="Search medications..."
                                                className="flex-1 px-3 py-2 border border-slate-200 rounded-l-lg focus:outline-none focus:border-blue-400 text-sm"
                                                list={`medications-${prescription.id}`}
                                            />
                                            <div className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg flex items-center">
                                                <Search className="w-4 h-4 text-slate-500" />
                                            </div>
                                        </div>

                                        {/* Medication Suggestions */}
                                        {showMedications && searchQuery.length > 1 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                                {filteredMedications.slice(0, 8).map(med => (
                                                    <button
                                                        key={med.name}
                                                        type="button"
                                                        onClick={() => selectMedication(med, prescription.id)}
                                                        className="w-full p-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                                                    >
                                                        <div className="font-medium text-slate-900">{med.name}</div>
                                                        <div className="text-sm text-slate-600">{med.genericName} • {med.category}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Generic Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Generic Name
                                    </label>
                                    <input
                                        type="text"
                                        value={prescription.genericName}
                                        onChange={(e) => handleMedicationChange(prescription.id, 'genericName', e.target.value)}
                                        placeholder="Generic name (auto-filled)"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm bg-slate-50"
                                        readOnly
                                    />
                                </div>

                                {/* Dosage */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Dosage *
                                    </label>
                                    <input
                                        type="text"
                                        value={prescription.dosage}
                                        onChange={(e) => handleMedicationChange(prescription.id, 'dosage', e.target.value)}
                                        placeholder="e.g., 500mg, 10ml, 2 tablets"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Right Column - Instructions */}
                            <div className="space-y-4">
                                {/* Frequency */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Frequency *
                                    </label>
                                    <select
                                        value={prescription.frequency}
                                        onChange={(e) => handleMedicationChange(prescription.id, 'frequency', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                                    >
                                        <option value="">Select frequency</option>
                                        {DOSAGE_FREQUENCIES.map(freq => (
                                            <option key={freq} value={freq}>
                                                {freq}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Duration *
                                    </label>
                                    <select
                                        value={prescription.duration}
                                        onChange={(e) => handleMedicationChange(prescription.id, 'duration', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                                    >
                                        <option value="">Select duration</option>
                                        {TREATMENT_DURATIONS.map(duration => (
                                            <option key={duration} value={duration}>
                                                {duration}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Instructions */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Instructions
                                    </label>
                                    <textarea
                                        value={prescription.instructions}
                                        onChange={(e) => handleMedicationChange(prescription.id, 'instructions', e.target.value)}
                                        placeholder="Take with food, avoid alcohol, etc."
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm resize-none"
                                        rows="2"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Warnings */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                Warnings & Precautions
                            </label>
                            <textarea
                                value={prescription.warnings}
                                onChange={(e) => handleMedicationChange(prescription.id, 'warnings', e.target.value)}
                                placeholder="Drug interactions, contraindications, side effects to monitor..."
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm resize-none"
                                rows="2"
                            />
                        </div>

                        {/* Prescription Summary */}
                        {prescription.medication && prescription.dosage && prescription.frequency && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="text-sm font-medium text-blue-800 mb-1">Prescription Summary:</div>
                                <div className="text-sm text-blue-700">
                                    <strong>{prescription.medication}</strong> {prescription.dosage} - {prescription.frequency}
                                    {prescription.duration && ` for ${prescription.duration}`}
                                </div>
                                {prescription.instructions && (
                                    <div className="text-xs text-blue-600 mt-1">
                                        Instructions: {prescription.instructions}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Prescription Guidelines */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-800 text-sm mb-1">
                            Prescription Guidelines
                        </h4>
                        <ul className="text-xs text-amber-700 space-y-0.5">
                            <li>• Always verify patient allergies before prescribing</li>
                            <li>• Check for drug interactions with existing medications</li>
                            <li>• Use generic names when possible for cost-effectiveness</li>
                            <li>• Provide clear instructions for patient compliance</li>
                            <li>• Include warnings for high-risk medications</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Medications Summary */}
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Total Medications: {medications.length}</span>
                <span>
                    Complete: {medications.filter(m => m.medication && m.dosage && m.frequency).length}
                </span>
            </div>
        </div>
    );
};

export default PrescriptionForm;