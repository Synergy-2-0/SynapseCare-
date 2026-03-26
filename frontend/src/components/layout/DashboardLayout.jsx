import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * DashboardLayout Component
 *
 * Wraps all doctor portal pages with sidebar navigation
 *
 * @param {ReactNode} children - Page content
 */
const DashboardLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Mark as client-side rendered
        setIsClient(true);

        // Check authentication
        const role = localStorage.getItem('user_role');
        if (role !== 'DOCTOR') {
            router.push('/login');
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    // Show consistent loading state until client-side hydration is complete
    if (!isClient || !isAuthorized) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900" role="status" aria-live="polite" aria-busy="true" aria-label="Establishing Connection...">
                <LoadingSpinner size="fullscreen" message="Establishing Connection..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-900">
            {/* Desktop Sidebar - Always visible on xl screens */}
            <div className="hidden xl:block">
                <Sidebar />
            </div>

            {/* Mobile/Tablet Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-[#0d213a]/50 backdrop-blur-sm z-40 xl:hidden"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{ type: 'spring', damping: 20 }}
                            className="fixed top-0 left-0 bottom-0 z-50 xl:hidden"
                        >
                            <Sidebar onClose={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 p-5 md:p-8 xl:p-10 overflow-y-auto">
                {/* Mobile Header with Hamburger */}
                <div className="xl:hidden mb-6 flex items-center justify-between surface-card px-4 py-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        <Menu className="w-5 h-5 text-slate-900" />
                    </button>
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="SynapseCare" className="w-8 h-8" />
                        <span className="text-base font-semibold text-slate-900">
                            SynapseCare
                        </span>
                    </div>
                </div>

                {/* Page Content */}
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
