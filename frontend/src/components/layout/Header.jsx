import React from 'react';
import { ChevronRight, Bell } from 'lucide-react';
import Badge from '../ui/Badge';

/**
 * Header Component
 *
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle
 * @param {Array} breadcrumbs - Array of { label, href } breadcrumb items
 * @param {ReactNode} actions - Action buttons
 * @param {object} verificationStatus - { status: 'PENDING'|'APPROVED'|'REJECTED', message: string }
 */
const Header = ({
    title,
    subtitle,
    breadcrumbs,
    actions,
    verificationStatus
}) => {
    return (
        <div className="mb-8">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <div className="flex items-center gap-2 mb-3 text-xs font-medium text-slate-500">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={index}>
                            <span className={index === breadcrumbs.length - 1 ? 'text-blue-600 font-semibold' : ''}>
                                {crumb.label}
                            </span>
                            {index < breadcrumbs.length - 1 && (
                                <ChevronRight className="w-4 h-4" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* Title & Actions */}
            <div className="flex justify-between items-start gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {title}
                        </h1>
                        {verificationStatus && (
                            <Badge
                                variant={
                                    verificationStatus.status === 'APPROVED' ? 'success' :
                                    verificationStatus.status === 'REJECTED' ? 'danger' :
                                    'warning'
                                }
                                size="md"
                            >
                                {verificationStatus.status === 'APPROVED' ? 'Verified' : verificationStatus.message}
                            </Badge>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-slate-600 font-regular text-xs">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex items-center gap-4">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
