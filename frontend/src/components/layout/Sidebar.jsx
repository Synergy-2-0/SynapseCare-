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
    UserCog,
    Clock,
    ClipboardList,
    ShieldCheck,
    Search,
    Activity
} from 'lucide-react';
import { DOCTOR_ROUTES, PATIENT_ROUTES, ADMIN_ROUTES } from '../../constants/routes';

const Sidebar = ({ onClose }) => {
    const router = useRouter();

    const [storedRole] = useState(() => {
        if (typeof window === 'undefined') {
            return '';
        }
        return localStorage.getItem('user_role') || '';
    });

    const currentRole = storedRole || 'PATIENT';
    
    // Navigation configurations for different roles
    const adminNav = [
        { id: 'admin-dashboard', icon: LayoutDashboard, label: 'Admin Dashboard', path: ADMIN_ROUTES.DASHBOARD },
        { id: 'appointments', icon: Calendar, label: 'Appointments', path: '/dashboard/admin?tab=appointments' },
        { id: 'doctor-directory', icon: ShieldCheck, label: 'Doctor Directory', path: '/dashboard/admin?tab=doctors' },
        { id: 'user-management', icon: Users, label: 'User Management', path: '/dashboard/admin?tab=users' },
    ];

    const doctorNav = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: DOCTOR_ROUTES.DASHBOARD },
        { id: 'appointments', icon: Calendar, label: 'Appointments', path: DOCTOR_ROUTES.APPOINTMENTS },
        { id: 'patients', icon: Users, label: 'My Patients', path: DOCTOR_ROUTES.PATIENTS },
        { id: 'consultations', icon: Video, label: 'Consultations', path: DOCTOR_ROUTES.TELEMEDICINE },
        { id: 'prescriptions', icon: ClipboardList, label: 'Prescriptions', path: DOCTOR_ROUTES.PRESCRIPTIONS },
        { id: 'schedule', icon: Clock, label: 'Schedule', path: DOCTOR_ROUTES.SCHEDULE },
        { id: 'profile', icon: UserCog, label: 'My Settings', path: DOCTOR_ROUTES.SETTINGS },
    ];

    const patientNav = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: PATIENT_ROUTES.DASHBOARD },
        { id: 'appointments', icon: Calendar, label: 'My Appointments', path: PATIENT_ROUTES.APPOINTMENTS },
        { id: 'find-doctors', icon: Search, label: 'Find Doctors', path: PATIENT_ROUTES.FIND_DOCTORS },
        { id: 'telemedicine', icon: Video, label: 'Consultations', path: `${PATIENT_ROUTES.DASHBOARD}?tab=telemedicine` },
        { id: 'records', icon: FileText, label: 'Medical Records', path: PATIENT_ROUTES.MEDICAL_RECORDS },
        { id: 'symptom-checker', icon: Activity, label: 'AI Health Checker', path: PATIENT_ROUTES.SYMPTOM_CHECKER },
    ];

    const roleToNav = {
        'ADMIN': adminNav,
        'DOCTOR': doctorNav,
        'PATIENT': patientNav
    };

    const mainNav = roleToNav[currentRole] || patientNav;

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const isActive = (path) => {
        if (path.includes('?')) {
            return router.asPath === path;
        }
        return router.pathname === path || (path !== '/' && router.pathname.startsWith(path + '/'));
    };

    return (
        <aside className="w-[280px] bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 z-50 overflow-hidden shadow-sm">
            {/* Logo Section - Clean Sans-Serif as in reference image */}
            <div className="flex items-center gap-3 px-8 py-10 cursor-pointer" onClick={() => {
                if (currentRole === 'DOCTOR') router.push(DOCTOR_ROUTES.DASHBOARD);
                else if (currentRole === 'PATIENT') router.push(PATIENT_ROUTES.DASHBOARD);
                else if (currentRole === 'ADMIN') router.push(ADMIN_ROUTES.DASHBOARD);
                else router.push('/');
            }}>
                <Image src="/logo.png" alt="SynapseDoc" width={32} height={32} className="w-8 h-8 object-contain" />
                <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
                    Synapse<span className="text-teal-600">Doc</span>
                </span>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                {mainNav.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                router.push(item.path);
                                if (onClose) onClose();
                            }}
                            className={`w-full flex items-center px-6 py-4 text-[15px] font-medium transition-all relative rounded-lg group
                                ${active 
                                    ? 'bg-teal-50/50 text-teal-600' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            {/* Left Border for Active Item */}
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-teal-600 rounded-r-md" />
                            )}
                            
                            <div className="flex items-center gap-4">
                                <item.icon 
                                    className={`w-5 h-5 ${active ? 'text-teal-600' : 'text-slate-400 group-hover:text-teal-600'} transition-colors`} 
                                    strokeWidth={active ? 2.5 : 2} 
                                />
                                <span className={active ? 'font-semibold' : ''}>{item.label}</span>
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* Logout Section */}
            <div className="p-4 border-t border-slate-50 mt-auto">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 text-[15px] font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all rounded-lg group"
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
