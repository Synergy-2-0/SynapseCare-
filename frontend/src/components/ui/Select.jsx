import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select Component
 *
 * @param {string} label - Select label
 * @param {Array} options - Array of { value, label } options
 * @param {string} value - Selected value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message
 * @param {boolean} disabled - Disabled state
 * @param {boolean} required - Required field
 * @param {string} className - Additional CSS classes
 */
const Select = ({
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Select an option',
    error,
    disabled = false,
    required = false,
    className = '',
    ...props
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    {label}
                    {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`
                        w-full bg-white border border-slate-200
                        rounded-xl py-3 px-4 pr-10
                        text-slate-900
                        outline-none
                        focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100
                        disabled:bg-slate-100 disabled:cursor-not-allowed
                        transition-all duration-200
                        appearance-none cursor-pointer
                        ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-100' : ''}
                        ${!value ? 'text-slate-400' : ''}
                    `}
                    {...props}
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
            {error && (
                <p className="text-xs text-rose-600 font-medium pl-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Select;
