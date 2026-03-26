import React from 'react';

/**
 * Textarea Component
 *
 * @param {string} label - Textarea label
 * @param {string} value - Textarea value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {number} rows - Number of rows
 * @param {string} error - Error message
 * @param {boolean} disabled - Disabled state
 * @param {boolean} required - Required field
 * @param {string} className - Additional CSS classes
 */
const Textarea = ({
    label,
    value,
    onChange,
    placeholder,
    rows = 4,
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
            <textarea
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                className={`
                    w-full bg-white border border-slate-200
                    rounded-xl py-3 px-4
                    text-slate-900
                    placeholder:text-slate-400
                    outline-none
                    focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100
                    disabled:bg-slate-100 disabled:cursor-not-allowed
                    transition-all duration-200
                    resize-none
                    ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-100' : ''}
                `}
                {...props}
            />
            {error && (
                <p className="text-xs text-rose-600 font-medium pl-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Textarea;
