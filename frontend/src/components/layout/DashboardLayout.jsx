import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Command } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import Sidebar from './Sidebar';
import LoadingSpinner from '../ui/LoadingSpinner';
import NotificationBell from '../ui/NotificationBell';

const DashboardLayout = ({ children, title = "" }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userData, setUserData] = useState({ name: 'Practitioner', specialization: 'General Physician' });
    const [userRole, setUserRole] = useState('PATIENT');
    const [isClient, setIsClient] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    const displayTitle = title ? `${title} | SynapseDoc` : "SynapseDoc Dashboard";

    const getAllowedRolesForPath = (pathname) => {
        if (pathname.startsWith('/dashboard/admin')) return ['ADMIN'];
        if (pathname.startsWith('/dashboard/doctor') || pathname.startsWith('/doctor')) return ['DOCTOR'];
        if (pathname.startsWith('/dashboard/patient') || pathname.startsWith('/patient')) return ['PATIENT'];
        if (pathname.startsWith('/appointments')) return ['PATIENT', 'DOCTOR', 'ADMIN'];
        return ['PATIENT', 'DOCTOR', 'ADMIN'];
    };

    const getFallbackRoute = (role) => {
        if (role === 'ADMIN') return '/dashboard/admin';
        if (role === 'DOCTOR') return '/doctor/dashboard';
        if (role === 'PATIENT') return '/dashboard/patient';
        return '/login';
    };

    useEffect(() => {
        setIsClient(true);
        const role = localStorage.getItem('user_role');
        const allowedRoles = getAllowedRolesForPath(router.pathname);
        const verificationStatus = localStorage.getItem('user_verificationStatus');

        if (!role) {
            router.push('/login');
            return;
        }

        if (role === 'DOCTOR' && verificationStatus === 'PENDING' && !router.pathname.startsWith('/doctor/setup')) {
            router.push('/doctor/setup');
            return;
        }

        if (role === 'DOCTOR' && verificationStatus === 'APPROVED' && router.pathname.startsWith('/doctor/setup')) {
            router.push('/dashboard/doctor');
            return;
        }

        if (allowedRoles.includes(role)) {
            setIsAuthorized(true);
            setUserRole(role);
            setUserData({
                name: localStorage.getItem('user_name') || 'Practitioner',
                specialization: localStorage.getItem('user_specialization') || (role === 'DOCTOR' ? 'General Physician' : 'Patient')
            });
            return;
        }

        router.push(getFallbackRoute(role));
    }, [router, router.pathname]);

    if (!isClient || !isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900">
                <LoadingSpinner size="fullscreen" message="Synchronizing Healthcare Infrastructure..." />
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{displayTitle}</title>
            </Head>
            <div className="min-h-screen bg-[var(--bg-base)] flex text-[var(--text-primary)] selection:bg-teal-100 selection:text-teal-900">
            {/* Desktop Sidebar Overlay */}
            <div className="hidden xl:block shrink-0 sticky top-0 h-screen w-[240px]">
                <Sidebar />
            </div>

            {/* Mobile/Tablet Sidebar Drawer */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-100 xl:hidden"
                        />
                        <motion.div
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 z-110 xl:hidden"
                        >
                            <Sidebar onClose={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Application Interface */}
            <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
                {/* Enterprise Header */}
                <header className="h-20 glass-morphism !border-x-0 !border-t-0 flex items-center justify-between px-6 lg:px-8 shrink-0 z-40 relative sticky top-0 shadow-sm">
                    <div className="flex items-center gap-6 flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 bg-[var(--bg-hover)] rounded-xl hover:bg-slate-200 transition-all text-slate-900 xl:hidden active:scale-90"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center bg-[var(--bg-hover)] rounded-xl px-4 py-2 w-full max-w-md border border-transparent focus-within:border-[var(--accent-teal)] focus-within:bg-white focus-within:shadow-md focus-within:shadow-[var(--accent-teal)]/10 transition-all group">
                            <Search size={18} className="text-[var(--text-muted)] group-focus-within:text-[var(--accent-teal)] transition-colors" />
                            <input type="text" placeholder="Search patients, appointments..." className="bg-transparent border-none outline-none text-sm font-medium px-3 w-full text-[var(--text-primary)] placeholder:text-[var(--text-muted)]" />
                            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-white text-[10px] font-bold text-[var(--text-muted)]">
                                 <Command size={10} /> K
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6 ml-4">
                        <NotificationBell />
                        
                        <div className="h-8 w-px bg-[var(--border-color)] hidden sm:block" />

                        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push(userRole === 'DOCTOR' ? '/doctor/dashboard?tab=profile' : userRole === 'PATIENT' ? '/dashboard/patient?tab=profile' : '#')}>
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold font-serif text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent-teal)] transition-colors">
                                    {userRole === 'DOCTOR' ? `Dr. ${userData.name}` : userRole === 'ADMIN' ? `Admin ${userData.name}` : userData.name}
                                </p>
                                <p className="text-[10px] font-medium text-[var(--text-muted)] mt-0.5">
                                    {userRole === 'DOCTOR' ? userData.specialization : userRole === 'ADMIN' ? 'Administrator' : 'Patient'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[var(--bg-hover)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-teal)] relative group-hover:scale-105 transition-transform overflow-hidden">
                                {typeof window !== 'undefined' && localStorage.getItem('user_image') ? (
                                    <Image 
                                        src={localStorage.getItem('user_image')} 
                                        alt={userData.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${userData.name}&background=0D9488&color=fff`} 
                                        alt={userData.name}
                                        className="w-full h-full rounded-full object-cover p-0.5"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Viewport */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[var(--bg-base)] scroll-smooth relative">
                    <div className="max-w-7xl mx-auto pb-20">
                         <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={router.asPath}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                         >
                            {children}
                         </motion.div>
                    </div>
                </div>
            </main>
        </div>
        </>
    );
};

export default DashboardLayout;
