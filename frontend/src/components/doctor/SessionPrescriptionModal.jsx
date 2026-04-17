import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Pill, Send, ShieldCheck, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { prescriptionApi, appointmentApi } from '@/lib/api';
import SOAPNotes from './SOAPNotes';

const SessionPrescriptionModal = ({ session, onClose, doctorId }) => {
    const [submitting, setSubmitting] = useState(false);
    const [medications, setMedications] = useState([{ name: '', dosage: '', duration: '', labTest: '', instructions: '' }]);

    if (!session) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            let rxCount = 0;
            // 1. Issue Prescriptions if any are filled
            for (const med of medications) {
                if (med.name && med.name.trim() !== '') {
                    await prescriptionApi.post('/create', {
                        appointmentId: session.id,
                        doctorId: parseInt(doctorId),
                        patientId: parseInt(session.patientId || 0),
                        medicineName: med.name,
                        dosage: med.dosage,
                        duration: med.duration,
                        instructions: med.instructions,
                        followUpNotes: session.inheritedNotes || '',
                        createdDate: new Date().toISOString()
                    });
                    rxCount++;
                }
            }

            // 2. Explicitly Complete the Appointment Session
            await appointmentApi.patch(`/${session.id}/status?status=COMPLETED`);

            if (rxCount > 0) {
                toast.success(`Consultation finalized with ${rxCount} prescriptions.`);
            } else {
                toast.success("Consultation notes saved and session completed.");
            }
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Failed to finalize clinical session.");
        } finally {
            setSubmitting(false);
        }
    };

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', duration: '', instructions: '' }]);
    };

    const updateMedication = (index, field, value) => {
        const newMeds = [...medications];
        newMeds[index][field] = value;
        setMedications(newMeds);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                    className="w-full max-w-6xl h-[85vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
                >
                    <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif text-slate-900 font-semibold tracking-tight">Post-Session Context & e-Rx</h2>
                                <p className="text-xs text-slate-500 font-medium tracking-wider uppercase mt-0.5">{session.patientName || `Patient #${session.patientId}`} • Visit #{session.id}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Left Side: SOAP Notes */}
                        <div className="w-1/2 border-r border-slate-100 bg-slate-50/30 overflow-y-auto p-8 custom-scrollbar">
                            <div className="flex items-center gap-2 mb-6 text-indigo-700">
                                <FileText className="w-5 h-5" />
                                <h3 className="text-lg font-serif font-medium">Session Consultation Notes</h3>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 pointer-events-none">
                                <SOAPNotes appointmentId={session.id} initialNotes={session.inheritedNotes} readOnly />
                            </div>
                            {session.inheritedNotes && (
                                <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-sm text-indigo-800">
                                    <strong className="block mb-1">Inherited Telemedicine Notes:</strong>
                                    {session.inheritedNotes}
                                </div>
                            )}
                        </div>

                        {/* Right Side: e-Prescription Builder */}
                        <div className="w-1/2 bg-white overflow-y-auto p-8 custom-scrollbar relative">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-2 text-teal-700">
                                    <Pill className="w-5 h-5" />
                                    <h3 className="text-lg font-serif font-medium">Treatment Plan</h3>
                                </div>
                                <button onClick={addMedication} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors">
                                    + Add Medication
                                </button>
                            </div>

                            <form id="rx-form" onSubmit={handleSubmit} className="space-y-6 pb-24">
                                {medications.map((med, i) => (
                                    <motion.div key={i} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-slate-50/50 border border-slate-200 rounded-[1.5rem] relative group">
                                        <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm">{i+1}</div>
                                        <div className="grid grid-cols-2 gap-5 mb-5">
                                            <div>
                                                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Drug Name</label>
                                                <input value={med.name} onChange={e => updateMedication(i, 'name', e.target.value)} placeholder="e.g. Amoxicillin (Optional)" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Dosage</label>
                                                <input value={med.dosage} onChange={e => updateMedication(i, 'dosage', e.target.value)} placeholder="e.g. 500mg" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Duration</label>
                                                <input value={med.duration} onChange={e => updateMedication(i, 'duration', e.target.value)} placeholder="e.g. 7 Days" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Lab Test (if needed)</label>
                                                <input value={med.labTest} onChange={e => updateMedication(i, 'labTest', e.target.value)} placeholder="e.g. CBC, LFT" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all" />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-1.5 block">Instructions</label>
                                            <textarea value={med.instructions} onChange={e => updateMedication(i, 'instructions', e.target.value)} placeholder="e.g. Take 2 times a day" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all resize-y min-h-[80px]" />
                                        </div>
                                        {medications.length > 1 && (
                                            <button type="button" onClick={() => setMedications(medications.filter((_, idx) => idx !== i))} className="absolute right-4 top-4 text-slate-300 hover:text-rose-500 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </form>

                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                                <button type="submit" form="rx-form" disabled={submitting} className="w-full py-4 text-white bg-teal-600 hover:bg-teal-700 rounded-2xl shadow-lg shadow-teal-600/20 font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                                    {submitting ? 'Authenticating & Finalizing...' : 'Complete Consultation Session'} <CheckCircle size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SessionPrescriptionModal;