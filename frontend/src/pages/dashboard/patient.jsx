import React, { useEffect, useState } from 'react';
import { patientApi, appointmentApi, medicalHistoryApi } from '../../lib/api';
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
    Download,
    ArrowRight,
    HeartPulse,
    AlertCircle,
    ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';

const PatientDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({ appointments: 0, reports: 0, prescriptions: 2 });
    const [upcoming, setUpcoming] = useState([]);
    const [history, setHistory] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');
            const name = localStorage.getItem('user_name');
            const id = localStorage.getItem('user_id');

            if (role !== 'PATIENT') { router.push('/login'); return; }

            const fetchData = async () => {
                try {
                    const [apptRes, patientRes, historyRes, reportRes] = await Promise.all([
                        appointmentApi.get(`/patient/${id}`).catch(() => ({ data: [] })),
                        patientApi.get(`/${id}`).catch(() => ({ data: { data: {} } })),
                        medicalHistoryApi.get(`/patient/${id}`).catch(() => ({ data: { data: [] } })),
                        patientApi.get(`/${id}/reports`).catch(() => ({ data: { data: [] } }))
                    ]);
                    
                    const allAppts = apptRes.data || [];
                    const patientInfo = patientRes.data?.data || {};
                    const historyInfo = historyRes.data?.data || [];
                    const reportInfo = reportRes.data?.data || [];
                    
                    setUserData({ ...patientInfo, name: patientInfo.name || name, id });
                    setUpcoming(allAppts.filter(a => a.status === 'CONFIRMED' || a.status === 'PAID'));
                    setHistory(historyInfo);
                    setReports(reportInfo);
                    setStats({
                        appointments: allAppts.length,
                        reports: reportInfo.length,
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

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-8">
            <div className="w-24 h-24 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="font-black italic text-white tracking-[0.5em] text-2xl animate-pulse">SYNCING HEALTH DATA...</div>
        </div>
    );

    const sidebarItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
        { id: 'appointments', icon: Calendar, label: 'Appointments' },
        { id: 'reports', icon: FileText, label: 'Medical Records' },
        { id: 'prescriptions', icon: Shield, label: 'Prescriptions' },
        { id: 'telemedicine', icon: Video, label: 'Virtual Care' },
        { id: 'chat', icon: MessageSquare, label: 'AI Health Chat' },
        { id: 'profile', icon: User, label: 'Profile Settings' },
    ];

    return (
        <div className="min-h-screen bg-[#0F172A] flex font-bold italic text-slate-100 italic font-bold">
            {/* Sidebar */}
            <aside className="w-80 bg-[#1E293B] border-r border-slate-800 flex flex-col p-8 sticky top-0 h-screen shadow-2xl z-20">
                <div className="flex items-center gap-4 mb-16 px-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/40 italic rotate-3">H</div>
                    <span className="text-2xl font-black text-white italic tracking-tighter">HEALIX.</span>
                </div>
                
                <nav className="flex-1 space-y-2">
                    {sidebarItems.map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => setActiveTab(item.id)} 
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)] scale-105' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'animate-bounce-slow' : ''}`} /> 
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="pt-8 border-t border-slate-800">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all italic underline decoration-2 decoration-rose-500/30">
                        <LogOut className="w-5 h-5" /> Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-16 overflow-y-auto bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
                <header className="flex justify-between items-start mb-16">
                    <div className="space-y-2">
                        <h1 className="text-6xl font-black text-white italic tracking-tighter leading-tight uppercase underline decoration-8 decoration-indigo-600/30">
                            Bonjour, <br /> {userData?.name?.split(' ')[0]}
                        </h1>
                        <p className="text-indigo-400 font-black italic text-sm uppercase tracking-[0.3em] opacity-80">
                            Registry Status: #PAT-{userData?.id?.toString().padStart(4, '0')}
                        </p>
                    </div>
                    <div className="flex gap-4">
                         <div className="px-6 py-4 bg-slate-800/50 backdrop-blur-xl border border-white/5 rounded-3xl flex items-center gap-4 shadow-2xl">
                            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">System Status</div>
                                <div className="text-xs text-white font-black italic uppercase">Connected</div>
                            </div>
                         </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                    {/* Primary Area */}
                    <div className="xl:col-span-8 space-y-12">
                        {activeTab === 'overview' && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                    {[
                                        { label: 'Cumulative Visits', value: stats.appointments, icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                                        { label: 'Secure Records', value: stats.reports, icon: FileText, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                                        { label: 'Active Meds', value: stats.prescriptions, icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
                                    ].map((s, i) => (
                                        <motion.div key={i} whileHover={{ scale: 1.05 }} className="bg-[#1E293B] p-8 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden group">
                                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <s.icon className="w-24 h-24" />
                                            </div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-4 ${s.bg} ${s.color} rounded-2xl shadow-inner font-black`}>
                                                    <s.icon className="w-6 h-6" />
                                                </div>
                                                <div className="text-5xl font-black text-white tracking-tighter italic">{s.value}</div>
                                            </div>
                                            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black italic">{s.label}</div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="bg-[#1E293B] rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden">
                                    <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
                                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Scheduled Interventions</h3>
                                        <button className="text-sm font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase italic tracking-widest underline">Manage All</button>
                                    </div>
                                    <div className="p-10 space-y-4">
                                        {upcoming.length > 0 ? upcoming.map((appt, i) => (
                                            <div key={i} className="flex justify-between items-center p-6 bg-slate-800/50 rounded-3xl border border-white/5 hover:border-indigo-500 transition-all group cursor-pointer">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-black italic text-white shadow-xl shadow-indigo-600/20">#DS</div>
                                                    <div>
                                                        <div className="text-xl font-black text-white italic capitalize">Doctor Verification #{appt.doctorId}</div>
                                                        <div className="text-xs text-slate-500 font-black uppercase tracking-widest italic">{appt.appointmentDate} • {appt.status}</div>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-6 h-6 text-slate-600 group-hover:text-indigo-500 transition-all translate-x-0 group-hover:translate-x-2" />
                                            </div>
                                        )) : (
                                            <div className="py-20 text-center space-y-6 opacity-30">
                                                <Calendar className="w-20 h-20 mx-auto text-slate-500" />
                                                <div className="text-sm font-black uppercase tracking-[0.5em]">No Pending Protocols</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-indigo-600 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20 group">
                                     <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                                     <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic">AI Health Engine</span>
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                            </div>
                                            <h3 className="text-5xl font-black italic tracking-tighter uppercase leading-tight">Instant Symptom <br /> Analysis</h3>
                                            <p className="text-indigo-100 text-lg italic opacity-80 max-w-md font-bold italic">Leverage our quantum diagnostics engine for a preliminary health assessment.</p>
                                        </div>
                                        <Link href="/chat" className="px-12 py-6 bg-white text-indigo-600 rounded-[2rem] font-black text-xl shadow-2xl hover:scale-110 active:scale-95 transition-all italic flex items-center gap-3 group/btn">
                                            Initialize Audit <Activity className="w-6 h-6 animate-spin-slow group-hover/btn:animate-ping" />
                                        </Link>
                                     </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'reports' && (
                            <div className="bg-[#1E293B] rounded-[3rem] p-12 shadow-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-12">
                                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase underline decoration-indigo-500/20">Secure Health Vault</h3>
                                    <button className="p-4 bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 transition-all italic flex items-center gap-3 font-black text-sm uppercase italic"><Plus className="w-5 h-5" /> Import Data</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-indigo-500 uppercase tracking-[0.3em] italic flex items-center gap-2">
                                            <ClipboardList className="w-4 h-4" /> Clinical History
                                        </h4>
                                        <div className="space-y-4">
                                            {history.length > 0 ? history.map((item, i) => (
                                                <div key={i} className="p-8 bg-slate-800/30 border border-white/5 rounded-3xl group hover:border-indigo-500/50 transition-all">
                                                    <div className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 italic">Diagnosis ID: #{item.id}</div>
                                                    <div className="text-2xl font-black text-white italic mb-4 leading-tight">{item.condition}</div>
                                                    <div className="text-sm text-slate-400 italic font-bold mb-6 opacity-80">{item.treatment}</div>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.diagnosisDate}</div>
                                                </div>
                                            )) : (
                                                <div className="p-10 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700 text-center space-y-4 opacity-40">
                                                    <AlertCircle className="w-10 h-10 mx-auto text-slate-500" />
                                                    <div className="text-[10px] font-black uppercase tracking-widest">No Historical Data Imprinted</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h4 className="text-sm font-black text-rose-500 uppercase tracking-[0.3em] italic flex items-center gap-2">
                                            <HeartPulse className="w-4 h-4" /> Diagnostic Reports
                                        </h4>
                                        <div className="space-y-4">
                                            {reports.length > 0 ? reports.map((rpt, i) => (
                                                <div key={i} className="flex items-center justify-between p-8 bg-rose-500/5 border border-rose-500/10 rounded-3xl group hover:bg-rose-500/10 transition-all cursor-pointer">
                                                    <div className="flex items-center gap-6">
                                                        <div className="p-4 bg-rose-500/20 text-rose-500 rounded-2xl shadow-inner italic"><FileText className="w-6 h-6" /></div>
                                                        <div>
                                                            <div className="text-lg font-black text-white italic leading-tight">{rpt.description}</div>
                                                            <div className="text-[10px] font-black text-rose-400/60 uppercase tracking-widest mt-1">Ref: #{rpt.id}</div>
                                                        </div>
                                                    </div>
                                                    <Download className="w-6 h-6 text-rose-500/30 group-hover:text-rose-500 transition-all" />
                                                </div>
                                            )) : (
                                                <div className="p-10 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700 text-center space-y-4 opacity-40">
                                                    <FileText className="w-10 h-10 mx-auto text-slate-500" />
                                                    <div className="text-[10px] font-black uppercase tracking-widest">No Artifacts Uploaded</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-[#1E293B] rounded-[3rem] p-16 shadow-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-16">
                                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase italic">Biometric Identity</h3>
                                    <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center text-indigo-500 shadow-2xl italic"><User className="w-10 h-10" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {[
                                        { label: 'Patient Avatar Name', value: userData?.name },
                                        { label: 'Comm Link (Email)', value: userData?.email },
                                        { label: 'Signal Vector (Phone)', value: userData?.phone || 'NOT SET' },
                                        { label: 'Origin Date (DOB)', value: userData?.dob || 'UNKNOWN' },
                                        { label: 'Gender Protocol', value: userData?.gender || 'NOT SPECIFIED' },
                                        { label: 'Biological Core (Blood)', value: userData?.bloodGroup || 'UNDEFINED' },
                                        { label: 'Emergency Override', value: userData?.emergencyContact || 'UNASSIGNED' },
                                        { label: 'Active Sensitivities', value: userData?.allergies || 'NONE DETECTED' },
                                    ].map((field, i) => (
                                        <div key={i} className="space-y-4 group">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic group-hover:text-indigo-500 transition-colors">{field.label}</label>
                                            <div className="p-6 bg-slate-900 shadow-inner rounded-[1.8rem] font-black text-white italic text-lg border-2 border-transparent group-hover:border-indigo-500/30 transition-all">{field.value || 'VOID'}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-16 flex gap-6">
                                    <button className="flex-1 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all italic">Modify Protocol</button>
                                    <button className="px-10 py-6 bg-white/5 border border-white/10 rounded-[2rem] font-black text-slate-500 hover:text-white transition-all italic">Refresh Data</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Wing */}
                    <div className="xl:col-span-4 space-y-12">
                        <div className="bg-[#1E293B] rounded-[3rem] p-10 border border-white/5 shadow-2xl relative group overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                             <h4 className="text-sm font-black text-rose-500 uppercase tracking-[0.4em] mb-10 italic">Quick Assist</h4>
                             <div className="space-y-4">
                                <button className="w-full py-6 bg-rose-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-900/40 transform hover:-translate-y-1 transition-all italic flex items-center justify-center gap-3">
                                    <AlertCircle className="w-5 h-5 animate-ping" /> Dispatch SOS
                                </button>
                                <button className="w-full py-6 bg-slate-800 text-slate-300 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all italic border border-white/5">
                                    Talk to Expert
                                </button>
                             </div>
                        </div>

                        <div className="bg-[#1E293B] rounded-[3rem] p-10 border border-white/5 shadow-2xl overflow-hidden relative group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                             <h4 className="text-sm font-black text-indigo-500 uppercase tracking-[0.4em] mb-10 italic">System Feed</h4>
                             <div className="space-y-6">
                                {[
                                    { title: 'New Lab result', time: '2h ago', icon: FileText, color: 'text-indigo-500' },
                                    { title: 'Appointment Paid', time: '1d ago', icon: Shield, color: 'text-emerald-500' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer">
                                        <div className={`p-4 bg-slate-900 ${item.color} rounded-2xl italic`}><item.icon className="w-5 h-5" /></div>
                                        <div>
                                            <div className="text-xs font-black text-white italic">{item.title}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">{item.time}</div>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-4 mt-6 bg-slate-800 text-indigo-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-indigo-600 hover:text-white transition-all italic border border-white/5 shadow-inner">View Full Stream</button>
                             </div>
                        </div>

                        <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-[3rem] p-10 text-center shadow-inner group transition-all duration-500 hover:bg-emerald-600/20">
                             <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30 transform group-hover:rotate-[360deg] transition-transform duration-1000 italic">
                                <Clock className="w-10 h-10" />
                             </div>
                             <h5 className="text-2xl font-black text-white italic tracking-tighter uppercase">Next Sync Point</h5>
                             <p className="text-[10px] text-emerald-500 mt-2 font-black uppercase tracking-[0.5em] italic">T-Minus 4 Days • March 26</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PatientDashboard;
