import React from 'react';
import { X } from 'lucide-react';
import { COMMON_SYMPTOMS } from '../../constants/symptoms';

/**
 * SymptomChips Component
 *
 * Quick symptom selection with chips for common symptoms
 * Clinical design with clear selection states
 */
const SymptomChips = ({
    selectedSymptoms = [],
    onSymptomToggle,
    className = ''
}) => {

    const handleChipClick = (symptom) => {
        if (selectedSymptoms.includes(symptom)) {
            // Remove symptom if already selected
            onSymptomToggle(selectedSymptoms.filter(s => s !== symptom));
        } else {
            // Add symptom if not selected
            onSymptomToggle([...selectedSymptoms, symptom]);
        }
    };

    return (
        <div className={className}>
            <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                    Common Symptoms (Select all that apply)
                </h4>
                <div className="flex flex-wrap gap-2">
                    {COMMON_SYMPTOMS.map((symptom) => {
                        const isSelected = selectedSymptoms.includes(symptom);
                        return (
                            <button
                                key={symptom}
                                type="button"
                                onClick={() => handleChipClick(symptom)}
                                className={`
                                    px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${isSelected
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                                `}
                            >
                                <span className="flex items-center gap-1.5">
                                    {symptom}
                                    {isSelected && <X className="w-3 h-3" />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected symptoms summary */}
            {selectedSymptoms.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">
                            Selected: {selectedSymptoms.join(', ')}
                        </span>
                        <button
                            type="button"
                            onClick={() => onSymptomToggle([])}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            )}

            {/* Additional symptoms textarea */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Symptoms or Details
                </label>
                <textarea
                    rows={3}
                    placeholder="Describe any other symptoms or provide more details about the selected symptoms..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                    Include details like location, intensity, triggers, or patterns
                </p>
            </div>
        </div>
    );
};

export default SymptomChips;