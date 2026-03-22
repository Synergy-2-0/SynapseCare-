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
    Stethoscope,
    ChevronRight,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const AppointmentsPage = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
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
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-bold italic text-slate-900 italic font-bold">
            <aside className="w-32 bg-white border-r border-slate-100 flex flex-col items-center py-10 h-screen sticky top-0 gap-10 shadow-xl italic font-bold">
                <Link href="/dashboard/patient" className="p-5 bg-indigo-50 text-indigo-600 rounded-[1.5rem] shadow-xl hover:scale-110 transition-transform italic">
                    <ArrowLeft className="w-8 h-8 italic" />
                </Link>
                <div className="flex-1 flex flex-col gap-6 italic">
                    <button className="p-5 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl shadow-indigo-600/30 italic"><Calendar className="w-6 h-6 italic" /></button>
                    <button className="p-5 bg-white border-2 border-slate-50 text-slate-300 rounded-[1.5rem] hover:border-indigo-600 hover:text-indigo-600 transition-all italic"><Users className="w-6 h-6 italic" /></button>
                </div>
            </aside>

            <main className="flex-1 p-16 overflow-y-auto italic font-bold">
                <header className="flex justify-between items-end mb-20 italic font-bold">
                    <div className="space-y-4 italic font-bold">
                        <div className="flex items-center gap-3 italic"><h1 className="text-6xl font-black italic tracking-tighter italic font-bold">Medical Appointments</h1><div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black italic">Active Schedule</div></div>
                        <p className="text-slate-400 font-bold italic text-xs uppercase tracking-[0.4em] opacity-80 font-bold">Manage your upcoming doctor visits</p>
                    </div>
                    <div className="flex gap-4 italic font-bold">
                         <div className="relative italic font-bold">
                             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 italic" />
                             <input type="text" placeholder="Search by doctor or date..." className="bg-white border-2 border-slate-100 rounded-[2rem] py-5 pl-14 pr-8 text-sm font-black w-80 outline-none focus:border-indigo-600 shadow-xl transition-all italic" />
                         </div>
                         <button className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg flex items-center gap-4 italic shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all italic"><Plus className="w-6 h-6 italic" /> Book New Appointment</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-12 italic font-bold">
                    <div className="xl:col-span-3 space-y-8 italic font-bold">
                        <div className="flex justify-between items-center px-4 italic font-bold">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 italic italic font-bold">Confirmed Visits</h3>
                            <button className="flex items-center gap-2 text-indigo-600 font-black text-xs italic"><Filter className="w-4 h-4 italic" /> Filter List</button>
                        </div>
                        <AnimatePresence>
                            {appointments.length > 0 ? appointments.map((appt, i) => (
                                <motion.div key={i} whileHover={{ x: 10 }} className="bg-white p-10 rounded-[4rem] shadow-2xl border border-slate-100 flex justify-between items-center italic transition-all hover:bg-white active:scale-[0.98] italic font-bold group">
                                    <div className="flex items-center gap-10 italic">
                                        <div className="w-24 h-24 bg-slate-50 text-indigo-600 rounded-[2.5rem] flex items-center justify-center italic shadow-sm group-hover:bg-indigo-50 transition-colors italic"><Stethoscope className="w-10 h-10 italic" /></div>
                                        <div className="space-y-4 italic font-bold">
                                            <div className="flex items-center gap-3 italic"><div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic font-bold ${appt.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{appt.status}</div><div className="text-slate-300 font-black italic">|</div><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Doctor ID: #{appt.doctorId}</div></div>
                                            <h3 className="text-3xl font-black italic tracking-tighter italic font-bold">Private Specialist Visit</h3>
                                            <p className="text-slate-400 font-bold italic text-sm italic italic font-bold">Consultation scheduled with our certified board specialists.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10 italic font-bold">
                                        <div className="text-right italic font-bold px-8 border-r-2 border-slate-50">
                                            <div className="text-4xl font-black italic italic font-bold leading-none italic mb-1">{new Date(appt.appointmentDate).getDate()}</div>
                                            <div className="text-xs uppercase font-black text-slate-400 tracking-widest italic">{new Date(appt.appointmentDate).toLocaleString('default', { month: 'short' })}</div>
                                        </div>
                                        <div className="flex gap-4 italic font-bold">
                                            <Link href="/telemedicine" className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center italic shadow-2xl hover:bg-slate-800 hover:scale-110 transition-all italic"><Video className="w-7 h-7 italic" /></Link>
                                            <button className="w-16 h-16 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl flex items-center justify-center italic hover:border-indigo-600 hover:text-indigo-600 transition-all italic"><ChevronRight className="w-7 h-7 italic" /></button>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="p-32 text-center text-slate-300 border-4 border-dashed border-slate-100 rounded-[5rem] italic font-bold flex flex-col items-center gap-8">
                                     <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl italic"><Activity className="w-12 h-12 text-slate-100 italic" /></div>
                                     <div className="font-black text-xl uppercase tracking-[0.5em] italic italic font-bold">Search results empty.</div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="space-y-12 italic font-bold">
                         <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl shadow-slate-900/40 italic font-bold">
                              <h4 className="text-2xl font-black italic tracking-tighter italic font-bold mb-8 italic">Booking <br /> Center</h4>
                              <div className="space-y-6 italic font-bold">
                                 <div className="p-6 bg-white/5 rounded-3xl border border-white/10 italic font-bold">
                                     <div className="text-xs font-black text-slate-500 uppercase tracking-widest italic mb-2">Platform Load</div>
                                     <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden italic"><div className="w-1/3 h-full bg-emerald-400 italic"></div></div>
                                 </div>
                                 <p className="text-[10px] text-slate-500 font-bold italic leading-relaxed italic italic font-bold">Securely booking your visits with local doctors.</p>
                              </div>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AppointmentsPage;
