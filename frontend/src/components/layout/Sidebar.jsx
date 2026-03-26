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
    Stethoscope
} from 'lucide-react';
import { DOCTOR_ROUTES } from '../../constants/routes';

/**
 * Sidebar Component for Doctor Portal
 */
const Sidebar = ({ onClose }) => {
    const router = useRouter();
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: DOCTOR_ROUTES.DASHBOARD },
        { id: 'schedule', icon: Calendar, label: 'My Schedule', path: DOCTOR_ROUTES.SCHEDULE },
        { id: 'appointments', icon: ClipboardList, label: 'Appointments', path: DOCTOR_ROUTES.APPOINTMENTS },
        { id: 'patients', icon: Users, label: 'My Patients', path: DOCTOR_ROUTES.PATIENTS },
        { id: 'prescriptions', icon: Stethoscope, label: 'Prescriptions', path: DOCTOR_ROUTES.PRESCRIPTIONS },
        { id: 'telemedicine', icon: Video, label: 'Telemedicine', path: DOCTOR_ROUTES.TELEMEDICINE },
        { id: 'analytics', icon: TrendingUp, label: 'Analytics', path: DOCTOR_ROUTES.ANALYTICS },
    ];

    const bottomNavItems = [
        { id: 'profile', icon: User, label: 'My Profile', path: DOCTOR_ROUTES.PROFILE },
        { id: 'settings', icon: Settings, label: 'Settings', path: DOCTOR_ROUTES.SETTINGS },
    ];

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
            router.push('/login');
        }
    };

    const isActivePath = (path) => {
        return router.pathname === path || router.pathname.startsWith(path + '/');
    };

    return (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-5 sticky top-0 h-screen shadow-sm overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-2">
                <img src="/logo.png" alt="SynapseCare" className="w-10 h-10" />
                <span className="text-lg font-semibold text-slate-900 truncate">
                    Doctor Portal
                </span>
            </div>

            <div className="mb-5 px-2">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Clinical Workspace</p>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            router.push(item.path);
                            if (onClose) onClose();
                        }}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-2xl
                            font-medium transition-all
                            ${isActivePath(item.path)
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                            }
                        `}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Bottom Navigation */}
            <div className="space-y-2 mb-6 pt-6 border-t border-slate-200">
                {bottomNavItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            router.push(item.path);
                            if (onClose) onClose();
                        }}
                        className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-2xl
                            font-medium transition-all
                            ${isActivePath(item.path)
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                            }
                        `}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Logout Button */}
            <div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
