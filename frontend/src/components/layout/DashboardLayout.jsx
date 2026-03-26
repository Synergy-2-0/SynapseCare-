import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Bell, User, LayoutDashboard, Command } from 'lucide-react';
import Sidebar from './Sidebar';
import LoadingSpinner from '../ui/LoadingSpinner';

const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
        const role = localStorage.getItem('user_role');
        if (role !== 'DOCTOR' && role !== 'ADMIN') {
            router.push('/login');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isClient || !isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900">
                <LoadingSpinner size="fullscreen" message="Synchronizing Healthcare Infrastructure..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Desktop Sidebar Overlay */}
            <div className="hidden xl:block shrink-0 sticky top-0 h-screen">
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
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] xl:hidden"
                        />
                        <motion.div
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 z-[110] xl:hidden"
                        >
                            <Sidebar onClose={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Application Interface */}
            <main className="flex-1 flex flex-col min-w-0 max-h-screen overflow-hidden">
                {/* Enterprise Header */}
                <header className="h-20 lg:h-24 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 flex items-center justify-between px-6 lg:px-12 shrink-0 z-40 relative">
                    <div className="flex items-center gap-8 flex-1">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all text-slate-900 xl:hidden active:scale-90"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="hidden sm:flex items-center bg-slate-100/80 rounded-2xl px-5 py-3 w-full max-w-lg border border-transparent focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-xl focus-within:shadow-indigo-500/5 transition-all group">
                            <Search size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input type="text" placeholder="Search specialized medical intelligence..." className="bg-transparent border-none outline-none text-sm font-bold px-3 w-full placeholder:text-slate-400" />
                            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg border border-slate-200 bg-white text-[10px] font-black text-slate-400">
                                 <Command size={10} /> K
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-8 ml-4">
                        <div className="hidden lg:flex flex-col text-right">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">Security Status</span>
                             <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 justify-end">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                 Clinical Safe-Grid Active
                             </span>
                        </div>

                        <button className="relative w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all shadow-sm hover:shadow-lg group">
                            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
                        </button>
                        
                        <div className="h-10 w-px bg-slate-200 hidden sm:block" />

                        <div className="flex items-center gap-4 group cursor-pointer pl-1">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">Dr. Identity</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-tight mt-1">Medical Specialist</p>
                            </div>
                            <div className="w-12 h-12 rounded-[1.2rem] bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-xl shadow-slate-300 relative group-hover:scale-105 transition-transform">
                                <User size={22} strokeWidth={2.5} />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Viewport */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 bg-slate-50/50 scroll-smooth custom-scrollbar relative">
                    <div className="max-w-[1400px] mx-auto pb-20">
                         <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={router.asPath}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                         >
                            {children}
                         </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
