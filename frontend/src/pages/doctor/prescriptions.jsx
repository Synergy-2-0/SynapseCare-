import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { prescriptionApi, doctorApi, appointmentApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDoctorApproved } from '@/lib/doctorVerification';
import { Download, Clock, Search, PlusCircle, Printer } from 'lucide-react';
import IssuePrescription from '@/components/doctor/IssuePrescription';

const PrescriptionsPage = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'history'
    const [activeEncounter, setActiveEncounter] = useState(null);
    const [doctorId, setDoctorId] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');
            const id = localStorage.getItem('user_id');

            if (role !== 'DOCTOR') { router.push('/login'); return; }
            const fetchData = async () => {
                try {
                    const profileRes = await doctorApi.get('/profile/me');
                    if (!isDoctorApproved(profileRes?.data?.verificationStatus)) {
                        router.replace('/doctor/setup');
                        return;
                    }
                    const dbId = profileRes.data?.id || id;
                    setDoctorId(dbId);

                    const [presRes, apptRes] = await Promise.all([
                        prescriptionApi.get(`/doctor/${dbId}`),
                        appointmentApi.get(`/doctor/${dbId}`)
                    ]);

                    const allPres = presRes.data?.data || presRes.data || [];
                    const allAppts = apptRes.data?.data || apptRes.data || [];

                    setPrescriptions(allPres);
                    setPendingAppointments(allAppts.filter(a => a.status === 'COMPLETED').filter(a => !allPres.some(p => p.appointmentId === a.id)));
                } catch (err) {
                    console.error("Failed to fetch prescriptions context", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [router]);

    const refreshData = async () => {
        if (!doctorId) return;
        try {
            const [presRes, apptRes] = await Promise.all([
                prescriptionApi.get(`/doctor/${doctorId}`),
                appointmentApi.get(`/doctor/${doctorId}`)
            ]);
            const allPres = presRes.data?.data || presRes.data || [];
            const allAppts = apptRes.data?.data || apptRes.data || [];
            setPrescriptions(allPres);
            setPendingAppointments(allAppts.filter(a => a.status === 'COMPLETED').filter(a => !allPres.some(p => p.appointmentId === a.id)));
        } catch (err) {
            console.error("Refresh failed", err);
        }
    };

    if (loading) return null;

    return (
        <DashboardLayout>
            <Head>
                <title>Prescriptions | SynapsCare Doctor</title>
            </Head>
            <div className="surface-card bg-white p-8 xl:p-12 min-h-[600px] flex flex-col">
                <div className="flex border-b border-slate-100 mb-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'pending' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                        Awaiting Prescription ({pendingAppointments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'history' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/30' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                        Issued Records ({prescriptions.length})
                    </button>
                </div>

                <div className="flex-1 overflow-x-auto">
                    {activeTab === 'pending' ? (
                        <table className="w-full text-left border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                    <th className="px-6 py-2">Patient Reference</th>
                                    <th className="px-6 py-2">Session Date</th>
                                    <th className="px-6 py-2">Clinical Status</th>
                                    <th className="px-6 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingAppointments.map((appt, i) => (
                                    <tr key={i} className="group hover:-translate-y-1 transition-transform">
                                        <td className="bg-slate-50 group-hover:bg-white border-y border-l border-slate-100 group-hover:border-teal-200 rounded-l-[1.5rem] p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                                    #{appt.patientId}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm">Patient Record #{appt.patientId}</p>
                                                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Consultation Closed</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="bg-slate-50 group-hover:bg-white border-y border-slate-100 group-hover:border-teal-200 p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5">
                                            <p className="text-sm font-bold text-slate-700">{appt.date}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{appt.time}</p>
                                        </td>
                                        <td className="bg-slate-50 group-hover:bg-white border-y border-slate-100 group-hover:border-teal-200 p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5">
                                            <div className="flex items-center gap-2 text-amber-500">
                                                <Clock size={14} className="animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Digital Rx</span>
                                            </div>
                                        </td>
                                        <td className="bg-slate-50 group-hover:bg-white border-y border-r border-slate-100 group-hover:border-teal-200 rounded-r-[1.5rem] p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5 text-right">
                                            <button
                                                onClick={() => setActiveEncounter(appt)}
                                                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 active:scale-95 transition-all shadow-lg shadow-teal-500/10 flex items-center gap-2 inline-flex"
                                            >
                                                <PlusCircle size={14} /> Issue Rx
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {pendingAppointments.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-20 text-slate-400 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                            <Search size={32} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-bold">No pending records found.</p>
                                            <p className="text-xs">All completed consultations have digital prescriptions.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                    <th className="px-6 py-2">Date / ID</th>
                                    <th className="px-6 py-2">Medication Info</th>
                                    <th className="px-6 py-2">Patient Reference</th>
                                    <th className="px-6 py-2">Prescription Status</th>
                                    <th className="px-6 py-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prescriptions.map((px, i) => (
                                    <tr key={i} className="group hover:-translate-y-1 transition-transform">
                                        <td className="bg-slate-50 group-hover:bg-white border-y border-l border-slate-100 group-hover:border-teal-200 rounded-l-[1.5rem] p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5">
                                            <p className="text-sm font-bold text-slate-700">{px.createdDate ? new Date(px.createdDate).toLocaleDateString() : 'N/A'}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">RX #{px.id}</p>
                                        </td>
                                        <td className="bg-slate-50 group-hover:bg-white border-y border-slate-100 group-hover:border-teal-200 p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5">
                                            <p className="font-black text-slate-800 text-sm">{px.medicineName}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{px.dosage || 'Standard'} • {px.duration || 'Session Based'}</p>
                                        </td>
                                        <td className="bg-slate-50 group-hover:bg-white border-y border-slate-100 group-hover:border-teal-200 p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                                                    #{px.patientId}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="bg-slate-50 group-hover:bg-white border-y border-slate-100 group-hover:border-teal-200 p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5">
                                            <div className="flex items-center gap-2 text-emerald-600">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Issued</span>
                                            </div>
                                        </td>
                                        <td className="bg-slate-50 group-hover:bg-white border-y border-r border-slate-100 group-hover:border-teal-200 rounded-r-[1.5rem] p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5 text-right">
                                            <button
                                                onClick={() => window.open(`/doctor/print/bill/${px.appointmentId}`, '_blank')}
                                                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 hover:text-slate-800 active:scale-95 transition-all flex items-center gap-2 inline-flex"
                                            >
                                                <Printer size={14} /> Print Bill
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {prescriptions.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-20 text-slate-400 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                            <Search size={32} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-bold">No historical prescriptions.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {activeEncounter && (
                <IssuePrescription
                    session={activeEncounter}
                    doctorId={doctorId}
                    onClose={() => {
                        setActiveEncounter(null);
                        refreshData();
                    }}
                />
            )}
        </DashboardLayout>
    );
};

export default PrescriptionsPage;
