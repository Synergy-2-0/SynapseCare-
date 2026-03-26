import React from 'react';
import { AlertTriangle, Phone } from 'lucide-react';

/**
 * RedFlagBanner Component
 *
 * Emergency warning banner for dangerous symptom combinations
 * Critical medical alert styling with action buttons
 */
const RedFlagBanner = ({
    warning,
    severity = 'high',
    onCallEmergency,
    onFindEmergency,
    className = ''
}) => {

    if (!warning) return null;

    const severityStyles = {
        critical: {
            bg: 'bg-rose-600',
            text: 'text-white',
            icon: 'text-white',
            border: 'border-rose-600',
            pulse: true
        },
        high: {
            bg: 'bg-amber-600',
            text: 'text-white',
            icon: 'text-white',
            border: 'border-amber-600',
            pulse: false
        }
    };

    const styles = severityStyles[severity] || severityStyles.high;

    return (
        <div className={`${className} mb-6`}>
            <div className={`
                ${styles.bg} ${styles.border} border-2 rounded-lg p-4
                ${styles.pulse ? 'animate-pulse' : ''}
                shadow-lg
            `}>
                <div className="flex items-start gap-3">
                    {/* Warning Icon */}
                    <div className="flex-shrink-0">
                        <AlertTriangle className={`w-6 h-6 ${styles.icon}`} />
                    </div>

                    {/* Warning Content */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h3 className={`font-bold text-sm ${styles.text}`}>
                                MEDICAL ALERT
                            </h3>
                            {severity === 'critical' && (
                                <span className="px-2 py-0.5 bg-white bg-opacity-20 rounded text-xs font-medium">
                                    URGENT
                                </span>
                            )}
                        </div>
                        <p className={`text-sm ${styles.text} mb-3 leading-relaxed`}>
                            {warning}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            {severity === 'critical' && (
                                <button
                                    onClick={onCallEmergency}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-rose-700 rounded-lg font-medium text-sm hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-rose-600"
                                >
                                    <Phone className="w-4 h-4" />
                                    Call 119 Emergency
                                </button>
                            )}
                            <button
                                onClick={onFindEmergency}
                                className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg font-medium text-sm hover:bg-opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-current"
                            >
                                Find Emergency Center
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Medical Disclaimer */}
            <div className="mt-2 text-xs text-slate-600 text-center">
                This is an automated assessment. When in doubt, always seek immediate medical attention.
            </div>
        </div>
    );
};

export default RedFlagBanner;