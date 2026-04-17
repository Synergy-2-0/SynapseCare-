import React, { useEffect, useState } from 'react';
import { 
    Users, Calendar, ClipboardList, 
    Video, Activity, CheckCircle, Clock,
    Building2, GraduationCap, DollarSign, 
    Save, Plus, ShieldCheck, FileCheck
} from 'lucide-react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { appointmentApi, doctorApi } from '@/lib/api';
import { AnimatePresence } from 'framer-motion';
import { isToday, startOfWeek, addDays, format, isSameDay } from 'date-fns';
import SessionPrescriptionModal from '@/components/doctor/SessionPrescriptionModal';
import PatientContextDrawer from '@/components/doctor/PatientContextDrawer';
import { isDoctorApproved } from '@/lib/doctorVerification';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Image from 'next/image';
import toast from 'react-hot-toast';

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

const parseLocalDate = (value) => {
    if (!value) return null;
    const [year, month, day] = String(value).split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
};

const getAppointmentType = (appointment) => String(appointment?.consultationType || appointment?.type || appointment?.mode || '').toUpperCase();

const DoctorDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({ appointmentsToday: 0, activePatients: 0, hours: 8 });
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activePostSession, setActivePostSession] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: '',
        specialization: '',
        bio: '',
        consultationFee: 0,
        yearsOfExperience: 0,
        qualifications: '',
        clinicName: '',
        clinicAddress: '',
        profileImageUrl: '',
        licenseUrl: ''
    });
    const router = useRouter();

    const handleFileUpload = async (e, type = 'profile') => {
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
                throw new Error(result?.error?.message || 'Failed to upload artifact');
            }
            return result.secure_url;
        };

        try {
            toast.loading(`Synchronizing ${type === 'profile' ? 'professional artifact' : 'clinical credential'}...`);
            const fileUrl = await uploadToCloudinary(file);
            
            const updatedForm = {
                ...profileForm,
                [type === 'profile' ? 'profileImageUrl' : 'licenseUrl']: fileUrl
            };

            // Re-sync with backend registry
            await doctorApi.put('/profile', updatedForm);

            setProfileForm(prev => ({
                ...prev,
                [type === 'profile' ? 'profileImageUrl' : 'licenseUrl']: fileUrl
            }));
            
            if (type === 'profile') {
                localStorage.setItem('user_image', fileUrl);
            }
            
            toast.dismiss();
            toast.success(`${type === 'profile' ? 'Professional identity' : 'Clinical license'} updated.`);
        } catch (err) {
            toast.dismiss();
            console.error("Artifact upload failed:", err);
            toast.error('Identity artifact synchronization failed.');
        }
    };

    useEffect(() => {
        if (router.query.tab) {
            setActiveTab(router.query.tab);
        }
    }, [router.query.tab]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');
            const id = localStorage.getItem('user_id');
            const name = localStorage.getItem('user_name');

            if (role !== 'DOCTOR') { router.push('/login'); return; }
            setUserData({ name, id, doctorDbId: null });

            const fetchData = async () => {
                try {
                    const profileRes = await doctorApi.get('/profile/me');
                    if (profileRes?.data?.specialization) {
                        localStorage.setItem('user_specialization', profileRes.data.specialization);
                    }
                    if (!isDoctorApproved(profileRes?.data?.verificationStatus)) {
                        router.replace('/doctor/setup');
                        return;
                    }

                    const doctorId = profileRes?.data?.id;
                    if (!doctorId) {
                        console.error("No clinical ID found for doctor profile");
                        setLoading(false);
                        return;
                    }

                    setUserData({ name, id, doctorDbId: doctorId });

                    const apptRes = await appointmentApi.get(`/doctor/${doctorId}`);
                    const allAppts = apptRes.data?.data || apptRes.data || [];
                    const safeAppts = Array.isArray(allAppts) ? allAppts : [];

                    // Fetch patient details to resolve names
                    let pMap = {};
                    try {
                        const patRes = await appointmentApi.get(`/doctor/${doctorId}/patients`);
                        const patList = patRes.data?.data || patRes.data || [];
                        patList.forEach(p => { if (p?.id) pMap[p.id] = p; });
                    } catch (patErr) {
                        console.warn('Could not load patient names:', patErr.message);
                    }
                    
                    setUserData(prev => ({ ...prev, patientsMap: pMap }));
                    setAppointments(safeAppts.filter(a => a.status !== 'CANCELLED'));
                    setStats(prev => ({
                        ...prev,
                        appointmentsToday: safeAppts.filter(a => {
                            const appointmentDate = parseLocalDate(a.date);
                            return appointmentDate && isToday(appointmentDate) && a.status !== 'CANCELLED' && a.status !== 'REJECTED';
                        }).length,
                        activePatients: new Set(safeAppts.map(a => a.patientId)).size
                    }));

                    setProfileForm({
                        ...profileRes.data,
                        name: profileRes.data.name || name
                    });
                    
                    if (profileRes.data.profileImageUrl) {
                        localStorage.setItem('user_image', profileRes.data.profileImageUrl);
                    }
                } catch (err) {
                    console.error("Failed to fetch doctor dashboard", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [router]);

    const handleUpdateProfile = async () => {
        try {
            setProfileLoading(true);
            await doctorApi.put('/profile', profileForm);
            setUserData(prev => ({ ...prev, name: profileForm.name }));
            localStorage.setItem('user_name', profileForm.name);
            localStorage.setItem('user_specialization', profileForm.specialization);
            toast.success('Clinical metadata synchronized.');
            setActiveTab('overview');
        } catch (err) {
            console.error("Profile update failed:", err);
            toast.error('Registry synchronization failed.');
        } finally {
            setProfileLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
            <LoadingSpinner size="lg" message="Synthesizing Clinic View..." />
        </div>
    );

    return (
        <DashboardLayout>
            <Head>
                <title>{userData?.name ? `Dr. ${userData.name} | Practitioner Dashboard` : 'Doctor Dashboard'} | SynapsCare</title>
            </Head>
            
            <main className="relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200/20 blur-[100px] -z-10 rounded-full pointer-events-none"></div>

                {activeTab === 'overview' && (
                    <div className="space-y-10">
                        <header className="flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-serif text-slate-900 tracking-tight">Clinical Overview</h2>
                                <p className="text-slate-500 font-medium mt-1">Status and performance at a glance.</p>
                            </div>
                        </header>

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                            <div className="xl:col-span-3 space-y-8">
                                <div className="bg-gradient-to-r from-teal-50 to-indigo-50 rounded-3xl p-8 flex justify-between items-center relative overflow-hidden shadow-sm border border-slate-100">
                                    <div className="z-10">
                                        <h2 className="text-3xl font-serif text-teal-900 mb-2">Good Morning, Dr. {userData?.name || 'Practitioner'}</h2>
                                        <p className="text-teal-700/80 font-medium tracking-wide">Ready for your clinical rotation today.</p>
                                    </div>
                                    <div className="absolute right-0 bottom-0 pointer-events-none opacity-90 h-[120%] flex items-end">
                                        <div className="w-48 h-48 bg-teal-200/40 rounded-full blur-3xl absolute -right-10 -bottom-10"></div>
                                        <div className="relative flex items-center gap-4 px-12 pb-4">
                                            <div className="w-16 h-32 bg-teal-600/10 rounded-t-full"></div>
                                            <div className="w-20 h-40 bg-indigo-600/10 rounded-t-full"></div>
                                            <div className="w-16 h-32 bg-teal-600/10 rounded-t-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-serif text-slate-800">Weekly Performance</h3>
                                        <button className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                            Current Rotation <Calendar className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Total Patients', value: stats.activePatients, icon: Users, bg: 'bg-teal-600', text: 'text-white', iconColor: 'text-white', iconBg: 'bg-white/20' },
                                            { label: 'Avg. Severity', value: 'Normal', icon: Activity, bg: 'bg-white', text: 'text-slate-900', iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
                                            { label: "Today's Visits", value: stats.appointmentsToday, icon: Calendar, bg: 'bg-white', text: 'text-slate-900', iconColor: 'text-rose-500', iconBg: 'bg-rose-50' },
                                            { label: 'Tele-sessions', value: appointments.filter(a => getAppointmentType(a) === 'TELEMEDICINE').length, icon: Video, bg: 'bg-white', text: 'text-slate-900', iconColor: 'text-indigo-500', iconBg: 'bg-indigo-50' },
                                        ].map((s, i) => (
                                            <div key={i} className={`p-6 rounded-3xl ${s.bg} flex flex-col items-center justify-center shadow-sm border border-slate-100 hover:-translate-y-1 transition-all`}>
                                                <div className={`w-12 h-12 ${s.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                                                    <s.icon className={`w-6 h-6 ${s.iconColor}`} />
                                                </div>
                                                <div className={`text-xs font-black uppercase tracking-widest mb-1 opacity-80 ${s.text}`}>{s.label}</div>
                                                <div className={`text-3xl font-black ${s.text}`}>{s.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="surface-card bg-white overflow-hidden flex flex-col mt-8 shadow-sm border border-slate-100 rounded-[2rem]">
                                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                                        <div>
                                            <h3 className="text-xl font-serif text-slate-900">Waitlist Queue</h3>
                                            <p className="text-xs text-slate-500 mt-1">Real-time status of awaiting patients.</p>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                                                    <th className="p-6 pl-8">Patient Identity</th>
                                                    <th className="p-6">Visit Mode</th>
                                                    <th className="p-6">Consultation Time</th>
                                                    <th className="p-6">Clinical Status</th>
                                                    <th className="p-6 pr-8 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {appointments.filter(a => a.status !== 'PENDING').slice(0, 5).map((appt, i) => (
                                                    <tr key={i} className="hover:bg-slate-50/30 transition-colors group cursor-pointer" onClick={() => { setSelectedAppointment(appt); setIsDrawerOpen(true); }}>
                                                        <td className="p-6 pl-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm relative">
                                                                    <Image 
                                                                        src={`https://ui-avatars.com/api/?name=P${appt.patientId}&background=random&color=fff`} 
                                                                        alt="Patient Avatar" 
                                                                        fill
                                                                        className="object-cover"
                                                                        unoptimized
                                                                    />
                                                                </div>
                                                                <span className="font-bold text-slate-800">{userData?.patientsMap?.[appt.patientId]?.name || `Patient #${appt.patientId}`}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            <Badge variant={appt.mode === 'TELEMEDICINE' ? 'primary' : 'success'}>
                                                                {appt.mode}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-slate-700">{appt.date}</span>
                                                                <span className="text-[10px] font-medium text-slate-500 mt-0.5">{appt.time}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${appt.status === 'PAID' ? 'bg-teal-500' : 'bg-amber-500'} animate-pulse`} />
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">{appt.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6 pr-8 text-right">
                                                            {(appt.status === 'CONFIRMED' || appt.status === 'PAID') && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); setActivePostSession(appt); }}
                                                                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all ml-auto group-hover:shadow-lg group-hover:shadow-teal-500/20"
                                                                    title="Issue Prescription"
                                                                >
                                                                    <ClipboardList className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {appointments.filter(a => a.status !== 'PENDING').length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" className="p-12 text-center">
                                                            <div className="flex flex-col items-center opacity-40">
                                                                <Calendar size={48} className="text-slate-200 mb-4" />
                                                                <p className="text-sm font-medium text-slate-400">No active sessions in queue.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="font-serif text-slate-900 text-xl">Clinic Calendar</h4>
                                    </div>
                                    <div className="flex justify-between text-center pb-6">
                                        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                                            const dayDate = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
                                            const isCurrentDay = isSameDay(dayDate, new Date());
                                            return (
                                                <div key={i} className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${isCurrentDay ? 'bg-teal-600 text-white shadow-xl shadow-teal-500/30 scale-110' : 'text-slate-400 hover:bg-slate-50'}`}>
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{format(dayDate, 'EEE')}</span>
                                                    <span className={`text-sm font-black ${isCurrentDay ? 'text-white' : 'text-slate-800'}`}>{format(dayDate, 'd')}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="border-t border-slate-50 pt-8">
                                        <h4 className="font-serif text-slate-900 text-lg mb-6">System Health</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-teal-50/50 rounded-[1.5rem] border border-teal-100/30 text-center">
                                                <CheckCircle size={18} className="text-teal-500 mx-auto mb-2" />
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</div>
                                                <div className="text-sm font-black text-teal-700">92%</div>
                                            </div>
                                            <div className="p-4 bg-indigo-50/50 rounded-[1.5rem] border border-indigo-100/30 text-center">
                                                <Clock size={18} className="text-indigo-500 mx-auto mb-2" />
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hours</div>
                                                <div className="text-sm font-black text-indigo-700">8.5</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/20 blur-[50px] rounded-full" />
                                    <h4 className="font-serif text-xl mb-8 relative z-10">Patient Flow Tracker</h4>
                                    <div className="h-40 flex items-end justify-between gap-2 px-2 relative z-10">
                                        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                                            const dayDate = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
                                            const dayAppointments = appointments.filter(a => a.date && isSameDay(new Date(a.date), dayDate)).length;
                                            const h = dayAppointments > 0 ? Math.min(100, Math.max(10, dayAppointments * 20)) : 10 + (i * 15 % 50); 
                                            return (
                                                <div key={i} className="flex flex-col items-center gap-2">
                                                    <div className="flex items-end gap-1.5 h-28">
                                                        <div className="w-2.5 bg-white/10 rounded-t-full transition-all duration-700" style={{ height: `${h}%` }}></div>
                                                        <div className="w-2.5 bg-teal-400 rounded-t-full shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all duration-1000 delay-100" style={{ height: `${h * 0.7}%` }}></div>
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">
                                                        {format(dayDate, 'EEE')}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <header>
                            <h2 className="text-4xl font-serif text-slate-900 tracking-tight">Clinical Identity</h2>
                            <p className="text-slate-500 font-medium mt-2">Manage your professional credentials and clinical metadata.</p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            <div className="md:col-span-12">
                                <div className="surface-card p-10 bg-white border border-slate-100 shadow-sm rounded-[2.5rem] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                                    
                                    <div className="flex flex-col md:flex-row items-center gap-10 mb-12 border-b border-slate-50 pb-12 relative z-10">
                                        <div className="w-40 h-40 rounded-[3rem] bg-slate-900 flex items-center justify-center text-teal-400 text-6xl shadow-2xl relative group overflow-hidden border-4 border-white">
                                            {profileForm.profileImageUrl ? (
                                                <Image 
                                                    src={profileForm.profileImageUrl} 
                                                    alt="Practitioner" 
                                                    fill 
                                                    className="object-cover group-hover:scale-110 transition-transform" 
                                                    unoptimized 
                                                />
                                            ) : (
                                                <Users size={48} className="group-hover:scale-110 transition-transform opacity-40" />
                                            )}
                                            <div 
                                                className="absolute inset-0 bg-teal-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm"
                                                onClick={() => document.getElementById('doctor-image-input').click()}
                                            >
                                                <Plus size={32} className="text-white" />
                                            </div>
                                            <input 
                                                type="file" 
                                                id="doctor-image-input" 
                                                className="hidden" 
                                                accept="image/*" 
                                                onChange={(e) => handleFileUpload(e, 'profile')}
                                            />
                                        </div>
                                        <div className="flex-1 text-center md:text-left space-y-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-[10px] font-black uppercase tracking-widest">
                                                <ShieldCheck size={12} /> Verified Practitioner Shard
                                            </div>
                                            <h2 className="text-5xl font-serif text-slate-900 tracking-tight leading-none">Dr. {profileForm.name}</h2>
                                            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialization</span>
                                                    <span className="text-sm font-bold text-slate-600 mt-1">{profileForm.specialization || 'General Physician'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-teal-600">ID Shard</span>
                                                    <span className="text-sm font-bold text-slate-600 mt-1">DOC-{profileForm.id || 'SYNCING'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleUpdateProfile}
                                            disabled={profileLoading}
                                            className="h-14 px-8 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-teal-600 transition-all flex items-center gap-3 shadow-xl shadow-slate-200 disabled:opacity-50"
                                        >
                                            {profileLoading ? 'Synchronizing...' : <><Save size={16} /> Commit Changes</>}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 relative z-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Display Name</label>
                                            <input 
                                                value={profileForm.name} 
                                                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                                className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-teal-600">Clinical Specialization</label>
                                            <input 
                                                value={profileForm.specialization} 
                                                onChange={(e) => setProfileForm({...profileForm, specialization: e.target.value})}
                                                className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-serif italic" 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinic Name</label>
                                            <div className="relative">
                                                <Building2 size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input 
                                                    value={profileForm.clinicName} 
                                                    onChange={(e) => setProfileForm({...profileForm, clinicName: e.target.value})}
                                                    className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-6 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consultation Fee (LKR)</label>
                                            <div className="relative">
                                                <DollarSign size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input 
                                                    type="number"
                                                    value={profileForm.consultationFee} 
                                                    onChange={(e) => setProfileForm({...profileForm, consultationFee: e.target.value})}
                                                    className="w-full h-16 bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-6 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical License Artifact</label>
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => document.getElementById('license-upload').click()}
                                                    className="h-16 px-8 flex-1 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center gap-3 text-teal-700 font-bold hover:bg-teal-100 transition-all overflow-hidden"
                                                >
                                                    <FileCheck size={20} />
                                                    <span className="truncate max-w-[150px]">
                                                        {profileForm.licenseUrl ? 'Re-upload License' : 'Upload Clinical License'}
                                                    </span>
                                                </button>
                                                {profileForm.licenseUrl && (
                                                    <a href={profileForm.licenseUrl} target="_blank" rel="noreferrer" className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-teal-600 transition-all">
                                                        <Activity size={24} />
                                                    </a>
                                                )}
                                                <input 
                                                    type="file" 
                                                    id="license-upload" 
                                                    className="hidden" 
                                                    accept=".pdf,image/*" 
                                                    onChange={(e) => handleFileUpload(e, 'license')}
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Qualifications</label>
                                            <div className="relative">
                                                <GraduationCap size={16} className="absolute left-6 top-7 text-slate-400" />
                                                <textarea 
                                                    value={profileForm.qualifications} 
                                                    onChange={(e) => setProfileForm({...profileForm, qualifications: e.target.value})}
                                                    className="w-full min-h-32 bg-slate-50/50 border border-slate-100 rounded-2xl pl-14 pr-6 py-6 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none" 
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Practitioner Biography</label>
                                            <textarea 
                                                value={profileForm.bio} 
                                                onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                                                className="w-full min-h-40 bg-slate-50/50 border border-slate-100 rounded-2xl p-6 font-medium text-slate-600 leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none" 
                                                placeholder="Describe your clinical expertise..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <PatientContextDrawer 
                    isOpen={isDrawerOpen} 
                    onClose={() => setIsDrawerOpen(false)} 
                    appointment={selectedAppointment} 
                />
                
                <AnimatePresence>
                    {activePostSession && (
                        <SessionPrescriptionModal 
                            session={activePostSession} 
                            onClose={() => setActivePostSession(null)} 
                            doctorId={userData?.doctorDbId || userData?.id} 
                        />
                    )}
                </AnimatePresence>
            </main>
        </DashboardLayout>
    );
};

export default DoctorDashboard;
