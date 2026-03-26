import React from 'react';
import { Clock } from 'lucide-react';

/**
 * TimePicker Component
 *
 * @param {string} label - TimePicker label
 * @param {string} value - Time value (HH:mm format)
 * @param {function} onChange - Change handler
 * @param {string} error - Error message
 * @param {boolean} disabled - Disabled state
 * @param {boolean} required - Required field
 * @param {string} className - Additional CSS classes
 */
const TimePicker = ({
    label,
    value,
    onChange,
    error,
    disabled = false,
    required = false,
    className = '',
    ...props
}) => {
    return (
        <div className={`space-y-3 ${className}`}>
            {label && (
                <label className="text-xs font-black uppercase tracking-widest text-slate-700 italic flex items-center gap-2">
                    {label}
                    {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <div className="relative">
                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none z-10" />
                <input
                    type="time"
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`
                        w-full bg-white border-2 border-slate-200
                        rounded-[2rem] py-4 px-6 pl-14
                        font-bold text-slate-900 italic
                        outline-none
                        focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10
                        disabled:bg-slate-50 disabled:cursor-not-allowed
                        transition-all
                        ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-xs text-rose-600 font-bold italic pl-2">
                    {error}
                </p>
            )}
        </div>
    );
};

export default TimePicker;
