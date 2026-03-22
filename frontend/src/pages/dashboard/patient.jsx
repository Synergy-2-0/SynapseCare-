import React, { useEffect, useState } from 'react';
import { patientApi, appointmentApi } from '../../lib/api';
import { 
    LayoutDashboard, 
    Calendar, 
    User, 
    FileText, 
    MessageSquare, 
    Video, 
    LogOut, 
    Bell, 
    Search, 
    Plus, 
    Stethoscope, 
    Activity, 
    Clock,
    Shield,
    ChevronRight,
    Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';

const PatientDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({ appointments: 0, reports: 0, prescriptions: 0 });
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');
            const name = localStorage.getItem('user_name');
            const id = localStorage.getItem('user_id');

            if (role !== 'PATIENT') { router.push('/login'); return; }
            setUserData({ name, id });

            const fetchData = async () => {
                try {
                    const apptRes = await appointmentApi.get(`/appointments/patient/${id}`);
                    const allAppts = apptRes.data || [];
                    setUpcoming(allAppts.filter(a => a.status === 'CONFIRMED' || a.status === 'PAID'));
                    setStats({
                        appointments: allAppts.length,
                        reports: 4,
                        prescriptions: 2
                    });
                    setLoading(false);
                } catch (err) {
                    console.error("Failed to fetch dashboard data", err);
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [router]);

    const logout = () => { localStorage.clear(); router.push('/login'); };

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black italic text-slate-900 tracking-widest text-3xl animate-pulse">Loading Your Portal...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-bold italic text-slate-900 italic font-bold">
            <aside className="w-80 bg-white border-r border-slate-100 flex flex-col p-10 sticky top-0 h-screen shadow-2xl italic font-bold">
                <div className="flex items-center gap-4 mb-20 px-4 italic">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/20 italic">S</div>
                    <span className="text-2xl font-black text-slate-900 italic tracking-tighter italic font-bold">Patient Portal</span>
                </div>
                
                <div className="flex-1 space-y-3 italic font-bold">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'My Dashboard' },
                        { id: 'appointments', icon: Calendar, label: 'Manage Bookings' },
                        { id: 'doctors', icon: Stethoscope, label: 'Find Doctors' },
                        { id: 'reports', icon: FileText, label: 'My Medical Records' },
                        { id: 'prescriptions', icon: Shield, label: 'e-Prescriptions' },
                        { id: 'telemedicine', icon: Video, label: 'Video Consults' },
                        { id: 'chat', icon: MessageSquare, label: 'Symptom Checker' },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.8rem] font-black scale-100 transition-all italic hover:scale-[1.02] ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}>
                            <item.icon className="w-5 h-5 italic" /> {item.label}
                        </button>
                    ))}
                </div>

                <div className="pt-8 border-t border-slate-100 italic">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.8rem] font-black text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all italic">
                        <LogOut className="w-5 h-5 italic" /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-16 overflow-y-auto italic font-bold">
                <header className="flex justify-between items-center mb-16 italic font-bold">
                    <div className="space-y-2 italic font-bold">
                        <h1 className="text-5xl font-black text-slate-900 italic tracking-tighter">Welcome, {userData?.name}</h1>
                        <p className="text-slate-400 font-bold italic text-xs uppercase tracking-widest opacity-80 italic">Patient ID: #PAT-{userData?.id}</p>
                    </div>
                    <div className="flex gap-6 italic font-bold">
                        <div className="relative italic font-bold">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search for doctors or records..." className="bg-white border-2 border-slate-100 rounded-[1.5rem] py-3 pl-12 pr-6 text-xs font-black w-72 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all italic italic italic shadow-inner" />
                        </div>
                        <button className="p-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 shadow-xl hover:border-indigo-600 transition-all animate-bounce-slow italic"><Bell className="w-5 h-5 italic" /></button>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 italic font-bold">
                    <div className="xl:col-span-2 space-y-12 italic font-bold">
                        {activeTab === 'overview' && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 italic font-bold font-black uppercase tracking-widest text-[10px] text-slate-400">
                                    {[{ label: 'Total Visits', value: stats.appointments, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' }, { label: 'Medical Reports', value: stats.reports, icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' }, { label: 'Active Prescriptions', value: stats.prescriptions, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' }].map((s, i) => (
                                        <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-8 rounded-[3rem] shadow-2xl border border-slate-200/50 italic italic font-bold group">
                                            <div className="flex justify-between items-center mb-6 italic italic italic italic">
                                                <div className={`p-4 ${s.bg} ${s.color} rounded-2xl italic italic italic font-bold group-hover:scale-110 transition-transform`}><s.icon className="w-6 h-6 italic" /></div>
                                                <div className="text-4xl font-black text-slate-900 italic italic font-bold tracking-tighter">{s.value}</div>
                                            </div>
                                            <div className="italic italic italic font-bold whitespace-nowrap">{s.label}</div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden italic font-bold">
                                    <div className="p-10 border-b border-slate-50 flex justify-between items-center italic bg-slate-50/50">
                                        <h3 className="text-2xl font-black text-slate-900 italic italic font-bold tracking-tight">Upcoming Appointments</h3>
                                        <button className="text-xs font-black uppercase text-indigo-600 tracking-widest italic font-bold">See All</button>
                                    </div>
                                    <div className="p-16 text-center italic font-bold space-y-6">
                                        {upcoming.length > 0 ? (
                                            <div className="space-y-4 italic font-bold text-left">
                                                {upcoming.map((appt, i) => (
                                                    <div key={i} className="flex justify-between items-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-600 transition-all italic font-bold group">
                                                        <div className="flex items-center gap-6 italic">
                                                            <div className="w-14 h-14 bg-white border border-slate-200 text-indigo-600 rounded-2xl flex items-center justify-center font-black italic shadow-md">Dr</div>
                                                            <div><div className="text-lg font-black italic italic font-bold text-slate-900">Consultation with Doctor #{appt.doctorId}</div><div className="text-xs text-slate-400 font-bold italic italic font-bold uppercase tracking-widest">{appt.appointmentDate}</div></div>
                                                        </div>
                                                        <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-all italic" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-6 italic font-bold">
                                                <div className="w-24 h-24 bg-slate-50 border-2 border-slate-100 rounded-full flex items-center justify-center mx-auto italic"><Activity className="w-10 h-10 text-slate-200 italic" /></div>
                                                <div className="text-slate-400 font-black uppercase tracking-widest text-sm italic italic font-bold">No upcoming appointments.</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-indigo-600 rounded-[3.5rem] p-12 text-white flex justify-between items-center relative overflow-hidden italic font-bold group shadow-2xl shadow-indigo-600/30">
                                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2"></div>
                                     <div className="relative z-10 space-y-6 italic font-bold max-w-lg">
                                        <div className="flex items-center gap-3 italic"><div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest italic">Personal Assistant</div><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse italic"></div></div>
                                        <h3 className="text-4xl font-black italic tracking-tighter italic font-bold">AI Symptom Checker</h3>
                                        <p className="text-indigo-100 text-lg font-bold italic opacity-90 leading-relaxed italic italic font-bold">Got a concern? Describe your symptoms for instant helpful guidance.</p>
                                        <Link href="/chat" className="inline-flex px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-900/40 items-center gap-3 hover:translate-x-2 transition-all italic">
                                            Start Checking <ArrowRight className="w-6 h-6 italic" />
                                        </Link>
                                     </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'prescriptions' && (
                            <div className="bg-white rounded-[3rem] p-16 shadow-2xl border border-slate-100 italic">
                                <div className="flex justify-between items-center mb-12 italic font-bold">
                                    <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter italic font-bold">My e-Prescriptions</h3>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg italic"><Download className="w-4 h-4 italic" /> Save Records</button>
                                </div>
                                <div className="space-y-6 italic font-bold">
                                    {[
                                        { doc: 'Dr. Emily Watson', date: 'March 22, 2026', ref: 'RX-7443' },
                                        { doc: 'Dr. Michael Smith', date: 'Feb 15, 2026', ref: 'RX-1209' }
                                    ].map((p, i) => (
                                        <div key={i} className="p-8 bg-slate-50 rounded-[2rem] flex justify-between items-center border border-slate-100 hover:border-indigo-600 transition-all italic font-bold group">
                                            <div className="flex items-center gap-6 italic">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-rose-600 font-black shadow-sm italic"><Shield className="w-6 h-6 italic" /></div>
                                                <div><div className="text-lg font-black text-slate-900 italic italic font-bold">{p.doc}</div><div className="text-[10px] text-slate-500 font-black tracking-widest uppercase italic italic font-bold">{p.date} • ID: {p.ref}</div></div>
                                            </div>
                                            <button className="px-6 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-xl text-xs font-black group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all italic italic font-bold uppercase tracking-widest">View Prescription</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-12 italic font-bold">
                        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden italic font-bold">
                             <div className="relative z-10 space-y-8 italic font-bold">
                                <h4 className="text-2xl font-black italic tracking-tighter italic font-bold leading-tight">Emergency <br /> Support</h4>
                                <div className="space-y-4 italic font-bold">
                                    <button className="w-full py-5 bg-rose-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-600/30 hover:bg-rose-500 transition-all italic">Emergency SOS</button>
                                    <button className="w-full py-5 bg-white/10 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-300 italic">Call Support</button>
                                </div>
                             </div>
                        </div>

                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 italic font-bold">
                             <h4 className="text-lg font-black text-slate-900 mb-8 italic tracking-tight italic font-bold">My Lab Reports</h4>
                             <div className="space-y-4 italic font-bold">
                                {['Blood_Test_Mar_22.pdf', 'X_Ray_Scan.jpg'].map((f, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl italic font-bold">
                                        <div className="flex items-center gap-3 italic"><FileText className="w-4 h-4 text-indigo-600 italic" /><span className="text-xs font-bold text-slate-700 italic italic font-bold">{f}</span></div>
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full italic"></div>
                                    </div>
                                ))}
                                <button className="w-full py-4 mt-4 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all italic italic font-bold">Upload New Report <Plus className="w-4 h-4 ml-2 inline italic" /></button>
                             </div>
                        </div>

                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 italic font-bold text-center">
                             <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl italic"><Clock className="w-8 h-8 text-white italic" /></div>
                             <h5 className="font-black text-slate-900 italic italic font-bold">Next Check-up</h5>
                             <p className="text-[10px] text-slate-400 font-bold italic mt-1 uppercase tracking-widest italic font-bold">In 4 days • March 26</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientDashboard;
