import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    Video,
    LogOut,
    User,
    BarChart,
    Settings,
    Clock,
    Activity,
    ShieldCheck
} from 'lucide-react';
import { ADMIN_ROUTES, DOCTOR_ROUTES, PATIENT_ROUTES } from '../../constants/routes';
import { motion } from 'framer-motion';

const Sidebar = ({ onClose }) => {
    const router = useRouter();

    const [storedRole] = useState(() => {
        if (typeof window === 'undefined') {
            return '';
        }
        return localStorage.getItem('user_role') || '';
    });

    const currentRole = (storedRole || (
        router.pathname.startsWith('/dashboard/admin')
            ? 'ADMIN'
            : ((router.pathname.startsWith('/patient') || router.pathname.startsWith('/dashboard/patient'))
                ? 'PATIENT'
                : 'DOCTOR')
    ));

    const doctorMainNav = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: DOCTOR_ROUTES.DASHBOARD },
        { id: 'appointments', icon: Calendar, label: 'Appointments', path: DOCTOR_ROUTES.APPOINTMENTS },
        { id: 'patients', icon: Users, label: 'My Patients', path: DOCTOR_ROUTES.PATIENTS },
        { id: 'consultations', icon: Video, label: 'Consultations', path: DOCTOR_ROUTES.TELEMEDICINE },
        { id: 'prescriptions', icon: FileText, label: 'Prescriptions', path: DOCTOR_ROUTES.PRESCRIPTIONS },
        { id: 'schedule', icon: Clock, label: 'Schedule', path: DOCTOR_ROUTES.SCHEDULE },
        { id: 'earnings', icon: BarChart, label: 'Earnings', path: DOCTOR_ROUTES.ANALYTICS },
    ];

    const doctorBottomNav = [
        { id: 'settings', icon: Settings, label: 'Profile & Settings', path: DOCTOR_ROUTES.SETTINGS },
    ];

    const patientMainNav = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Patient Hub', path: PATIENT_ROUTES.DASHBOARD },
        { id: 'appointments', icon: Calendar, label: 'My Appointments', path: PATIENT_ROUTES.APPOINTMENTS },
        { id: 'find-doctors', icon: Users, label: 'Find Doctors', path: PATIENT_ROUTES.FIND_DOCTORS },
        { id: 'symptom-checker', icon: Activity, label: 'AI Symptom Checker', path: PATIENT_ROUTES.SYMPTOM_CHECKER },
        { id: 'telemedicine', icon: Video, label: 'Telemedicine', path: PATIENT_ROUTES.TELEMEDICINE },
        { id: 'records', icon: FileText, label: 'Medical Records', path: PATIENT_ROUTES.MEDICAL_RECORDS },
    ];

    const patientBottomNav = [
        { id: 'profile', icon: User, label: 'My Profile', path: PATIENT_ROUTES.PROFILE },
    ];

    const adminMainNav = [
        { id: 'admin-dashboard', icon: LayoutDashboard, label: 'Admin Dashboard', path: ADMIN_ROUTES.DASHBOARD },
        { id: 'admin-appointments', icon: Calendar, label: 'Appointments', path: '/appointments' },
        { id: 'admin-doctors', icon: ShieldCheck, label: 'Doctor Directory', path: ADMIN_ROUTES.DASHBOARD, tab: 'doctors' },
    ];

    const adminBottomNav = [];

    const mainNav = currentRole === 'ADMIN'
        ? adminMainNav
        : (currentRole === 'PATIENT' ? patientMainNav : doctorMainNav);
    const bottomNav = currentRole === 'ADMIN'
        ? adminBottomNav
        : (currentRole === 'PATIENT' ? patientBottomNav : doctorBottomNav);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const activeTabFromPath = (() => {
        const queryString = router.asPath.split('?')[1] || '';
        const params = new URLSearchParams(queryString);
        return params.get('tab');
    })();

    const isActive = (item) => {
        if (item.tab) {
            return router.pathname === item.path && activeTabFromPath === item.tab;
        }

        return router.pathname === item.path || router.pathname.startsWith(item.path + '/');
    };

    return (
        <aside className="w-[240px] glass-morphism border-r border-[var(--border-color)]/30 flex flex-col pt-6 pb-6 sticky top-0 h-screen z-50 overflow-y-auto selection:bg-teal-100 selection:text-teal-900 border-0">
            <div className="flex items-center gap-3 px-6 mb-8 group cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => router.push('/')}>
                <div className="relative">
                    <div className="absolute inset-0 bg-[var(--accent-teal)] blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                    <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain relative drop-shadow-sm transition-transform group-hover:rotate-12" />
                </div>
                <span className="text-xl font-bold tracking-tight font-serif text-[var(--text-primary)]">Synapse<span className="text-[var(--accent-teal)]">Care</span></span>
            </div>

            <div className="flex-1 flex flex-col space-y-1">
                {mainNav.map((item) => {
                    const active = isActive(item);
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.tab) {
                                    router.push(`${item.path}?tab=${item.tab}`);
                                } else {
                                    router.push(item.path);
                                }
                                if (onClose) onClose();
                            }}
                            className={`w-full flex items-center justify-between px-6 py-3 text-[14px] font-medium transition-all duration-200 relative group ${active ? 'bg-[var(--bg-hover)] text-[var(--accent-teal)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-[18px] h-[18px] transition-transform group-hover:scale-110 ${active ? 'text-[var(--accent-teal)]' : 'text-[var(--text-muted)] group-hover:text-[var(--accent-teal)]'}`} strokeWidth={active ? 2.5 : 2} />
                                {item.label}
                            </div>

                            {item.id === 'consultations' && active && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}

                            {active && (
                                <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--accent-teal)] rounded-r" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-1 mt-auto pt-6 border-t border-[var(--border-color)]">
                {bottomNav.map((item) => {
                    const active = isActive(item);
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                router.push(item.path);
                                if (onClose) onClose();
                            }}
                            className={`w-full flex items-center gap-3 px-6 py-3 text-[14px] font-medium transition-all duration-200 relative group ${active ? 'bg-[var(--bg-hover)] text-[var(--accent-teal)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'}`}
                        >
                            <item.icon className={`w-[18px] h-[18px] ${active ? 'text-[var(--accent-teal)]' : 'text-[var(--text-muted)] group-hover:text-[var(--accent-teal)]'}`} strokeWidth={active ? 2.5 : 2} />
                            {item.label}
                            {active && (
                                <motion.div layoutId="active-indicator-bottom" className="absolute left-0 top-0 bottom-0 w-[4px] bg-[var(--accent-teal)] rounded-r" />
                            )}
                        </button>
                    );
                })}

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-3 text-[14px] font-medium text-[var(--accent-red)] hover:bg-red-50/50 transition-all group mt-2"
                >
                    <LogOut className="w-[18px] h-[18px] group-hover:-translate-x-1 transition-transform" />
                    Secure Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
