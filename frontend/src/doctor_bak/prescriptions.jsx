import React, { useState, useContext } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import { Search, Plus, Filter, FileText, Download, Activity, Heart, Eye, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MockDataContext } from '../../context/MockDataContext';
import { ToastContext } from '../../context/ToastContext';

const prescriptionSchema = z.object({
  patientName: z.string().min(1, "Patient is required"),
  diagnosis: z.string().min(3, "Diagnosis is required"),
  instructions: z.string().optional(),
  medications: z.array(z.object({
    drugName: z.string().min(2, "Drug name required"),
    dosage: z.string().min(1, "Dosage required"),
    frequency: z.string().min(1, "Frequency required"),
    duration: z.string().min(1, "Duration required"),
    route: z.string().min(1, "Route required")
  })).min(1, "At least one medication is required")
});

export default function Prescriptions() {
    const [draftOpen, setDraftOpen] = useState(false);
    const { prescriptions, addPrescription } = useContext(MockDataContext);
    const { showToast } = useContext(ToastContext);

    const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(prescriptionSchema),
        defaultValues: {
            patientName: '',
            diagnosis: '',
            instructions: '',
            medications: [{ drugName: '', dosage: '', frequency: 'BID', duration: '', route: 'Oral' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "medications"
    });

    const onSubmit = async (data) => {
        try {
            await addPrescription(data);
            showToast('success', 'Prescription issued successfully!');
            setDraftOpen(false);
            reset();
        } catch (error) {
            showToast('error', 'Failed to issue prescription');
        }
    };

    return (
        <DashboardLayout>
            <Header title="Prescriptions" subtitle="Manage and issue e-prescriptions" />
            
            <div className="flex justify-between items-center mb-6 mt-6">
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] h-4 w-4" />
                        <input type="text" placeholder="Search patient ID or name..." className="input-field !pl-10 !w-80 !rounded-[var(--radius-2xl)] !shadow-sm !bg-white" />
                    </div>
                </div>
                <button 
                    onClick={() => { reset(); setDraftOpen(true); }}
                    className="btn-primary !rounded-xl"
                >
                    <Plus className="h-4 w-4" /> Issue New
                </button>
            </div>

            <div className="surface-card !rounded-[var(--radius-3xl)] overflow-hidden border-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-base)] text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold">
                                <th className="p-4 w-12 text-center">RX#</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Patient</th>
                                <th className="p-4">Diagnosis</th>
                                <th className="p-4">Medications</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)] text-sm">
                            {prescriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-[var(--text-muted)]">No prescriptions found.</td>
                                </tr>
                            ) : (
                                prescriptions.map((px, idx) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={px.id} 
                                        className="hover:bg-[var(--bg-hover)] transition-colors group"
                                    >
                                        <td className="p-4 text-[var(--text-muted)] font-mono text-xs text-center">{px.id}</td>
                                        <td className="p-4 text-[var(--text-primary)]">{px.date}</td>
                                        <td className="p-4 font-bold text-[var(--accent-teal)]">{px.patient}</td>
                                        <td className="p-4 text-[var(--text-secondary)]">{px.dx}</td>
                                        <td className="p-4 text-[var(--text-secondary)]">
                                            {px.meds.map((m, i) => (
                                                <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-bold border border-slate-200 mr-2">{m}</span>
                                            ))}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${px.status === 'Signed' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}`}>
                                                {px.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-teal)] bg-white border border-[var(--border-color)] rounded shadow-sm"><Eye className="w-4 h-4" /></button>
                                            <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-teal)] bg-white border border-[var(--border-color)] rounded shadow-sm"><Download className="w-4 h-4" /></button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-In Modal Form */}
            <AnimatePresence>
                {draftOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex justify-end"
                    >
                        <motion.div 
                            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="glass-morphism w-full max-w-2xl h-full shadow-[var(--shadow-premium-lg)] flex flex-col border-l border-white/50 backdrop-blur-3xl !rounded-l-[var(--radius-3xl)] my-2"
                        >
                            <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
                                <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-base)]">
                                    <div>
                                        <h2 className="text-xl font-bold font-serif text-[var(--text-primary)] relative">
                                            <Heart className="absolute -left-6 top-1 text-red-500 w-4 h-4" /> New Prescription
                                        </h2>
                                        <p className="text-xs text-[var(--text-muted)] font-medium mt-1">Structured medication regimen</p>
                                    </div>
                                    <button type="button" onClick={() => setDraftOpen(false)} className="text-[var(--text-muted)] hover:text-red-500 transition-transform hover:rotate-90">
                                        <Plus className="w-6 h-6 rotate-45" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Select Patient</label>
                                        <select {...register("patientName")} className="input-field !shadow-sm">
                                            <option value="">-- Choose Patient --</option>
                                            <option value="Kasun Wijesinghe">Kasun Wijesinghe (ID: SYN-883)</option>
                                            <option value="Nethmi Perera">Nethmi Perera (ID: SYN-214)</option>
                                        </select>
                                        {errors.patientName && <span className="text-xs text-red-500">{errors.patientName.message}</span>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Primary Diagnosis (ICD-10)</label>
                                        <textarea {...register("diagnosis")} rows={2} className="input-field !shadow-sm resize-none" placeholder="e.g. Essential Hypertension"></textarea>
                                        {errors.diagnosis && <span className="text-xs text-red-500">{errors.diagnosis.message}</span>}
                                    </div>

                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                key={field.id} 
                                                className="border border-[var(--border-color)] bg-[var(--bg-base)] rounded-lg overflow-hidden relative shadow-sm"
                                            >
                                                <div className="bg-slate-100 px-4 py-2 border-b border-[var(--border-color)] font-bold text-xs text-[var(--text-secondary)] flex justify-between items-center">
                                                    Medication {index + 1}
                                                    {fields.length > 1 && (
                                                        <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 flex items-center gap-1">
                                                            <Trash2 className="w-3 h-3" /> Remove
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                                                    <div className="col-span-2">
                                                        <input {...register(\medications.\.drugName\)} type="text" placeholder="Drug Name (e.g. Amoxicillin 500mg)" className="col-span-2 w-full p-2 border-b border-dashed border-[var(--border-color)] bg-transparent outline-none focus:border-slate-400 font-bold text-[var(--text-primary)]" />
                                                        {errors?.medications?.[index]?.drugName && <span className="text-xs text-red-500">{errors.medications[index].drugName.message}</span>}
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Dosage</label>
                                                        <input {...register(\medications.\.dosage\)} type="text" placeholder="e.g. 1 Tablet" className="w-full p-2 bg-white border border-[var(--border-color)] rounded shadow-sm outline-none focus:ring-1 focus:ring-[var(--accent-teal)]" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Frequency</label>
                                                        <select {...register(\medications.\.frequency\)} className="w-full p-2 bg-white border border-[var(--border-color)] rounded shadow-sm outline-none focus:ring-1 focus:ring-[var(--accent-teal)]">
                                                            <option value="BID">BID (Twice a day)</option>
                                                            <option value="TID">TID (Three times a day)</option>
                                                            <option value="QD">QD (Daily)</option>
                                                            <option value="PRN">PRN (As needed)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Duration</label>
                                                        <input {...register(\medications.\.duration\)} type="text" placeholder="e.g. 5 Days" className="w-full p-2 bg-white border border-[var(--border-color)] rounded shadow-sm outline-none focus:ring-1 focus:ring-[var(--accent-teal)]" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-[var(--text-muted)] block mb-1">Route</label>
                                                        <select {...register(\medications.\.route\)} className="w-full p-2 bg-white border border-[var(--border-color)] rounded shadow-sm outline-none focus:ring-1 focus:ring-[var(--accent-teal)]">
                                                            <option value="Oral">Oral</option>
                                                            <option value="Topical">Topical</option>
                                                            <option value="Injection">Injection</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {errors.medications && <span className="text-xs text-red-500 block">{errors.medications.message}</span>}

                                    <button type="button" onClick={() => append({ drugName: '', dosage: '', frequency: 'BID', duration: '', route: 'Oral' })} className="w-full py-3 border-2 border-dashed border-[var(--border-color)] rounded-lg text-sm font-bold text-[var(--text-muted)] hover:text-[var(--accent-teal)] hover:border-[var(--accent-teal)] transition-colors active:scale-[0.98]">
                                        + Add Another Medication
                                    </button>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Instructions / Notes</label>
                                        <textarea {...register("instructions")} rows={3} className="w-full p-3 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-[var(--radius-sm)] text-sm shadow-sm outline-none focus:border-[var(--accent-teal)] resize-none" placeholder="Take after meals..."></textarea>
                                    </div>
                                </div>

                                <div className="p-6 border-t border-[var(--border-color)] bg-slate-50 flex gap-4 mt-auto">
                                    <button type="button" onClick={() => setDraftOpen(false)} className="flex-1 py-3 px-4 bg-white border border-[var(--border-color)] rounded-[var(--radius-sm)] text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">Discard</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 bg-[var(--accent-teal)] text-white rounded-[var(--radius-sm)] text-sm font-bold shadow-sm flex justify-center items-center gap-2 hover:bg-teal-700 transition-colors disabled:opacity-50">
                                        {isSubmitting ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <><Activity className="w-4 h-4"/> Sign & Issue</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
