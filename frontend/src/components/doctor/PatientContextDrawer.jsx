import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Activity, HeartPulse, Shield, FileText, BrainCircuit, PlayCircle, PlusCircle } from 'lucide-react';

export default function PatientContextDrawer({ isOpen, onClose, appointment }) {
    if (!appointment) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dark Glass Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                    />

                    {/* Right-Side Drawer */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } }}
                        exit={{ x: '100%', opacity: 0 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-[500px] bg-white border-l border-slate-200 z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <div className="flex items-center gap-3 text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">
                                    <Activity className="w-4 h-4" /> Clinical Context
                                </div>
                                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                                    {appointment.name || `Patient #${appointment.patientId || appointment.id}`}
                                </h2>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 shadow-sm transition-all group">
                                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Body content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20">
                            {/* AI Summary Block */}
                            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[2rem] border border-indigo-100/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <BrainCircuit className="w-5 h-5 text-indigo-600" />
                                    <div className="text-xs font-bold uppercase tracking-widest text-indigo-600">Synapcare AI Insights</div>
                                </div>
                                <div className="text-slate-700 text-sm leading-relaxed font-medium">
                                    Patient reported recurring symptoms matching <span className="font-bold text-indigo-900 bg-indigo-100/50 px-2 py-0.5 rounded">Migraine</span> context via the preliminary Symptom Checker at {appointment.time || '10:00 AM'}. Elevated stress levels noted in triage forms.
                                </div>
                            </div>

                            {/* Vitals Grid */}
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
                                    <HeartPulse className="w-4 h-4" /> Last Recorded Vitals
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                        <div className="text-[11px] font-bold text-slate-400 uppercase">Blood Pressure</div>
                                        <div className="text-xl font-black tracking-tight text-slate-900 mt-1">120/80</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                        <div className="text-[11px] font-bold text-slate-400 uppercase">Heart Rate</div>
                                        <div className="text-xl font-black tracking-tight text-slate-900 mt-1">72 bpm</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                        <div className="text-[11px] font-bold text-slate-400 uppercase">Temperature</div>
                                        <div className="text-xl font-black tracking-tight text-slate-900 mt-1">98.6°F</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                        <div className="text-[11px] font-bold text-slate-400 uppercase">Weight</div>
                                        <div className="text-xl font-black tracking-tight text-slate-900 mt-1">165 lbs</div>
                                    </div>
                                </div>
                            </div>

                            {/* Medical History */}
                            <div className="surface-card p-6 bg-white border border-slate-100">
                                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-700 mb-4">
                                    <FileText className="w-4 h-4" /> Health Record
                                </h4>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 rounded-full border border-teal-500 bg-teal-100 flex-shrink-0"></div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-700">Allergies</div>
                                            <div className="text-xs text-slate-500 font-medium mt-0.5">Penicillin (Mild Rash)</div>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <div className="mt-1 w-2 h-2 rounded-full border border-teal-500 bg-teal-100 flex-shrink-0"></div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-700">Pre-existing</div>
                                            <div className="text-xs text-slate-500 font-medium mt-0.5">Type 2 Diabetes (Managed)</div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-4">
                            <button className="col-span-2 py-4 rounded-[1.2rem] bg-teal-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 hover:bg-teal-700 transition-all hover:-translate-y-0.5">
                                <PlayCircle className="w-5 h-5" /> Begin Appointment
                            </button>
                            <button className="py-3 rounded-[1rem] bg-slate-50 border border-slate-200 text-slate-600 font-semibold flex items-center justify-center gap-2 text-sm hover:bg-slate-100 transition-colors">
                                <FileText className="w-4 h-4" /> View full chart
                            </button>
                            <button className="py-3 rounded-[1rem] bg-slate-50 border border-slate-200 text-slate-600 font-semibold flex items-center justify-center gap-2 text-sm hover:bg-slate-100 transition-colors">
                                <PlusCircle className="w-4 h-4" /> Add Note
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}