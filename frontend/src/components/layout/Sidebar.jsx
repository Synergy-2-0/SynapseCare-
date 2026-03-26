import React from 'react';
import { useRouter } from 'next/router';
import {
    LayoutDashboard,
    Users,
    Calendar,
    ClipboardList,
    Video,
    LogOut,
    User,
    TrendingUp,
    Settings,
    Stethoscope,
    MessageSquare,
    Bell,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { DOCTOR_ROUTES } from '../../constants/routes';
import { motion } from 'framer-motion';

const Sidebar = ({ onClose }) => {
    const router = useRouter();
    
    const mainNav = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Clinical Overview', path: DOCTOR_ROUTES.DASHBOARD },
        { id: 'appointments', icon: ClipboardList, label: 'Patient Queue', path: DOCTOR_ROUTES.APPOINTMENTS },
        { id: 'schedule', icon: Calendar, label: 'Duty Roster', path: DOCTOR_ROUTES.SCHEDULE },
        { id: 'patients', icon: Users, label: 'Health Records', path: DOCTOR_ROUTES.PATIENTS },
        { id: 'prescriptions', icon: Stethoscope, label: 'E-Prescribing', path: DOCTOR_ROUTES.PRESCRIPTIONS },
        { id: 'telemedicine', icon: Video, label: 'HD Virtual Care', path: DOCTOR_ROUTES.TELEMEDICINE },
    ];

    const bottomNav = [
        { id: 'profile', icon: User, label: 'Doctor Identity', path: DOCTOR_ROUTES.PROFILE },
        { id: 'settings', icon: Settings, label: 'System Config', path: DOCTOR_ROUTES.SETTINGS },
    ];

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    const isActive = (path) => router.pathname === path || router.pathname.startsWith(path + '/');

    return (
        <aside className="w-[300px] bg-white border-r border-slate-200 flex flex-col p-8 sticky top-0 h-screen z-50 overflow-y-auto selection:bg-indigo-100 selection:text-indigo-900">
            {/* Branding */}
            <div className="flex items-center gap-3 mb-12 group cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => router.push('/')}>
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain relative drop-shadow-sm transition-transform group-hover:rotate-12" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-slate-800">Synapse<span className="text-indigo-600">Care</span></span>
            </div>

            <div className="mb-6 px-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Clinical Enterprise</p>
            </div>

            {/* Navigation */}
            <div className="flex-1 space-y-2">
                {mainNav.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            router.push(item.path);
                            if (onClose) onClose();
                        }}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.8rem] text-sm font-bold tracking-tight transition-all duration-300 relative group overflow-hidden ${
                            isActive(item.path)
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive(item.path) ? 'text-indigo-400' : ''}`} />
                        {item.label}
                        {isActive(item.path) && (
                            <motion.div layoutId="doc-nav-bg" className="absolute left-0 w-1.5 h-6 bg-indigo-500 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Footer Items */}
            <div className="space-y-2 mt-10 pt-8 border-t border-slate-100">
                {bottomNav.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            router.push(item.path);
                            if (onClose) onClose();
                        }}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.8rem] text-sm font-bold tracking-tight transition-all duration-300 ${
                            isActive(item.path)
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-indigo-400' : ''}`} />
                        {item.label}
                    </button>
                ))}
                
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.8rem] text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-all group mt-2"
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Secure Terminal Exit
                </button>
                
                <div className="mt-6 p-5 bg-indigo-600 rounded-[2rem] text-white overflow-hidden relative group cursor-pointer shadow-lg shadow-indigo-100 border border-indigo-500/20">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                             <ShieldCheck size={14} className="text-indigo-300" />
                             <span className="text-[9px] font-black uppercase tracking-widest opacity-80">Sync Status</span>
                        </div>
                        <p className="font-bold text-xs">Medical Cloud Connected</p>
                    </div>
                    <Zap className="absolute -bottom-2 -right-2 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform" />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
