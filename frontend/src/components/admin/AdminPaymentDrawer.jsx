import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    User, 
    Stethoscope, 
    Receipt, 
    ShieldCheck,
    AlertCircle,
    Download
} from 'lucide-react';

const AdminPaymentDrawer = ({ isOpen, onClose, transaction }) => {
    if (!transaction) return null;

    const isSuccess = transaction.status === 'SUCCESS';
    const isRefunded = transaction.status === 'REFUNDED';

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: transaction.currency || 'LKR',
        }).format(amount);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
                    />
                    <motion.div 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-[450px] bg-white shadow-2xl z-[70] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 uppercase">Transaction Audit</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">
                                        Settlement Shard: {transaction.paymentId.substring(0, 12)}
                                    </p>
                                </div>
                                <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                                    <X size={20} strokeWidth={1.5} />
                                </button>
                            </div>

                            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                                isSuccess ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                                isRefunded ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                                'bg-rose-50 border-rose-100 text-rose-700'
                            }`}>
                                <div className="flex items-center gap-3">
                                    {isSuccess ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{transaction.status}</span>
                                </div>
                                <span className="text-[14px] font-bold tabular-nums">{formatMoney(transaction.amount)}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Clinical Context */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Context</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Patient Entity</p>
                                            <p className="text-xs font-bold text-slate-900">{transaction.patientName || 'Clinical Record Placeholder'}</p>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase">{transaction.patientEmail || 'Auth ID: 0x' + transaction.patientId}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white">
                                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                            <Stethoscope size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Provider Shard</p>
                                            <p className="text-xs font-bold text-slate-900">{transaction.doctorName || 'Faculty Clinician'}</p>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase">{transaction.doctorSpecialization || 'System Consultation'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Settlement Ledger Timeline */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Settlement Pulse</h4>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1 rounded-full bg-emerald-500" />
                                    <div className="flex-1 h-1 rounded-full bg-emerald-500" />
                                    <div className={`flex-1 h-1 rounded-full ${transaction.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                </div>
                                <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                                    <span>Auth</span>
                                    <span>Cleared</span>
                                    <span>Settled</span>
                                </div>
                            </div>

                            {/* Value Breakdown */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Value Breakdown</h4>
                                <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-400 uppercase">Consultation Fee</span>
                                        <span className="text-slate-900">{formatMoney(transaction.consultationFee || transaction.amount * 0.8)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold border-b border-slate-200 pb-3">
                                        <span className="text-slate-400 uppercase">Platform Service Fee</span>
                                        <span className="text-slate-900">{formatMoney(transaction.serviceFee || transaction.amount * 0.2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold pt-1">
                                        <span className="text-slate-900 uppercase">Total Settlement</span>
                                        <span className="text-emerald-600">{formatMoney(transaction.amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Global Settlement Verification */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Settlement Verification</h4>
                                    <span className="flex items-center gap-1 text-[8px] font-bold text-slate-400 uppercase border border-slate-200 px-2 py-0.5 rounded-full bg-slate-50">
                                        <ShieldCheck size={10} className="text-emerald-500" />
                                        Restricted Audit Shard
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                            <span className="text-slate-400">Network ID:</span>
                                            <span className="text-slate-900 font-mono">{transaction.transactionReference || 'Internal Sync Agent'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                            <span className="text-slate-400">Clearing Channel:</span>
                                            <span className="text-slate-900">{transaction.method || 'STRIPE_GLOBAL'}</span>
                                        </div>
                                        <div className="pt-4 border-t border-slate-200 flex justify-between gap-2">
                                            <div className="flex-1 p-3 rounded-xl bg-white border border-slate-100 flex flex-col gap-1">
                                                <span className="text-[8px] font-bold text-slate-400 uppercase">Risk Level</span>
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Low Intensity</span>
                                            </div>
                                            <div className="flex-1 p-3 rounded-xl bg-white border border-slate-100 flex flex-col gap-1">
                                                <span className="text-[8px] font-bold text-slate-400 uppercase">Auth Code</span>
                                                <span className="text-[10px] font-bold text-slate-900 font-mono tracking-widest">982341</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-slate-400 italic text-center px-4 leading-relaxed">
                                        This shard has been cleared through the SynapCare Global Settlement Network and verified against original clinician case ID.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-slate-100 bg-slate-50/10 flex flex-col gap-3">
                            {transaction.receiptUrl && (
                                <a 
                                    href={transaction.receiptUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-full py-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm shadow-slate-100"
                                >
                                    <Receipt size={14} />
                                    View Digital Receipt
                                </a>
                            )}
                            <button className="w-full py-4 rounded-2xl bg-slate-900 text-white flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                                <Download size={14} />
                                Export Audit Report
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AdminPaymentDrawer;
