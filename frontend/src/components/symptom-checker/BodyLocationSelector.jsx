import React from 'react';
import { User } from 'lucide-react';
import { BODY_REGIONS } from '../../constants/symptoms';

/**
 * BodyLocationSelector Component
 *
 * Body region selector for symptom location
 * Healthcare-styled with visual body map
 */
const BodyLocationSelector = ({
    selectedRegions = [],
    onRegionToggle,
    className = ''
}) => {

    const handleRegionClick = (regionId) => {
        if (selectedRegions.includes(regionId)) {
            // Remove region if already selected
            onRegionToggle(selectedRegions.filter(r => r !== regionId));
        } else {
            // Add region if not selected
            onRegionToggle([...selectedRegions, regionId]);
        }
    };

    return (
        <div className={className}>
            <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                    Where are you experiencing symptoms?
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                    Select the body areas where you feel symptoms (optional but helpful for diagnosis)
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Body Region Checkboxes */}
                <div>
                    <h5 className="text-sm font-medium text-slate-600 mb-3">
                        Body Regions
                    </h5>
                    <div className="space-y-2">
                        {BODY_REGIONS.map(region => {
                            const isSelected = selectedRegions.includes(region.id);
                            return (
                                <label
                                    key={region.id}
                                    className={`
                                        flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                                        ${isSelected
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }
                                    `}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleRegionClick(region.id)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                                    />
                                    <span className={`text-sm font-medium ${
                                        isSelected ? 'text-blue-700' : 'text-slate-700'
                                    }`}>
                                        {region.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Simple Body Diagram */}
                <div>
                    <h5 className="text-sm font-medium text-slate-600 mb-3">
                        Body Overview
                    </h5>
                    <div className="flex justify-center">
                        <div className="relative">
                            {/* Simple body silhouette */}
                            <User className="w-32 h-32 text-slate-300" />

                            {/* Highlight selected regions */}
                            {selectedRegions.includes('head') && (
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-400 bg-opacity-50 rounded-full"></div>
                            )}
                            {selectedRegions.includes('chest') && (
                                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-10 h-6 bg-blue-400 bg-opacity-50 rounded"></div>
                            )}
                            {selectedRegions.includes('abdomen') && (
                                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-blue-400 bg-opacity-50 rounded"></div>
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 text-center mt-2">
                        Visual representation of selected areas
                    </p>
                </div>
            </div>

            {/* Selected regions summary */}
            {selectedRegions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">
                            Affected areas: {selectedRegions.map(id =>
                                BODY_REGIONS.find(r => r.id === id)?.label
                            ).join(', ')}
                        </span>
                        <button
                            type="button"
                            onClick={() => onRegionToggle([])}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Clear All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BodyLocationSelector;