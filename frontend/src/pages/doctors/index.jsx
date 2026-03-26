import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, ChevronRight, MapPin, Award, Star, Calendar } from 'lucide-react';

const MOCK_DOCTORS = [
    {
        id: 1,
        name: "Dr. Elena Rodriguez",
        specialty: "Cardiology",
        image: "https://api.dicebear.com/7.x/notionists/svg?seed=Elena",
        location: "New York Medical Center",
        rating: 4.9,
        reviews: 124,
        experience: "15+ Years",
        availableToday: true
    },
    {
        id: 2,
        name: "Dr. James Wilson",
        specialty: "Neurology",
        image: "https://api.dicebear.com/7.x/notionists/svg?seed=James",
        location: "Synapse Care Hub, Boston",
        rating: 4.8,
        reviews: 98,
        experience: "12+ Years",
        availableToday: false
    },
    {
        id: 3,
        name: "Dr. Sarah Chen",
        specialty: "Pediatrics",
        image: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah",
        location: "Children's Health Clinic",
        rating: 5.0,
        reviews: 312,
        experience: "8+ Years",
        availableToday: true
    },
    {
        id: 4,
        name: "Dr. Michael Chang",
        specialty: "Dermatology",
        image: "https://api.dicebear.com/7.x/notionists/svg?seed=Michael",
        location: "Skin Care Institute",
        rating: 4.7,
        reviews: 156,
        experience: "10+ Years",
        availableToday: true
    }
];

export default function DoctorsList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                setTimeout(() => {
                    setDoctors(MOCK_DOCTORS);
                    setLoading(false);
                }, 800);
            } catch (err) {
                setDoctors(MOCK_DOCTORS);
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100">
            {/* Header */}
            <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 sm:px-12 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-4 cursor-pointer">
                    <img src="/logo.png" alt="logo" className="w-10 h-10 object-contain drop-shadow-sm" />
                    <span className="text-2xl font-black text-slate-800 tracking-tight">SynapseCare</span>
                </Link>
                <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-slate-100/50 hover:bg-slate-100 transition-colors rounded-full border border-slate-200">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search doctors, specialties..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm font-medium w-64 text-slate-800 placeholder:text-slate-400"
                    />
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-800 mb-4">Our <span className="text-teal-600">Specialists</span></h1>
                    <p className="text-lg font-medium text-slate-500 max-w-2xl">
                        Connect with top-tier medical professionals. Filtered for excellence and ready to assist you safely.
                    </p>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-sm mb-8">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent border-none outline-none text-base font-medium w-full text-slate-800"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="animate-pulse bg-white rounded-[2rem] border border-slate-100 h-80 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredDoctors.map(doc => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={doc.id} 
                                className="bg-white rounded-[2rem] p-8 flex flex-col justify-between border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all group"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-20 h-20 bg-teal-50 rounded-2xl border border-teal-100 shadow-sm overflow-hidden">
                                            <img src={doc.image} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        </div>
                                        {doc.availableToday ? (
                                            <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-full">Available Today</span>
                                        ) : (
                                            <span className="px-3 py-1 bg-slate-50 border border-slate-100 text-slate-500 text-xs font-bold rounded-full">Next Avail: tmrw</span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">{doc.name}</h2>
                                    <h3 className="text-teal-600 font-semibold text-sm mb-6 mt-1">{doc.specialty}</h3>
                                    
                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                                            <MapPin className="w-4 h-4 text-slate-400" /> {doc.location}
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                                            <Award className="w-4 h-4 text-teal-500" /> {doc.experience} Experience
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {doc.rating} ({doc.reviews} reviews)
                                        </div>
                                    </div>
                                </div>
                                <Link href={`/doctors/${doc.id}`} className="w-full py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-colors">
                                    View Profile <ChevronRight className="w-4 h-4"/>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
                {!loading && filteredDoctors.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <p className="text-lg font-medium text-slate-400">No specialists found.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
