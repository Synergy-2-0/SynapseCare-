import React from 'react';
import { ChevronRight, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import Badge from '../ui/Badge';

const Header = ({
    title,
    subtitle,
    breadcrumbs,
    actions,
    verificationStatus
}) => {
    return (
        <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-4">
                    {/* Integrated Breadcrumbs */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={index}>
                                    <span className={index === breadcrumbs.length - 1 ? 'text-indigo-600' : ''}>
                                        {crumb.label}
                                    </span>
                                    {index < breadcrumbs.length - 1 && (
                                        <ChevronRight className="w-3 h-3 text-slate-300" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                            {title}
                        </h1>
                        
                        {verificationStatus && (
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 shadow-sm ${
                                verificationStatus.status === 'APPROVED' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                                {verificationStatus.status === 'APPROVED' ? <ShieldCheck size={14} /> : <AlertCircle size={14} />}
                                {verificationStatus.status === 'APPROVED' ? 'Verified Practitioner' : verificationStatus.message || 'Status Pending'}
                            </div>
                        )}
                    </div>

                    {subtitle && (
                        <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Dashboard Actions Integrated */}
                {actions && (
                    <div className="flex items-center gap-4 shrink-0">
                        {actions}
                    </div>
                )}
            </div>
            
            {/* Horizontal Divider with Subtle Indigo Glow */}
            <div className="mt-10 h-px w-full bg-slate-200 relative">
                 <div className="absolute left-0 top-0 h-px w-32 bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
            </div>
        </div>
    );
};

export default Header;
