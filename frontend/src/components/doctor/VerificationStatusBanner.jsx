import React from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

/**
 * VerificationStatusBanner Component
 *
 * Displays doctor verification status - professional healthcare styling
 *
 * @param {string} status - 'PENDING' | 'APPROVED' | 'REJECTED'
 * @param {string} message - Optional custom message
 */
const VerificationStatusBanner = ({ status, message }) => {
    if (!status) return null;

    const config = {
        PENDING: {
            icon: AlertCircle,
            title: 'Verification Pending',
            message: 'Your profile is under review. You can start receiving appointments once approved.',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            iconColor: 'text-amber-600',
            textColor: 'text-amber-800'
        },
        APPROVED: {
            icon: CheckCircle,
            title: 'Verified Doctor',
            message: 'Your profile has been verified. You can now receive appointment requests.',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            iconColor: 'text-emerald-600',
            textColor: 'text-emerald-800'
        },
        REJECTED: {
            icon: XCircle,
            title: 'Verification Issue',
            message: 'Your verification was not approved. Please contact support.',
            bgColor: 'bg-rose-50',
            borderColor: 'border-rose-200',
            iconColor: 'text-rose-600',
            textColor: 'text-rose-800'
        }
    };

    const cfg = config[status];
    if (!cfg) return null;

    const Icon = cfg.icon;

    return (
        <div className={`${cfg.bgColor} ${cfg.borderColor} border px-5 py-4 rounded-lg mb-6 flex items-start gap-3`}>
            <Icon className={`w-5 h-5 ${cfg.iconColor} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
                <h3 className={`font-semibold text-sm ${cfg.textColor} mb-0.5`}>
                    {cfg.title}
                </h3>
                <p className={`text-sm ${cfg.textColor} opacity-80`}>
                    {message || cfg.message}
                </p>
            </div>
        </div>
    );
};

export default VerificationStatusBanner;
