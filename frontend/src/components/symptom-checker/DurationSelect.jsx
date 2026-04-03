import React from 'react';
import { Clock } from 'lucide-react';
import { DURATION_OPTIONS, ONSET_TYPES } from '../../constants/symptoms';

/**
 * DurationSelect Component
 *
 * Duration and onset selection for healthcare symptom assessment
 * Professional medical form styling
 */
const DurationSelect = ({
    duration = '',
    onset = '',
    onDurationChange,
    onOnsetChange,
    className = ''
}) => {

    return (
        <div className={className}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration Select */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                        <Clock className="w-4 h-4 text-teal-600" />
                        How long have you had these symptoms?
                        <span className="text-rose-600">*</span>
                    </label>
                    <select
                        value={duration}
                        onChange={(e) => onDurationChange && onDurationChange(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 text-sm bg-white"
                        required
                    >
                        <option value="">Select duration</option>
                        {DURATION_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Onset Type */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        How did the symptoms start?
                        <span className="text-rose-600">*</span>
                    </label>
                    <div className="space-y-2">
                        {ONSET_TYPES.map(type => (
                            <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="onset"
                                    value={type.value}
                                    checked={onset === type.value}
                                    onChange={(e) => onOnsetChange && onOnsetChange(e.target.value)}
                                    className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300"
                                    required
                                />
                                <span className="text-sm text-slate-700">{type.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Context */}
            <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pattern or Triggers (Optional)
                </label>
                <textarea
                    rows={2}
                    placeholder="Does anything make it better or worse? Any specific times of day? Triggers?"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-400 text-sm resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                    Help us understand when and how your symptoms occur
                </p>
            </div>
        </div>
    );
};

export default DurationSelect;