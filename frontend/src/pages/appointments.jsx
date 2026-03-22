import React, { useState, useEffect } from 'react';
import { appointmentApi, doctorApi } from '../lib/api';
import { 
    Calendar, 
    ArrowLeft, 
    Clock, 
    Video, 
    Activity, 
    Users, 
    Search, 
    Plus, 
    Stethoscope 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const AppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('user_id');
        const role = localStorage.getItem('user_role');
        const fetchData = async () => {
            try {
                const endpoint = role === 'DOCTOR' ? `/appointments/doctor/${userId}` : `/appointments/patient/${userId}`;
                const res = await appointmentApi.get(endpoint);
                setAppointments(res.data || []);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load appointments", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex font-bold italic">
            <aside className="w-24 bg-white border-r border-slate-100 flex flex-col items-center py-8 h-screen gap-8 italic font-bold">
                <Link href="/dashboard/patient" className="p-4 bg-orange-50 text-primary rounded-2xl italic"><ArrowLeft className="w-6 h-6 italic" /></Link>
            </aside>

            <main className="flex-1 p-12 overflow-y-auto italic font-bold">
                <header className="flex justify-between items-center mb-12 italic font-bold">
                    <h1 className="text-4xl font-black text-slate-900 italic">Central Schedule hub</h1>
                    <button className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center gap-2 italic hover:scale-105 transition-transform"><Plus className="w-4 h-4 italic" /> New Booking</button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 italic font-bold">
                    <div className="lg:col-span-2 space-y-6 italic">
                        <AnimatePresence>
                            {appointments.length > 0 ? appointments.map((appt, i) => (
                                <motion.div key={i} whileHover={{ x: 5 }} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center italic">
                                    <div className="flex items-center gap-6 italic">
                                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-[1.5rem] flex items-center justify-center italic"><Stethoscope className="w-8 h-8 italic" /></div>
                                        <div><div className="text-[10px] font-black uppercase text-primary tracking-widest italic">Clinical Node</div><h3 className="text-xl font-black italic">Lead Specialist #{appt.doctorId}</h3></div>
                                    </div>
                                    <div className="flex items-center gap-8 italic">
                                        <div className="text-center italic"><div className="text-lg font-black italic">{new Date(appt.appointmentDate).getDate()} {new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' })}</div></div>
                                        <Link href="/telemedicine" className="p-3.5 bg-slate-900 text-white rounded-xl italic transition-transform hover:scale-110"><Video className="w-5 h-5 italic" /></Link>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="p-20 text-center text-slate-300 border-2 border-dashed rounded-[3rem] italic">No active scheduled nodes found.</div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AppointmentsPage;
