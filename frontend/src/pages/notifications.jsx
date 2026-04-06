import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Header from '../components/layout/Header';
import { useNotifications } from '../context/NotificationContext';
import { 
    Bell, CheckCheck, Trash2, Calendar, CreditCard, 
    FileText, Video, User, Clock, Filter, Search, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
    const { 
        notifications, 
        loading, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification,
        fetchNotifications
    } = useNotifications();

    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const categories = [
        { id: 'ALL', label: 'All Updates', icon: Bell },
        { id: 'APPOINTMENT', label: 'Appointments', icon: Calendar },
        { id: 'PAYMENT', label: 'Financial', icon: CreditCard },
        { id: 'TELEMEDICINE', label: 'Telemedicine', icon: Video },
        { id: 'PRESCRIPTION', label: 'Prescriptions', icon: FileText }
    ];

    const filteredNotifications = notifications.filter(n => {
        const matchesType = filter === 'ALL' || n.type.toLowerCase().includes(filter.toLowerCase());
        const matchesSearch = n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             n.message?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const getIcon = (type) => {
        const iconProps = { size: 20 };
        if (type.includes('APPOINTMENT')) return <Calendar {...iconProps} className="text-blue-500" />;
        if (type.includes('PAYMENT')) return <CreditCard {...iconProps} className="text-emerald-500" />;
        if (type.includes('TELEMEDICINE')) return <Video {...iconProps} className="text-cyan-500" />;
        if (type.includes('PRESCRIPTION')) return <FileText {...iconProps} className="text-purple-500" />;
        if (type.includes('DOCTOR')) return <User {...iconProps} className="text-indigo-500" />;
        return <Bell {...iconProps} className="text-slate-400" />;
    };

    return (
        <DashboardLayout title="Notification Center">
            <Header 
                title="Notification Command Center" 
                subtitle="Track and manage your entire clinical communication history across all channels."
                breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Notifications' }]}
                actions={
                    <button 
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <CheckCheck size={18} />
                        Mark All as Read
                    </button>
                }
            />

            <div className="mt-8 grid lg:grid-cols-4 gap-8">
                {/* Left: Filters & Search */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200/60 shadow-sm overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                         
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                            <Filter size={12} strokeWidth={3} /> Filter Intelligence
                         </h3>

                         <div className="space-y-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilter(cat.id)}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                                        filter === cat.id 
                                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <cat.icon size={18} strokeWidth={filter === cat.id ? 2.5 : 2} />
                                    {cat.label}
                                </button>
                            ))}
                         </div>

                         <div className="mt-8 pt-8 border-t border-slate-100">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search alerts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                                />
                            </div>
                         </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        <div className="relative z-10">
                            <h4 className="text-lg font-black tracking-tight mb-2">Multichannel Sync</h4>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                All clinical alerts are synchronized across SMS, WhatsApp, and Email based on your preferences.
                            </p>
                            <button className="mt-6 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">
                                Configure Preferences <ArrowRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Notifications List */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-premium overflow-hidden">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Clinical Feed</h3>
                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                {filteredNotifications.length} Results
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100 min-h-[500px]">
                            <AnimatePresence mode="popLayout">
                                {loading && notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                                        <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                                        <p className="text-sm font-bold text-slate-400 animate-pulse">Synchronizing Clinical Timeline...</p>
                                    </div>
                                ) : filteredNotifications.length === 0 ? (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center py-40 px-8 text-center"
                                    >
                                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
                                            <Bell size={40} className="text-slate-300" />
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Clinical Feed is Clear</h4>
                                        <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                                            You're all caught up! No new notifications found for the selected filters.
                                        </p>
                                    </motion.div>
                                ) : (
                                    filteredNotifications.map((notif, index) => (
                                        <motion.div
                                            key={notif.id}
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3, delay: index * 0.03 }}
                                            className={`p-10 group flex gap-8 items-start hover:bg-slate-50 relative transition-all ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <div className="relative">
                                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 border-white shadow-md relative z-10 ${!notif.isRead ? 'bg-white' : 'bg-slate-50'}`}>
                                                    {getIcon(notif.type)}
                                                </div>
                                                {!notif.isRead && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white z-20" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div>
                                                        <h4 className={`text-lg tracking-tight ${!notif.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                                                            {notif.title || notif.type.replace(/_/g, ' ')}
                                                        </h4>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                                                                <Clock size={12} strokeWidth={3} />
                                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                            </div>
                                                            <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                                Channel: {notif.channel || 'IN_APP'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {!notif.isRead && (
                                                            <button 
                                                                onClick={() => markAsRead(notif.id)}
                                                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 shadow-sm transition-all"
                                                                title="Mark as Read"
                                                            >
                                                                <CheckCheck size={16} strokeWidth={3} />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => deleteNotification(notif.id)}
                                                            className="p-2.5 bg-white border border-slate-200 rounded-xl text-rose-500 hover:bg-rose-50 hover:border-rose-100 shadow-sm transition-all"
                                                            title="Delete Permanently"
                                                        >
                                                            <Trash2 size={16} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 pr-12">
                                                    {notif.message}
                                                </p>
                                                {notif.actionUrl && (
                                                    <a 
                                                        href={notif.actionUrl}
                                                        className="inline-flex items-center gap-2 mt-6 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors py-2 px-4 bg-indigo-50/50 rounded-xl"
                                                    >
                                                        Visit Link <ArrowRight size={10} strokeWidth={4} />
                                                    </a>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

// Simple Arrow icon not available in initial scope
const ArrowRight = ({ size, className, strokeWidth = 2 }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={strokeWidth} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

export default NotificationsPage;
