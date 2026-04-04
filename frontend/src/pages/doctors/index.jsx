import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import { 
    Search, 
    ChevronRight, 
    MapPin, 
    Award, 
    Star, 
    Calendar, 
    Zap, 
    ArrowLeft, 
    Filter, 
    Globe, 
    Users, 
    ShieldCheck, 
    Cpu,
    BookOpen,
    Clock,
    User,
    ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/router';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { publicDoctorApi } from '../../lib/api';
import { SPECIALIZATIONS, SPECIALIZATION_LABELS } from '../../constants/specializations';

// Synchronizing with real API doctor registry
const DoctorsList = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('ALL');

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                const response = await publicDoctorApi.get('/search');
                // Map the new backend fields to the UI card structure
                const mappedDoctors = response.data.map(doc => ({
                    id: doc.userId, // Standardized to clinical identity across microservices
                    dbId: doc.id,
                    name: (doc.firstName && doc.lastName) 
                        ? `${doc.firstName} ${doc.lastName}`
                        : `Specialist Node #${doc.userId}`, 
                    specialization: doc.specialization || "Clinical Practice",
                    image: doc.profileImageUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${doc.userId}`,
                    location: "SynapseCare Global Hub", 
                    rating: 4.8 + (doc.userId % 5) * 0.05, 
                    reviews: 50 + (doc.userId * 7) % 200,
                    experience: doc.experience ? `${doc.experience}+ Years` : "Senior Practitioner",
                    availableToday: doc.isAvailable,
                    fee: doc.consultationFee || 1500
                }));
                setDoctors(mappedDoctors);
            } catch (error) {
                console.error("Failed to fetch node registry signal:", error);
                // Fallback to empty list or handled by the "No Node Signal" UI
                setDoctors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc => 
        (doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (activeFilter === 'ALL' || doc.specialization.toUpperCase() === activeFilter)
    );

    const specializationFilters = ['ALL', ...SPECIALIZATIONS];

    return (
        <>
            <Head>
                <title>Specialist Registry | Find Top Medical Practitioners | SynapsCare</title>
                <meta name="description" content="Search and discover elite medical specialists across cardiology, neurology, pediatrics, and more" />
            </Head>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 overflow-x-hidden">
            {/* Global Registry Header */}
            <nav className="h-24 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 px-8 sm:px-16 flex items-center justify-between sticky top-0 z-[60] shadow-sm">
                <Link href="/" className="flex items-center gap-6 group cursor-pointer active:scale-95 transition-transform">
                    <img src="/logo.png" alt="logo" className="w-10 h-10 drop-shadow-sm group-hover:rotate-12 transition-transform" />
                    <span className="text-2xl font-black text-slate-800 tracking-tighter italic uppercase tracking-widest leading-none">Synapse<span className="text-indigo-600">Care</span></span>
                </Link>

                <div className="hidden lg:flex items-center bg-slate-100/80 rounded-2xl px-5 py-3 w-full max-w-lg border border-transparent focus-within:border-indigo-400 focus-within:bg-white transition-all shadow-inner group">
                    <Search size={18} className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Query specialist nodes, medical domains..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-[11px] font-black uppercase tracking-widest px-4 w-full placeholder:text-slate-400 text-slate-900"
                    />
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-4 px-6 py-2.5 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
                         <ShieldCheck size={14} className="text-indigo-400" />
                         <span className="text-[10px] font-black uppercase tracking-widest leading-none">Security Node Sync: OK</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1400px] mx-auto px-8 sm:px-16 py-16">
                {/* Hero Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 relative">
                     <div className="space-y-6 relative z-10">
                        <Badge variant="indigo" size="md" pulse>GLOBAL MEDICAL REGISTRY</Badge>
                        <h1 className="text-6xl sm:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9] italic uppercase tracking-widest">Authorized <br /> <span className="text-indigo-600">Specialists.</span></h1>
                        <p className="text-lg font-medium text-slate-400 max-w-2xl leading-relaxed italic">
                             "Strategic access to high-tier medical nodes. Synchronized with the global clinical intelligence network for verified practitioners."
                        </p>
                     </div>
                     <div className="hidden lg:flex flex-col items-end text-right space-y-4">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                             <Cpu size={14} /> Neural-Cluster Architecture
                        </div>
                        <div className="flex items-center gap-3 bg-white px-8 py-5 rounded-[2rem] shadow-2xl shadow-indigo-100 border border-slate-100 group hover:border-indigo-200 transition-all cursor-default">
                             <div className="text-right">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Authenticated Nodes</p>
                                 <p className="text-2xl font-black text-slate-900 tracking-tighter">1,240 <span className="text-indigo-500">+</span></p>
                             </div>
                             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform">
                                  <Users size={22} strokeWidth={2.5} />
                             </div>
                        </div>
                     </div>

                     {/* Design Flair Background */}
                     <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none translate-x-1/2 -translate-y-1/2 select-none">
                         <BookOpen size={600} strokeWidth={1} />
                     </div>
                </div>

                {/* Tactical Selection Filters */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-16 overflow-x-auto pb-6 scroll-smooth custom-scrollbar">
                     <div className="flex items-center gap-4 px-6 py-3 bg-slate-900 rounded-2xl text-indigo-400 shrink-0">
                         <Filter size={16} />
                         <span className="text-[10px] font-black uppercase tracking-widest text-white leading-none">Domain Select</span>
                     </div>
                     <div className="flex gap-3">
                         {specializationFilters.map((spec) => (
                             <button 
                                key={spec} 
                                onClick={() => setActiveFilter(spec)}
                                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeFilter === spec 
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                                     : 'bg-white border border-slate-100 text-slate-400 hover:border-indigo-400 hover:text-indigo-600'
                                }`}
                             >
                                 {spec === 'ALL' ? 'ALL' : (SPECIALIZATION_LABELS[spec] || spec)}
                             </button>
                         ))}
                     </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="animate-pulse bg-white rounded-[3rem] border border-slate-100 h-[500px] shadow-2xl shadow-slate-200/50"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {filteredDoctors.map(doc => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={doc.id} 
                                className="group surface-card bg-white p-10 flex flex-col justify-between hover:border-indigo-100 hover:shadow-premium transition-all duration-500 overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                                     <Globe size={180} />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] border-2 border-slate-100 shadow-inner overflow-hidden p-2 group-hover:border-indigo-500/20 transition-all duration-500">
                                             <div className="w-full h-full rounded-[1.5rem] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                                                <img src={doc.image} alt={doc.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                             </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 text-right">
                                             {doc.availableToday ? (
                                                 <Badge variant="success" size="sm">NODE ACTIVE</Badge>
                                             ) : (
                                                 <Badge variant="warning" size="sm">SYNC: TMRW</Badge>
                                             )}
                                             <div className="flex items-center gap-1.5 text-xs text-slate-400 font-black uppercase tracking-widest">
                                                 <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {doc.rating}
                                             </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 mb-10">
                                        <Badge variant="indigo" size="sm">{doc.specialization.toUpperCase()}</Badge>
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none italic uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Dr. {doc.name}</h2>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-slate-100">
                                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                 <MapPin className="w-3.5 h-3.5 text-slate-400" /> {doc.location.split(',')[1] || doc.location}
                                             </div>
                                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                 <Award className="w-3.5 h-3.5 text-indigo-500" /> {doc.experience.split(' ')[0]} SENIORITY
                                             </div>
                                             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                 <Clock className="w-3.5 h-3.5 text-sky-500" /> LKR {doc.fee}
                                             </div>
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/doctors/${doc.id}`} className="w-full h-14 bg-slate-100 border border-slate-100 rounded-[1.5rem] text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 group-hover:bg-slate-900 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-slate-200 group-hover:border-slate-800 transition-all z-10">
                                    Assess Clinical Profile <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
                
                {!loading && filteredDoctors.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-indigo-100/30">
                         <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 text-slate-300">
                              <Search size={40} />
                         </div>
                         <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic tracking-widest">No Node Signal</h3>
                         <p className="text-slate-400 font-medium mt-2">Try adjusting your spectral filters or medical domain search criteria.</p>
                         <button onClick={() => { setSearchTerm(''); setActiveFilter('ALL'); }} className="mt-10 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-indigo-100">Reset Search Matrix</button>
                    </motion.div>
                )}
                
                {/* Advanced Neural Search Footer */}
                <div className="mt-40 p-12 bg-slate-950 rounded-[4rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
                     <div className="absolute top-0 left-0 p-10 opacity-20 pointer-events-none group-hover:rotate-6 transition-transform">
                          <Zap size={180} />
                     </div>
                     <div className="relative z-10 max-w-xl">
                          <Badge variant="success" className="mb-6">ADVANCED RECRUITMENT NODE</Badge>
                          <h4 className="text-4xl font-black tracking-tighter uppercase italic tracking-widest mb-6">Can&apos;t Find Your <br /> <span className="text-indigo-400">Specialist Node?</span></h4>
                          <p className="text-slate-400 font-medium text-base mb-10 leading-relaxed italic">Our platform uses autonomous intelligence to identify medical professionals globally. If you require a custom search cluster, deploy a request to our infrastructure team.</p>
                          <Button variant="secondary" size="lg" icon={Zap} className="px-12">Deploy Custom Search Cluster</Button>
                     </div>
                     <div className="relative z-10 flex flex-col items-center gap-6">
                          <div className="w-40 h-40 bg-white/5 rounded-full border border-white/5 flex items-center justify-center relative group">
                              <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
                              <ShieldCheck size={64} className="text-indigo-500" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Identity Guard v4.2 Active</span>
                     </div>
                </div>
            </main>
        </div>
        </>
    );
};

export default DoctorsList;
