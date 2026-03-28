import React, { useEffect, useState } from 'react';
import { 
    LayoutDashboard, Users, Calendar, ClipboardList, 
    Video, LogOut, Search, Bell, CheckCircle, XCircle,
    Activity, Shield, AlertCircle, ArrowUpRight, Stethoscope, Clock, Wallet,
    BarChart2, Settings
} from 'lucide-react';
import { useRouter } from 'next/router';
import { appointmentApi, prescriptionApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { isToday, isTomorrow, compareAsc } from 'date-fns';
import ScheduleTab from '@/components/doctor/ScheduleTab';
import TelemedicineTab from '@/components/doctor/TelemedicineTab';
import SessionPrescriptionModal from '@/components/doctor/SessionPrescriptionModal';
import PatientContextDrawer from '@/components/doctor/PatientContextDrawer';
import PatientRosterTab from '@/components/doctor/PatientRosterTab';


const Badge = ({ children, variant }) => {
    const variants = {
        success: 'bg-emerald-100/50 text-emerald-700 border-emerald-200/50',
        primary: 'bg-teal-100/50 text-teal-700 border-teal-200/50',
        warning: 'bg-amber-100/50 text-amber-700 border-amber-200/50',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${variants[variant] || variants.primary}`}>
            {children}
        </span>
    );
};

const DoctorDashboard = () => {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({ appointmentsToday: 0, activePatients: 0, hours: 0 });
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
const [activePostSession, setActivePostSession] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const role = localStorage.getItem('user_role');
            const id = localStorage.getItem('user_id');
            const name = localStorage.getItem('user_name');

            if (role !== 'DOCTOR') { router.push('/login'); return; }
            setUserData({ name, id });

            const fetchData = async () => {
                try {
                    const apptRes = await appointmentApi.get(`/doctor/${id}`);
                    const allAppts = apptRes.data?.data || [];
                    setAppointments(allAppts.filter(a => a.status !== 'CANCELLED'));
                    setStats({
                        appointmentsToday: allAppts.filter(a => a.status === 'PAID').length,
                        activePatients: 24,
                        hours: 8
                    });
                } catch (err) {
                    console.error("Failed to fetch doctor dashboard", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [router]);

    const handleApptAction = async (id, action, reason = null) => {
        try {
            const payload = reason ? { data: { reason } } : {};
            await appointmentApi.put(`/${id}/${action}`, payload);
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: action === 'accept' ? 'CONFIRMED' : 'REJECTED' } : a));
            toast.success(`Visit ${action === 'accept' ? 'Confirmed' : 'Rejected'}`);
        } catch (err) {
            console.error("Action error", err);
            toast.error("Failed to update status");
        }
    };

    const logout = () => { localStorage.clear(); router.push('/login'); };

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
                <div className="text-xl font-serif text-slate-700 tracking-wide">Synthesizing Clinic View...</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex">
            <aside className="w-80 glass-morphism border-r border-[var(--border-color)] flex flex-col p-8 sticky top-0 h-screen z-10">
                <div className="inline-flex items-center gap-2 mb-16 px-2 group cursor-pointer">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                        <img src="/logo.png" alt="SynapseDoc" className="w-10 h-10 object-contain relative drop-shadow-sm transition-transform group-hover:scale-110" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-slate-900 font-display">
                        Synapse<span className="text-indigo-600">Doc</span>
                    </span>
                </div>
                
                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'patients', icon: Users, label: 'My Patients' },
                        { id: 'schedule', icon: Calendar, label: 'My Schedule' },
                        { id: 'telemedicine', icon: Video, label: 'Telemedicine' },
                        { id: 'statistics', icon: BarChart2, label: 'Statistic' },
                        { id: 'settings', icon: Settings, label: 'Settings' },
                    ].map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => setActiveTab(item.id)} 
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-[var(--radius-xl)] transition-all duration-300 font-medium ${
                                activeTab === item.id 
                                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25 translate-x-1' 
                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="pt-6 border-t border-[var(--border-color)]">
                    <button onClick={logout} className="w-full flex items-center gap-4 px-5 py-4 rounded-[var(--radius-xl)] font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group">
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
                        <span className="text-sm tracking-wide">End Session</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-10 xl:p-14 overflow-y-auto w-full relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200/20 blur-[100px] -z-10 rounded-full pointer-events-none"></div>

                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-64">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" placeholder="Search Appointments..." className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[var(--border-color)] bg-white text-sm focus:outline-none focus:border-teal-500 transition-colors shadow-sm" />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors">
                            Appointment History
                        </button>
                        <button className="px-5 py-2.5 bg-teal-600 text-white rounded-full text-sm font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm">
                            <div className="w-4 h-4 flex items-center justify-center bg-white/20 rounded-full">+</div> Add Patients
                        </button>
                        <div className="h-6 w-px bg-slate-200 mx-2"></div>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 rounded-full flex items-center justify-center text-teal-600 hover:bg-teal-50 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900">{userData?.name || 'Dr. Doctor'}</p>
                                <p className="text-xs text-slate-500">Your Profile</p>
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                <img src={`https://ui-avatars.com/api/?name=${userData?.name}&background=0D8B93&color=fff`} alt="Profile" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    <div className="xl:col-span-3 space-y-8">
                          
                          {activeTab === 'overview' && (
                              <>
                                  <div className="bg-gradient-to-r from-teal-50 to-indigo-50 rounded-3xl p-8 flex justify-between items-center relative overflow-hidden">
                                      <div className="z-10">
                                          <h2 className="text-3xl font-serif text-teal-900 mb-2">Good Morning, {userData?.name || 'Dr. Doctor'}</h2>
                                          <p className="text-teal-700/80 font-medium">Have a nice day at work</p>
                                      </div>
                                      <div className="absolute right-0 bottom-0 pointer-events-none opacity-90 h-[120%] flex items-end">
                                          {/* Placeholder for illustration */}
                                          <div className="w-48 h-48 bg-teal-200/40 rounded-full blur-3xl absolute -right-10 -bottom-10"></div>
                                          <div className="w-32 h-32 bg-indigo-200/40 rounded-full blur-2xl absolute right-20 top-0"></div>
                                          <div className="relative flex items-center gap-4 px-12 pb-4">
                                              <div className="w-16 h-32 bg-teal-600/10 rounded-t-full"></div>
                                              <div className="w-20 h-40 bg-indigo-600/10 rounded-t-full"></div>
                                              <div className="w-16 h-32 bg-teal-600/10 rounded-t-full"></div>
                                          </div>
                                      </div>
                                  </div>

                                  <div>
                                      <div className="flex justify-between items-center mb-4">
                                          <h3 className="text-lg font-serif text-slate-800">Weekly Reports</h3>
                                          <button className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1">
                                              Last Week <Calendar className="w-4 h-4" />
                                          </button>
                                      </div>
                                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                          {[
                                              { label: 'Total Patients', value: '265', icon: Users, bg: 'bg-teal-600', text: 'text-white', iconColor: 'text-white', iconBg: 'bg-white/20' },
                                              { label: 'Phone Calls', value: '260', icon: Activity, bg: 'bg-white', text: 'text-slate-900', iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
                                              { label: 'Appointments', value: '128', icon: Calendar, bg: 'bg-white', text: 'text-slate-900', iconColor: 'text-rose-500', iconBg: 'bg-rose-50' },
                                              { label: 'Annual Visits', value: '321', icon: Clock, bg: 'bg-white', text: 'text-slate-900', iconColor: 'text-indigo-500', iconBg: 'bg-indigo-50' },
                                          ].map((s, i) => (
                                              <div key={i} className={`p-4 rounded-2xl ${s.bg} flex flex-col items-center justify-center shadow-sm border border-slate-100/50 hover:-translate-y-1 transition-transform`}>
                                                  <div className={`w-10 h-10 ${s.iconBg} rounded-full flex items-center justify-center mb-3`}>
                                                      <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                                                  </div>
                                                  <div className={`text-xs font-semibold uppercase tracking-wider mb-1 opacity-80 ${s.text}`}>{s.label}</div>
                                                  <div className={`text-2xl font-bold ${s.text}`}>{s.value}</div>
                                              </div>
                                          ))}
                                          <div className="p-4 rounded-2xl bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors">
                                              <div className="w-10 h-10 rounded-full border-2 border-slate-300 flex items-center justify-center text-2xl font-light mb-2">+</div>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="surface-card bg-white overflow-hidden flex flex-col mt-8">
                                      <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-slate-50/30">
                                          <h3 className="text-xl font-serif text-slate-900">Upcoming Appointments</h3>
                                          <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1">
                                              See all
                                          </button>
                                      </div>
                                      <div className="overflow-x-auto">
                                          <table className="w-full text-left border-collapse min-w-[600px]">
                                              <thead>
                                                  <tr className="border-b border-slate-100 bg-slate-50/50 text-xs uppercase tracking-widest text-slate-500">
                                                      <th className="font-medium p-4 pl-6">Name</th>
                                                      <th className="font-medium p-4">Location</th>
                                                      <th className="font-medium p-4">Date</th>
                                                      <th className="font-medium p-4">Time</th>
                                                      <th className="font-medium p-4">Status</th>
                                                      <th className="font-medium p-4 pr-6 text-right">Action</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100">
                                                  {appointments.filter(a => a.status !== 'PENDING').slice(0, 5).map((appt, i) => (
                                                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                          <td className="p-4 pl-6">
                                                              <div className="flex items-center gap-3">
                                                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                                                                      <img src={`https://ui-avatars.com/api/?name=Patient+${appt.patientId}&background=random&color=fff`} alt="Patient" />
                                                                  </div>
                                                                  <span className="font-medium text-slate-900">Patient #{appt.patientId}</span>
                                                              </div>
                                                          </td>
                                                          <td className="p-4 text-sm text-slate-600">{appt.mode === 'TELEMEDICINE' || appt.type === 'TELEMEDICINE' ? 'Online' : 'Clinic'}</td>
                                                          <td className="p-4 text-sm text-slate-600">{appt.date}</td>
                                                          <td className="p-4 text-sm text-slate-600 font-medium">{appt.time}</td>
                                                          <td className="p-4">
                                                              <Badge variant={appt.status === 'CONFIRMED' ? 'success' : appt.status === 'PAID' ? 'primary' : 'warning'}>{appt.status}</Badge>
                                                          </td>
                                                          <td className="p-4 pr-6 text-right">
                                                              {(appt.status === 'CONFIRMED' || appt.status === 'PAID') && (
                                                                  <button 
                                                                      onClick={(e) => { e.stopPropagation(); setActivePostSession(appt); }}
                                                                      className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 transition-colors ml-auto"
                                                                      title="Issue Rx"
                                                                  >
                                                                      <ClipboardList className="w-4 h-4" />
                                                                  </button>
                                                              )}
                                                          </td>
                                                      </tr>
                                                  ))}
                                                  {appointments.filter(a => a.status !== 'PENDING').length === 0 && (
                                                      <tr>
                                                          <td colSpan="6" className="p-8 text-center text-slate-500">
                                                              No upcoming appointments.
                                                          </td>
                                                      </tr>
                                                  )}
                                              </tbody>
                                          </table>
                                      </div>
                                  </div>
                              </>                        )}

                        {activeTab === 'patients' && (
                            <PatientRosterTab 
                                userData={userData}
                                onViewPatient={(appt) => {
                                setSelectedAppointment(appt);
                                setIsDrawerOpen(true);
                            }} />
                        )}

                        {activeTab === 'schedule' && (
                            <ScheduleTab 
                                appointments={appointments} 
                                doctorId={userData?.id}
                                onAppointmentClick={(appt) => {
                                    setSelectedAppointment(appt);
                                    setIsDrawerOpen(true);
                                }}
                            />
                        )}

                        {activeTab === 'telemedicine' && (
                            <TelemedicineTab 
                                appointments={appointments} 
                                userData={userData} 
                                onCompleteSession={(id) => {
                                    setAppointments(prev => prev.filter(a => a.id !== id));
                                }} 
                                onEndSession={(appt, notes) => setActivePostSession({ ...appt, inheritedNotes: notes })} 
                            />
                        )}

                        {activeTab === 'statistics' && (
                            <div className="surface-card bg-white p-12 flex flex-col items-center justify-center min-h-[500px]">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex flex-col items-center justify-center mb-6 border border-slate-100 shadow-sm">
                                    <BarChart2 className="w-10 h-10 text-teal-300" />
                                </div>
                                <h3 className="text-2xl font-serif text-slate-800 mb-2">Practice Statistics</h3>
                                <p className="text-slate-500 font-medium">Detailed patient metrics and income reports will appear here.</p>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="surface-card bg-white p-12 flex flex-col items-center justify-center min-h-[500px]">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex flex-col items-center justify-center mb-6 border border-slate-100 shadow-sm">
                                    <Settings className="w-10 h-10 text-teal-300" />
                                </div>
                                <h3 className="text-2xl font-serif text-slate-800 mb-2">Account Settings</h3>
                                <p className="text-slate-500 font-medium">Manage your profile, integrations, and preferences.</p>
                            </div>
                        )}
                        
                    </div>

                    <div className="space-y-8">
                        {activeTab === 'overview' && (
                            <>
                                <div className="bg-white p-6 rounded-3xl border border-[var(--border-color)]">
                                     <div className="flex justify-between items-center mb-6">
                                         <h4 className="font-serif text-slate-900 text-lg">Schedule Calendar</h4>
                                         <div className="flex gap-2">
                                             <button className="px-3 py-1 text-xs font-semibold text-teal-600 bg-teal-50 rounded-full">Mon</button>
                                             <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 rounded-full">Oct</button>
                                         </div>
                                     </div>
                                     <div className="flex justify-between text-center pb-4">
                                         {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                             <div key={i} className={`flex flex-col items-center gap-2 p-2 rounded-2xl ${i === 3 ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30' : 'text-slate-500'}`}>
                                                 <span className="text-xs">{day}</span>
                                                 <span className={`text-sm font-bold ${i === 3 ? 'text-white' : 'text-slate-900'}`}>{14 + i}</span>
                                             </div>
                                         ))}
                                     </div>
                                     <div className="border-t border-slate-100 pt-4">
                                         <h4 className="font-serif text-slate-900 text-lg mb-4">Monthly Reports</h4>
                                         <div className="grid grid-cols-2 gap-3">
                                             <div className="p-3 bg-teal-50 rounded-2xl border border-teal-100/50 text-center">
                                                 <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                                                     <Users className="w-4 h-4 text-teal-600" />
                                                 </div>
                                                 <div className="text-[10px] font-semibold text-slate-600 uppercase">Consulting</div>
                                                 <div className="text-xs font-bold text-teal-700">120</div>
                                             </div>
                                             <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100/50 text-center">
                                                 <div className="w-8 h-8 mx-auto bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                                                     <Activity className="w-4 h-4 text-indigo-600" />
                                                 </div>
                                                 <div className="text-[10px] font-semibold text-slate-600 uppercase">Physician PA</div>
                                                 <div className="text-xs font-bold text-indigo-700">85</div>
                                             </div>
                                         </div>
                                     </div>
                                </div>

                                <div className="bg-gradient-to-b from-teal-500 to-teal-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-teal-600/20">
                                    <h4 className="font-serif text-lg mb-6">Number of Patients</h4>
                                    <div className="h-40 flex items-end justify-between gap-2 px-2">
                                        {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2">
                                                <div className="flex items-end gap-1 h-28">
                                                    <div className="w-2 bg-teal-300/40 rounded-t-full" style={{ height: `${h}%` }}></div>
                                                    <div className="w-2 bg-white/80 rounded-t-full shadow-sm" style={{ height: `${h * 0.8}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-medium opacity-80">
                                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'patients' && (
                            <div className="surface-card bg-white p-8">
                                <h4 className="text-xl font-serif text-slate-900 mb-4">Patient Roster Insights</h4>
                                <p className="text-slate-500 text-sm">Dynamic analytics for your patient base in this panel.</p>
                                <ul className="mt-4 text-sm text-slate-500 space-y-2">
                                    <li>• Active cases: {appointments.filter(a => a.status !== 'CANCELLED').length}</li>
                                    <li>• High-risk referrals: 5</li>
                                    <li>• Pending lab review: 2</li>
                                </ul>
                            </div>
                        )}

                        {activeTab === 'schedule' && (() => {
                            const upcomingAppts = appointments
                                .filter(a => {
                                    if (!a.date) return false;
                                    const d = new Date(a.date);
                                    return isToday(d) || isTomorrow(d);
                                })
                                .sort((a, b) => {
                                    const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
                                    const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
                                    return compareAsc(dateA, dateB);
                                });

                            return (
                                <div className="surface-card bg-white p-8">
                                    <h4 className="text-xl font-serif text-slate-900 mb-4">Schedule Summary</h4>
                                    <p className="text-slate-500 text-sm">Upcoming appointments for today and tomorrow.</p>
                                    <div className="mt-4 space-y-3">
                                        {upcomingAppts.length > 0 ? (
                                            upcomingAppts.map((appt, i) => (
                                                <div key={i} className="flex flex-col p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm font-semibold text-slate-700">Patient #{appt.patientId}</span>
                                                        <Badge variant={appt.status === 'CONFIRMED' ? 'success' : appt.status === 'PAID' ? 'primary' : 'warning'}>
                                                            {appt.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                                        <div className="flex gap-2">
                                                            <span className="font-medium text-slate-600">{isToday(new Date(appt.date)) ? 'Today' : 'Tomorrow'}</span>
                                                            <span>•</span>
                                                            <span>{appt.time}</span>
                                                        </div>
                                                        <span className="font-medium flex items-center gap-1">
                                                            {appt.mode === 'TELEMEDICINE' || appt.type === 'TELEMEDICINE' ? (
                                                                <><Video className="w-3 h-3 text-indigo-500" /> Video</>
                                                            ) : (
                                                                <><Users className="w-3 h-3 text-emerald-500" /> Clinic</>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-slate-500 text-sm">
                                                No appointments scheduled for today or tomorrow.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}

                        {activeTab === 'telemedicine' && (
                            <div className="surface-card bg-white p-8">
                                <h4 className="text-xl font-serif text-slate-900 mb-4">Telemedicine Panel</h4>
                                <p className="text-slate-500 text-sm">This area shows active remote consultation tokens and immediate post-session Rx handoff.</p>
                                <div className="mt-4 space-y-3">
                                    {appointments.filter(a => a.mode === 'TELEMEDICINE' || a.type === 'TELEMEDICINE').slice(0, 4).map((appt, i) => (
                                        <div key={i} className="p-3 rounded-lg border border-slate-100">
                                            <div className="text-sm font-medium text-slate-700">Patient #{appt.patientId}</div>
                                            <div className="text-xs text-slate-500">{appt.date} • {appt.time}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'statistics' && (
                            <div className="surface-card bg-white p-8">
                                <h4 className="text-xl font-serif text-slate-900 mb-4">Quick Insights</h4>
                                <p className="text-slate-500 text-sm">Key performance indicators and analytics.</p>
                                <div className="mt-6 flex flex-col gap-3">
                                    <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 flex items-center justify-between">
                                        <div className="text-sm font-bold text-teal-800">Total Consultations</div>
                                        <div className="text-lg font-serif text-teal-900">{appointments.length}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="surface-card bg-white p-8">
                                <h4 className="text-xl font-serif text-slate-900 mb-4">Quick Preferences</h4>
                                <p className="text-slate-500 text-sm">Adjust notifications and display themes.</p>
                                <div className="mt-6 space-y-4">
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" className="w-4 h-4 text-teal-600 rounded" defaultChecked />
                                        <span className="text-sm font-medium text-slate-700">Email Notifications</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" className="w-4 h-4 text-teal-600 rounded" defaultChecked />
                                        <span className="text-sm font-medium text-slate-700">SMS Alerts</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <PatientContextDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} appointment={selectedAppointment} />
                <AnimatePresence>
                    {activePostSession && (
                        <SessionPrescriptionModal 
                            session={activePostSession} 
                            onClose={() => setActivePostSession(null)} 
                            doctorId={userData?.id} 
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default DoctorDashboard;













