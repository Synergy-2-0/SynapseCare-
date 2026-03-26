import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Calendar,
    User,
    FileText,
    MessageSquare,
    Video,
    LogOut,
    Shield,
    Download,
    Plus,
    Clock,
    Activity,
    AlertCircle,
    ClipboardList,
    ChevronRight,
    Wallet,
    CheckCircle2,
    Search,
    Bell,
    Settings,
    ShieldCheck,
    CreditCard,
    ArrowRight
} from 'lucide-react';
import { patientApi, appointmentApi, medicalHistoryApi, paymentApi, prescriptionApi, notificationApi } from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PatientDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({ appointments: 0, reports: 0, prescriptions: 0 });
    const [upcoming, setUpcoming] = useState([]);
    const [history, setHistory] = useState([]);
    const [reports, setReports] = useState([]);
    const [payments, setPayments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');
            const name = localStorage.getItem('user_name');
            const id = localStorage.getItem('user_id');

            if (role !== 'PATIENT') {
                router.push('/login');
                return;
            }

            const fetchData = async () => {
                try {
                    const [apptRes, patientRes, historyRes, reportRes, paymentRes, prescRes, notifRes] = await Promise.all([
                        appointmentApi.get(`/patient/${id}`).catch(() => ({ data: [] })),
                        patientApi.get(`/${id}`).catch(() => ({ data: { data: {} } })),
                        medicalHistoryApi.get(`/patient/${id}`).catch(() => ({ data: { data: [] } })),
                        patientApi.get(`/${id}/reports`).catch(() => ({ data: { data: [] } })),
                        paymentApi.get(`/patient/${id}`).catch(() => ({ data: { data: [] } })),
                        prescriptionApi.get(`/patient/${id}`).catch(() => ({ data: [] })),
                        notificationApi.get(`/user/${id}`).catch(() => ({ data: [] }))
                    ]);

                    const allAppts = apptRes.data || [];
                    const patientInfo = patientRes.data?.data || {};
                    const historyInfo = historyRes.data?.data || [];
                    const reportInfo = reportRes.data?.data || [];
                    const paymentInfo = paymentRes.data?.data || [];
                    const prescriptionInfo = prescRes.data || [];
                    const notificationInfo = notifRes.data || [];

                    setUserData({ ...patientInfo, name: patientInfo.name || name, id });
                    setUpcoming(allAppts.filter((a) => a.status === 'CONFIRMED' || a.status === 'PAID'));
                    setHistory(historyInfo);
                    setReports(reportInfo);
                    setPayments(paymentInfo);
                    setPrescriptions(prescriptionInfo);
                    setNotifications(notificationInfo);
                    setStats({
                        appointments: allAppts.length,
                        reports: reportInfo.length,
                        prescriptions: prescriptionInfo.length
                    });
                } catch (err) {
                    console.error('Failed to fetch dashboard data', err);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [router]);

    const logout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Health Center' },
        { id: 'appointments', icon: Calendar, label: 'Visits & Tokens' },
        { id: 'prescriptions', icon: Shield, label: 'Digital Rx' },
        { id: 'reports', icon: FileText, label: 'Records Vault' },
        { id: 'payments', icon: CreditCard, label: 'Billing Nest' },
        { id: 'telemedicine', icon: Video, label: 'Virtual Clinic' },
        { id: 'chat', icon: MessageSquare, label: 'AI Diagnostic' },
        { id: 'profile', icon: User, label: 'My Identity' }
    ];

    if (loading) return <LoadingSpinner size="fullscreen" message="Synchronizing Patient Data..." />;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Professional Responsive Sidebar */}
            <aside className="hidden lg:flex flex-col w-[300px] border-r border-slate-200 bg-white sticky top-0 h-screen p-8 transition-all duration-500 overflow-y-auto z-50">
                <div className="flex items-center gap-3 mb-12 group cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => router.push('/')}>
                    <img src="/logo.png" alt="SynapseCare" className="w-10 h-10 drop-shadow-sm transition-transform group-hover:rotate-12" />
                    <span className="text-2xl font-black tracking-tight text-slate-800">Synapse<span className="text-indigo-600">Care</span></span>
                </div>

                <div className="mb-6 px-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Main Care Console</p>
                </div>

                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl text-sm font-bold tracking-tight transition-all duration-300 relative group overflow-hidden ${
                                activeTab === item.id 
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : ''}`} />
                            {item.label}
                            {activeTab === item.id && (
                                <motion.div layoutId="nav-bg" className="absolute left-0 w-1.5 h-6 bg-white/40 rounded-full" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col gap-3">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-5 py-4 rounded-3xl text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-all group">
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Log Out
                    </button>
                    <div className="p-4 bg-indigo-600 rounded-[2rem] text-white overflow-hidden relative group cursor-pointer shadow-lg shadow-indigo-100">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Support</p>
                            <p className="font-bold text-sm mt-1">24/7 Concierge</p>
                        </div>
                        <Activity className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </aside>

            {/* Main Workspace Area */}
            <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                {/* Modern Topbar */}
                <header className="h-20 lg:h-24 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-6 lg:px-12 shrink-0 z-40">
                    <div className="flex items-center gap-8 flex-1">
                        <div className="lg:hidden flex items-center gap-2">
                             <img src="/logo.png" alt="Logo" className="w-8 h-8" />
                        </div>
                        <div className="hidden sm:flex items-center bg-slate-100 rounded-2xl px-4 py-2.5 w-full max-w-md border border-transparent focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-inner">
                            <Search size={18} className="text-slate-400" />
                            <input type="text" placeholder="Search records, doctors, or results..." className="bg-transparent border-none outline-none text-sm font-medium px-3 w-full" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6 ml-4">
                        <button className="relative w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm group">
                            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                            {notifications.length > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />}
                        </button>
                        
                        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block mr-1">
                                <p className="text-xs font-black text-slate-900 leading-none mb-1">{userData?.name || 'Authorized Patient'}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Patient Workspace</p>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                                <User size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-12 scroll-smooth bg-slate-50/50">
                    <div className="max-w-7xl mx-auto space-y-12 pb-20">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-10">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="lg:col-span-2 p-10 bg-indigo-600 rounded-[3rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000" />
                                            <div className="relative z-10">
                                                <Badge variant="success">PATIENT ACCOUNT SYNCED</Badge>
                                                <h2 className="text-4xl font-black mt-6 tracking-tight leading-tight">Your Health Vault <br /> is up to date.</h2>
                                                <p className="text-indigo-100/80 font-medium mt-4 max-w-sm">Manage your entire medical journey from one secure indigo interface.</p>
                                                <div className="mt-10 flex gap-4">
                                                    <button onClick={() => setActiveTab('appointments')} className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:scale-105 transition-transform flex items-center gap-2">
                                                        Book New Visit <Plus size={16} />
                                                    </button>
                                                    <button className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-2xl hover:bg-white/20 transition-all">
                                                        Refresh Records
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {[
                                            { label: 'Active Appointments', value: upcoming.length, icon: Calendar, color: 'text-sky-600', bg: 'bg-sky-50' },
                                            { label: 'Verified Records', value: stats.reports, icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' },
                                            { label: 'Digital Prescriptions', value: stats.prescriptions, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                            { label: 'Platform Status', value: 'Healthy', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' }
                                        ].map((s, i) => (
                                            <div key={i} className="p-8 surface-card surface-card-hover flex flex-col justify-between group">
                                                <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                                                    <s.icon size={24} />
                                                </div>
                                                <div>
                                                    <div className="text-3xl font-black text-slate-900 leading-none">{s.value}</div>
                                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{s.label}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Secondary Layout Body */}
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                        <div className="lg:col-span-8 space-y-10">
                                            {/* Clinical Timeline */}
                                            <section className="surface-card p-10 bg-linear-to-b from-white to-slate-50 relative overflow-hidden">
                                                <div className="flex items-center justify-between mb-12">
                                                    <div>
                                                        <h2 className="title-section text-slate-900 tracking-tighter">Clinical Timeline</h2>
                                                        <p className="text-sm text-slate-500 font-medium">Visualization of your past care activities</p>
                                                    </div>
                                                    <Link href="/doctors" className="h-10 px-4 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-[10px] font-black tracking-widest border border-indigo-100 hover:bg-indigo-100 transition-colors uppercase">All Records</Link>
                                                </div>

                                                {history.length > 0 ? (
                                                    <div className="relative space-y-16 pl-10 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-1 before:bg-slate-100 before:rounded-full">
                                                        {history.slice(0, 3).map((item, idx) => (
                                                            <div key={idx} className="relative group">
                                                                <div className="absolute -left-[3.1rem] top-1 w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center group-hover:border-indigo-400 group-hover:bg-indigo-50 transition-all duration-500 z-10 shadow-sm overflow-hidden">
                                                                    <div className="bg-slate-200/50 w-full h-full flex items-center justify-center group-hover:text-indigo-600 text-slate-400 transition-colors">
                                                                        <Calendar size={18} />
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-6 p-8 rounded-[2.5rem] bg-white border border-slate-100 group-hover:border-indigo-100 shadow-sm hover:shadow-premium transition-all duration-500">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-5">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="px-3 py-1 rounded-full bg-indigo-600 font-black text-[9px] text-white uppercase tracking-widest">{new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">DR. {item.doctorName || 'Senior Specialist'}</span>
                                                                        </div>
                                                                        <Badge variant={item.status === 'COMPLETED' ? 'success' : 'primary'}>{item.status}</Badge>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{item.condition || 'General Assessment'}</h4>
                                                                        <p className="text-slate-500 font-medium leading-relaxed italic line-clamp-2">"{item.description || 'Comprehensive assessment conducted for reported health markers.'}"</p>
                                                                        <div className="flex flex-wrap gap-2">
                                                                             {['Consultation', 'Labs', 'Diagnosis'].map(tag => (
                                                                                 <span key={tag} className="px-3 py-1 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">{tag}</span>
                                                                             ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                                                        <Activity className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                                                        <p className="text-slate-400 font-bold tracking-tight">Timeline history is currently empty.</p>
                                                    </div>
                                                )}
                                            </section>
                                        </div>

                                        <div className="lg:col-span-4 space-y-10">
                                            {/* Upcoming Quick Card */}
                                            <section className="surface-card p-10 space-y-8 bg-white border border-slate-100 relative overflow-hidden group shadow-xl shadow-slate-200/50">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl pointer-events-none" />
                                                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-900">
                                                    <Clock size={24} className="text-indigo-600" /> Appointments
                                                </h3>
                                                
                                                <div className="space-y-4">
                                                    {upcoming.length > 0 ? upcoming.slice(0, 2).map((u, i) => (
                                                        <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-indigo-100 transition-all shadow-sm">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs">#{u.id}</div>
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Token #{u.tokenNumber || 'TBD'}</span>
                                                            </div>
                                                            <div className="text-sm font-bold text-slate-700">{u.appointmentDate}</div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Confirmed Specialist</div>
                                                        </div>
                                                    )) : (
                                                        <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                                                            <p className="text-slate-400 text-xs font-bold leading-relaxed">No sessions scheduled for this cycle.</p>
                                                            <button onClick={() => router.push('/doctors')} className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors">Book Now</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>

                                            {/* AI Triage Banner */}
                                            <div className="p-10 rounded-[3rem] bg-emerald-600 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-emerald-100" onClick={() => router.push('/chat')}>
                                                <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/20" />
                                                <div className="relative z-10 space-y-6">
                                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                                        <Activity size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black tracking-tight">Need Medical Clarity?</h4>
                                                        <p className="text-emerald-100/70 font-medium text-xs mt-2 leading-relaxed">Ask our Digital Triage for structured diagnostic insights before your visit.</p>
                                                    </div>
                                                </div>
                                                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            
                            {activeTab === 'prescriptions' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                        <div>
                                            <h2 className="title-display text-4xl leading-tight tracking-tighter text-slate-900">Digital Rx <span className="text-indigo-600">Archive.</span></h2>
                                            <p className="text-lg text-slate-500 font-medium mt-2">Verified prescriptions issued by your specialist ecosystem.</p>
                                        </div>
                                        <button className="btn-secondary flex items-center gap-3">
                                            <Download size={20} className="text-indigo-600" /> Export All History
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                        {prescriptions.length > 0 ? prescriptions.map((px, i) => (
                                            <div key={i} className="surface-card p-10 surface-card-hover group border border-slate-100 relative">
                                                <div className="absolute top-10 right-10 flex gap-2">
                                                    <Badge variant="success">AUTHORIZED</Badge>
                                                </div>
                                                
                                                <div className="flex items-start gap-6 mb-10">
                                                    <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner border border-indigo-100">
                                                        <ShieldCheck size={32} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Prescription ID #{px.id}</p>
                                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{px.medicineName}</h3>
                                                        <p className="text-sm font-bold text-indigo-500 mt-1 uppercase tracking-widest">DR. {px.doctorName || 'Authorized Specialist'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-50">
                                                    {[
                                                        { l: 'Dosage', v: px.dosage, i: Clock },
                                                        { l: 'Frequency', v: px.frequency, i: Activity },
                                                        { l: 'Duration', v: px.duration, i: Calendar },
                                                        { l: 'Issued', v: px.issuedDate, i: User }
                                                    ].map((it, idx) => (
                                                        <div key={idx}>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><it.i size={10} className="text-indigo-600" /> {it.l}</p>
                                                            <p className="text-xs font-bold text-slate-700">{it.v || 'Contact Pharmacist'}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-8 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={16} /></div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Authentication Signature</p>
                                                    </div>
                                                    <button className="h-12 px-6 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-lg shadow-indigo-100">
                                                        <Download size={16} /> View Digital PDF
                                                    </button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="xl:col-span-2 py-32 text-center surface-card border-dashed bg-slate-50/50">
                                                <Shield size={48} className="mx-auto text-slate-300 mb-6" />
                                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">No digital prescriptions found.</h3>
                                                <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">As doctors issue prescriptions, they will be instantly synchronized and updated in this repository.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'appointments' && (
                                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                        <div>
                                            <h2 className="title-display text-4xl leading-tight tracking-tighter text-slate-900 font-display">Manage Care <span className="text-indigo-600">Events.</span></h2>
                                            <p className="text-lg text-slate-500 font-medium mt-2">Digital queue management, visit history, and new consultation bookings.</p>
                                        </div>
                                        <button onClick={() => router.push('/doctors')} className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:scale-105 transition-all text-sm flex items-center gap-3">
                                            Find New Specialist <ArrowRight size={18} />
                                        </button>
                                    </div>

                                    <div className="surface-card p-10 bg-white min-h-[500px]">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {upcoming.length > 0 ? upcoming.map((u, i) => (
                                                <div key={i} className="p-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/30 hover:bg-white hover:border-indigo-100 hover:shadow-premium transition-all duration-500 group relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rotate-45 translate-x-12 -translate-y-12 pointer-events-none" />
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-100 text-indigo-600 flex items-center justify-center shadow-sm">
                                                            <Calendar size={28} />
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest inline-block">TOKEN #{u.tokenNumber || 'TBD'}</div>
                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{u.status}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-5">
                                                        <div>
                                                            <h4 className="text-xl font-black text-slate-900 tracking-tight">Visit with Dr. {u.doctorName || 'Specialist'}</h4>
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Confirmed for clinical care</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-50">
                                                            <Clock size={16} className="text-indigo-600" />
                                                            <span className="text-sm font-bold text-slate-700">{u.appointmentDate}</span>
                                                        </div>
                                                        <div className="pt-2 flex gap-3">
                                                            {u.status === 'PAID' ? (
                                                                <button onClick={() => router.push('/telemedicine')} className="flex-1 py-3 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg border border-indigo-500 hover:bg-indigo-700 transition-all">Open Virtual Call</button>
                                                            ) : (
                                                                <button onClick={() => router.push('/payment')} className="flex-1 py-3 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100">Clear Balance</button>
                                                            )}
                                                            <button className="w-12 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-all"><Settings size={18} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="col-span-full py-32 text-center opacity-40">
                                                    <Calendar size={48} className="mx-auto mb-6" />
                                                    <p className="font-bold text-slate-500 tracking-tight uppercase tracking-widest text-[10px]">No Active Care Slots Detected</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                 </motion.div>
                            )}

                             {activeTab === 'payments' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                                     <div>
                                        <h2 className="title-display text-4xl leading-tight tracking-tighter text-slate-900 font-display">Financial <span className="text-indigo-600">Sync.</span></h2>
                                        <p className="text-lg text-slate-500 font-medium mt-2">Transparent billing history, payment settlements, and digital receipts.</p>
                                    </div>

                                    <div className="surface-card p-10 bg-white overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none -mr-16 -mt-16">
                                            <Wallet size={300} strokeWidth={1} />
                                        </div>
                                        <table className="w-full text-left">
                                            <thead className="border-b border-slate-100">
                                                <tr>
                                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Reference Node</th>
                                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">Clinical Event</th>
                                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none text-right">Settled Amount</th>
                                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none text-center">Security Status</th>
                                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none text-right">Archived</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {payments.length > 0 ? payments.map((p, i) => (
                                                    <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                                                        <td className="px-6 py-8">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-black text-slate-900">#PY-{String(p.id).padStart(5, '0')}</span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{p.paidDate || 'Pending Cycle'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-[10px] shadow-inner">TR</div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-bold text-slate-900 leading-none">Authorized Consultation Fee</span>
                                                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-2">{p.method || 'Standard Wire'}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-8 text-right">
                                                            <span className="text-base font-black text-slate-900 leading-none">LKR {p.amount?.toLocaleString()}</span>
                                                        </td>
                                                        <td className="px-6 py-8">
                                                            <div className="flex justify-center">
                                                                <div className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 ${p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'SUCCESS' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                                    {p.status}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-8 text-right">
                                                            <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all opacity-0 group-hover:opacity-100 shadow-sm"><Download size={16} /></button>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={5} className="py-32 text-center opacity-40">
                                                            <Wallet size={48} className="mx-auto mb-4" />
                                                            <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Financial History Cleared</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                             {activeTab === 'reports' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                        <div>
                                            <h2 className="title-display text-4xl leading-tight tracking-tighter text-slate-900">Records <span className="text-indigo-600">Vault.</span></h2>
                                            <p className="text-lg text-slate-500 font-medium mt-2">Secure repository for medical reports, lab results, and history.</p>
                                        </div>
                                        <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2">
                                            <Plus size={18} /> Upload New Record
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {reports.length > 0 ? reports.map((r, i) => (
                                            <div key={i} className="surface-card p-8 surface-card-hover group border border-slate-100">
                                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                                                    <FileText size={24} />
                                                </div>
                                                <h4 className="text-lg font-black text-slate-900 tracking-tight">{r.title || 'Medical Report'}</h4>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Issued: {r.date}</p>
                                                <div className="mt-8 flex justify-between items-center">
                                                    <Badge variant="primary">{r.type || 'LAB'}</Badge>
                                                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Download size={20} /></button>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="col-span-full py-32 text-center surface-card border-dashed">
                                                <FileText size={48} className="mx-auto text-slate-200 mb-6" />
                                                <p className="text-slate-400 font-bold tracking-tight">No scientific records archived yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'telemedicine' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 text-center py-20">
                                    <div className="max-w-xl mx-auto space-y-8 surface-card p-12 bg-white">
                                        <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
                                            <Video size={48} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Virtual Clinic Access</h2>
                                            <p className="text-slate-500 font-medium mt-4">Connect with your specialist via high-definition encrypted video link.</p>
                                        </div>
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Queue Status</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">Join button will activate 5 minutes before your scheduled clinical session.</p>
                                        </div>
                                        <button onClick={() => router.push('/telemedicine')} className="btn-primary w-full py-4 text-center">Enter Command Center</button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'chat' && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                        <div>
                                            <h2 className="title-display text-4xl leading-tight tracking-tighter text-slate-900">AI <span className="text-indigo-600">Diagnostic.</span></h2>
                                            <p className="text-lg text-slate-500 font-medium mt-2">Structured diagnostic insights and symptom analysis.</p>
                                        </div>
                                    </div>
                                    <div className="surface-card p-12 bg-indigo-600 text-white flex items-center justify-between group overflow-hidden relative">
                                        <div className="relative z-10 space-y-6 max-w-lg">
                                            <h3 className="text-3xl font-black leading-tight italic tracking-widest uppercase">Launch AI Triage</h3>
                                            <p className="text-indigo-100/80 font-medium">Get immediate clarity on your symptoms with our clinical-grade AI assessment tool.</p>
                                            <button onClick={() => router.push('/chat')} className="px-8 py-4 bg-white text-indigo-600 font-black rounded-2xl hover:scale-105 transition-transform uppercase tracking-widest text-xs">Begin Session</button>
                                        </div>
                                        <Activity size={300} className="absolute -right-20 -bottom-20 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'profile' && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-4xl space-y-10">
                                    <div className="surface-card p-12 bg-white flex flex-col md:flex-row items-center gap-12">
                                        <div className="w-40 h-40 rounded-[3rem] bg-slate-900 flex items-center justify-center text-indigo-400 text-6xl shadow-2xl relative group overflow-hidden">
                                            <User size={64} className="group-hover:scale-110 transition-transform" />
                                            <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                <Plus size={32} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center md:text-left space-y-4">
                                            <Badge variant="indigo">VERIFIED PATIENT IDENTITY</Badge>
                                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic tracking-widest leading-none">{userData?.name}</h2>
                                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                                <span className="text-sm font-bold text-slate-500 flex items-center gap-2"><LayoutDashboard size={14} className="text-indigo-600" /> Patient UUID: #{userData?.id}</span>
                                                <span className="text-sm font-bold text-slate-500 flex items-center gap-2"><Activity size={14} className="text-emerald-500" /> Blood Group: {userData?.bloodGroup || 'O+'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="surface-card p-10 bg-white">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Clinical Details</h3>
                                            <div className="space-y-6">
                                                {[
                                                    { label: 'Date of Birth', value: userData?.dob || '1995-10-12', icon: Calendar },
                                                    { label: 'Allergies', value: userData?.allergies || 'No known allergies', icon: AlertCircle },
                                                    { label: 'Chronic Diseases', value: userData?.chronicDiseases || 'None reported', icon: Activity }
                                                ].map((d, i) => (
                                                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><d.icon size={12} className="text-indigo-600" /> {d.label}</span>
                                                        <span className="text-sm font-bold text-slate-700">{d.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="surface-card p-10 bg-white">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Workspace Settings</h3>
                                            <div className="space-y-4">
                                                <button className="w-full py-4 px-6 bg-slate-50 rounded-2xl flex items-center justify-between text-sm font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all group">
                                                    Update Medical Dossier <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </button>
                                                <button className="w-full py-4 px-6 bg-slate-50 rounded-2xl flex items-center justify-between text-sm font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-all group">
                                                    Infrastructure Security <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Global Mobile Drawer */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 h-20 bg-slate-900/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl z-[100] flex items-center justify-around px-8">
                {navItems.slice(0, 5).map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`p-3 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 -translate-y-4' : 'text-slate-500'}`}
                    >
                        <item.icon size={22} />
                    </button>
                ))}
            </div>
        </div>
    );
};

const Badge = ({ children, variant = 'primary' }) => {
    const variants = {
        primary: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        warning: 'bg-amber-50 text-amber-600 border-amber-100',
        danger: 'bg-rose-50 text-rose-600 border-rose-100'
    };
    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${variants[variant] || variants.primary} uppercase tracking-[0.2em] inline-block shadow-sm`}>
            {children}
        </span>
    );
};

export default PatientDashboard;
