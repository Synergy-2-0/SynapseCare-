import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { appointmentApi, doctorApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { isDoctorApproved } from '@/lib/doctorVerification';
import SessionPrescriptionModal from '@/components/doctor/SessionPrescriptionModal';
import { AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, ClipboardList } from 'lucide-react';

const Badge = ({ children, variant }) => {
    const variants = {
        success: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50',
        primary: 'bg-teal-100/50 text-teal-700 border-teal-200/50',
        warning: 'bg-amber-100/50 text-amber-700 border-amber-200/50',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${variants[variant] || variants.primary}`}>
            {children}
        </span>
    );
};

const PrescriptionsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [activePostSession, setActivePostSession] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');
            const id = localStorage.getItem('user_id');
            const name = localStorage.getItem('user_name');

            if (role !== 'DOCTOR') { router.push('/login'); return; }
            setUserData({ name, id });

            const fetchData = async () => {
                try {
                    const profileRes = await doctorApi.get('/profile/me');
                    if (!isDoctorApproved(profileRes?.data?.verificationStatus)) {
                        router.replace('/doctor/setup');
                        return;
                    }

                    const apptRes = await appointmentApi.get(`/doctor/${id}`);
                    setAppointments((apptRes.data?.data || apptRes.data || []).filter(a => a.status !== 'CANCELLED'));
                } catch (err) {
                    console.error("Failed to fetch prescriptions context", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [router]);

    if (loading) return null;

    return (
        <DashboardLayout>
            <Head>
                <title>Prescriptions | SynapsCare Doctor</title>
            </Head>
            <div className="surface-card bg-white p-8 xl:p-12 min-h-[600px] flex flex-col">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-3xl font-serif text-slate-900 tracking-tight">Prescription Management</h3>
                        <p className="text-slate-500 font-medium mt-1">Issue and track clinical prescriptions for your sessions.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 mb-4 shadow-sm">
                            <AlertCircle size={24} />
                        </div>
                        <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Awaiting RX</h4>
                        <p className="text-3xl font-black text-amber-600">{appointments.filter(a => a.status === 'PAID' || a.status === 'CONFIRMED').length}</p>
                    </div>
                    <div className="p-6 bg-teal-50 rounded-[2rem] border border-teal-100 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-500 mb-4 shadow-sm">
                            <CheckCircle size={24} />
                        </div>
                        <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest mb-1">Issued Today</h4>
                        <p className="text-3xl font-black text-teal-600">0</p>
                    </div>
                    <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 mb-4 shadow-sm">
                            <ClipboardList size={24} />
                        </div>
                        <h4 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-1">Total Records</h4>
                        <p className="text-3xl font-black text-indigo-600">0</p>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                <th className="px-6 py-2">Patient Information</th>
                                <th className="px-6 py-2">Session Type</th>
                                <th className="px-6 py-2">Last Interaction</th>
                                <th className="px-6 py-2">Prescription Status</th>
                                <th className="px-6 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.filter(a => a.status === 'PAID' || a.status === 'CONFIRMED' || a.status === 'COMPLETED').map((appt, i) => (
                                <tr key={i} className="group hover:-translate-y-1 transition-transform">
                                    <td className="bg-slate-50 group-hover:bg-white border-y border-l border-slate-100 group-hover:border-teal-200 rounded-l-[1.5rem] p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-bold text-teal-600">
                                                #{appt.patientId}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm">Patient Record #{appt.patientId}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">ID Verified</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="bg-slate-50 group-hover:bg-white border-y border-slate-100 group-hover:border-teal-200 p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5">
                                        <Badge variant={appt.mode === 'TELEMEDICINE' ? 'primary' : 'success'}>
                                            {appt.mode === 'TELEMEDICINE' ? 'TELECONSULT' : 'PHYSICAL VISIT'}
                                        </Badge>
                                    </td>
                                    <td className="bg-slate-50 group-hover:bg-white border-y border-slate-100 group-hover:border-teal-200 p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5">
                                        <p className="text-xs font-bold text-slate-700">{appt.date}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{appt.time}</p>
                                    </td>
                                    <td className="bg-slate-50 group-hover:bg-white border-y border-slate-100 group-hover:border-teal-200 p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5">
                                        <div className="flex items-center gap-2 text-amber-500">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Pending Issuance</span>
                                        </div>
                                    </td>
                                    <td className="bg-slate-50 group-hover:bg-white border-y border-r border-slate-100 group-hover:border-teal-200 rounded-r-[1.5rem] p-5 group-hover:shadow-xl group-hover:shadow-teal-500/5 text-right">
                                        <button 
                                            onClick={() => setActivePostSession(appt)}
                                            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 active:scale-95 transition-all shadow-lg shadow-teal-500/10"
                                        >
                                            Issue RX
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <AnimatePresence>
                    {activePostSession && (
                        <SessionPrescriptionModal 
                            session={activePostSession} 
                            onClose={() => setActivePostSession(null)} 
                            doctorId={userData?.id} 
                        />
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
};

export default PrescriptionsPage;
