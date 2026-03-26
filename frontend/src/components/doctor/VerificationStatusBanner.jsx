import React from 'react';
import { AlertCircle, CheckCircle, XCircle, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const VerificationStatusBanner = ({ status, message }) => {
    if (!status) return null;

    const styles = {
        PENDING: {
            icon: AlertCircle,
            title: 'VERIFICATION CYCLE PENDING',
            description: 'Your clinical identity is currently being synchronized with our global medical registry.',
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            iconColor: 'text-amber-500',
            text: 'text-amber-900',
            badge: 'INTERNAL REVIEW'
        },
        APPROVED: {
            icon: ShieldCheck,
            title: 'CLINICAL IDENTITY VERIFIED',
            description: 'Your practitioners account is fully authorized for global healthcare operations.',
            bg: 'bg-emerald-50',
            border: 'border-emerald-100',
            iconColor: 'text-emerald-500',
            text: 'text-emerald-900',
            badge: 'AUTHORIZED'
        },
        REJECTED: {
            icon: XCircle,
            title: 'IDENTITY MISMATCH DETECTED',
            description: 'Verification failed. Please escalate via the secure support terminal.',
            bg: 'bg-rose-50',
            border: 'border-rose-100',
            iconColor: 'text-rose-500',
            text: 'text-rose-900',
            badge: 'ESCALATION REQUIRED'
        }
    };

    const cfg = styles[status] || styles.PENDING;
    const Icon = cfg.icon;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`${cfg.bg} ${cfg.border} border-2 p-8 rounded-[2.5rem] mb-12 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden shadow-xl shadow-slate-200/50`}
        >
            <div className={`w-20 h-20 rounded-3xl ${cfg.bg} border-2 ${cfg.border} flex items-center justify-center ${cfg.iconColor} shadow-inner shrink-0 relative group`}>
                <Icon size={36} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm animate-bounce">
                    <Zap size={12} className="text-indigo-500" />
                </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2 justify-center sm:justify-start">
                    <h3 className={`text-xl font-black tracking-tighter ${cfg.text}`}>
                        {cfg.title}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${cfg.border} ${cfg.iconColor} bg-white shadow-sm`}>
                        {cfg.badge}
                    </span>
                </div>
                <p className={`text-sm font-medium ${cfg.text} opacity-60 leading-relaxed max-w-2xl`}>
                    {message || cfg.description}
                </p>
            </div>

            <div className="shrink-0 flex gap-2">
                 <button className={`h-11 px-6 bg-white border ${cfg.border} rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all ${cfg.iconColor}`}>
                     Full Protocol
                 </button>
                 {status === 'REJECTED' && (
                     <button className="h-11 px-6 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">
                         Open Escalation
                     </button>
                 )}
            </div>

            {/* Background design flair */}
            <div className="absolute right-0 bottom-0 p-8 opacity-5 pointer-events-none -mr-12 -mb-12">
                 <Icon size={200} strokeWidth={1} />
            </div>
        </motion.div>
    );
};

export default VerificationStatusBanner;
