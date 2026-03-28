import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Activity,
    Users,
    Calendar,
    TrendingUp,
    Plus,
    Clock,
    ShieldCheck,
    ArrowUpRight,
    Search,
    ChevronDown,
    Zap,
    LayoutGrid,
    MessageSquare,
    Stethoscope,
    User
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Header from '../../components/layout/Header';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import VerificationStatusBanner from '../../components/doctor/VerificationStatusBanner';
import AppointmentCard from '../../components/doctor/AppointmentCard';
import useDoctorProfile from '../../hooks/useDoctorProfile';
import useToast from '../../hooks/useToast';
import { DOCTOR_ROUTES } from '../../constants/routes';
import { isToday } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorDashboard = () => {
    const router = useRouter();
    const { profile, fetchProfile, loading: profileLoading } = useDoctorProfile();
    const [appointments] = useState([
        {
            id: 1,
            patientId: 101,
            patientName: 'Malith Perera',
            appointmentDate: new Date().toISOString().split('T')[0],
            status: 'CONFIRMED',
            time: '09:30 AM',
            tokenNumber: 'P-042'
        },
        {
            id: 2,
            patientId: 102,
            patientName: 'Saman Kumara',
            appointmentDate: new Date().toISOString().split('T')[0],
            status: 'PAID',
            time: '11:15 AM',
            tokenNumber: 'P-045'
        },
        {
            id: 3,
            patientId: 103,
            patientName: 'Devindi Ranasinghe',
            appointmentDate: new Date().toISOString().split('T')[0],
            status: 'PENDING',
            time: '02:00 PM',
            tokenNumber: 'P-051'
        }
    ]);

    const appointmentsLoading = false;
    useToast();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            fetchProfile().catch((err) => {
                if (err.response?.status === 404) {
                    router.push('/doctor/profile/setup');
                }
            });
        }
    }, [fetchProfile, router]);

    const todaysAppointments = appointments.filter(appt =>
        isToday(appt.appointmentDate) && appt.status !== 'CANCELLED'
    );

    const stats = [
        {
            label: 'Today\'s Workload',
            value: todaysAppointments.length,
            icon: Activity,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            trend: { value: '+2 from avg', isPositive: true }
        },
        {
            label: 'Patient Portfolio',
            value: '1,248',
            icon: Users,
            color: 'text-sky-600',
            bgColor: 'bg-sky-50',
            trend: { value: '+12% growth', isPositive: true }
        },
        {
            label: 'Monthly Earnings',
            value: 'LKR 42.5k',
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            trend: { value: 'Verified', isPositive: true }
        }
    ];

    const handleViewDetails = (appointment) => {
        router.push(`/doctor/appointments/${appointment.id}`);
    };

    const handleStartConsultation = (appointment) => {
        router.push({
            pathname: '/doctor/cases/new',
            query: {
                appointmentId: appointment.id,
                patientId: appointment.patientId,
                patientName: appointment.patientName,
                patientAge: appointment.patientAge || 30,
                patientGender: appointment.patientGender || 'Unknown'
            }
        });
    };

    if (profileLoading || appointmentsLoading) {
        return <LoadingSpinner size="fullscreen" message="Accessing Secure Clinical Hub..." />;
    }

    return (
        <DashboardLayout>
            <Header
                title={`Dr. ${profile?.userId || 'Practitioner'}`}
                subtitle={profile?.specialization || 'Strategic Medical Intelligence & Patient Care'}
                verificationStatus={profile ? {
                    status: profile.verificationStatus,
                    message: profile.verificationStatus
                } : null}
                actions={
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="primary" 
                            size="md" 
                            icon={Plus}
                            onClick={() => router.push(DOCTOR_ROUTES.PRESCRIPTIONS)}
                        >
                            Quick RX
                        </Button>
                        <Button 
                            variant="secondary" 
                            size="md" 
                            icon={Calendar}
                            onClick={() => router.push(DOCTOR_ROUTES.SCHEDULE)}
                        >
                            Configure Slot
                        </Button>
                    </div>
                }
            />

            {profile && profile.verificationStatus !== 'APPROVED' && (
                <VerificationStatusBanner status={profile.verificationStatus} />
            )}

            <div className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={index}
                            label={stat.label}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                            bgColor={stat.bgColor}
                            trend={stat.trend}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    {/* Primary Workflow Column */}
                    <div className="xl:col-span-8 space-y-10">
                        <Card
                            title="Patient Queue"
                            subtitle="Prioritized clinical assessments for today's roster"
                            padding="none"
                            actions={
                                <div className="flex items-center gap-2">
                                     <button className="h-10 px-4 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:bg-white hover:text-indigo-600 transition-all flex items-center gap-2">
                                         Export <Plus size={14} />
                                     </button>
                                     <button className="h-10 px-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                                         View Full Stack
                                     </button>
                                </div>
                            }
                        >
                            <div className="p-10 space-y-6">
                                {todaysAppointments.length > 0 ? (
                                    <div className="space-y-4">
                                        {todaysAppointments.map((appt) => (
                                            <AppointmentCard
                                                key={appt.id}
                                                appointment={appt}
                                                onViewDetails={handleViewDetails}
                                                onStartConsultation={handleStartConsultation}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-sm border border-slate-50 mb-6">
                                             <Calendar size={32} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Active Sessions Scheduled</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Analytical Projection Tooltip Placeholder */}
                        <div className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group shadow-2xl shadow-indigo-100/20">
                             <div className="absolute top-0 right-0 p-10 opacity-20 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                                 <TrendingUp size={240} strokeWidth={1} />
                             </div>
                             <div className="relative z-10 max-w-xl">
                                 <div className="flex items-center gap-3 mb-6">
                                     <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                         <Zap size={24} className="text-indigo-400" />
                                     </div>
                                     <Badge variant="success">INTELLIGENT PREDICTION</Badge>
                                 </div>
                                 <h4 className="text-3xl font-black tracking-tight leading-tight">Projected Efficiency <br /> Increasing by 14.2%</h4>
                                 <p className="text-slate-400 font-medium mt-4 text-sm leading-relaxed">Based on your current scheduling patterns, we've optimized your next clinical cycle to reduce patient waiting times by 12 minutes.</p>
                                 <button className="mt-8 px-8 py-3.5 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-transform">Enable Optimization</button>
                             </div>
                        </div>
                    </div>

                    {/* Secondary Intelligence Column */}
                    <div className="xl:col-span-4 space-y-10">
                        {/* Clinical Profile Management */}
                        <Card
                            title="Clinical Identity"
                            subtitle="Global verification & profile status"
                            variant="dark"
                        >
                            <div className="space-y-8">
                                <div className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/5">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden relative group">
                                         <User size={32} />
                                         <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                         <h5 className="font-black text-xl tracking-tight leading-none group-hover:text-indigo-400 transition-colors">Dr. {profile?.userId || 'Staff'}</h5>
                                         <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-2">Senior Specialist</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                     <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                         <span>Profile Completeness</span>
                                         <span className="text-indigo-400">82%</span>
                                     </div>
                                     <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                         <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: '82%' }}
                                            className="h-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
                                         />
                                     </div>
                                </div>

                                <Button 
                                    variant="primary" 
                                    size="md" 
                                    className="w-full"
                                    onClick={() => router.push(DOCTOR_ROUTES.PROFILE)}
                                >
                                    Refine Identity
                                </Button>
                            </div>
                        </Card>

                        {/* Recent Infrastructure Logs */}
                        <Card
                            title="System Intel"
                            subtitle="Automated logs from clinical cloud"
                        >
                            <div className="space-y-6">
                                {[
                                    { msg: 'New Prescription synced to cloud', time: '12m ago', icon: Stethoscope, color: 'text-emerald-500' },
                                    { msg: 'Token P-042 arrived at clinic', time: '45m ago', icon: User, color: 'text-indigo-500' },
                                    { msg: 'System background audit complete', time: '2h ago', icon: ShieldCheck, color: 'text-sky-500' }
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className={`w-10 h-10 rounded-xl bg-slate-50 ${log.color} flex items-center justify-center border border-slate-100 shrink-0 group-hover:scale-110 transition-transform`}>
                                            <log.icon size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700 leading-tight">{log.msg}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{log.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Help Desk Banner */}
                        <div className="p-10 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 group cursor-pointer hover:bg-indigo-100 transition-all">
                             <div className="flex items-center gap-4 mb-4">
                                 <div className="w-12 h-12 rounded-2xl bg-white border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                     <MessageSquare size={22} />
                                 </div>
                                 <h6 className="font-black text-slate-900 tracking-tight">Clinical Support</h6>
                             </div>
                             <p className="text-xs font-medium text-slate-500 leading-relaxed italic">"Our tactical medical support team is ready to assist with any high-priority infrastructure issues."</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DoctorDashboard;
