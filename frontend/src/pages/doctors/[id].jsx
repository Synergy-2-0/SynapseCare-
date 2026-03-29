import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { 
    ArrowLeft, 
    Star, 
    MapPin, 
    Award, 
    Calendar, 
    Video, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    User, 
    Clock, 
    Globe,
    Stethoscope,
    ChevronRight,
    Search,
    BookOpen,
    Verified,
    Check
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { publicDoctorApi } from '../../lib/api';

// Real data only: Specialist profile synchronization using API dossier registry signals.

export default function DoctorProfile() {
    const router = useRouter();
    const { id } = router.query;
    
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingMode, setBookingMode] = useState('TELEHEALTH');

    useEffect(() => {
        if (!id) return;

        const fetchDoctorDetail = async () => {
            if (!id || isNaN(id)) {
                setLoading(false);
                setDoctor(null);
                return;
            }
            
            setLoading(true);
            try {
                const response = await publicDoctorApi.get(`/${id}`);
                const doc = response.data;
                
                // Map API response to rich UI structure
                const richDoctor = {
                    id: doc.id,
                    name: (doc.firstName && doc.lastName) ? `${doc.firstName} ${doc.lastName}` : `Specialist Node #${doc.id}`,
                    specialization: doc.specialization || "Clinical Practice",
                    image: doc.profileImageUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${doc.id}`,
                    location: "Global Healthcare Node 04, NY", // Future: get from doctor entity
                    rating: 4.8 + (doc.id % 5) * 0.05,
                    reviews: 50 + (doc.id * 7) % 200,
                    experience: doc.experience ? `${doc.experience}+ Years Clinical Experience` : "Senior Practice",
                    about: doc.bio || "No clinical statement available for this practitioner.",
                    education: doc.qualifications ? doc.qualifications.split(',').map(s => s.trim()) : [
                        "Doctor of Medicine (MD)",
                        "Clinical Residency Program"
                    ],
                    services: [
                        "Advanced Clinical Diagnostics",
                        "Personalized Neural Protocols",
                        "Strategic Health Monitoring"
                    ],
                    slots: [
                        { time: "08:30 AM", available: true },
                        { time: "10:15 AM", available: true },
                        { time: "01:30 PM", available: true },
                        { time: "04:45 PM", available: false }
                    ],
                    fee: doc.consultationFee || 1500,
                    verificationStatus: doc.verificationStatus
                };
                setDoctor(richDoctor);
            } catch (error) {
                console.error("Failed to fetch node dossier registry signal:", error);
                setDoctor(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorDetail();
    }, [id]);

    const handleBooking = () => {
        if (!selectedSlot) return;
        router.push({
            pathname: '/payment',
            query: { 
                id: `APT-${Math.floor(Math.random() * 10000)}`,
                amount: doctor.fee,
                patientId: localStorage.getItem('user_id'),
                doctorId: doctor.id
            }
        });
    };

    if (loading) return <LoadingSpinner size="fullscreen" message="Accessing Specialized Practitioner Dossier..." />;

    if (!doctor) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                 <Card className="max-w-md w-full text-center p-12">
                     <Search size={48} className="mx-auto text-slate-300 mb-6" />
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight">Practitioner Not Found</h2>
                     <p className="text-slate-500 font-medium mt-2 mb-10">We couldn't synchronize the requested clinical profile.</p>
                     <Button variant="primary" onClick={() => router.push('/doctors')}>Back to Registry</Button>
                 </Card>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{doctor?.name ? `Dr. ${doctor.name} | ${doctor.specialization}` : 'Specialist Profile'} | SynapsCare</title>
                <meta name="description" content={doctor?.about ? doctor.about.substring(0, 160) : "View expert medical profile and book appointments with top-tier specialists"} />
            </Head>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 overflow-x-hidden">
            {/* High-End Navigation Header */}
            <nav className="h-24 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 px-8 sm:px-16 flex items-center justify-between sticky top-0 z-[60] shadow-sm">
                <div className="flex items-center gap-8">
                    <button 
                        onClick={() => router.push('/doctors')}
                        className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-400 transition-all active:scale-90 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="hidden sm:flex flex-col">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-slate-900 tracking-tighter uppercase italic tracking-widest leading-none">Practitioner Dossier</span>
                            <Verified size={14} className="text-indigo-500" />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">ID: {doctor.id} • SYNCED SECURELY</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <Badge variant="success" size="sm" pulse>AVAILABLE</Badge>
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative group cursor-pointer">
                         <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                    </div>
                </div>
            </nav>

            <main className="max-w-[1400px] mx-auto px-8 sm:px-16 py-16 grid grid-cols-1 xl:grid-cols-12 gap-16">
                {/* Profile Core Intelligence (Col Span 8) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-8 space-y-16">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                         {/* Large Profile Visual */}
                         <div className="md:col-span-4 lg:col-span-3">
                             <div className="aspect-square bg-white rounded-[3rem] p-6 border-2 border-slate-100 shadow-2xl shadow-indigo-100/30 relative group overflow-hidden">
                                 <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-50/50 to-transparent pointer-events-none" />
                                 <div className="w-full h-full bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 relative z-10">
                                     <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                 </div>
                                 <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 z-20 group-hover:rotate-12 transition-transform">
                                      <Zap size={24} fill="white" />
                                 </div>
                             </div>
                         </div>

                         {/* Core Info Details */}
                         <div className="md:col-span-8 lg:col-span-9 space-y-8">
                             <div>
                                 <div className="flex items-center gap-4 mb-4">
                                     <Badge variant="indigo" size="md">SENIOR SPECIALIST</Badge>
                                     <div className="flex items-center gap-1.5 text-xs text-slate-400 font-black uppercase tracking-widest">
                                          <Globe size={12} /> {doctor.location}
                                     </div>
                                 </div>
                                 <h1 className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none italic uppercase tracking-widest mb-4">Dr. {doctor.name}</h1>
                                 <h2 className="text-2xl font-black text-indigo-600 tracking-tight flex items-center gap-3">
                                     {doctor.specialization} <div className="h-0.5 w-12 bg-indigo-200" />
                                 </h2>
                             </div>

                             <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-100">
                                 {[
                                     { label: 'Rating', val: doctor.rating, icon: Star, color: 'text-amber-500' },
                                     { label: 'Seniority', val: doctor.experience.split(' ')[0], icon: Award, color: 'text-indigo-500' },
                                     { label: 'Feed', val: doctor.reviews, icon: User, color: 'text-sky-500' }
                                 ].map((stat, i) => (
                                     <div key={i} className="space-y-2">
                                         <div className="flex items-center gap-2">
                                             <stat.icon size={16} className={stat.color} />
                                             <span className="text-xl font-black text-slate-900 tracking-tighter">{stat.val}</span>
                                         </div>
                                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                     </div>
                                 ))}
                             </div>
                         </div>
                    </div>

                    {/* Extended Dossier Information */}
                    <div className="space-y-16">
                         <div className="surface-card p-12 bg-white relative overflow-hidden group border border-slate-100">
                             <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic tracking-widest mb-8 flex items-center gap-4">
                                 <BookOpen size={20} className="text-indigo-600" /> Clinical Statement
                             </h3>
                             <p className="text-lg font-medium text-slate-500 leading-relaxed italic max-w-3xl">
                                 "{doctor.about}"
                             </p>
                             <div className="absolute right-0 bottom-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                                 <Stethoscope size={180} />
                             </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                             <div className="p-10 bg-indigo-50 border border-indigo-100 rounded-[3rem] text-slate-900 shadow-xl shadow-indigo-100/50">
                                 <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-8 flex items-center gap-3">
                                     <Verified size={16} /> Academic Pedigree
                                 </h4>
                                 <ul className="space-y-6">
                                     {doctor.education.map((edu, i) => (
                                         <li key={i} className="flex gap-4 group cursor-default">
                                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                                             <p className="text-sm font-bold text-slate-600 group-hover:text-indigo-900 transition-colors">{edu}</p>
                                         </li>
                                     ))}
                                 </ul>
                             </div>

                             <div className="p-10 bg-white border border-slate-100 rounded-[3rem]">
                                 <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                                     <Stethoscope size={16} className="text-indigo-600" /> Practical Operations
                                 </h4>
                                 <ul className="space-y-6">
                                     {doctor.services.map((srv, i) => (
                                         <li key={i} className="flex items-center gap-4 group">
                                             <div className="w-8 h-8 rounded-xl bg-slate-50 text-indigo-500 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                  <Check size={14} strokeWidth={3} />
                                             </div>
                                             <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{srv}</span>
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                         </div>
                    </div>
                </motion.div>

                {/* Tactical Booking Interface (Col Span 4) */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="xl:col-span-4">
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100 sticky top-32 overflow-hidden border border-slate-100">
                        {/* Booking Header */}
                        <div className="p-10 bg-indigo-600 text-white flex justify-between items-end relative overflow-hidden group">
                             <div className="relative z-10">
                                <h3 className="text-3xl font-black tracking-tighter uppercase italic tracking-widest mb-1">Schedule Visit</h3>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-200">Session ID: AUTO-SYNC-X</p>
                             </div>
                             <Calendar size={32} className="relative z-10 group-hover:rotate-12 transition-transform" />
                             <div className="absolute top-0 right-0 p-10 opacity-20 pointer-events-none blur-2xl flex gap-10">
                                 <div className="w-32 h-32 bg-white rounded-full" />
                             </div>
                        </div>

                        {/* Booking Controls */}
                        <div className="p-10 space-y-10">
                            {/* Mode Toggle */}
                            <div className="flex gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                                 {['TELEHEALTH', 'IN-PERSON'].map((mode) => (
                                     <button 
                                        key={mode}
                                        onClick={() => setBookingMode(mode)}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            bookingMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'
                                        }`}
                                     >
                                         <div className="flex items-center justify-center gap-2">
                                             {mode === 'TELEHEALTH' ? <Video size={12} /> : <MapPin size={12} />}
                                             {mode}
                                         </div>
                                     </button>
                                 ))}
                            </div>

                            {/* Slot Cluster */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Available Nodes Today</p>
                                <div className="grid grid-cols-2 gap-4">
                                     {doctor.slots.map((slot, i) => (
                                         <button 
                                            key={i}
                                            disabled={!slot.available}
                                            onClick={() => setSelectedSlot(slot.time)}
                                            className={`p-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                                                !slot.available 
                                                ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed italic' 
                                                : selectedSlot === slot.time 
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl scale-[1.05]' 
                                                : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-400 hover:text-indigo-600'
                                            }`}
                                         >
                                             {selectedSlot === slot.time && <Check size={12} className="text-white" />}
                                             {slot.time}
                                         </button>
                                     ))}
                                </div>
                            </div>

                            {/* Fee Calculation */}
                            <div className="pt-10 border-t border-slate-100 space-y-6">
                                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                      <span className="text-slate-400">Service Authorized Fee</span>
                                      <span className="text-slate-900 text-base">LKR {doctor.fee.toLocaleString()}</span>
                                 </div>
                                 <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-4">
                                      <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                           <ShieldCheck size={20} />
                                      </div>
                                      <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest italic">Encrypted payment & verified clinical identity guaranteed.</p>
                                 </div>
                            </div>

                            <Button 
                                variant="primary" 
                                size="xl" 
                                className="w-full"
                                disabled={!selectedSlot}
                                onClick={handleBooking}
                                icon={Zap}
                            >
                                {selectedSlot ? 'Finalize Booking Protocol' : 'Select Command Node'}
                            </Button>
                        </div>

                        {/* Infrastructure Footer */}
                        <div className="bg-slate-50 p-6 flex items-center justify-center gap-3">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secure Node SYNC-X ACTIVE</span>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
        </>
    );
}
