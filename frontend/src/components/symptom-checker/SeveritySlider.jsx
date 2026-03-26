import React, { useState } from 'react';

/**
 * SeveritySlider Component
 *
 * Visual 1-10 severity scale for healthcare symptom assessment
 * Professional medical styling with clear pain scale indicators
 */
const SeveritySlider = ({
    value = 5,
    onChange,
    className = ''
}) => {
    const [localValue, setLocalValue] = useState(value);

    const handleChange = (newValue) => {
        setLocalValue(newValue);
        onChange && onChange(newValue);
    };

    // Pain scale descriptors for healthcare context
    const getSeverityLabel = (val) => {
        if (val <= 2) return 'Mild';
        if (val <= 4) return 'Mild-Moderate';
        if (val <= 6) return 'Moderate';
        if (val <= 8) return 'Moderate-Severe';
        return 'Severe';
    };

    const getSeverityColor = (val) => {
        if (val <= 3) return 'text-emerald-600';
        if (val <= 6) return 'text-amber-600';
        return 'text-rose-600';
    };

    return (
        <div className={className}>
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                    Symptom Severity Level
                </label>

                {/* Current Value Display */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-slate-900">
                            {localValue}
                        </span>
                        <span className={`text-sm font-medium ${getSeverityColor(localValue)}`}>
                            {getSeverityLabel(localValue)}
                        </span>
                    </div>
                    <span className="text-xs text-slate-500">
                        Scale: 1 (Minimal) - 10 (Worst Possible)
                    </span>
                </div>

                {/* Slider */}
                <div className="relative">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={localValue}
                        onChange={(e) => handleChange(parseInt(e.target.value))}
                        className="w-full h-3 bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                            background: `linear-gradient(to right,
                                #10b981 0%, #10b981 ${((localValue - 1) / 9) * 30}%,
                                #f59e0b ${((localValue - 1) / 9) * 30}%, #f59e0b ${((localValue - 1) / 9) * 70}%,
                                #ef4444 ${((localValue - 1) / 9) * 70}%, #ef4444 100%)`
                        }}
                    />

                    {/* Scale markers */}
                    <div className="flex justify-between mt-2 px-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => handleChange(num)}
                                className={`
                                    w-6 h-6 rounded-full text-xs font-medium transition-colors
                                    ${localValue === num
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                                `}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    {/* Scale labels */}
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>No Pain</span>
                        <span>Moderate</span>
                        <span>Worst Possible</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                    cursor: pointer;
                }

                .slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default SeveritySlider;