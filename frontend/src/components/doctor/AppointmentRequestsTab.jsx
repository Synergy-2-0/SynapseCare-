import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, User, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentRequestsTab = ({ appointments, onAction, onViewPatient }) => {
    const pendingAppts = appointments.filter(a => a.status === 'PENDING');

    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const handleRejectSubmit = (id) => {
        onAction(id, 'reject', rejectReason);
        setRejectingId(null);
        setRejectReason('');
    };

    if (pendingAppts.length === 0) {
        return (
            <div className="surface-card bg-white p-12 flex flex-col items-center justify-center min-h-[500px]">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex flex-col items-center justify-center mb-6 border border-slate-100 shadow-sm">
                    <CheckCircle className="w-10 h-10 text-teal-300" />
                </div>
                <h3 className="text-2xl font-serif text-slate-800 mb-2">All Caught Up!</h3>
                <p className="text-slate-500 font-medium">You have no pending appointment requests to review.</p>
            </div>
        );
    }

    return (
        <div className="surface-card bg-white min-h-[600px] flex flex-col border border-slate-200">
            <div className="p-8 border-b border-[var(--border-color)] bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-serif text-slate-900 flex items-center gap-3">
                        Appointment Requests
                        <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">{pendingAppts.length} Pending</span>
                    </h3>
                    <p className="text-slate-500 font-medium mt-1">Review and manage incoming consultations</p>
                </div>
            </div>

            <div className="p-8 pb-12 flex-1 bg-slate-50/20">
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence>
                        {pendingAppts.map(appt => (
                            <motion.div 
                                key={appt.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                            >
                                {/* Mode Indicator Banner */}
                                <div className={`absolute left-0 top-0 bottom-0 w-2 ${appt.mode === 'TELEMEDICINE' || appt.type === 'TELEMEDICINE' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />

                                <div className="pl-4 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
                                    <div className="flex gap-6 items-center">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shadow-inner">
                                            <span className="text-xs font-bold text-slate-400 uppercase">{appt.date?.split('-')[1] || 'MON'}</span>
                                            <span className="text-xl font-serif font-bold text-slate-800">{appt.date?.split('-')[2] || '12'}</span>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-lg font-serif font-bold text-slate-900">Patient #{appt.patientId}</h4>
                                                <span className={`px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold rounded-lg border ${appt.mode === 'TELEMEDICINE' || appt.type === 'TELEMEDICINE' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                                    {appt.mode === 'TELEMEDICINE' || appt.type === 'TELEMEDICINE' ? 'Video Consult' : 'In-Person Sync'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                                                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> {appt.time}</div>
                                                <div className="flex items-center gap-1.5 cursor-pointer hover:text-teal-600 transition-colors" onClick={() => onViewPatient && onViewPatient(appt)}>
                                                    <FileText className="w-4 h-4 text-slate-400" /> View History
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {rejectingId === appt.id ? (
                                        <div className="flex-1 flex items-center gap-3 bg-rose-50 p-3 rounded-2xl border border-rose-100 w-full xl:w-auto xl:ml-8 animate-in fade-in slide-in-from-right-4">
                                            <input 
                                                type="text" 
                                                placeholder="Reason for rejection (optional)..." 
                                                className="flex-1 bg-white border border-rose-200 outline-none px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700"
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                                autoFocus
                                            />
                                            <button onClick={() => handleRejectSubmit(appt.id)} className="px-4 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-rose-700 transition-colors whitespace-nowrap">
                                                Confirm Reject
                                            </button>
                                            <button onClick={() => setRejectingId(null)} className="px-4 py-2.5 text-slate-500 hover:bg-rose-100 rounded-xl text-sm font-bold transition-colors">
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 w-full xl:w-auto">
                                            <button 
                                                onClick={() => onAction(appt.id, 'accept', null)}
                                                className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-200 hover:border-emerald-500 rounded-xl font-bold transition-all shadow-sm group"
                                            >
                                                <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> Approve
                                            </button>
                                            <button 
                                                onClick={() => setRejectingId(appt.id)}
                                                className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-600 hover:text-rose-600 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 rounded-xl font-bold transition-all shadow-sm group"
                                            >
                                                <XCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AppointmentRequestsTab;