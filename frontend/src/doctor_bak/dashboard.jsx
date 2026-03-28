import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import {
    Activity, Users, Calendar, TrendingUp, Plus, Clock, 
    ArrowUpRight, Video, FileText, LayoutGrid
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import { MockDataContext } from '../../context/MockDataContext';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
    <div className="surface-card surface-card-hover !rounded-[var(--radius-3xl)] p-8 relative overflow-hidden group">
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">{title}</p>
                <h3 className="text-4xl font-black font-serif text-[var(--text-primary)]">{value}</h3>
            </div>
            <motion.div 
                animate={{ y: [0, -5, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className={`p-4 rounded-2xl shadow-inner bg-[var(--bg-hover)] ${colorClass}`}
            >
                <Icon size={28} />
            </motion.div>
        </div>
        {trend && (
            <div className="mt-6 flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-full border border-emerald-100">
                <TrendingUp size={14} className="mr-1" /> {trend}
            </div>
        )}
        {/* Soft background shape */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-teal-50/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />
    </div>
);

export default function DoctorDashboard() {
    const router = useRouter();
    const { stats, appointments, isLoading } = useContext(MockDataContext);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="animate-pulse space-y-8 mt-8">
                    <div className="h-12 bg-[var(--bg-base)] rounded-lg w-1/3 blur-sm" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)]" />)}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 h-96 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)]" />
                        <div className="h-96 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-[var(--radius-lg)]" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Header 
                title="Hello, Dr. Silva." 
                subtitle="Here's what's happening today." 
                action={
                   <button onClick={() => router.push('/doctor/telemedicine-center')} className="btn-primary flex items-center gap-2">
                       <Video size={18} /> Enter Telemedicine Hub
                   </button>
                }
            />

            {/* Dashboard Stats */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
            >
                <StatCard title="Today's Patients" value={stats.todayPatients} icon={Users} colorClass="text-blue-600" />
                <StatCard title="Consultations" value={stats.consultations} icon={Video} colorClass="text-indigo-600" trend="+12% this week" />
                <StatCard title="Pending Reports" value={stats.pendingReports} icon={FileText} colorClass="text-amber-500" />
                <StatCard title="Est. Revenue" value={`$${stats.revenue}`} icon={Activity} colorClass="text-emerald-600" trend="+4% vs yesterday" />
            </motion.div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* Left Col - Queue */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="surface-card !rounded-[var(--radius-3xl)] overflow-hidden">
                        <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-base)] flex justify-between items-center rounded-t-[var(--radius-3xl)]">
                            <h2 className="font-bold text-xl text-[var(--text-primary)] font-serif flex items-center gap-3">
                                <Clock className="text-[var(--accent-amber)]" size={24} /> Active Queue
                            </h2>
                            <button onClick={() => router.push('/doctor/appointments')} className="text-sm font-bold text-[var(--accent-teal)] hover:translate-x-1 transition-transform flex items-center">
                                View Full Schedule <ArrowUpRight size={16} className="ml-1" />
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            {appointments.slice(0, 4).map((apt, index) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.01, y: -2 }}
                                    key={apt.id} 
                                    className="p-5 surface-card surface-card-hover cursor-pointer flex items-center justify-between !rounded-xl border border-[var(--border-color)]/50"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center font-black text-slate-400 text-lg">
                                            {apt.patient.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-teal)] transition-colors">{apt.patient}</h4>
                                            <p className="text-sm text-[var(--text-muted)] font-medium mt-1">{apt.time} • {apt.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border shadow-sm ${apt.status === 'Confirmed' ? 'border-teal-200 text-teal-700 bg-teal-50' : 'border-amber-200 text-amber-700 bg-amber-50'}`}>
                                            {apt.status}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            {appointments.length === 0 && (
                                <div className="p-12 text-center text-[var(--text-muted)] font-medium">No appointments found for today.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Col - Quick Tools & AI Intel */}
                <div className="space-y-6">
                    <div className="glass-morphism bg-gradient-to-br from-indigo-500 to-indigo-700 !rounded-[var(--radius-3xl)] p-8 shadow-[var(--shadow-premium)] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Activity size={120} />
                        </div>
                        <h3 className="font-serif font-black text-2xl relative z-10 flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-blue-300 animate-ping" /> AI Intel
                        </h3>
                        <p className="text-base text-indigo-100 mt-3 font-medium relative z-10 leading-relaxed">SynapseCare analysis has flagged 2 pending reports anomalies requiring review.</p>
                        <button className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-2xl font-bold text-sm transition-all backdrop-blur-md shadow-sm relative z-10">
                            Review AI Flags
                        </button>
                    </div>

                    <div className="surface-card !rounded-[var(--radius-3xl)] overflow-hidden">
                        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-base)]">
                            <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Quick Actions</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <button onClick={() => router.push('/doctor/prescriptions')} className="p-6 border border-[var(--border-color)] rounded-2xl text-center hover:bg-[var(--bg-hover)] transition-all hover:border-[var(--accent-teal)] hover:-translate-y-1 hover:shadow-md group">
                                <Plus size={24} className="mx-auto text-[var(--text-muted)] group-hover:text-[var(--accent-teal)] mb-3 transition-colors" />
                                <span className="text-sm font-bold text-[var(--text-primary)]">New RX</span>
                            </button>
                            <button onClick={() => router.push('/doctor/schedule')} className="p-6 border border-[var(--border-color)] rounded-2xl text-center hover:bg-[var(--bg-hover)] transition-all hover:border-[var(--accent-teal)] hover:-translate-y-1 hover:shadow-md group">
                                <Calendar size={24} className="mx-auto text-[var(--text-muted)] group-hover:text-[var(--accent-teal)] mb-3 transition-colors" />
                                <span className="text-sm font-bold text-[var(--text-primary)]">Edit Slots</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
