import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, PlusCircle, Trash2, FileText, Calculator, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { prescriptionApi } from '@/lib/api';

const IssuePrescription = ({ session, onClose, doctorId }) => {
    const [submitting, setSubmitting] = useState(false);
    const [medications, setMedications] = useState([
        { name: '', instructions: '', unitPrice: 0, quantity: 1, unitDiscount: 0 }
    ]);

    const totals = useMemo(() => {
        return medications.reduce((acc, med) => {
            const sub = (med.unitPrice * med.quantity) - med.unitDiscount;
            return {
                gross: acc.gross + (med.unitPrice * med.quantity),
                discount: acc.discount + med.unitDiscount,
                net: acc.net + Math.max(0, sub)
            };
        }, { gross: 0, discount: 0, net: 0 });
    }, [medications]);

    if (!session) return null;

    const addMedication = () => {
        setMedications([...medications, { name: '', instructions: '', unitPrice: 0, quantity: 1, unitDiscount: 0 }]);
    };

    const updateMedication = (index, field, value) => {
        const newMeds = [...medications];
        if (['unitPrice', 'unitDiscount'].includes(field)) {
            newMeds[index][field] = parseFloat(value) || 0;
        } else if (field === 'quantity') {
            newMeds[index][field] = parseInt(value) || 0;
        } else {
            newMeds[index][field] = value;
        }
        setMedications(newMeds);
    };

    const removeMedication = (index) => {
        if (medications.length === 1) return;
        setMedications(medications.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validMeds = medications.filter(m => m.name && m.name.trim() !== '');
        if (validMeds.length === 0) {
            toast.error("Please add at least one medication to the bill.");
            return;
        }

        setSubmitting(true);
        try {
            const docId = parseInt(doctorId) || 0;
            const patId = parseInt(session.patientId || 0);

            for (const med of validMeds) {
                const payload = {
                    appointmentId: session.id,
                    doctorId: docId,
                    patientId: patId,
                    medicineName: med.name,
                    instructions: med.instructions || '',
                    unitPrice: parseFloat(med.unitPrice || 0),
                    quantity: parseInt(med.quantity || 1),
                    unitDiscount: parseFloat(med.unitDiscount || 0)
                };

                await prescriptionApi.post('/create', payload);
            }
            toast.success("Prescription Bill Finalized & Issued");
            window.open('/doctor/print/bill/' + session.id, '_blank');
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Billing system failed. Please check connectivity.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />
                
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative w-full max-w-5xl bg-slate-50 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white"
                >
                    {/* INVOICE HEADER */}
                    <div className="p-10 border-b border-slate-200 bg-white flex justify-between items-start">
                        <div className="flex gap-6">
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white rotate-3 shadow-xl shadow-slate-200">
                                <FileText size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-2">Prescription Invoice</h2>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-200 pl-3">Reference: APPT-{session.id}</p>
                                <div className="mt-4 flex items-center gap-6">
                                   <div>
                                       <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Patient Reference</span>
                                       <span className="text-sm font-bold text-slate-800">#{session.patientId || 'Unlinked'}</span>
                                   </div>
                                   <div className="w-px h-6 bg-slate-100" />
                                   <div>
                                       <span className="text-[10px] font-black uppercase text-slate-400 block mb-0.5">Billing Date</span>
                                       <span className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                   </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all">
                            <X size={28} />
                        </button>
                    </div>

                    {/* ITEMS TABLE */}
                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-10">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 w-[35%]">Item / Medication</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Unit Price</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Qty</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Discount</th>
                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medications.map((med, i) => (
                                        <tr key={i} className="group border-b border-slate-50 last:border-none">
                                            <td className="p-6">
                                                <div className="space-y-2 relative">
                                                    <input 
                                                        value={med.name}
                                                        onChange={e => updateMedication(i, 'name', e.target.value)}
                                                        placeholder="Medication Name"
                                                        className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-indigo-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 outline-none transition-all"
                                                    />
                                                    <input 
                                                        value={med.instructions}
                                                        onChange={e => updateMedication(i, 'instructions', e.target.value)}
                                                        placeholder="E.g., 500mg - 1 tab BID"
                                                        className="w-full bg-transparent text-[10px] text-slate-500 italic px-4 focus:outline-none"
                                                    />
                                                    {medications.length > 1 && (
                                                        <button 
                                                            onClick={() => removeMedication(i)}
                                                            className="absolute -left-8 top-3 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 group-focus-within:bg-white border border-transparent focus-within:border-indigo-200 transition-all">
                                                    <span className="text-slate-400 text-xs">$</span>
                                                    <input 
                                                        type="number"
                                                        value={med.unitPrice}
                                                        onChange={e => updateMedication(i, 'unitPrice', e.target.value)}
                                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-black text-slate-800 p-2"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <input 
                                                    type="number"
                                                    value={med.quantity}
                                                    onChange={e => updateMedication(i, 'quantity', e.target.value)}
                                                    className="w-16 bg-slate-50 border border-transparent focus:border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-center outline-none"
                                                />
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-3 border border-transparent focus-within:border-rose-200 transition-all">
                                                    <span className="text-rose-400 text-xs">-</span>
                                                    <input 
                                                        type="number"
                                                        value={med.unitDiscount}
                                                        onChange={e => updateMedication(i, 'unitDiscount', e.target.value)}
                                                        className="w-full bg-transparent border-none focus:ring-0 text-sm font-black text-rose-600 p-2"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <span className="text-sm font-black text-slate-900 italic">
                                                    LKR {((med.unitPrice * med.quantity) - med.unitDiscount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-6 bg-slate-50/30 flex justify-start">
                                <button 
                                    type="button" 
                                    onClick={addMedication}
                                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hovber:border-slate-300 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                                >
                                    <PlusCircle size={16} /> Add Line Item
                                </button>
                            </div>
                        </div>

                        {/* BILL SUMMARY */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 h-fit">
                                <div className="flex items-center gap-3 mb-6 text-indigo-600">
                                    <Info size={18} />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Pharmacist Instructions</h4>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed italic">
                                    This bill serves as the official transaction record for the digital prescription. Prices are calculated manually based on the center&apos;s current inventory. Verify quantities before finalizing with the patient.
                                </p>
                            </div>

                            <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl text-white">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                                    <Calculator size={14} /> Total Bill Calculation
                                </h4>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center opacity-60">
                                        <span className="text-sm font-medium">Gross Subtotal</span>
                                        <span className="text-sm font-bold">LKR {totals.gross.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-rose-400">
                                        <span className="text-sm font-medium">Applied Discounts</span>
                                        <span className="text-sm font-bold">(- LKR {totals.discount.toLocaleString()})</span>
                                    </div>
                                    <div className="h-px bg-white/10 my-4" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-black uppercase tracking-widest text-slate-400">Net Payable</span>
                                        <span className="text-4xl font-serif">LKR {totals.net.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="p-10 border-t border-slate-200 bg-white flex justify-end gap-6 items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">
                            Values are automatically calculated per line item.
                        </p>
                        <button 
                            onClick={onClose}
                            className="px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Discard Bill
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-teal-600 text-white px-12 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 shadow-2xl shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-3"
                        >
                            {submitting ? 'Authenticating Bill...' : (
                                <><Save size={20} /> Finalize bill & Issue RX</>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default IssuePrescription;
