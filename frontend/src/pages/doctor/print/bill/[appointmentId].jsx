import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { prescriptionApi } from '@/lib/api';
import Head from 'next/head';

const PrintBill = () => {
    const router = useRouter();
    const { appointmentId } = router.query;
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!appointmentId) return;

        const fetchBill = async () => {
            try {
                const response = await prescriptionApi.get(`/appointment/${appointmentId}`);
                setPrescriptions(response.data);
            } catch (error) {
                console.error("Failed to load bill", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBill();
    }, [appointmentId]);

    useEffect(() => {
        // Automatically open the print dialog when data is loaded
        if (!loading && prescriptions.length > 0) {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [loading, prescriptions]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen text-slate-400">Preparing Bill...</div>;
    }

    if (!prescriptions || prescriptions.length === 0) {
        return <div className="flex items-center justify-center min-h-screen font-black text-rose-500">No billing records found.</div>;
    }

    // Calculations
    const subtotal = prescriptions.reduce((sum, item) => sum + ((item.unitPrice || 0) * (item.quantity || 1)), 0);
    const totalDiscount = prescriptions.reduce((sum, item) => sum + (item.unitDiscount || 0), 0);
    const finalAmount = prescriptions.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

    const docId = prescriptions[0].doctorId;
    const patId = prescriptions[0].patientId;

    return (
        <div className="bg-white min-h-screen text-slate-800 font-sans print:m-0 print:p-0">
            <Head>
                <title>Prescription Bill #{appointmentId}</title>
            </Head>
            
            {/* The Print Layout */}
            <div className="max-w-4xl mx-auto p-12 print:p-8 print:max-w-none print:w-full">
                
                {/* Header Phase */}
                <header className="flex items-center justify-between border-b-4 border-slate-900 pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">SynapsCare</h1>
                        <p className="text-sm font-bold tracking-[0.3em] text-slate-400 uppercase mt-1">Medical Center & Pharmacy</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-black text-slate-300 uppercase tracking-widest">INVOICE & E-RX</h2>
                        <p className="text-sm font-bold text-slate-500 mt-2">Ref: APPT-{appointmentId}</p>
                        <p className="text-xs font-medium text-slate-400">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                </header>

                {/* Patient & Doctor Meta */}
                <div className="grid grid-cols-2 gap-12 border-b border-slate-200 pb-8 mb-8">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Patient Details</h3>
                        <p className="text-xl font-bold text-slate-800">Patient #{patId}</p>
                        <p className="text-sm text-slate-500">Registered Patient ID</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Prescribing Doctor</h3>
                        <p className="text-xl font-bold text-slate-800">Doctor #{docId}</p>
                        <p className="text-sm text-slate-500">Verified Clinical ID</p>
                    </div>
                </div>

                {/* Rx Symbol */}
                <div className="mb-6 flex justify-between items-end">
                    <span className="text-6xl font-serif italic font-black text-slate-200 -mb-2">Rx</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Itemized Breakdown</span>
                </div>

                {/* Itemized Table */}
                <table className="w-full text-left mb-12">
                    <thead>
                        <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <th className="py-4">Item / Medication</th>
                            <th className="py-4 text-center">Instructions</th>
                            <th className="py-4 text-right">Price</th>
                            <th className="py-4 text-center">Qty</th>
                            <th className="py-4 text-right">Discount</th>
                            <th className="py-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prescriptions.map((item, index) => (
                            <tr key={index} className="border-b border-slate-100 last:border-0 align-top">
                                <td className="py-5 pr-4">
                                    <p className="font-bold text-slate-900">{item.medicineName}</p>
                                </td>
                                <td className="py-5 px-4 text-center">
                                    <p className="text-xs text-slate-600 font-mono bg-slate-50 px-2 py-1 rounded inline-block">
                                        {item.instructions || 'As Directed'}
                                    </p>
                                </td>
                                <td className="py-5 px-4 text-right font-medium text-slate-700">LKR {item.unitPrice?.toFixed(2)}</td>
                                <td className="py-5 px-4 text-center font-bold text-slate-700">{item.quantity}</td>
                                <td className="py-5 px-4 text-right text-rose-500 font-medium">LKR {item.unitDiscount?.toFixed(2)}</td>
                                <td className="py-5 pl-4 text-right font-black text-slate-900">LKR {item.totalAmount?.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals Section */}
                <div className="border-t border-slate-900 pt-8 flex justify-end">
                    <div className="w-72 space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                            <span>Subtotal</span>
                            <span>LKR {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-rose-500 pb-4 border-b border-slate-200">
                            <span>Total Discount</span>
                            <span>- LKR {totalDiscount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                            <span className="text-xl font-black uppercase tracking-widest text-slate-900">Net Total</span>
                            <span className="text-2xl font-black text-slate-900">LKR {finalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="mt-24 pt-8 border-t border-slate-200 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Thank you for trusting SynapsCare</p>
                    <p className="text-[10px] text-slate-500 italic">This is a computer generated document and does not require a physical signature.</p>
                </div>

                {/* Print Only Action Area - Hidden during print */}
                <div className="mt-12 text-center print:hidden">
                    <button 
                        onClick={() => window.print()} 
                        className="px-8 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-300"
                    >
                        Print Document
                    </button>
                    <button 
                        onClick={() => window.close()} 
                        className="px-8 py-4 bg-transparent text-slate-500 font-bold uppercase tracking-widest hover:text-slate-900 transition-all ml-4"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PrintBill;
