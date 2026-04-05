import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
import { patientApi, appointmentApi, medicalHistoryApi, paymentApi, prescriptionApi, notificationApi, fileUploadApi } from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FileUpload from '../../components/ui/FileUpload';

const PatientDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({ appointments: 0, reports: 0, prescriptions: 0 });
    const [allAppointments, setAllAppointments] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [history, setHistory] = useState([]);
    const [reports, setReports] = useState([]);
    const [payments, setPayments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadReportType, setUploadReportType] = useState('LAB_RESULT');
    const router = useRouter();

    useEffect(() => {
        if (typeof router.query.tab === 'string') {
            setActiveTab(router.query.tab);
        }
    }, [router.query.tab]);

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
                    // Step 1: Resolve Clinical Profile by user ID -> patient ID mapping.
                    setLoading(true);
                    const id = localStorage.getItem('user_id');
                    const name = localStorage.getItem('user_name');

                    const patientRes = await patientApi.get(`/user/${id}`).catch(err => {
                        if (err.response?.status === 401) logout();
                        return { data: { data: {} } };
                    });
                    const patientInfo = patientRes.data?.data || patientRes.data || {};
                    const clinicalId = patientInfo.id;

                    if (!clinicalId) {
                        console.warn("Could not resolve clinical ID for user:", id);
                        setUserData({ name: name, id, clinicalId: null });
                        setLoading(false);
                        return;
                    }

                    localStorage.setItem('patient_id', String(clinicalId));

                    // Step 2: Fetch clinical records using the correct clinicalId
                    const [apptRes, historyRes, reportRes, paymentRes, prescRes, notifRes] = await Promise.all([
                        appointmentApi.get(`/patient/${clinicalId}`).catch(() => ({ data: { data: [] } })),
                        medicalHistoryApi.get(`/patient/${clinicalId}`).catch(() => ({ data: { data: [] } })),
                        patientApi.get(`/${clinicalId}/reports`).catch(() => ({ data: { data: [] } })),
                        paymentApi.get(`/patient/${clinicalId}/history`).catch(() => ({ data: { data: [] } })),
                        prescriptionApi.get(`/patient/${clinicalId}`).catch(() => ({ data: { data: [] } })),
                        notificationApi.get(`/user/${id}`).catch(() => ({ data: { data: [] } }))
                    ]);

                    const allAppts = apptRes.data?.data || apptRes.data || [];
                    const historyInfo = historyRes.data?.data || historyRes.data || [];
                    const reportInfo = reportRes.data?.data || reportRes.data || [];
                    const paymentInfo = paymentRes.data?.data || paymentRes.data || [];
                    const prescriptionInfo = prescRes.data?.data || prescRes.data || [];
                    const notificationInfo = notifRes.data?.data || notifRes.data || [];

                    const safeAppts = Array.isArray(allAppts) ? allAppts : [];
                    const safeHistory = Array.isArray(historyInfo) ? historyInfo : [];
                    const safeReports = Array.isArray(reportInfo) ? reportInfo : [];
                    const safePayments = Array.isArray(paymentInfo) ? paymentInfo : [];
                    const safePrescriptions = Array.isArray(prescriptionInfo) ? prescriptionInfo : [];
                    const safeNotifications = Array.isArray(notificationInfo) ? notificationInfo : [];

                    setUserData({ ...patientInfo, name: patientInfo.name || name, id, clinicalId });
                    setAllAppointments(safeAppts);
                    setUpcoming(safeAppts.filter(a => ['CONFIRMED', 'PAID', 'PENDING_PAYMENT'].includes(a.status)));
                    setHistory(safeHistory);
                    setReports(safeReports);
                    setPayments(safePayments);
                    setPrescriptions(safePrescriptions);
                    setNotifications(safeNotifications);
                    setStats({
                        appointments: safeAppts.length,
                        reports: safeReports.length,
                        prescriptions: safePrescriptions.length
                    });
                } catch (err) {
                    console.error('Failed to fetch dashboard data', err);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        }
    }, [router.pathname]);

    // Handle Payment Success Redirect
    useEffect(() => {
        if (router.query.payment === 'success') {
            console.log("Payment success detected — synchronizing visit states...");
            const id = localStorage.getItem('patient_id') || localStorage.getItem('user_id');

            const syncData = async () => {
                await new Promise((resolve) => setTimeout(resolve, 750));
                const apptRes = await appointmentApi.get(`/patient/${id}`).catch(() => ({ data: { data: [] } }));
                const allAppts = apptRes.data?.data || apptRes.data || [];
                const safeAppts = Array.isArray(allAppts) ? allAppts : [];
                setAllAppointments(safeAppts);
                setUpcoming(safeAppts.filter(a => ['CONFIRMED', 'PAID', 'PENDING_PAYMENT'].includes(a.status)));

                // Update URL to remove visual success param without reload
                router.replace('/dashboard/patient', undefined, { shallow: true });
            };
            syncData();
        }
    }, [router.query.payment, router.query.appointmentId]);

    const logout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const handleFileUpload = async (file) => {
        const patientId = localStorage.getItem('patient_id') || userData?.clinicalId;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', uploadDescription);
        formData.append('reportType', uploadReportType);

        const response = await fileUploadApi.post(`/${patientId}/reports`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Refresh reports list
        const reportRes = await patientApi.get(`/${userData.clinicalId}/reports`).catch(() => ({ data: { data: [] } }));
        setReports(reportRes.data?.data || []);
        setShowUploadModal(false);
        setUploadDescription('');
        setUploadReportType('LAB_RESULT');
    };

    const handleDownloadReport = async (report) => {
        try {
            if (report.fileUrl) {
                window.open(report.fileUrl, '_blank');
            }
        } catch (err) {
            console.error('Download failed', err);
        }
    };

    const downloadPrescriptionPdf = async (prescriptionId) => {
        try {
            const response = await prescriptionApi.get(`/${prescriptionId}/pdf`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `prescription_${prescriptionId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download prescription PDF', err);
        }
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
        <>
            <Head>
                <title>{userData?.name ? `${userData.name} | Patient Health Vault` : 'Patient Dashboard'} | SynapsCare</title>
                <meta name="description" content="Securely manage your medical records, appointments, and prescriptions" />
            </Head>
            <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-teal-100 selection:text-teal-900 overflow-hidden">
                {/* Professional Responsive Sidebar */}
                <aside className="hidden lg:flex flex-col w-[260px] border-r border-slate-200 bg-white sticky top-0 h-screen px-6 py-6 transition-all duration-500 overflow-hidden z-50">
                    <div className="flex items-center gap-3 mb-8 group cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => router.push('/')}>
                        <img src="/logo.png" alt="SynapseCare" className="w-9 h-9 drop-shadow-sm transition-transform group-hover:rotate-12" />
                        <span className="text-xl font-black tracking-tight text-slate-800">Synapse<span className="text-teal-600">Care</span></span>
                    </div>

                    <div className="mb-4 px-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Main Care Console</p>
                    </div>

                    <nav className="flex-1 space-y-1.5">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    router.replace(`/dashboard/patient?tab=${item.id}`, undefined, { shallow: true });
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold tracking-tight transition-all duration-300 relative group overflow-hidden ${activeTab === item.id
                                    ? 'bg-teal-600 text-white shadow-xl shadow-teal-200'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600'
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

                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5">
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-amber-50 hover:text-amber-700 transition-all group">
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Log Out
                        </button>
                        <div className="p-4 bg-teal-600 rounded-[1.5rem] text-white overflow-hidden relative group cursor-pointer shadow-lg shadow-teal-100">
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
                            <div className="hidden sm:flex items-center bg-slate-100 rounded-2xl px-4 py-2.5 w-full max-w-md border border-transparent focus-within:border-teal-400 focus-within:bg-white transition-all shadow-inner">
                                <Search size={18} className="text-slate-400" />
                                <input type="text" placeholder="Search records, doctors, or results..." className="bg-transparent border-none outline-none text-sm font-medium px-3 w-full" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:gap-6 ml-4">
                            <button className="relative w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-teal-400 hover:text-teal-600 transition-all shadow-sm group">
                                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                                {notifications.length > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />}
                            </button>

                            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block mr-1">
                                    <p className="text-xs font-black text-slate-900 leading-none mb-1">{userData?.name || 'Authorized Patient'}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Patient Workspace</p>
                                </div>
                                <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-sm">
                                    <User size={20} />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Dashboard Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth bg-slate-50/50">
                        <div className="max-w-6xl mx-auto space-y-8 pb-16">
                            <AnimatePresence mode="wait">
                                {activeTab === 'overview' && (
                                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-8">
                                        {/* Care Snapshot */}
                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                                            <div className="xl:col-span-7 p-8 bg-gradient-to-br from-teal-600 via-teal-600 to-emerald-600 rounded-[3rem] text-white shadow-2xl shadow-teal-200 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[90px] group-hover:scale-110 transition-transform duration-1000" />
                                                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                                                <div className="relative z-10 max-w-2xl">
                                                    <Badge variant="teal">TODAY&apos;S CARE SUMMARY</Badge>
                                                    <h2 className="text-4xl font-black mt-6 tracking-tighter leading-tight">Welcome back, {userData?.name || 'Patient'}.<br />Your care is ready at a glance.</h2>
                                                    <p className="text-teal-100/90 font-medium mt-4 max-w-xl leading-relaxed">See what matters now, open your next visit, and keep records, prescriptions, and bills in one calm place.</p>

                                                    <div className="mt-8 flex flex-wrap gap-3">
                                                        {[
                                                            { label: 'Upcoming', value: upcoming.length },
                                                            { label: 'Reports', value: stats.reports },
                                                            { label: 'Rx', value: stats.prescriptions }
                                                        ].map((item) => (
                                                            <div key={item.label} className="px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-2 text-sm font-bold">
                                                                <span className="text-white/70 text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
                                                                <span className="text-white">{item.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-10 flex flex-wrap gap-4">
                                                        <button onClick={() => setActiveTab('appointments')} className="px-6 py-3 bg-white text-teal-700 font-bold rounded-2xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-teal-900/10">
                                                            Book Appointment <Plus size={16} />
                                                        </button>
                                                        <button onClick={() => setActiveTab('reports')} className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 font-bold rounded-2xl hover:bg-white/20 transition-all">
                                                            View Records
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">
                                                {[
                                                    { label: 'Next Visits', value: upcoming.length, icon: Calendar, color: 'text-teal-600', bg: 'bg-teal-50', note: 'Upcoming appointments' },
                                                    { label: 'Records', value: stats.reports, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', note: 'Uploaded medical files' },
                                                    { label: 'Prescriptions', value: stats.prescriptions, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', note: 'Active digital Rx' }
                                                ].map((s, i) => (
                                                    <div key={i} className="surface-card surface-card-hover p-5 flex items-center gap-4 group">
                                                        <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0`}>
                                                            <s.icon size={24} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-3xl font-black text-slate-900 leading-none">{s.value}</div>
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{s.label}</div>
                                                            <p className="text-xs text-slate-500 mt-1">{s.note}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Secondary Layout Body */}
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            <div className="lg:col-span-8 space-y-8">
                                                {/* Clinical Timeline */}
                                                <section className="surface-card p-8 bg-linear-to-b from-white to-slate-50 relative overflow-hidden">
                                                    <div className="flex items-center justify-between mb-12">
                                                        <div>
                                                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Clinical Timeline</h2>
                                                            <p className="text-sm text-slate-500 font-medium">Visualization of your past care activities</p>
                                                        </div>
                                                        <Link href="/doctors" className="h-10 px-4 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-[10px] font-black tracking-widest border border-teal-100 hover:bg-teal-100 transition-colors uppercase">All Records</Link>
                                                    </div>

                                                    {history.length > 0 ? (
                                                        <div className="relative space-y-16 pl-10 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-1 before:bg-slate-100 before:rounded-full">
                                                            {history.slice(0, 3).map((item, idx) => (
                                                                <div key={idx} className="relative group">
                                                                    <div className="absolute -left-[3.1rem] top-1 w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center group-hover:border-teal-400 group-hover:bg-teal-50 transition-all duration-500 z-10 shadow-sm overflow-hidden">
                                                                        <div className="bg-slate-200/50 w-full h-full flex items-center justify-center group-hover:text-teal-600 text-slate-400 transition-colors">
                                                                            <Calendar size={18} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-6 p-8 rounded-[2.5rem] bg-white border border-slate-100 group-hover:border-teal-100 shadow-sm hover:shadow-premium transition-all duration-500">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-5">
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="px-3 py-1 rounded-full bg-teal-600 font-black text-[9px] text-white uppercase tracking-widest">{new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
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

                                            <div className="lg:col-span-4 space-y-8">
                                                {/* Upcoming Quick Card */}
                                                <section className="surface-card p-8 space-y-6 bg-white border border-slate-100 relative overflow-hidden group shadow-xl shadow-slate-200/50">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl pointer-events-none" />
                                                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-900">
                                                        <Clock size={24} className="text-teal-600" /> Appointments
                                                    </h3>

                                                    <div className="space-y-3.5">
                                                        {upcoming.length > 0 ? upcoming.slice(0, 2).map((u, i) => (
                                                            <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-teal-100 transition-all shadow-sm">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-black text-xs">#{u.id}</div>
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-teal-500">Token #{u.tokenNumber || 'TBD'}</span>
                                                                </div>
                                                                <div className="text-sm font-bold text-slate-700">{u.appointmentDate}</div>
                                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Confirmed Specialist</div>
                                                            </div>
                                                        )) : (
                                                            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                                                                <p className="text-slate-400 text-xs font-bold leading-relaxed">No sessions scheduled for this cycle.</p>
                                                                <button onClick={() => router.push('/doctors')} className="mt-4 text-xs font-black text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-colors">Book Now</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </section>

                                                {/* AI Triage Banner */}
                                                <div className="p-8 rounded-[3rem] bg-emerald-600 text-white relative overflow-hidden group cursor-pointer shadow-xl shadow-emerald-100" onClick={() => router.push('/chat')}>
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
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                            <div>
                                                <h2 className="text-4xl leading-tight tracking-tighter text-slate-900 font-black">My <span className="text-teal-600">Prescriptions.</span></h2>
                                                <p className="text-lg text-slate-500 font-medium mt-2">View prescriptions issued by your care team in one place.</p>
                                            </div>
                                            <button className="btn-secondary flex items-center gap-3">
                                                <Download size={20} className="text-teal-600" /> Export All History
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                            {prescriptions.length > 0 ? prescriptions.map((px, i) => (
                                                <div key={i} className="surface-card p-8 surface-card-hover group border border-slate-100 relative">
                                                    <div className="absolute top-10 right-10 flex gap-2">
                                                        <Badge variant="success">AUTHORIZED</Badge>
                                                    </div>

                                                    <div className="flex items-start gap-6 mb-10">
                                                        <div className="w-20 h-20 rounded-[2rem] bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner border border-teal-100">
                                                            <ShieldCheck size={32} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Prescription ID #{px.id}</p>
                                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{px.medicineName}</h3>
                                                            <p className="text-sm font-bold text-teal-500 mt-1 uppercase tracking-widest">DR. {px.doctorName || 'Authorized Specialist'}</p>
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
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><it.i size={10} className="text-teal-600" /> {it.l}</p>
                                                                <p className="text-xs font-bold text-slate-700">{it.v || 'Contact Pharmacist'}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-8 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={16} /></div>
                                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digital Authentication Signature</p>
                                                        </div>
                                                        <button onClick={() => downloadPrescriptionPdf(px.id)} className="h-12 px-6 bg-teal-600 text-white rounded-2xl font-bold text-xs hover:bg-teal-700 transition-all flex items-center gap-3 shadow-lg shadow-teal-100">
                                                            <Download size={16} /> Download PDF
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
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 text-slate-900 font-sans">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                            <div>
                                                <h2 className="text-4xl leading-tight tracking-tighter font-black">Upcoming <span className="text-teal-600">Visits.</span></h2>
                                                <p className="text-lg text-slate-500 font-medium mt-2">Check confirmed visits, access your token, and join virtual care when it is ready.</p>
                                            </div>
                                            <button onClick={() => router.push('/doctors')} className="px-8 py-4 bg-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-100 hover:scale-105 transition-all text-sm flex items-center gap-3">
                                                Schedule New Appointment <ArrowRight size={18} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            <div className="lg:col-span-8 space-y-8">
                                                {upcoming.length > 0 ? upcoming.map((u, i) => (
                                                    <div key={i} className="p-8 rounded-[3rem] border border-slate-100 bg-white hover:border-teal-100 hover:shadow-premium transition-all duration-500 group relative overflow-hidden shadow-sm">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-600/5 rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />

                                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                                                            <div className="flex items-center gap-6">
                                                                <div className="w-20 h-20 rounded-[2rem] bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner border border-teal-100 flex-shrink-0">
                                                                    <Calendar size={32} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                        <Clock size={12} className="text-teal-600" /> Confirmed {u.appointmentDate || u.date} at {u.appointmentTime || u.time || '14:00'}
                                                                    </p>
                                                                    <h4 className="text-2xl font-black tracking-tight leading-tight uppercase italic">{u.doctorName || 'Senior Specialist'}</h4>
                                                                    <div className="flex gap-2 mt-3">
                                                                        <Badge variant={['CONFIRMED', 'PAID'].includes(u.status) ? 'success' : 'primary'}>{u.status}</Badge>
                                                                        <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400">ID #{u.id}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-center md:text-right p-6 bg-slate-50 rounded-3xl border border-slate-100 min-w-[140px]">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Your Token</p>
                                                                <p className="text-4xl font-black text-teal-600 drop-shadow-sm leading-none mt-2">{u.tokenNumber || 'TBD'}</p>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10 border-b border-slate-50 mb-10">
                                                            <div className="p-6 bg-teal-50/30 rounded-3xl border border-teal-100/50">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-teal-500 mb-2">Visit Type</p>
                                                                <p className="text-sm font-bold flex items-center gap-2">{u.consultationType || 'Virtual Video Call'} <Video size={14} className="text-teal-600" /></p>
                                                            </div>
                                                            <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50">
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Financial Node</p>
                                                                <p className="text-sm font-bold">LKR {u.fee?.toLocaleString() || '1,500'} Settlement</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-4">
                                                            {(u.status === 'PAID' || u.status === 'CONFIRMED') ? (
                                                                <button
                                                                    onClick={() => {
                                                                        localStorage.setItem('active_consultation_id', u.id);
                                                                        router.push('/telemedicine');
                                                                    }}
                                                                    className="flex-1 py-4 bg-teal-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-teal-100 border border-teal-500 hover:bg-teal-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                                                                >
                                                                    <Video size={18} /> Join Clinical Session
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => router.push(`/payment?appointmentId=${u.id}&amount=${u.fee || 1500}&patientId=${userData.id}&doctorId=${u.doctorId}`)}
                                                                    className="flex-1 py-4 bg-white text-teal-600 border-2 border-teal-600 font-black text-sm rounded-2xl hover:bg-teal-50 transition-all uppercase tracking-widest"
                                                                >
                                                                    Settle Clinical Fee
                                                                </button>
                                                            )}
                                                            <button className="w-16 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:border-teal-400 hover:text-teal-600 transition-all"><Settings size={20} /></button>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="py-40 text-center surface-card border-dashed bg-slate-50 max-w-2xl mx-auto rounded-[3rem]">
                                                        <Calendar size={64} className="mx-auto text-slate-200 mb-8" strokeWidth={1} />
                                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Agenda Clear.</h3>
                                                        <p className="text-slate-500 mt-3 font-medium px-10">No upcoming visits yet. When you book one, it will appear here with your token and time.</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="lg:col-span-4 space-y-8">
                                                <div className="p-8 rounded-[3rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-600/20 blur-3xl" />
                                                    <h3 className="text-xl font-black italic tracking-widest uppercase mb-6 leading-none">Billing</h3>
                                                    <div className="space-y-5">
                                                        {payments.slice(0, 3).map((p, i) => (
                                                            <div key={i} className="flex justify-between items-center group cursor-pointer border-b border-white/10 pb-4 last:border-0 last:pb-0">
                                                                <div>
                                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-400">Node #{p.id}</p>
                                                                    <p className="text-xs font-bold mt-1">Receipt Verified</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-black tracking-tight">{p.amount?.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button onClick={() => setActiveTab('payments')} className="w-full mt-10 py-4 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase hover:bg-white/20 transition-all">View Full History</button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}                             {activeTab === 'payments' && (

                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div>
                                            <h2 className="text-4xl leading-tight tracking-tighter text-slate-900 font-black">Payments <span className="text-teal-600">& History.</span></h2>
                                            <p className="text-lg text-slate-500 font-medium mt-2">Review your payment history, settlements, and receipts.</p>
                                        </div>

                                        <div className="surface-card p-8 bg-white overflow-hidden relative">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -mr-16 -mt-16">
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
                                                                        <span className="text-[9px] font-black text-teal-500 uppercase tracking-widest mt-2">{p.method || 'Standard Wire'}</span>
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
                                                                <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-400 transition-all opacity-0 group-hover:opacity-100 shadow-sm"><Download size={16} /></button>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan={5} className="py-32 text-center opacity-40">
                                                                <Wallet size={48} className="mx-auto mb-4" />
                                                                <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">No payment history yet</p>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'reports' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                            <div>
                                                <h2 className="text-4xl leading-tight tracking-tighter text-slate-900 font-black">Medical <span className="text-teal-600">Records.</span></h2>
                                                <p className="text-lg text-slate-500 font-medium mt-2">Keep reports, lab results, and history organized and easy to find.</p>
                                            </div>
                                            <button onClick={() => setShowUploadModal(true)} className="px-6 py-3 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-100 flex items-center gap-2">
                                                <Plus size={18} /> Upload New Record
                                            </button>
                                        </div>

                                        {/* Upload Modal */}
                                        {showUploadModal && (
                                            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                                                <div className="bg-white rounded-2xl p-8 max-w-lg w-full space-y-6">
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-2xl font-bold text-slate-900">Upload a Medical Report</h3>
                                                        <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                                                            <Plus size={24} className="rotate-45" />
                                                        </button>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-2">Report Type</label>
                                                            <select
                                                                value={uploadReportType}
                                                                onChange={(e) => setUploadReportType(e.target.value)}
                                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                            >
                                                                <option value="LAB_RESULT">Lab Result</option>
                                                                <option value="IMAGING">Imaging / X-Ray</option>
                                                                <option value="PRESCRIPTION">Prescription</option>
                                                                <option value="OTHER">Other</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                                            <input
                                                                type="text"
                                                                value={uploadDescription}
                                                                onChange={(e) => setUploadDescription(e.target.value)}
                                                                placeholder="e.g., Blood test results from City Hospital"
                                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                            />
                                                        </div>

                                                        <FileUpload
                                                            onUpload={handleFileUpload}
                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                            maxSize={10}
                                                            label="Drop your file here"
                                                            description="PDF, JPG, or PNG up to 10MB"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                            {reports.length > 0 ? reports.map((r, i) => (
                                                <div key={i} className="surface-card p-8 surface-card-hover group border border-slate-100">
                                                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
                                                        <FileText size={24} />
                                                    </div>
                                                    <h4 className="text-lg font-black text-slate-900 tracking-tight">{r.fileName || r.description || 'Medical Report'}</h4>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                                                        {r.uploadedAt ? new Date(r.uploadedAt).toLocaleDateString() : r.date}
                                                    </p>
                                                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{r.description}</p>
                                                    <div className="mt-8 flex justify-between items-center">
                                                        <Badge variant="primary">{r.reportType || r.type || 'OTHER'}</Badge>
                                                        <button
                                                            onClick={() => handleDownloadReport(r)}
                                                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                        >
                                                            <Download size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="col-span-full py-32 text-center surface-card border-dashed">
                                                    <FileText size={48} className="mx-auto text-slate-200 mb-6" />
                                                    <p className="text-slate-400 font-bold tracking-tight">No records uploaded yet.</p>
                                                    <button onClick={() => setShowUploadModal(true)} className="mt-4 text-teal-600 font-medium hover:underline">
                                                        Add your first report
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'telemedicine' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        {(() => {
                                            const telemedicineAppointments = allAppointments.filter((a) => {
                                                const mode = String(a.consultationType || a.mode || a.type || '').toUpperCase();
                                                return mode === 'ONLINE' || mode === 'TELEMEDICINE';
                                            });

                                            const upcomingTelemedicine = telemedicineAppointments.filter((a) =>
                                                ['PENDING', 'PENDING_PAYMENT', 'CONFIRMED', 'PAID', 'IN_SESSION'].includes(String(a.status || '').toUpperCase())
                                            );

                                            const completedTelemedicine = telemedicineAppointments.filter((a) =>
                                                ['COMPLETED', 'CANCELLED'].includes(String(a.status || '').toUpperCase())
                                            );

                                            const canJoinSession = (appt) => {
                                                const status = String(appt?.status || '').toUpperCase();
                                                if (['PAID', 'CONFIRMED', 'IN_SESSION'].includes(status)) return true;

                                                const date = appt?.appointmentDate || appt?.date;
                                                const time = appt?.appointmentTime || appt?.time;
                                                if (!date || !time) return false;

                                                const when = new Date(`${date}T${time}`);
                                                if (Number.isNaN(when.getTime())) return false;
                                                const unlockAt = new Date(when.getTime() - 60 * 60 * 1000);
                                                return new Date() >= unlockAt;
                                            };

                                            return (
                                                <>
                                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                                        <div>
                                                            <h2 className="text-4xl leading-tight tracking-tighter text-slate-900 font-black">Virtual <span className="text-teal-600">Clinic.</span></h2>
                                                            <p className="text-lg text-slate-500 font-medium mt-2">Join upcoming video consultations without leaving your patient dashboard.</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="primary">Upcoming {upcomingTelemedicine.length}</Badge>
                                                            <Badge variant="success">Completed {completedTelemedicine.length}</Badge>
                                                        </div>
                                                    </div>

                                                    {upcomingTelemedicine.length > 0 ? (
                                                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                                            {upcomingTelemedicine.map((appt) => {
                                                                const whenDate = appt.appointmentDate || appt.date || 'TBD';
                                                                const whenTime = appt.appointmentTime || appt.time || 'TBD';
                                                                const doctorName = appt.doctorName || `Doctor #${appt.doctorId}`;
                                                                const status = String(appt.status || 'PENDING').toUpperCase();

                                                                return (
                                                                    <div key={appt.id} className="surface-card p-8 bg-white border border-slate-100 space-y-6">
                                                                        <div className="flex items-start justify-between gap-4">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner">
                                                                                    <Video size={24} />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Telemedicine Visit</p>
                                                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">Dr. {doctorName}</h3>
                                                                                </div>
                                                                            </div>
                                                                            <Badge variant={status === 'PAID' || status === 'CONFIRMED' || status === 'IN_SESSION' ? 'success' : 'warning'}>{status}</Badge>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</p>
                                                                                <p className="text-sm font-bold text-slate-700 mt-1">{whenDate}</p>
                                                                            </div>
                                                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time</p>
                                                                                <p className="text-sm font-bold text-slate-700 mt-1">{whenTime}</p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex flex-col sm:flex-row gap-3">
                                                                            <button
                                                                                onClick={() => router.push(`/telemedicine?appointmentId=${appt.id}`)}
                                                                                disabled={!canJoinSession(appt)}
                                                                                className={`flex-1 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${canJoinSession(appt)
                                                                                    ? 'bg-teal-600 text-white hover:scale-[1.02] shadow-lg shadow-teal-200'
                                                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                                                    }`}
                                                                            >
                                                                                {canJoinSession(appt) ? 'Join Session' : 'Locked'}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setActiveTab('appointments')}
                                                                                className="flex-1 py-3 rounded-2xl text-sm font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 hover:border-teal-200 hover:text-teal-600 transition-all"
                                                                            >
                                                                                View Visit
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="surface-card p-12 bg-white border border-slate-100 text-center max-w-3xl">
                                                            <Video size={44} className="mx-auto text-slate-300 mb-6" />
                                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">No Upcoming Virtual Consultations</h3>
                                                            <p className="text-slate-500 font-medium mt-3">Book a telemedicine appointment to see your live session queue here.</p>
                                                            <button onClick={() => setActiveTab('appointments')} className="mt-6 px-8 py-3 bg-teal-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:scale-105 transition-transform">Go to Visits & Tokens</button>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </motion.div>
                                )}

                                {activeTab === 'chat' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                            <div>
                                                <h2 className="text-4xl leading-tight tracking-tighter text-slate-900 font-black">AI <span className="text-teal-600">Symptom Check.</span></h2>
                                                <p className="text-lg text-slate-500 font-medium mt-2">Get a quick, structured check before your visit.</p>
                                            </div>
                                        </div>
                                        <div className="surface-card p-8 bg-teal-600 text-white flex items-center justify-between group overflow-hidden relative">
                                            <div className="relative z-10 space-y-6 max-w-lg">
                                                <h3 className="text-3xl font-black leading-tight italic tracking-widest uppercase">Start a Quick Check</h3>
                                                <p className="text-teal-100/80 font-medium">Get quick guidance on symptoms before your appointment.</p>
                                                <button onClick={() => router.push('/chat')} className="px-8 py-4 bg-white text-teal-600 font-black rounded-2xl hover:scale-105 transition-transform uppercase tracking-widest text-xs">Start Check</button>
                                            </div>
                                            <Activity size={300} className="absolute -right-20 -bottom-20 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'profile' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-4xl space-y-8">
                                        <div className="surface-card p-8 bg-white flex flex-col md:flex-row items-center gap-8">
                                            <div className="w-40 h-40 rounded-[3rem] bg-slate-900 flex items-center justify-center text-teal-400 text-6xl shadow-2xl relative group overflow-hidden">
                                                <User size={64} className="group-hover:scale-110 transition-transform" />
                                                <div className="absolute inset-0 bg-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    <Plus size={32} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 text-center md:text-left space-y-4">
                                                <Badge variant="teal">VERIFIED PATIENT IDENTITY</Badge>
                                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">{userData?.name}</h2>
                                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                                    <span className="text-sm font-bold text-slate-500 flex items-center gap-2"><LayoutDashboard size={14} className="text-teal-600" /> Patient UUID: #{userData?.id}</span>
                                                    <span className="text-sm font-bold text-slate-500 flex items-center gap-2"><Activity size={14} className="text-emerald-500" /> Blood Group: {userData?.bloodGroup || 'O+'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="surface-card p-8 bg-white">
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Health Details</h3>
                                                <div className="space-y-6">
                                                    {[
                                                        { label: 'Date of Birth', value: userData?.dob || '1995-10-12', icon: Calendar },
                                                        { label: 'Allergies', value: userData?.allergies || 'No known allergies', icon: AlertCircle },
                                                        { label: 'Chronic Diseases', value: userData?.chronicDiseases || 'None reported', icon: Activity }
                                                    ].map((d, i) => (
                                                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><d.icon size={12} className="text-teal-600" /> {d.label}</span>
                                                            <span className="text-sm font-bold text-slate-700">{d.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="surface-card p-8 bg-white">
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Account Settings</h3>
                                                <div className="space-y-4">
                                                    <button className="w-full py-4 px-6 bg-slate-50 rounded-2xl flex items-center justify-between text-sm font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-600 transition-all group">
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
                            className={`p-3 rounded-2xl transition-all ${activeTab === item.id ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/30 -translate-y-4' : 'text-slate-500'}`}
                        >
                            <item.icon size={22} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};

const Badge = ({ children, variant = 'primary' }) => {
    const variants = {
        primary: 'bg-teal-50 text-teal-600 border-teal-100',
        teal: 'bg-teal-50 text-teal-600 border-teal-100',
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        warning: 'bg-amber-50 text-amber-600 border-amber-100',
        danger: 'bg-amber-50 text-amber-600 border-amber-100'
    };
    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${variants[variant] || variants.primary} uppercase tracking-[0.2em] inline-block shadow-sm`}>
            {children}
        </span>
    );
};

export default PatientDashboard;
