import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Search, Bell, LogOut } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import LoadingSpinner from '../ui/LoadingSpinner';

const AdminLayout = ({ children, title = "" }) => {
    const [userData, setUserData] = useState({ name: 'Administrator', role: 'ADMIN' });
    const [isClient, setIsClient] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    const displayTitle = title ? `${title} | SynapseCare` : "SynapseCare Admin Console";

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const role = localStorage.getItem('user_role');
        
        if (!role) {
            router.push('/login');
            return;
        }

        if (role === 'ADMIN') {
            setIsAuthorized(true);
            setUserData({
                name: localStorage.getItem('user_name') || 'Administrator',
                role: 'ADMIN'
            });
            return;
        }

        router.push('/login');
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    if (!isClient || !isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900">
                <LoadingSpinner size="fullscreen" message="Authenticating Access..." />
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{displayTitle}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-['Inter',_sans-serif]">
                {/* Minimalist Professional Header */}
                <header className="h-20 bg-white/80 backdrop-blur-xl flex items-center justify-between px-12 border-b border-slate-100 shrink-0 z-50 sticky top-0">
                    <div className="flex items-center gap-12 flex-1">
                        {/* Branded Logo */}
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/dashboard/admin')}>
                            <Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain" />
                            <span className="text-xl font-bold tracking-tight text-slate-800">
                                Synapse<span className="text-teal-600">Admin</span>
                            </span>
                        </div>

                        {/* Search Hub */}
                        <div className="hidden md:flex items-center bg-slate-50 rounded-xl px-5 py-2.5 w-full max-w-sm border border-slate-100 focus-within:border-teal-500/30 focus-within:bg-white transition-all group">
                            <Search size={18} className="text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Universal Search..." 
                                className="bg-transparent border-none outline-none text-sm font-medium px-4 w-full text-slate-700 placeholder:text-slate-400" 
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <button className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-teal-600 transition-all">
                                <Bell size={20} strokeWidth={2} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
                            </button>
                            
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all font-semibold text-xs uppercase tracking-wider"
                            >
                                <LogOut size={16} strokeWidth={2.5} />
                                <span>Logout</span>
                            </button>
                        </div>
                        
                        <div className="h-8 w-px bg-slate-100 hidden sm:block" />

                        <div className="flex items-center gap-3 group cursor-pointer relative">
                            <div className="text-right hidden sm:block">
                                <p className="text-[13px] font-bold text-slate-800 leading-tight">Admin Portal</p>
                                <p className="text-[10px] font-medium text-slate-400 mt-1 tracking-tight">{userData.name}</p>
                            </div>
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shadow-sm group-hover:border-teal-500 transition-all flex items-center justify-center">
                                    <img 
                                        src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=150&auto=format&fit=crop" 
                                        alt="Admin"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm z-10" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Viewport */}
                <main className="flex-1 overflow-y-auto p-12 bg-slate-50/50 scroll-smooth relative">
                    <div className="max-w-[1500px] mx-auto pb-40">
                         <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={router.asPath}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                         >
                            {children}
                         </motion.div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default AdminLayout;
