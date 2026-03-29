import React, { useEffect, useState } from 'react';
import { adminApi, doctorApi, publicDoctorApi } from '../../lib/api';
import {
    Activity,
    Users,
    ShieldCheck,
    Calendar,
    CreditCard,
    Search,
    LogOut,
    AlertCircle,
    CheckCircle2,
    Settings,
    LayoutDashboard,
    Zap,
    Bell,
    User,
    ChevronRight,
    Filter,
    Download,
    Cpu,
    Database,
    Globe
} from 'lucide-react';
import {
    adminApi,
    paymentApi,
    doctorApi,
    patientApi,
    appointmentApi,
    telemedicineApi,
    prescriptionApi
} from '../../lib/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';

const getUserLabel = (user) => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    return fullName || user?.username || user?.email || `User #${user?.id || 'N/A'}`;
};

const formatMoney = (value) => {
    const amount = Number(value || 0);
    return `LKR ${amount.toLocaleString()}`;
};

const ADMIN_TABS = ['overview', 'verifications', 'doctors', 'patients', 'users', 'operations', 'financials', 'services'];

const extractListData = (response) => {
    const payload = response?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const extractObjectData = (response) => {
    const payload = response?.data;
    if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
        return payload.data;
    }

    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        return payload;
    }

    return {};
};

const AdminDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [stats, setStats] = useState({ totalPatients: 0, totalDoctors: 0, pendingVerifications: 0, totalPayments: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const [users, setUsers] = useState([]);
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [doctorDirectory, setDoctorDirectory] = useState([]);
    const [patients, setPatients] = useState([]);
    const [paymentSummary, setPaymentSummary] = useState({
        total: 0,
        success: 0,
        failed: 0,
        pending: 0,
        refunded: 0,
        totalRevenue: 0
    });
    const [serviceHealth, setServiceHealth] = useState({
        admin: false,
        payments: false,
        doctors: false,
        patients: false,
        appointments: false,
        telemedicine: false,
        prescriptions: false,
        notifications: false
    });

    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [operationsLoading, setOperationsLoading] = useState(false);
    const [operationsError, setOperationsError] = useState('');
    const [doctorOperations, setDoctorOperations] = useState({
        appointments: [],
        sessions: [],
        prescriptions: []
    });

    const [processingId, setProcessingId] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        const queryString = router.asPath.split('?')[1] || '';
        const params = new URLSearchParams(queryString);
        const tabFromQuery = params.get('tab');
        const nextTab = tabFromQuery && ADMIN_TABS.includes(tabFromQuery) ? tabFromQuery : 'overview';

        if (nextTab !== activeTab) {
            setActiveTab(nextTab);
        }
    }, [router.isReady, router.asPath, activeTab]);

    const fetchDashboardData = async ({ initialLoad = false } = {}) => {
        if (initialLoad) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            setError('');

            const [
                usersRes,
                pendingRes,
                paymentRes,
                doctorDirectoryRes,
                patientRes
            ] = await Promise.allSettled([
                adminApi.get('/users'),
                adminApi.get('/doctors/pending'),
                paymentApi.get('/admin/summary'),
                doctorApi.get('/all'),
                patientApi.get('')
            ]);

            const nextUsers = usersRes.status === 'fulfilled' ? extractListData(usersRes.value) : [];
            const nextPending = pendingRes.status === 'fulfilled' ? extractListData(pendingRes.value) : [];
            const nextDoctorDirectory = doctorDirectoryRes.status === 'fulfilled' ? extractListData(doctorDirectoryRes.value) : [];
            const nextPatients = patientRes.status === 'fulfilled' ? extractListData(patientRes.value) : [];
            const nextPaymentSummary = paymentRes.status === 'fulfilled' ? extractObjectData(paymentRes.value) : {};

            setUsers(nextUsers);
            setPendingDoctors(nextPending);
            setDoctorDirectory(nextDoctorDirectory);
            setPatients(nextPatients);
            setPaymentSummary({
                total: nextPaymentSummary.total || 0,
                success: nextPaymentSummary.success || 0,
                failed: nextPaymentSummary.failed || 0,
                pending: nextPaymentSummary.pending || 0,
                refunded: nextPaymentSummary.refunded || 0,
                totalRevenue: nextPaymentSummary.totalRevenue || 0
            });

            setServiceHealth((prev) => ({
                ...prev,
                admin: usersRes.status === 'fulfilled' && pendingRes.status === 'fulfilled',
                payments: paymentRes.status === 'fulfilled',
                doctors: doctorDirectoryRes.status === 'fulfilled',
                patients: patientRes.status === 'fulfilled'
            }));

            if (
                usersRes.status !== 'fulfilled'
                && pendingRes.status !== 'fulfilled'
                && paymentRes.status !== 'fulfilled'
                && doctorDirectoryRes.status !== 'fulfilled'
                && patientRes.status !== 'fulfilled'
            ) {
                setError('Unable to reach backend services. Verify api-gateway and microservices are running.');
            }
        } catch (err) {
            console.error('Failed to load admin dashboard data', err);
            setError('Unable to load admin data right now. Please try again.');
        } finally {
            if (initialLoad) {
                setLoading(false);
            } else {
                setRefreshing(false);

            }
        };
        fetchData();
    }, [router]);

    useEffect(() => {
        if (selectedDoctorId || doctorDirectory.length === 0) {
            return;
        }

        const firstDoctor = doctorDirectory[0];
        if (firstDoctor?.id) {
            setSelectedDoctorId(String(firstDoctor.id));
        }
    }, [doctorDirectory, selectedDoctorId]);

    const fetchDoctorOperations = async (doctorId) => {
        if (!doctorId) {
            return;
        }

        try {
            setOperationsLoading(true);
            setOperationsError('');

            const [appointmentRes, sessionRes, prescriptionRes] = await Promise.allSettled([
                appointmentApi.get(`/doctor/${doctorId}`),
                telemedicineApi.get(`/sessions/doctor/${doctorId}`),
                prescriptionApi.get(`/doctor/${doctorId}`)
            ]);

            setDoctorOperations({
                appointments: appointmentRes.status === 'fulfilled' ? extractListData(appointmentRes.value) : [],
                sessions: sessionRes.status === 'fulfilled' ? extractListData(sessionRes.value) : [],
                prescriptions: prescriptionRes.status === 'fulfilled' ? extractListData(prescriptionRes.value) : []
            });

            setServiceHealth((prev) => ({
                ...prev,
                appointments: appointmentRes.status === 'fulfilled',
                telemedicine: sessionRes.status === 'fulfilled',
                prescriptions: prescriptionRes.status === 'fulfilled'
            }));

            if (
                appointmentRes.status !== 'fulfilled'
                && sessionRes.status !== 'fulfilled'
                && prescriptionRes.status !== 'fulfilled'
            ) {
                setOperationsError('Unable to load doctor operations from appointments, telemedicine, and prescriptions services.');
            }
        } catch (err) {
            console.error('Failed to load doctor operations', err);
            setOperationsError('Failed to load doctor operations. Please try again.');
        } finally {
            setOperationsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== 'operations' || !selectedDoctorId) {
            return;
        }

        fetchDashboardData({ initialLoad: true });
    }, [router]);

    useEffect(() => {
        if (selectedDoctorId || doctorDirectory.length === 0) {
            return;
        }

        const firstDoctor = doctorDirectory[0];
        if (firstDoctor?.id) {
            setSelectedDoctorId(String(firstDoctor.id));
        }
    }, [doctorDirectory, selectedDoctorId]);

    const fetchDoctorOperations = async (doctorId) => {
        if (!doctorId) {
            return;
        }

        try {
            setOperationsLoading(true);
            setOperationsError('');

            const [appointmentRes, sessionRes, prescriptionRes] = await Promise.allSettled([
                appointmentApi.get(`/doctor/${doctorId}`),
                telemedicineApi.get(`/sessions/doctor/${doctorId}`),
                prescriptionApi.get(`/doctor/${doctorId}`)
            ]);

            setDoctorOperations({
                appointments: appointmentRes.status === 'fulfilled' ? extractListData(appointmentRes.value) : [],
                sessions: sessionRes.status === 'fulfilled' ? extractListData(sessionRes.value) : [],
                prescriptions: prescriptionRes.status === 'fulfilled' ? extractListData(prescriptionRes.value) : []
            });

            setServiceHealth((prev) => ({
                ...prev,
                appointments: appointmentRes.status === 'fulfilled',
                telemedicine: sessionRes.status === 'fulfilled',
                prescriptions: prescriptionRes.status === 'fulfilled'
            }));

            if (
                appointmentRes.status !== 'fulfilled'
                && sessionRes.status !== 'fulfilled'
                && prescriptionRes.status !== 'fulfilled'
            ) {
                setOperationsError('Unable to load doctor operations from appointments, telemedicine, and prescriptions services.');
            }
        } catch (err) {
            console.error('Failed to load doctor operations', err);
            setOperationsError('Failed to load doctor operations. Please try again.');
        } finally {
            setOperationsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== 'operations' || !selectedDoctorId) {
            return;
        }

        fetchDoctorOperations(selectedDoctorId);
    }, [activeTab, selectedDoctorId]);

    const stats = useMemo(() => {
        const doctors = users.filter((u) => u.role === 'DOCTOR');
        const patients = users.filter((u) => u.role === 'PATIENT');
        const activeUsers = users.filter((u) => u.isActive).length;

        return {
            totalUsers: users.length,
            totalDoctors: doctors.length,
            totalPatients: patients.length,
            activeUsers,
            doctorProfiles: doctorDirectory.length,
            patientRegistry: patients.length,
            pendingVerifications: pendingDoctors.length,
            totalRevenue: Number(paymentSummary.totalRevenue || 0)
        };
    }, [users, pendingDoctors, paymentSummary, doctorDirectory, patients]);

    const filteredPendingDoctors = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return pendingDoctors;
        }

        return pendingDoctors.filter((doctor) => {
            const text = [
                doctor.firstName,
                doctor.lastName,
                doctor.username,
                doctor.email,
                String(doctor.id || '')
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return text.includes(query);
        });
    }, [pendingDoctors, searchTerm]);

    const filteredUsers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return users;
        }

        return users.filter((user) => {
            const text = [
                user.firstName,
                user.lastName,
                user.username,
                user.email,
                user.role,
                String(user.id || '')
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return text.includes(query);
        });
    }, [users, searchTerm]);

    const filteredDoctorDirectory = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return doctorDirectory;
        }

        return doctorDirectory.filter((doctor) => {
            const linkedUser = users.find((u) => u.id === doctor.userId);
            const text = [
                doctor.specialization,
                doctor.qualifications,
                doctor.licenseNumber,
                doctor.verificationStatus,
                linkedUser?.firstName,
                linkedUser?.lastName,
                linkedUser?.email,
                linkedUser?.username,
                String(doctor.id || ''),
                String(doctor.userId || '')
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return text.includes(query);
        });
    }, [doctorDirectory, users, searchTerm]);

    const filteredPatients = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) {
            return patients;
        }

        return patients.filter((patient) => {
            const text = [
                patient.name,
                patient.email,
                patient.phone,
                patient.gender,
                patient.bloodGroup,
                String(patient.id || '')
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return text.includes(query);
        });
    }, [patients, searchTerm]);

    const verifyDoctor = async (doctorId, status) => {
        try {
            setProcessingId(doctorId);

            if (status === 'REJECTED') {
                const reason = window.prompt('Enter rejection reason:') || '';
                if (!reason.trim()) {
                    return;
                }

                await adminApi.put(`/doctors/${doctorId}/verify`, {
                    status: 'REJECTED',
                    rejectionReason: reason.trim()
                });
            } else {
                await adminApi.put(`/doctors/${doctorId}/verify`, {
                    status: 'APPROVED'
                });
            }

            await fetchDashboardData({ initialLoad: false });
        } catch (err) {
            console.error("Failed to verify doctor", err);
        }
    };

    const logout = () => { localStorage.clear(); router.push('/login'); };

    if (loading) return <LoadingSpinner size="fullscreen" message="Accessing Administrative Control Center..." />;

    const sidebarItems = [
        { id: 'verifications', icon: ShieldCheck, label: 'Doctor Approvals' },
        { id: 'users', icon: Users, label: 'User Registry' },
        { id: 'financials', icon: CreditCard, label: 'Platform Revenue' },
        { id: 'infrastructure', icon: Cpu, label: 'System Health' },
        { id: 'settings', icon: Settings, label: 'Platform Config' },
    ];

    const filteredDoctors = doctors.filter(d =>
        (d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         d.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         d.userId?.toString().includes(searchTerm))
    );

    return (
        <>
            <Head>
                <title>Infrastructure Governance | Platform Admin | SynapsCare</title>
                <meta name="description" content="Platform administrative control center for healthcare infrastructure" />
            </Head>
            <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
            {/* Professional Admin Sidebar */}
            <aside className="hidden lg:flex flex-col w-[320px] bg-white border-r border-slate-200 sticky top-0 h-screen p-10 z-50">
                <div className="flex items-center gap-3 mb-16 group cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => router.push('/')}>
                    <img src="/logo.png" alt="SynapseCare" className="w-10 h-10 drop-shadow-sm transition-transform group-hover:rotate-12" />
                    <span className="text-2xl font-black tracking-tight text-slate-800 italic">Synapse<span className="text-indigo-600">Admin</span></span>
                </div>

                <div className="mb-6 px-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Core Governance</p>
                </div>

                <nav className="flex-1 space-y-2">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.8rem] text-sm font-bold tracking-tight transition-all duration-300 relative group overflow-hidden ${
                                activeTab === item.id 
                                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 text-sm'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-indigo-400' : ''}`} />
                                {item.label}
                            </div>
                            {item.id === 'verifications' && stats.pendingVerifications > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${activeTab === item.id ? 'bg-indigo-500 text-white' : 'bg-rose-500 text-white shadow-lg shadow-rose-200 animate-pulse'}`}>
                                    {stats.pendingVerifications}
                                </span>
                            )}
                            {activeTab === item.id && (
                                <motion.div layoutId="admin-nav-bg" className="absolute left-0 w-1.5 h-6 bg-indigo-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-10 pt-8 border-t border-slate-100 space-y-4">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.8rem] text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-all group">
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Platform Exit
                    </button>
                    <div className="p-6 bg-indigo-600 rounded-[2.5rem] text-white relative overflow-hidden group shadow-xl shadow-indigo-100">
                         <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                 <Zap size={14} className="text-indigo-300" />
                                 <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Security Level</span>
                            </div>
                            <p className="font-bold text-xs uppercase tracking-widest">Auth-Master Access</p>
                         </div>
                         <ShieldCheck className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </aside>

            {/* Main Application Interface */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Admin Header */}
                <header className="h-24 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 flex items-center justify-between px-12 shrink-0 z-40 relative">
                    <div className="flex items-center gap-10 flex-1">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">Infrastructure Control</h1>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Node Management • {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="hidden sm:flex items-center bg-slate-100/80 rounded-2xl px-5 py-3 w-full max-w-md border border-transparent focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-inner">
                            <Search size={18} className="text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Query doctors, audit logs, or system nodes..." 
                                className="bg-transparent border-none outline-none text-xs font-bold px-3 w-full placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex gap-4 px-6 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">API Status OK</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cloud Sync OK</span>
                             </div>
                        </div>

                        <button className="relative w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm group">
                            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                            {stats.pendingVerifications > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm" />}
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 leading-none mb-1 uppercase tracking-widest">Platform Admin</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Super-Admin Access</p>
                            </div>
                            <div className="w-12 h-12 rounded-[1.2rem] bg-indigo-600 border border-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                                <User size={22} strokeWidth={2.5} />
                                <motion.div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50 scroll-smooth">
                    <div className="max-w-[1400px] mx-auto space-y-12 pb-24">
                        <AnimatePresence mode="wait">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                                {/* Platform High-Level Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {[
                                        { label: 'Platform Users', value: stats.totalPatients, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Growing' },
                                        { label: 'Authorized Doctors', value: stats.totalDoctors, icon: ShieldCheck, color: 'text-sky-600', bg: 'bg-sky-50', trend: 'Verified' },
                                        { label: 'Awaiting Approval', value: stats.pendingVerifications, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Critical' },
                                        { label: 'Platform Revenue', value: `LKR ${stats.totalPayments.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Audited' }
                                    ].map((s, i) => (
                                        <div key={i} className="p-8 surface-card surface-card-hover flex flex-col justify-between group h-64">
                                            <div className="flex justify-between items-start">
                                                <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-[1.2rem] flex items-center justify-center shadow-inner border border-white/50 group-hover:scale-110 transition-transform`}>
                                                    <s.icon size={24} />
                                                </div>
                                                <Badge variant={i === 2 ? 'warning' : 'info'}>{s.trend}</Badge>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{s.value}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Platform Governance Tables */}
                                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                                    <div className="xl:col-span-9 space-y-10">
                                        <Card
                                            title="Practitioner Verification Grid"
                                            subtitle="Professional audit of clinical credentials and role authorization"
                                            padding="none"
                                            actions={
                                                <div className="flex items-center gap-3">
                                                    <button className="h-10 px-5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"><Filter size={14} /> Filter Set</button>
                                                    <button className="h-10 px-5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"><Download size={14} /> Export Audit</button>
                                                </div>
                                            }
                                        >
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead className="bg-slate-50/50 border-b border-slate-100">
                                                        <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                            <th className="px-10 py-6">Doctor Node</th>
                                                            <th className="px-10 py-6">Clinical Specialty</th>
                                                            <th className="px-10 py-6">Status Log</th>
                                                            <th className="px-10 py-6 text-right">Control Node</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {filteredDoctors.length > 0 ? filteredDoctors.map((doc, i) => (
                                                            <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                                                                <td className="px-10 py-8">
                                                                    <div className="flex items-center gap-5">
                                                                        <div className="w-14 h-14 bg-white border border-slate-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-105">
                                                                            {(doc.name || 'DR').substring(0, 2).toUpperCase()}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-base font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">Dr. {doc.name || 'Unidentified'}</span>
                                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-1.5"><Globe size={10} /> NODE: {doc.userId || 'ROOT-X'}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-10 py-8">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-slate-700">{doc.specialization || 'General Practice'}</span>
                                                                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1.5">Verified Degree Required</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-10 py-8">
                                                                     <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 border ${
                                                                         doc.verificationStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                                                     }`}>
                                                                         <div className={`w-1.5 h-1.5 rounded-full ${doc.verificationStatus === 'APPROVED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                                                                         {doc.verificationStatus || 'PENDING_AUDIT'}
                                                                     </div>
                                                                </td>
                                                                <td className="px-10 py-8 text-right">
                                                                    {doc.verificationStatus !== 'APPROVED' ? (
                                                                        <div className="flex gap-3 justify-end">
                                                                            <button 
                                                                                onClick={() => verifyDoctor(doc.id)}
                                                                                className="h-10 px-6 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                                                            >
                                                                                Approve
                                                                            </button>
                                                                            <button className="h-10 px-6 bg-white border border-slate-200 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all">Decline</button>
                                                                        </div>
                                                                    ) : (
                                                                        <button className="h-10 px-6 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Deep Audit</button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td colSpan={4} className="py-32 text-center">
                                                                    <div className="flex flex-col items-center justify-center opacity-30">
                                                                        <Search size={48} className="mb-6" />
                                                                        <p className="text-[10px] font-black uppercase tracking-widest">No matching practitioner nodes found</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="xl:col-span-3 space-y-10">
                                        {/* Real-time Infrastructure Health */}
                                        <Card title="Platform Pulse" subtitle="Real-time node telemetry" variant="dark">
                                             <div className="space-y-8">
                                                 <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-6">
                                                     {[
                                                         { label: 'Cloud Database', status: 'SYNCHRONIZED', val: 98, icon: Database, color: 'text-indigo-400' },
                                                         { label: 'Compute API', status: 'OPERATIONAL', val: 100, icon: Cpu, color: 'text-emerald-400' },
                                                         { label: 'Security Gate', status: 'SECURE', val: 100, icon: ShieldCheck, color: 'text-sky-400' }
                                                     ].map((n, i) => (
                                                         <div key={i} className="space-y-3">
                                                              <div className="flex justify-between items-center">
                                                                  <div className="flex items-center gap-3">
                                                                      <n.icon size={14} className={n.color} />
                                                                      <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{n.label}</span>
                                                                  </div>
                                                                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{n.val}%</span>
                                                              </div>
                                                              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                                  <motion.div initial={{ width: 0 }} animate={{ width: `${n.val}%` }} className={`h-full ${n.color.replace('text', 'bg')} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
                                                              </div>
                                                         </div>
                                                     ))}
                                                 </div>

                                                 <div className="space-y-4">
                                                     <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Infrastructure Logs</h5>
                                                     <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                         {[
                                                             'Doctor Registry Synced',
                                                             'Security Patch 1.28.0 Applied',
                                                             'New Admin Logged: ROOT-X',
                                                             'System Audit Log Generated',
                                                             'Platform Cache Purged'
                                                         ].map((log, i) => (
                                                             <div key={i} className="flex items-center gap-3 p-3 bg-white/2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group cursor-default">
                                                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                 <span className="text-[11px] font-bold text-slate-400 group-hover:text-white transition-colors">{log}</span>
                                                             </div>
                                                         ))}
                                                     </div>
                                                 </div>

                                                 <button className="w-full py-4 bg-indigo-600 text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/10">Full Platform Audit</button>
                                             </div>
                                        </Card>

                                        {/* AI Anomaly Detection */}
                                        <div className="p-8 rounded-[2.5rem] bg-emerald-600 text-white relative overflow-hidden group shadow-2xl shadow-emerald-200">
                                             <div className="relative z-10">
                                                 <div className="flex items-center gap-3 mb-6">
                                                     <Activity size={24} />
                                                     <Badge variant="success">LOG ANALYTICS</Badge>
                                                 </div>
                                                 <h5 className="text-xl font-black tracking-tighter leading-tight mb-2">Platform Anomaly Scan</h5>
                                                 <p className="text-xs font-medium text-emerald-100/60 leading-relaxed mb-6">Autonomous AI is scanning platform behavior for security deviations.</p>
                                                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                                      <span className="bg-white/20 px-3 py-1 rounded-lg">Status: Operational</span>
                                                 </div>
                                             </div>
                                             <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
        </>
    );
};

export default AdminDashboard;
