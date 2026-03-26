import React, { useState } from 'react';
import { Search, Plus, X, FileText, Star, Filter, AlertCircle } from 'lucide-react';
import { ICD_10_CODES, ICD_CATEGORIES } from '../../constants/icdCodes';

/**
 * DiagnosisCodeSearch Component
 *
 * ICD-10 diagnosis code picker with search, filtering, and primary/secondary designation
 * Professional medical coding interface for accurate billing and documentation
 */
const DiagnosisCodeSearch = ({
    selectedDiagnoses = [],
    onChange,
    className = ''
}) => {
    const [diagnoses, setDiagnoses] = useState(selectedDiagnoses.length > 0 ? selectedDiagnoses : []);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showResults, setShowResults] = useState(false);

    const handleDiagnosisAdd = (icdCode) => {
        const newDiagnosis = {
            id: Date.now() + Math.random(),
            code: icdCode.code,
            name: icdCode.name,
            category: icdCode.category,
            isPrimary: diagnoses.length === 0, // First diagnosis is primary by default
            notes: ''
        };

        const updated = [...diagnoses, newDiagnosis];
        setDiagnoses(updated);
        if (onChange) {
            onChange(updated);
        }
        setSearchQuery('');
        setShowResults(false);
    };

    const handleDiagnosisRemove = (id) => {
        const filtered = diagnoses.filter(d => d.id !== id);

        // If we removed the primary diagnosis, make the first remaining one primary
        if (filtered.length > 0 && !filtered.some(d => d.isPrimary)) {
            filtered[0].isPrimary = true;
        }

        setDiagnoses(filtered);
        if (onChange) {
            onChange(filtered);
        }
    };

    const handleDiagnosisUpdate = (id, field, value) => {
        const updated = diagnoses.map(d => {
            if (d.id === id) {
                // If setting as primary, unset others
                if (field === 'isPrimary' && value === true) {
                    diagnoses.forEach(otherD => {
                        if (otherD.id !== id) otherD.isPrimary = false;
                    });
                }
                return { ...d, [field]: value };
            }
            return d;
        });

        setDiagnoses(updated);
        if (onChange) {
            onChange(updated);
        }
    };

    const filteredCodes = ICD_10_CODES.filter(code => {
        const matchesSearch = searchQuery === '' ||
            code.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            code.code.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === '' || code.category === selectedCategory;

        // Don't show already selected codes
        const notAlreadySelected = !diagnoses.some(d => d.code === code.code);

        return matchesSearch && matchesCategory && notAlreadySelected;
    });

    const primaryDiagnosis = diagnoses.find(d => d.isPrimary);
    const secondaryDiagnoses = diagnoses.filter(d => !d.isPrimary);

    return (
        <div className={className}>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Diagnosis Codes (ICD-10)
                </h2>
                <p className="text-sm text-slate-600">
                    Search and add ICD-10 diagnosis codes for medical documentation and billing
                </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
                <div className="flex gap-3 mb-3">
                    <div className="flex-1 relative">
                        <div className="flex">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowResults(e.target.value.length > 1);
                                }}
                                placeholder="Search ICD-10 codes by name or code..."
                                className="flex-1 px-3 py-2 border border-slate-200 rounded-l-lg focus:outline-none focus:border-blue-400 text-sm"
                            />
                            <div className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg flex items-center">
                                <Search className="w-4 h-4 text-slate-500" />
                            </div>
                        </div>

                        {/* Search Results Dropdown */}
                        {showResults && searchQuery.length > 1 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                                {filteredCodes.length > 0 ? (
                                    filteredCodes.slice(0, 10).map(code => (
                                        <button
                                            key={code.code}
                                            type="button"
                                            onClick={() => handleDiagnosisAdd(code)}
                                            className="w-full p-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 focus:outline-none focus:bg-blue-50"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium text-slate-900">
                                                        {code.code} - {code.name}
                                                    </div>
                                                    <div className="text-sm text-slate-600">{code.category}</div>
                                                </div>
                                                <Plus className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-slate-500 text-sm">
                                        No matching ICD-10 codes found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-48 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm"
                    >
                        <option value="">All Categories</option>
                        {ICD_CATEGORIES.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Filter className="w-3 h-3" />
                    <span>
                        {filteredCodes.length} codes available
                        {selectedCategory && ` in ${selectedCategory}`}
                    </span>
                </div>
            </div>

            {/* Selected Diagnoses */}
            {diagnoses.length > 0 && (
                <div className="space-y-4 mb-6">
                    {/* Primary Diagnosis */}
                    {primaryDiagnosis && (
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-600" />
                                Primary Diagnosis
                            </h3>
                            <DiagnosisCard
                                diagnosis={primaryDiagnosis}
                                onUpdate={(field, value) => handleDiagnosisUpdate(primaryDiagnosis.id, field, value)}
                                onRemove={() => handleDiagnosisRemove(primaryDiagnosis.id)}
                                isPrimary={true}
                            />
                        </div>
                    )}

                    {/* Secondary Diagnoses */}
                    {secondaryDiagnoses.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                Secondary Diagnoses ({secondaryDiagnoses.length})
                            </h3>
                            <div className="space-y-3">
                                {secondaryDiagnoses.map(diagnosis => (
                                    <DiagnosisCard
                                        key={diagnosis.id}
                                        diagnosis={diagnosis}
                                        onUpdate={(field, value) => handleDiagnosisUpdate(diagnosis.id, field, value)}
                                        onRemove={() => handleDiagnosisRemove(diagnosis.id)}
                                        onSetPrimary={() => handleDiagnosisUpdate(diagnosis.id, 'isPrimary', true)}
                                        isPrimary={false}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Add Common Codes */}
            <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">Common ICD-10 Codes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {ICD_10_CODES.slice(0, 9).map(code => {
                        const isSelected = diagnoses.some(d => d.code === code.code);
                        return (
                            <button
                                key={code.code}
                                type="button"
                                onClick={() => !isSelected && handleDiagnosisAdd(code)}
                                disabled={isSelected}
                                className={`p-3 text-left border rounded-lg text-sm transition-colors ${
                                    isSelected
                                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                            >
                                <div className="font-medium">{code.code}</div>
                                <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                                    {code.name}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ICD Guidelines */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-800 text-sm mb-1">
                            ICD-10 Coding Guidelines
                        </h4>
                        <ul className="text-xs text-amber-700 space-y-0.5">
                            <li>• Primary diagnosis should be the main condition being treated</li>
                            <li>• List secondary diagnoses in order of clinical significance</li>
                            <li>• Use the most specific code available that accurately describes the condition</li>
                            <li>• Ensure all diagnoses are supported by clinical documentation</li>
                            <li>• Review codes for accuracy before finalizing the consultation</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <span>Total Diagnoses: {diagnoses.length}</span>
                <span>
                    Primary: {primaryDiagnosis ? '1' : '0'} | Secondary: {secondaryDiagnoses.length}
                </span>
            </div>
        </div>
    );
};

// Individual Diagnosis Card Component
const DiagnosisCard = ({ diagnosis, onUpdate, onRemove, onSetPrimary, isPrimary }) => {
    return (
        <div className={`border rounded-lg p-4 ${isPrimary ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900">{diagnosis.code}</span>
                        {isPrimary && <Star className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div className="text-sm text-slate-700 mb-1">{diagnosis.name}</div>
                    <div className="text-xs text-slate-500">{diagnosis.category}</div>
                </div>
                <div className="flex items-center gap-2">
                    {!isPrimary && (
                        <button
                            type="button"
                            onClick={onSetPrimary}
                            className="text-xs text-amber-600 hover:text-amber-800 font-medium"
                        >
                            Set Primary
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Notes */}
            <textarea
                value={diagnosis.notes}
                onChange={(e) => onUpdate('notes', e.target.value)}
                placeholder="Optional notes or additional details..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 text-sm resize-none"
                rows="2"
            />
        </div>
    );
};

export default DiagnosisCodeSearch;