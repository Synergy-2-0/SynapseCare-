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
    Sparkles,
    Wallet,
    CreditCard,
    ArrowRight,
    DollarSign,
    Search,
    Bell,
    Settings,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';
import { patientApi, appointmentApi, medicalHistoryApi, paymentApi, prescriptionApi, notificationApi } from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FileUpload from '../../components/ui/FileUpload';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import NotificationHub from '../../components/dashboard/NotificationHub';

const PatientDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({ appointments: 0, reports: 0, prescriptions: 0 });
    const [allAppointments, setAllAppointments] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [clinicalHistory, setClinicalHistory] = useState([]);
    const [reports, setReports] = useState([]);
    const [payments, setPayments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [appointmentView, setAppointmentView] = useState('upcoming'); // 'upcoming' or 'history'
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadDescription, setUploadDescription] = useState('');
    const [selectedAppointmentIdForUpload, setSelectedAppointmentIdForUpload] = useState(null);
    const [uploadReportType, setUploadReportType] = useState('LAB_RESULT');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        phone: '',
        bloodGroup: '',
        height: '',
        weight: '',
        allergies: '',
        chronicIllnesses: '',
        emergencyContact: '',
        gender: '',
        dob: '',
        profileImageUrl: ''
    });
    const router = useRouter();

    useEffect(() => {
        if (typeof router.query.tab === 'string') {
            setActiveTab(router.query.tab);
        }
    }, [router.query.tab]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');

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
                    
                    if (patientInfo.profileImageUrl) {
                        localStorage.setItem('user_image', patientInfo.profileImageUrl);
                    }

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
                        medicalHistoryApi.get(`/reports/patient/${clinicalId}`).catch(() => ({ data: { data: [] } })),
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

                    // Step 3: Resolve Doctor Names for the registry to ensure professional display
                    const uniqueDoctorIds = [...new Set(safeAppts.map(a => a.doctorId).filter(Boolean))];
                    const doctorCache = {};
                    await Promise.all(uniqueDoctorIds.map(async (docId) => {
                        try {
                            const dRes = await doctorApi.get(`/profile/${docId}`);
                            const d = dRes.data?.data || dRes.data;
                            if (d.firstName && d.lastName) {
                                doctorCache[docId] = `Dr. ${d.firstName} ${d.lastName}`;
                            } else if (d.name) {
                                doctorCache[docId] = d.name.startsWith('Dr.') ? d.name : `Dr. ${d.name}`;
                            }
                        } catch (e) {
                            console.warn("Name resolution failed for doctor shard:", docId);
                        }
                    }));

                    const hydratedAppts = safeAppts.map(a => ({
                        ...a,
                        doctorName: a.doctorName || doctorCache[a.doctorId] || 'Clinical Specialist'
                    }));

                    setUserData({ ...patientInfo, name: patientInfo.name || name, id, clinicalId });
                    setProfileForm({ ...patientInfo, name: patientInfo.name || name });
                    setAllAppointments(hydratedAppts);
                    setUpcoming(hydratedAppts.filter(a => 
                        ['CONFIRMED', 'PAID', 'PENDING_PAYMENT', 'IN_PROGRESS'].includes(a.status) &&
                        (a.consultationType === 'VIDEO' || a.consultationType === 'TELEMEDICINE' || a.mode === 'TELEMEDICINE')
                    ));
                    setClinicalHistory(safeHistory);
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
    }, [router.pathname, router]);

    // Handle Payment Success Redirect
    useEffect(() => {
        if (router.query.payment === 'success') {
            console.log("Payment success detected â€” synchronizing visit states...");
            const id = localStorage.getItem('patient_id') || localStorage.getItem('user_id');

            const syncData = async () => {
                await new Promise((resolve) => setTimeout(resolve, 750));
                const apptRes = await appointmentApi.get(`/patient/${id}`).catch(() => ({ data: { data: [] } }));
                const allAppts = apptRes.data?.data || apptRes.data || [];
                const safeAppts = Array.isArray(allAppts) ? allAppts : [];
                setAllAppointments(safeAppts);
                setUpcoming(safeAppts.filter(a => 
                    ['CONFIRMED', 'PAID', 'PENDING_PAYMENT', 'IN_PROGRESS'].includes(a.status) &&
                    (a.consultationType === 'VIDEO' || a.consultationType === 'TELEMEDICINE' || a.mode === 'TELEMEDICINE')
                ));

                // Update URL to remove visual success param without reload
                router.replace('/dashboard/patient', undefined, { shallow: true });
            };
            syncData();
        }
    }, [router.query.payment, router.query.appointmentId]);

    useEffect(() => {
        if (!router.isReady) return;

        const requestedTab = router.query.tab;
        const allowedTabs = new Set(['overview', 'appointments', 'prescriptions', 'reports', 'payments', 'telemedicine', 'chat', 'profile']);

        if (typeof requestedTab === 'string' && allowedTabs.has(requestedTab)) {
            setActiveTab(requestedTab);
        }
    }, [router.isReady, router.query.tab]);

    const logout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const handleFileUpload = async (file) => {
        const patientId = localStorage.getItem('patient_id') || userData?.id;
        
        if (!patientId) {
            toast.error("Clinical identity not resolved. Local session out of sync.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('patientId', patientId);
        if (selectedAppointmentIdForUpload) formData.append('appointmentId', selectedAppointmentIdForUpload);
        formData.append('reportType', uploadReportType);
        formData.append('description', uploadDescription);

        try {
            toast.loading("Synchronizing clinical artifact with secure vault...");
            const res = await medicalHistoryApi.post(`/reports/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            toast.dismiss();
            toast.success("Clinical artifact archived successfully.");
            
            // Refresh reports list
            const reportRes = await medicalHistoryApi.get(`/reports/patient/${patientId}`).catch(() => ({ data: { data: [] } }));
            setReports(reportRes.data?.data || reportRes.data || []);
            
            setShowUploadModal(false);
            setUploadDescription('');
            setUploadReportType('LAB_RESULT');
            setSelectedAppointmentIdForUpload(null);
        } catch (err) {
            toast.dismiss();
            console.error("Clinical sync failure:", err);
            toast.error(err.response?.data?.message || "Tactical artifact upload failure.");
        }
    };

    const handleDownloadReport = (report) => {
        if (report?.fileUrl) {
            window.open(report.fileUrl, '_blank');
        } else {
            toast.error("Clinical artifact URL not found in registry.");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadToCloudinary = async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'synapcare_preset');
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dao7fkewx';

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!response.ok || !result.secure_url) {
                throw new Error(result?.error?.message || 'Failed to upload to clinical-media registry');
            }
            return result.secure_url;
        };

        try {
            toast.loading('Synchronizing identity with Cloud Registry...');
            const imageUrl = await uploadToCloudinary(file);
            
            // Sync with backend immediately using clinicalId
            await patientApi.put(`/${userData.clinicalId}`, {
                ...userData,
                profileImageUrl: imageUrl
            });

            setUserData(prev => ({ ...prev, profileImageUrl: imageUrl }));
            setProfileForm(prev => ({ ...prev, profileImageUrl: imageUrl }));
            
            toast.dismiss();
            toast.success('Profile photo updated.');
        } catch (err) {
            toast.dismiss();
            console.error("Photo upload failed:", err);
            toast.error('Failed to update profile photo.');
        }
    };

    const handleUpdateProfile = async (e) => {
        if (e) e.preventDefault();
        
        // Frontend Validation Shard
        if (!profileForm.name?.trim()) return toast.error("Identity name cannot be empty.");
        if (profileForm.height < 0 || profileForm.weight < 0) return toast.error("Clinical metrics must be positive integers.");

        try {
            setLoading(true);
            
            // Clean up payload: Convert empty strings to null for numeric/date fields
            const payload = {
                ...profileForm,
                height: profileForm.height === "" ? null : parseFloat(profileForm.height),
                weight: profileForm.weight === "" ? null : parseFloat(profileForm.weight),
                dob: profileForm.dob === "" ? null : profileForm.dob
            };

            const res = await patientApi.put(`/${userData.clinicalId}`, payload);
            const updatedData = res.data?.data || res.data;
            setUserData(updatedData);
            setProfileForm(updatedData);
            setIsEditingProfile(false);
            toast.success("Clinical Identity re-indexed!");
        } catch (error) {
            console.error("Clinical shard update failure:", error);
            toast.error("Cloud registry update failed.");
        } finally {
            setLoading(false);
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
        { id: 'prescriptions', icon: Shield, label: 'My Prescriptions' },
        { id: 'payments', icon: CreditCard, label: 'Billing Nest' },
        { id: 'telemedicine', icon: Video, label: 'Virtual Clinic' },
        { id: 'chat', icon: MessageSquare, label: 'AI Diagnostic' },
        { id: 'profile', icon: User, label: 'My Identity' },
        { id: 'settings', icon: Settings, label: 'Notification Hub' }
    ];

    if (loading) return <LoadingSpinner size="fullscreen" message="Synchronizing Patient Data..." />;

    return (
        <>
            <Head>
                <title>{userData?.name ? `${userData.name} | Patient Health Vault` : 'Patient Dashboard'} | SynapsCare</title>
                <meta name="description" content="Securely manage your medical records, appointments, and prescriptions" />
            </Head>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-slate-50 flex font-['Open_Sans',sans-serif] text-slate-700 selection:bg-teal-100 selection:text-teal-900 overflow-hidden">
                {/* Professional Responsive Sidebar */}
                <aside className="hidden lg:flex flex-col w-[280px] border-r border-slate-200 bg-white sticky top-0 h-screen px-7 py-8 transition-all duration-500 overflow-hidden z-50">
                    <div className="flex items-center gap-3 mb-10 group cursor-pointer transition-transform hover:scale-[1.02] active:scale-95" onClick={() => router.push('/dashboard/patient')}>
                        <Image src="/logo.png" alt="SynapseCare" width={34} height={34} className="w-8.5 h-8.5 transition-transform group-hover:rotate-6" />
                        <span className="text-xl font-bold tracking-tight text-slate-800">Synapse<span className="text-teal-600 font-semibold">Care</span></span>
                    </div>

                    <div className="mb-4 px-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Main Console</p>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    router.replace(`/dashboard/patient?tab=${item.id}`, undefined, { shallow: true });
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[13px] font-semibold tracking-tight transition-all duration-300 relative group ${activeTab === item.id
                                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600'
                                    }`}
                            >
                                <item.icon className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : ''}`} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5">
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all group">
                            <LogOut className="w-5 h-5 transition-transform" />
                            Log Out
                        </button>
                        <div className="p-5 bg-teal-50 rounded-3xl text-teal-700 overflow-hidden relative group cursor-pointer border border-teal-100">
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Support</p>
                                <p className="font-semibold text-sm mt-1">24/7 Concierge</p>
                            </div>
                            <Activity className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10" />
                        </div>
                    </div>
                </aside>

                {/* Main Workspace Area */}
                <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
                    {/* Modern Topbar */}
                    <header className="h-20 lg:h-22 bg-white border-b border-slate-200 flex items-center justify-between px-8 lg:px-12 shrink-0 z-40">
                        <div className="flex items-center gap-6 flex-1">
                            <div className="lg:hidden flex items-center gap-2">
                                <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8" />
                            </div>
                            <div className="hidden sm:flex items-center bg-slate-50 rounded-2xl px-4 py-2.5 w-full max-w-sm border border-slate-200 focus-within:border-teal-300 focus-within:bg-white transition-all">
                                <Search size={16} className="text-slate-400" />
                                <input type="text" placeholder="Search records, doctors..." className="bg-transparent border-none outline-none text-[13px] font-medium px-3 w-full placeholder:text-slate-400" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:gap-6 ml-4">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-slate-400 hover:text-teal-600 transition-all group"
                            >
                                <Bell size={22} className="group-hover:rotate-12 transition-transform" />
                                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-white shadow-sm" />}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-20 right-0 w-96 bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 z-50 overflow-hidden"
                                    >
                                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Care Updates</h4>
                                            <Badge variant="teal">{notifications.length} New</Badge>
                                        </div>
                                        <div className="max-h-[32rem] overflow-y-auto">
                                            {notifications.length > 0 ? notifications.map((n, i) => (
                                                <div key={i} className="p-6 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group cursor-pointer">
                                                    <div className="flex gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-teal-50 text-teal-600'}`}>
                                                            {n.type === 'SUCCESS' ? <CheckCircle2 size={18} /> : <Bell size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 leading-tight">{n.title}</p>
                                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.context || n.message}</p>
                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">{n.time || 'JUST NOW'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="p-12 text-center">
                                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                                                        <Shield size={32} />
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No New Alerts</p>
                                                </div>
                                            )}
                                        </div>
                                        <button className="w-full py-4 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 transition-colors">Clear All Vaulted Notifications</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block mr-1">
                                    <p className="text-xs font-bold text-slate-900 leading-none mb-1">{userData?.name || 'Authorized Patient'}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Patient Workspace</p>
                                </div>
                                <div className="w-11 h-11 rounded-2xl bg-teal-50 border-2 border-teal-100 flex items-center justify-center text-teal-600 shadow-sm relative overflow-hidden">
                                    {userData?.profileImageUrl ? (
                                        <Image 
                                            src={userData.profileImageUrl} 
                                            alt="Profile" 
                                            fill 
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <User size={20} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Dashboard Scroll Area */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth bg-slate-50/50">
                        <div className="max-w-6xl mx-auto space-y-8 pb-16">
                            <AnimatePresence mode="wait">
                                {activeTab === 'overview' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                        {/* Care Snapshot */}
                                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                                            <div className="xl:col-span-7 p-8 bg-gradient-to-br from-teal-600 via-teal-600 to-emerald-600 rounded-[3rem] text-white shadow-2xl shadow-teal-200 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[90px] group-hover:scale-110 transition-transform duration-1000" />
                                                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                                                <div className="relative z-10 max-w-2xl">
                                                    <Badge variant="teal">TODAY&apos;S CARE SUMMARY</Badge>
                                                    <h2 className="text-4xl font-bold mt-6 tracking-tighter leading-tight">Welcome back, {userData?.name || 'Patient'}.<br />Your care is ready at a glance.</h2>
                                                    <p className="text-teal-100/90 font-medium mt-4 max-w-xl leading-relaxed">See what matters now, open your next visit, and keep records, prescriptions, and bills in one calm place.</p>

                                                    <div className="mt-8 flex flex-wrap gap-3">
                                                        {[
                                                            { label: 'Upcoming', value: upcoming.length },
                                                            { label: 'Reports', value: stats.reports },
                                                            { label: 'Rx', value: stats.prescriptions }
                                                        ].map((item) => (
                                                            <div key={item.label} className="px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-2 text-sm font-medium">
                                                                <span className="text-white/75 text-[10px] uppercase tracking-[0.18em] font-medium">{item.label}</span>
                                                                <span className="text-white">{item.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-10 flex flex-wrap gap-4">
                                                        <button onClick={() => setActiveTab('appointments')} className="px-6 py-3 bg-white text-teal-700 font-semibold rounded-2xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-teal-900/10">
                                                            Book Appointment <Plus size={16} />
                                                        </button>
                                                        <button onClick={() => setActiveTab('reports')} className="px-6 py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 font-semibold rounded-2xl hover:bg-white/20 transition-all">
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
                                                            <div className="text-3xl font-bold text-slate-900 leading-none">{s.value}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{s.label}</div>
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
                                                            <h2 className="text-3xl font-bold text-slate-900 tracking-tighter">Clinical Timeline</h2>
                                                            <p className="text-sm text-slate-500 font-medium">Visualization of your past care activities</p>
                                                        </div>
                                                        <Link href="/doctors" className="h-10 px-4 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-[10px] font-bold tracking-widest border border-teal-100 hover:bg-teal-100 transition-colors uppercase">All Records</Link>
                                                    </div>

                                                    {clinicalHistory.length > 0 ? (
                                                        <div className="relative space-y-16 pl-10 before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-1 before:bg-slate-100 before:rounded-full">
                                                            {clinicalHistory.slice(0, 3).map((item, idx) => (
                                                                <div key={idx} className="relative group">
                                                                    <div className="absolute -left-[3.1rem] top-1 w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center group-hover:border-teal-400 group-hover:bg-teal-50 transition-all duration-500 z-10 shadow-sm overflow-hidden">
                                                                        <div className="bg-slate-200/50 w-full h-full flex items-center justify-center group-hover:text-teal-600 text-slate-400 transition-colors">
                                                                            <Calendar size={18} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-6 p-8 rounded-[2.5rem] bg-white border border-slate-100 group-hover:border-teal-100 shadow-sm hover:shadow-premium transition-all duration-500">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-5">
                                                                            <div className="flex items-center gap-3">
                                                                                <span className="px-3 py-1 rounded-full bg-teal-600 font-bold text-[9px] text-white uppercase tracking-widest">{new Date(item.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                                                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">DR. {item.doctorName || 'Senior Specialist'}</span>
                                                                            </div>
                                                                            <Badge variant={item.status === 'COMPLETED' ? 'success' : 'primary'}>{item.status}</Badge>
                                                                        </div>
                                                                        <div className="space-y-4">
                                                                            <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{item.condition || 'General Assessment'}</h4>
                                                                            <p className="text-slate-500 font-medium leading-relaxed italic line-clamp-2">&ldquo;{item.description || 'Comprehensive assessment conducted for reported health markers.'}&rdquo;</p>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {['Consultation', 'Labs', 'Diagnosis'].map(tag => (
                                                                                    <span key={tag} className="px-3 py-1 bg-slate-50 rounded-xl text-[10px] font-medium text-slate-400 uppercase tracking-widest border border-slate-100">{tag}</span>
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
                                                            <p className="text-slate-400 font-bold tracking-tight">Care history is currently empty.</p>
                                                        </div>
                                                    )}
                                                </section>
                                            </div>

                                            <div className="lg:col-span-4 space-y-8">
                                                {/* Upcoming Quick Card */}
                                                <section className="surface-card p-8 space-y-6 bg-white border border-slate-100 relative overflow-hidden group shadow-xl shadow-slate-200/50">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl pointer-events-none" />
                                                    <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3 text-slate-900">
                                                        <Clock size={24} className="text-teal-600" /> Appointments
                                                    </h3>

                                                    <div className="space-y-3.5">
                                                        {upcoming.length > 0 ? upcoming.slice(0, 2).map((u, i) => (
                                                            <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-teal-100 transition-all shadow-sm">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">#{u.id}</div>
                                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-teal-500">Token #{u.tokenNumber || 'TBD'}</span>
                                                                </div>
                                                                <div className="text-sm font-bold text-slate-700">{u.appointmentDate}</div>
                                                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Confirmed Specialist</div>
                                                            </div>
                                                        )) : (
                                                            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                                                                <p className="text-slate-400 text-xs font-medium leading-relaxed">No sessions scheduled for this cycle.</p>
                                                                <button onClick={() => router.push('/doctors')} className="mt-4 text-xs font-semibold text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-colors">Book Now</button>
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
                                                            <h4 className="text-xl font-semibold tracking-tight">Need guidance?</h4>
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
                                                <h2 className="text-3xl leading-tight tracking-tight text-slate-900 font-semibold">Prescriptions</h2>
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
                                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Prescription ID #{px.id}</p>
                                                            <h3 className="text-2xl font-semibold text-slate-900 tracking-tight leading-tight">{px.medicineName}</h3>
                                                            <p className="text-sm font-medium text-teal-500 mt-1 uppercase tracking-widest">DR. {px.doctorName || 'Authorized Specialist'}</p>
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
                                                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><it.i size={10} className="text-teal-600" /> {it.l}</p>
                                                                <p className="text-xs font-medium text-slate-700">{it.v || 'Contact Pharmacist'}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-8 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={16} /></div>
                                                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Digital Authentication Signature</p>
                                                        </div>
                                                        <button onClick={() => downloadPrescriptionPdf(px.id)} className="h-12 px-6 bg-teal-600 text-white rounded-2xl font-medium text-xs hover:bg-teal-700 transition-all flex items-center gap-3 shadow-lg shadow-teal-100">
                                                            <Download size={16} /> Download PDF
                                                        </button>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="xl:col-span-2 py-32 text-center surface-card border-dashed bg-slate-50/50">
                                                    <Shield size={48} className="mx-auto text-slate-300 mb-6" />
                                                    <h3 className="text-xl font-medium text-slate-900 tracking-tight">No digital prescriptions found.</h3>
                                                    <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">As doctors issue prescriptions, they will be instantly synchronized and updated in this repository.</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'appointments' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-10">
                                        {/* Dynamic Header Shard */}
                                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4 border-b border-white/5">
                                            <div>
                                                <h2 className="text-3xl leading-tight tracking-tight text-slate-900 font-semibold">Care Sessions</h2>
                                                <div className="flex gap-4 mt-4">
                                                    <button 
                                                        onClick={() => setAppointmentView('upcoming')}
                                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${appointmentView === 'upcoming' ? 'bg-teal-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                                                    >
                                                        Upcoming ({upcoming.length})
                                                    </button>
                                                    <button 
                                                        onClick={() => setAppointmentView('history')}
                                                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${appointmentView === 'history' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                                                    >
                                                        History ({allAppointments.filter(a => ['COMPLETED', 'CANCELLED'].includes(a.status)).length})
                                                    </button>
                                                </div>
                                            </div>
                                            <button onClick={() => router.push('/doctors')} className="px-8 py-4 bg-teal-600 text-white font-medium rounded-2xl shadow-xl shadow-teal-100 hover:scale-105 transition-all text-sm flex items-center gap-3">
                                                Schedule New Appointment <ArrowRight size={18} />
                                            </button>
                                        </div>

                                        {appointmentView === 'upcoming' ? (
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            <div className="lg:col-span-8 space-y-8">
                                                {upcoming.length > 0 ? (
                                                    <>
                                                        <div className="p-8 rounded-[3rem] border border-slate-100 bg-white hover:border-teal-100 hover:shadow-premium transition-all duration-500 group relative overflow-hidden shadow-sm">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-600/5 rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />

                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="w-20 h-20 rounded-[2rem] bg-teal-50 text-teal-600 flex items-center justify-center shadow-inner border border-teal-100 flex-shrink-0">
                                                                        <Calendar size={32} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                            <Clock size={12} className="text-teal-600" /> Confirmed {upcoming[0].appointmentDate || upcoming[0].date} at {upcoming[0].appointmentTime || upcoming[0].time || '14:00'}
                                                                        </p>
                                                                        <h4 className="text-2xl font-semibold tracking-tight leading-tight">{upcoming[0].doctorName || 'Senior Specialist'}</h4>
                                                                        <div className="flex gap-2 mt-3">
                                                                            <Badge variant={['CONFIRMED', 'PAID'].includes(upcoming[0].status) ? 'success' : 'primary'}>{upcoming[0].status}</Badge>
                                                                            <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-semibold uppercase tracking-widest text-slate-400">ID #{upcoming[0].id}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-center md:text-right p-6 bg-slate-50 rounded-3xl border border-slate-100 min-w-[140px]">
                                                                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1 leading-none">Your Token</p>
                                                                    <p className="text-4xl font-semibold text-teal-600 drop-shadow-sm leading-none mt-2">{upcoming[0].tokenNumber || 'TBD'}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col lg:flex-row gap-8 items-center border-t border-slate-50 pt-10">
                                                                <div className="w-full lg:w-56 p-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center group-hover:scale-105 transition-transform duration-500">
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-2">Active Token</p>
                                                                    <p className="text-7xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{upcoming[0].tokenNumber || '00'}</p>
                                                                    <div className="mt-6 w-full h-px bg-white/10" />
                                                                    <p className="mt-4 text-[9px] font-bold text-white/50 uppercase tracking-widest">Session ID: #{upcoming[0].id}</p>
                                                                </div>

                                                                <div className="flex-1 flex flex-wrap gap-4 relative z-10">
                                                                    <button 
                                                                        onClick={() => {
                                                                            router.push(`/telemedicine?appointmentId=${upcoming[0].id}`);
                                                                        }}
                                                                        className="h-16 px-10 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-teal-600 transition-all shadow-xl shadow-slate-200"
                                                                    >
                                                                        <Video size={18} /> Join Clinical Entry
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setSelectedAppointmentIdForUpload(upcoming[0].id);
                                                                            setUploadDescription(`Medical records for consultation with Dr. ${upcoming[0].doctorName || 'Specialist'}`);
                                                                            setShowUploadModal(true);
                                                                        }}
                                                                        className="h-16 px-10 bg-white border-2 border-slate-100 text-slate-700 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-50 transition-all"
                                                                    >
                                                                        <Plus size={18} /> Share Medical Records
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Shared Records Manifest for this session */}
                                                            {reports.filter(r => r.appointmentId == upcoming[0].id).length > 0 && (
                                                                <div className="mt-8 pt-8 border-t border-slate-50 relative z-10">
                                                                    <div className="flex items-center gap-2 mb-4">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shared Documents for this Visit</span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-3">
                                                                        {reports.filter(r => r.appointmentId == upcoming[0].id).map((r, rIdx) => (
                                                                            <div key={rIdx} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-teal-100 transition-all cursor-pointer group/file" onClick={() => handleDownloadReport(r)}>
                                                                                <FileText size={14} className="text-teal-600 group-hover/file:scale-110 transition-transform" />
                                                                                <span className="text-[11px] font-bold text-slate-600 line-clamp-1 max-w-[140px]">{r.fileName || 'Report'}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Remaining Registry */}
                                                        {upcoming.length > 1 && (
                                                            <div className="space-y-6 pt-10">
                                                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 ml-2 mb-8">Clinical Queue Registry</h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    {upcoming.slice(1).map((u, i) => (
                                                                        <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/[0.08] transition-all group/item">
                                                                            <div className="flex justify-between items-start mb-8">
                                                                                <div className="w-12 h-12 rounded-[1.2rem] bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                                                                                    <Calendar size={24} />
                                                                                </div>
                                                                                <div className="px-4 py-6 bg-slate-900 border border-white/5 rounded-2xl text-center min-w-[70px]">
                                                                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Token</p>
                                                                                    <p className="text-xl font-black text-white leading-none">{u.tokenNumber || '00'}</p>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div className="space-y-2 mb-8">
                                                                                <h5 className="text-xl font-bold text-white tracking-tight uppercase leading-none">Dr. {u.doctorName || 'Specialist'}</h5>
                                                                                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">{u.appointmentDate || u.date} • {u.appointmentTime || u.time}</p>
                                                                            </div>

                                                                            <div className="flex gap-4">
                                                                                {u.status !== 'PAID' ? (
                                                                                    <button 
                                                                                        onClick={() => router.push(`/payment?appointmentId=${u.id}&amount=${u.fee || 2000}&patientId=${userData.id}&doctorId=${u.doctorId}`)}
                                                                                        className="flex-1 h-12 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all"
                                                                                    >
                                                                                        Settle Fee
                                                                                    </button>
                                                                                ) : (
                                                                                    <button className="flex-1 h-12 bg-white/5 border border-white/10 text-white/50 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-default">
                                                                                        Settled
                                                                                    </button>
                                                                                )}
                                                                                <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all">
                                                                                    <Settings size={18} />
                                                                                </button>
                                                                            </div>

                                                                            {/* Quick Record Manifest for secondary visits */}
                                                                            {reports.filter(r => r.appointmentId == u.id).length > 0 && (
                                                                                <div className="mt-6 pt-6 border-t border-white/10">
                                                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                                                                        <FileText size={10} className="text-teal-500" /> Documents Linked ({reports.filter(r => r.appointmentId == u.id).length})
                                                                                    </p>
                                                                                    <div className="flex flex-wrap gap-2">
                                                                                        {reports.filter(r => r.appointmentId == u.id).slice(0, 2).map((r, rIdx) => (
                                                                                            <div key={rIdx} className="px-2 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-medium text-slate-400 truncate max-w-[100px]">{r.fileName}</div>
                                                                                        ))}
                                                                                        {reports.filter(r => r.appointmentId == u.id).length > 2 && (
                                                                                            <div className="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-medium text-slate-500">+{reports.filter(r => r.appointmentId == u.id).length - 2} more</div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="py-40 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10">
                                                        <Calendar size={80} className="mx-auto text-slate-800 mb-8 opacity-20" strokeWidth={1} />
                                                        <h3 className="text-2xl font-black text-white italic uppercase tracking-widest mb-4">No Sessions Vaulted.</h3>
                                                        <p className="text-slate-500 font-medium px-20 text-lg leading-relaxed">Your clinical agenda is currently empty. Book a diagnostic node to activate your session stream.</p>
                                                        <button onClick={() => router.push('/doctors')} className="mt-12 h-14 px-10 bg-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-500/20">Explore Specialized Domains</button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Specialized Quick Actions Sidebar */}
                                            <div className="xl:col-span-4 space-y-10">
                                                <div className="p-10 rounded-[3rem] bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[60px]" />
                                                    <h3 className="text-lg font-black italic tracking-widest uppercase text-white mb-8">Clinical Statistics</h3>
                                                    
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                                                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Visits</div>
                                                                <div className="text-2xl font-bold text-white tracking-tighter">{stats.appointments}</div>
                                                            </div>
                                                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                                                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Pending ID</div>
                                                                <div className="text-2xl font-bold text-teal-400 tracking-tighter">{upcoming.length}</div>
                                                            </div>
                                                        </div>

                                                    <div className="mt-10 p-8 bg-teal-500/5 rounded-[2.5rem] border border-teal-500/10">
                                                        <p className="text-xs font-medium text-slate-400 leading-relaxed italic">
                                                        &quot;Regular clinical rotations ensure predictive health management and diagnostic accuracy.&quot;
                                                        </p>
                                                        <div className="mt-6 flex items-center gap-3">
                                                            <div className="w-8 h-px bg-teal-500" />
                                                            <span className="text-[10px] font-black uppercase text-teal-500 tracking-widest">Medical Directive</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-10 rounded-[3rem] bg-teal-600 text-white shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:rotate-12 transition-transform duration-700">
                                                        <Shield size={120} strokeWidth={1} />
                                                    </div>
                                                    <h3 className="text-xl font-black italic tracking-widest uppercase mb-6 relative z-10 leading-none">Quick Billing</h3>
                                                    <div className="space-y-4 relative z-10">
                                                        {payments.slice(0, 2).map((p, i) => (
                                                            <div key={i} className="flex justify-between items-center pb-4 border-b border-white/10 last:border-0 last:pb-0">
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">REF-#{p.id}</p>
                                                                    <p className="text-sm font-bold">Settled</p>
                                                                </div>
                                                                <p className="text-lg font-black tracking-tighter">LKR {p.amount?.toLocaleString()}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button onClick={() => setActiveTab('payments')} className="w-full mt-10 py-4 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-semibold tracking-[0.2em] uppercase hover:bg-white/20 transition-all">View Full History</button>
                                                </div>
                                            </div>
                                        </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 gap-6">
                                                    {allAppointments.filter(a => ['COMPLETED', 'CANCELLED'].includes(a.status)).map((appt, i) => (
                                                        <div key={i} className="surface-card p-8 bg-white border border-slate-100 hover:shadow-premium transition-all group overflow-hidden relative">
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                                <div className="flex items-center gap-6">
                                                                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-xl font-bold ${appt.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                                                        <Clock size={24} />
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-3 mb-1">
                                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">SESSION DATE: {appt.appointmentDate || appt.date}</span>
                                                                            <Badge variant={appt.status === 'COMPLETED' ? 'success' : 'primary'}>{appt.status}</Badge>
                                                                        </div>
                                                                        <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{appt.doctorName || 'Clinical Specialist'}</h4>
                                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Consultation ID: #{appt.id} • {appt.consultationType || appt.mode || 'PHYSICAL'}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-3">
                                                                    {appt.status === 'COMPLETED' && (
                                                                        <>
                                                                            <button 
                                                                                onClick={() => setActiveTab('prescriptions')}
                                                                                className="px-6 py-3 bg-teal-50 text-teal-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-100 transition-all border border-teal-100"
                                                                            >
                                                                                View Rx
                                                                            </button>
                                                                            {/* <button 
                                                                                onClick={() => {
                                                                                    setSelectedAppointmentIdForUpload(appt.id);
                                                                                    setUploadDescription(`Additional records for past visit with Dr. ${appt.doctorName}`);
                                                                                    setShowUploadModal(true);
                                                                                }}
                                                                                className="px-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white border border-slate-100 transition-all"
                                                                            >
                                                                                Linked Reports
                                                                            </button> */}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* Detailed History View */}
                                                            <div className="mt-8 pt-8 border-t border-slate-50 flex flex-wrap gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                                                <div className="flex items-center gap-2"><DollarSign size={14} className="text-indigo-400" /> Settled Registry: LKR {appt.fee || appt.amount || '0.00'}</div>
                                                                <div className="flex items-center gap-2"><FileText size={14} className="text-indigo-400" /> Notes Archived: YES</div>
                                                                <div className="flex items-center gap-1.5"><Shield size={14} className="text-indigo-400" /> Security Shard: LOCKED</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {allAppointments.filter(a => ['COMPLETED', 'CANCELLED'].includes(a.status)).length === 0 && (
                                                        <div className="py-32 text-center bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-sm">
                                                            <Clock size={48} className="mx-auto text-slate-300 mb-6" />
                                                            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No Past Records Found.</h3>
                                                            <p className="text-sm text-slate-400 mt-2">Historical data will populate here as sessions are completed.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === 'payments' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div>
                                            <h2 className="text-4xl leading-tight tracking-tighter text-white font-bold">Payments <span className="text-teal-600">& History.</span></h2>
                                            <p className="text-lg text-slate-500 font-medium mt-2">Review your payment history, settlements, and receipts stored in the clinical vault.</p>
                                        </div>

                                        <div className="surface-card p-10 bg-slate-900 border border-white/5 overflow-hidden relative">
                                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none -mr-16 -mt-16">
                                                <Wallet size={320} strokeWidth={1} className="text-teal-500" />
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead className="border-b border-white/5">
                                                        <tr>
                                                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none text-center">Protocol Node</th>
                                                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none">Clinical Sequence</th>
                                                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none text-right">Settled Registry</th>
                                                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none text-center">Security Hash</th>
                                                            <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none text-right">Vault</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {payments.length > 0 ? payments.map((p, i) => (
                                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                                                <td className="px-6 py-10 text-center">
                                                                    <div className="inline-flex flex-col">
                                                                        <span className="text-xs font-bold text-white">#PY-{String(p.id).padStart(5, '0')}</span>
                                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">{p.paidDate || 'Pending'}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-10">
                                                                    <div className="flex items-center gap-5">
                                                                        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-black text-[10px] border border-teal-500/20 shadow-lg">TR</div>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-bold text-white leading-none">High-Precision Consultation</span>
                                                                            <span className="text-[9px] font-black text-teal-500 uppercase tracking-[0.2em] mt-2.5">Method: {p.method || 'Digital Sequence'}</span>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-10 text-right">
                                                                    <span className="text-xl font-black text-white tracking-tighter leading-none">LKR {p.amount?.toLocaleString()}</span>
                                                                </td>
                                                                <td className="px-6 py-10">
                                                                    <div className="flex justify-center">
                                                                        <div className={`px-4 py-2 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center gap-2.5 border ${p.status === 'SUCCESS' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-white/5 text-slate-500 border-white/5'}`}>
                                                                            <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'SUCCESS' ? 'bg-teal-400 animate-pulse' : 'bg-slate-600'}`} />
                                                                            {p.status}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-10 text-right">
                                                                    <button className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white hover:border-white transition-all opacity-0 group-hover:opacity-100 shadow-xl"><Download size={18} /></button>
                                                                </td>
                                                            </tr>
                                                        )) : (
                                                            <tr>
                                                                <td colSpan={5} className="py-40 text-center opacity-40">
                                                                    <Wallet size={64} className="mx-auto mb-6 text-slate-800" strokeWidth={1} />
                                                                    <p className="font-black text-slate-600 uppercase tracking-[0.4em] text-[10px]">No settlement nodes found</p>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'telemedicine' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8 text-center py-10 lg:py-20">
                                        <div className="max-w-4xl mx-auto space-y-10 p-12 bg-slate-900 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px]" />
                                            <div className="w-28 h-28 bg-teal-500/10 rounded-[2.5rem] border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto shadow-inner relative z-10">
                                                <Video size={56} />
                                            </div>
                                            <div className="relative z-10 space-y-6">
                                                <h2 className="text-4xl font-black text-white italic tracking-widest uppercase">Clinical Bridge</h2>
                                                {upcoming.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                                        {upcoming.slice(0, 2).map((appt) => (
                                                            <div key={appt.id} className="p-6 bg-white/5 rounded-3xl border border-white/10 text-left space-y-3 hover:bg-white/10 transition-all group">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-[9px] font-black uppercase">Active Registry #{appt.id}</div>
                                                                    <div className="text-[10px] text-slate-500 font-bold">{appt.date}</div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-white font-bold text-lg">{appt.time}</p>
                                                                    <p className="text-slate-400 text-xs truncate">Ref: {appt.reason || 'Standard Clinical Review'}</p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => router.push(`/telemedicine?appointmentId=${appt.id}`)}
                                                                    className="w-full py-3 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-500 hover:text-white transition-all shadow-xl"
                                                                >
                                                                    Initialize Node
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-500 font-medium text-lg leading-relaxed px-10">No active clinical sessions found in your registry for the current cycle.</p>
                                                )}
                                            </div>
                                            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 text-left relative z-10 max-w-xl mx-auto">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500">Telemetry Status</span>
                                                </div>
                                                <p className="text-sm font-bold text-slate-400 italic">Your secure interactive uplink will activate as per the clinical schedule registry. Ensure high-bandwidth availability before initialization.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'chat' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                            <div>
                                                <h2 className="text-3xl leading-tight tracking-tight text-slate-900 font-semibold">Medical Records</h2>
                                                <p className="text-lg text-slate-500 font-medium mt-2">Keep reports, lab results, and history organized and easy to find.</p>
                                            </div>
                                            <button onClick={() => setShowUploadModal(true)} className="px-6 py-3 bg-teal-600 text-white font-medium rounded-2xl shadow-lg shadow-teal-100 flex items-center gap-2">
                                                <Plus size={18} /> Upload New Record
                                            </button>
                                        </div>
                                        <div className="surface-card p-8 bg-teal-600 text-white flex items-center justify-between group overflow-hidden relative">
                                            <div className="relative z-10 space-y-6 max-w-lg">
                                                <h3 className="text-3xl font-bold leading-tight italic tracking-widest uppercase">Start a Quick Check</h3>
                                                <p className="text-teal-100/80 font-medium">Get quick guidance on symptoms before your appointment.</p>
                                                <button onClick={() => router.push('/chat')} className="px-8 py-4 bg-white text-teal-600 font-bold rounded-2xl hover:scale-105 transition-transform uppercase tracking-widest text-xs">Start Check</button>
                                            </div>
                                            <Activity size={300} className="absolute -right-20 -bottom-20 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'profile' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="max-w-4xl space-y-8 pb-20">
                                        <div className="surface-card p-10 bg-white shadow-premium relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                                            
                                            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                                                <div className="w-44 h-44 rounded-[3.5rem] bg-slate-900 flex items-center justify-center text-teal-400 text-6xl shadow-2xl relative group overflow-hidden border-4 border-white">
                                                    {userData?.profileImageUrl || profileForm.profileImageUrl ? (
                                                        <Image src={profileForm.profileImageUrl || userData.profileImageUrl} alt="Identity" fill className="object-cover group-hover:scale-110 transition-transform" unoptimized />
                                                    ) : (
                                                        <User size={72} className="group-hover:scale-110 transition-transform" />
                                                    )}
                                                    <div className="absolute inset-0 bg-teal-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm" onClick={() => document.getElementById('profile-image-input').click()}>
                                                        <Plus size={32} className="text-white" />
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        id="profile-image-input" 
                                                        className="hidden" 
                                                        accept="image/*" 
                                                        onChange={handleImageUpload}
                                                    />
                                                </div>
                                                <div className="flex-1 text-center md:text-left space-y-5">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-[10px] font-black uppercase tracking-widest">
                                                        <ShieldCheck size={12} /> Verified Identity Shard
                                                    </div>
                                                    <h2 className="text-5xl font-bold text-slate-900 tracking-tighter leading-none">{userData?.name}</h2>
                                                    <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Terminal #</span>
                                                            <span className="text-sm font-bold text-slate-600 mt-1">PX-SY-{userData?.id}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-teal-600">Secure Email</span>
                                                            <span className="text-sm font-bold text-slate-600 mt-1">{userData?.email}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {!isEditingProfile ? (
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                                <div className="md:col-span-8 space-y-8">
                                                    <div className="surface-card p-10 bg-white shadow-premium">
                                                        <div className="flex items-center justify-between mb-10">
                                                            <div>
                                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Health Profile</h3>
                                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Core Clinical Data Shards</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => setIsEditingProfile(true)}
                                                                className="h-12 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
                                                            >
                                                                <LayoutDashboard size={14} /> Edit Identity
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                                                            {[
                                                                { label: 'Date of Birth', value: userData?.dob, icon: Calendar },
                                                                { label: 'Gender Shard', value: userData?.gender || '--', icon: User },
                                                                { label: 'Body Metrics', value: `${userData?.height || '--'} cm / ${userData?.weight || '--'} kg`, icon: Activity },
                                                                { label: 'Clinical Group', value: userData?.bloodGroup || '--', icon: Shield },
                                                                { label: 'Allergies', value: userData?.allergies || 'NONE REPORTED', icon: AlertCircle },
                                                                { label: 'Chronic Shards', value: userData?.chronicIllnesses || 'NONE REPORTED', icon: LayoutDashboard },
                                                                { label: 'Emerg. Contact', value: userData?.emergencyContact || '--', icon: Calendar }
                                                            ].map((d, i) => (
                                                                <div key={i} className="space-y-2 group p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-teal-100 hover:bg-teal-50/30 transition-all">
                                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors group-hover:text-teal-600">
                                                                        <d.icon size={12} /> {d.label}
                                                                    </div>
                                                                    <p className="text-sm font-bold text-slate-900">{d.value || 'NOT_ARCHIVED'}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="md:col-span-4 space-y-8">
                                                    <div className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
                                                        <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 blur-3xl pointer-events-none" />
                                                        <div className="relative z-10 space-y-6">
                                                            <Shield size={40} className="text-teal-500 mb-4" strokeWidth={1.5} />
                                                            <h3 className="text-2xl font-black italic tracking-widest uppercase leading-none text-white">Trust Registry</h3>
                                                            <p className="text-xs font-medium text-slate-400 leading-relaxed">Your medical identity is encrypted at the storage shard level. Only authorized specialists can view vital markers during active clinical sessions.</p>
                                                            <div className="pt-6 border-t border-white/10 flex items-center gap-3">
                                                                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-sans">End-to-End Encryption Enabled</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="surface-card p-10 bg-white shadow-premium">
                                                <div className="flex items-center justify-between mb-12 border-b border-slate-50 pb-8">
                                                    <div>
                                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Modify Identity</h3>
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 underline decoration-teal-500/30 decoration-2 underline-offset-8">Synchronizing secure clinical registry</p>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button 
                                                            onClick={() => setIsEditingProfile(false)}
                                                            className="h-14 px-8 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                                                        >
                                                            Discard Shards
                                                        </button>
                                                        <button 
                                                            onClick={handleUpdateProfile}
                                                            className="h-14 px-10 bg-teal-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all flex items-center gap-3"
                                                        >
                                                            <Sparkles size={16} /> Commit to Ledger
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Display Name</label>
                                                        <input 
                                                            value={profileForm.name} 
                                                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                                            className="input-field h-14 bg-slate-50/50" 
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                                        <input 
                                                            type="date"
                                                            value={profileForm.dob || ""} 
                                                            onChange={(e) => setProfileForm({...profileForm, dob: e.target.value})}
                                                            className="input-field h-14 bg-slate-50/50" 
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                                        <input 
                                                            value={profileForm.phone} 
                                                            onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                                                            className="input-field h-14 bg-slate-50/50" 
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Registry Locked)</label>
                                                        <input 
                                                            value={profileForm.email} 
                                                            readOnly
                                                            className="input-field h-14 bg-slate-100/50 text-slate-400 cursor-not-allowed" 
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Blood Registry Group</label>
                                                        <select 
                                                            value={profileForm.bloodGroup} 
                                                            onChange={(e) => setProfileForm({...profileForm, bloodGroup: e.target.value})}
                                                            className="input-field h-14 bg-slate-50/50"
                                                        >
                                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                                                <option key={bg} value={bg}>{bg}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Height Metric (cm)</label>
                                                        <input 
                                                            type="number"
                                                            value={profileForm.height} 
                                                            onChange={(e) => setProfileForm({...profileForm, height: e.target.value})}
                                                            className="input-field h-14 bg-slate-50/50" 
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Weight Metric (kg)</label>
                                                        <input 
                                                            type="number"
                                                            value={profileForm.weight} 
                                                            onChange={(e) => setProfileForm({...profileForm, weight: e.target.value})}
                                                            className="input-field h-14 bg-slate-50/50" 
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gender Identity</label>
                                                        <select 
                                                            value={profileForm.gender} 
                                                            onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                                                            className="input-field h-14 bg-slate-50/50"
                                                        >
                                                            <option value="">Select Gender</option>
                                                            <option value="MALE">Male</option>
                                                            <option value="FEMALE">Female</option>
                                                            <option value="OTHER">Other</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Emergency Contact Node</label>
                                                        <input 
                                                            value={profileForm.emergencyContact} 
                                                            onChange={(e) => setProfileForm({...profileForm, emergencyContact: e.target.value})}
                                                            className="input-field h-14 bg-slate-50/50" 
                                                            placeholder="+15550000000"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Critical Allergy Shards</label>
                                                        <textarea 
                                                            value={profileForm.allergies} 
                                                            onChange={(e) => setProfileForm({...profileForm, allergies: e.target.value})}
                                                            className="input-field min-h-32 resize-none bg-slate-50/50" 
                                                            placeholder="List known clinical allergies..."
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-3">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Chronic Clinical Illnesses</label>
                                                        <textarea 
                                                            value={profileForm.chronicIllnesses} 
                                                            onChange={(e) => setProfileForm({...profileForm, chronicIllnesses: e.target.value})}
                                                            className="input-field min-h-32 resize-none bg-slate-50/50" 
                                                            placeholder="List known chronic conditions..."
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
                                                    <h4 className="text-lg font-semibold text-slate-900 tracking-tight">{r.fileName || r.description || 'Medical Report'}</h4>
                                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-2">
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

                                                    <div className="space-y-16">
                                                        {[...upcoming, ...clinicalHistory].filter(app => reports.some(r => r.appointmentId === app.id)).length > 0 ? (
                                                            [...upcoming, ...clinicalHistory].filter(app => reports.some(r => r.appointmentId === app.id)).map((app, appIdx) => (
                                                                <div key={appIdx} className="relative pl-12 before:absolute before:left-5 before:top-10 before:bottom-[-2rem] before:w-px before:bg-white/5 last:before:hidden">
                                                                    <div className="absolute left-0 top-0 w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/20 z-10 border border-teal-400/50">
                                                                        <Calendar size={18} className="text-white" />
                                                                    </div>
                                                                    <div className="mb-6">
                                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-500 mb-1">{app.appointmentDate || app.date}</p>
                                                                        <h4 className="text-xl font-bold text-white tracking-tight">Visit with Dr. {app.doctorName || 'Senior Specialist'}</h4>
                                                                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Clinical Token: #{app.tokenNumber || 'TBD'}</p>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                        {reports.filter(r => r.appointmentId === app.id).map((r, rIdx) => (
                                                                            <div key={rIdx} className="p-6 bg-white/5 border border-white/10 rounded-3xl group/item hover:bg-white/10 transition-all cursor-pointer" onClick={() => handleDownloadReport(r)}>
                                                                                <div className="flex items-center justify-between mb-4">
                                                                                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover/item:scale-110 transition-transform">
                                                                                        <FileText size={18} />
                                                                                    </div>
                                                                                    <Badge variant="teal">{r.reportType || 'OTHER'}</Badge>
                                                                                </div>
                                                                                <p className="text-sm font-bold text-white leading-tight mb-2 line-clamp-1">{r.fileName}</p>
                                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Signature: Shard-{r.id}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                                                                <Shield size={48} className="mx-auto text-slate-700 mb-6 opacity-20" />
                                                                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Registry Empty</p>
                                                                <p className="text-slate-400 text-sm font-medium mt-3 px-10">Upload records during your next appointment session to see them grouped here.</p>
                                                            </div>
                                                        )}

                                                        {/* Independent Records Shard */}
                                                        {reports.filter(r => !r.appointmentId).length > 0 && (
                                                            <div className="pt-10 border-t border-white/5">
                                                                <h5 className="text-[10px] font-bold uppercase tracking-[0.34em] text-slate-500 mb-8 px-2">Independent Medical Files</h5>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                    {reports.filter(r => !r.appointmentId).map((r, i) => (
                                                                        <div key={i} className="p-6 bg-slate-800/50 border border-white/5 rounded-3xl flex items-center gap-5 hover:bg-slate-800 transition-all cursor-pointer group/detached" onClick={() => handleDownloadReport(r)}>
                                                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-teal-400 group-hover/detached:text-teal-300 transition-colors">
                                                                                <FileText size={24} />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-xs font-bold text-white mb-1 line-clamp-1">{r.fileName}</p>
                                                                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{r.reportType || 'GENERAL'}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )) : null}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'settings' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                                        <NotificationHub />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Global High-Fidelity Upload Modal Shard */}
                        <AnimatePresence>
                            {showUploadModal && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }} 
                                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-12"
                                >
                                    <motion.div 
                                        initial={{ scale: 0.95, y: 20 }} 
                                        animate={{ scale: 1, y: 0 }} 
                                        exit={{ scale: 0.95, y: 20 }} 
                                        className="bg-white rounded-[3rem] p-10 max-w-xl w-full space-y-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                        
                                        <div className="flex justify-between items-center relative z-10">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mb-2">Medical Records</p>
                                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Upload Document</h3>
                                            </div>
                                            <button onClick={() => { setShowUploadModal(false); setSelectedAppointmentIdForUpload(null); }} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                                <Plus size={24} className="rotate-45" />
                                            </button>
                                        </div>

                                        <div className="space-y-6 relative z-10">
                                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                                <AlertCircle size={20} className="text-amber-500 shrink-0 mt-1" />
                                                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                                                    {selectedAppointmentIdForUpload 
                                                        ? `This document will be shared with your practitioner for Session #${selectedAppointmentIdForUpload}.` 
                                                        : 'This is an independent record. It will be added to your secure medical history.'}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Document Type</label>
                                                    <select
                                                        value={uploadReportType}
                                                        onChange={(e) => setUploadReportType(e.target.value)}
                                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-sm"
                                                    >
                                                        <option value="LAB_RESULT">Laboratory Result</option>
                                                        <option value="IMAGING">Imaging / Radiology</option>
                                                        <option value="PRESCRIPTION">Historical Rx</option>
                                                        <option value="OTHER">Other Medical Document</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Session ID</label>
                                                    <div className="px-5 py-4 bg-slate-100/50 border border-slate-100 rounded-2xl font-black text-sm text-slate-400">
                                                        #{selectedAppointmentIdForUpload || 'NONE'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Notes / Context</label>
                                                <input
                                                    type="text"
                                                    value={uploadDescription}
                                                    onChange={(e) => setUploadDescription(e.target.value)}
                                                    placeholder="Brief clinical description..."
                                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold text-sm"
                                                />
                                            </div>

                                            <FileUpload
                                                onUpload={handleFileUpload}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                maxSize={10}
                                                label="Drop Medical Files"
                                                description="Secure PDF, JPG, or PNG up to 10MB"
                                            />
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-semibold border ${variants[variant] || variants.primary} uppercase tracking-[0.2em] inline-block shadow-sm`}>
            {children}
        </span>
    );
};

export default PatientDashboard;

