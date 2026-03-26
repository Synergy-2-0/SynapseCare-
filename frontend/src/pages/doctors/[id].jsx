import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Award, Calendar, Video, CheckCircle2 } from 'lucide-react';

const MOCK_DOCTOR = {
    id: 1,
    name: "Dr. Elena Rodriguez",
    specialty: "Cardiology",
    image: "https://api.dicebear.com/7.x/notionists/svg?seed=Elena",
    location: "New York Medical Center",
    rating: 4.9,
    reviews: 124,
    experience: "15+ Years",
    about: "Dr. Rodriguez is an interventional cardiologist specializing in complex coronary interventions. With over 15 years of clinical experience across top-tier global institutions, she leads the cardiovascular research department at SynapseCare.",
    education: [
        "MD, Harvard Medical School",
        "Residency, Johns Hopkins Hospital",
        "Fellowship in Cardiology, Mayo Clinic"
    ],
    services: [
        "Echocardiogram",
        "Heart Risk Assessment",
        "Arrhythmia Treatment",
        "Post-Surgery Checkup"
    ],
    slots: [
        { time: "09:00 AM", available: true },
        { time: "10:30 AM", available: false },
        { time: "11:00 AM", available: true },
        { time: "02:00 PM", available: true },
        { time: "03:30 PM", available: true },
        { time: "04:00 PM", available: false }
    ]
};

export default function DoctorProfile() {
    const router = useRouter();
    const { id } = router.query;
    
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setTimeout(() => {
            setDoctor({ ...MOCK_DOCTOR, id: id });
            setLoading(false);
        }, 600);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-lg text-slate-400 animate-pulse">
                Loading Profile...
            </div>
        );
    }

    if (!doctor) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Doctor not found</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-100 pb-32">
            {/* Header */}
            <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-6 sm:px-12 py-4 flex flex-wrap items-center gap-6 shadow-sm sticky top-0 z-50">
                <Link href="/doctors" className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors border border-slate-200">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-50 rounded-lg overflow-hidden border border-teal-100">
                         <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-bold text-slate-800 tracking-tight">{doctor.name}</div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-6 sm:px-12 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
                {/* Left Col - Info */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col md:flex-row gap-10 items-start">
                        <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-teal-50 rounded-3xl border border-teal-100 shadow-sm overflow-hidden p-2">
                            <div className="w-full h-full rounded-2xl overflow-hidden">
                                <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="inline-flex px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-full">
                                Accepting Patients
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight leading-tight">{doctor.name}</h1>
                            <h2 className="text-lg text-teal-600 font-semibold">{doctor.specialty}</h2>
                            
                            <div className="flex flex-wrap gap-x-8 gap-y-4 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-2 font-medium text-slate-500 text-sm">
                                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> {doctor.rating} ({doctor.reviews})
                                </div>
                                <div className="flex items-center gap-2 font-medium text-slate-500 text-sm">
                                    <Award className="w-5 h-5 text-teal-500" /> {doctor.experience}
                                </div>
                                <div className="flex items-center gap-2 font-medium text-slate-500 text-sm">
                                    <MapPin className="w-5 h-5 text-slate-400" /> {doctor.location}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">About the Doctor</h3>
                        <p className="text-slate-500 font-medium leading-relaxed text-base">{doctor.about}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-6">Education & Training</h4>
                            <ul className="space-y-4">
                                {doctor.education.map((edu, idx) => (
                                    <li key={idx} className="flex gap-3 font-medium text-sm text-slate-500">
                                        <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" /> {edu}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-6">Clinical Services</h4>
                            <ul className="space-y-4">
                                {doctor.services.map((srv, idx) => (
                                    <li key={idx} className="flex gap-3 font-medium text-sm text-slate-500">
                                        <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" /> {srv}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Right Col - Booking Widget */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
                    <div className="bg-white rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.05)] border border-slate-100 sticky top-32 overflow-hidden flex flex-col h-auto">
                        <div className="p-8 pb-6 border-b border-slate-100">
                            <h3 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-teal-500" /> Book Visit
                            </h3>
                            <p className="font-medium text-slate-500 mt-2 text-sm">Select an available time slot below.</p>
                        </div>
                        
                        <div className="p-8 space-y-8 bg-slate-50/50">
                            <div className="grid grid-cols-2 gap-3">
                                {doctor.slots.map((slot, idx) => (
                                    <button 
                                        key={idx}
                                        disabled={!slot.available}
                                        onClick={() => setSelectedSlot(slot.time)}
                                        className={`py-3.5 rounded-xl font-bold text-sm transition-all border ${
                                            !slot.available 
                                                ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-60' 
                                                : selectedSlot === slot.time 
                                                    ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20 scale-[1.02]' 
                                                    : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50'
                                        }`}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-200 space-y-4">
                                <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                                    <span className="flex items-center gap-2"><Video className="w-4 h-4 text-blue-500"/> Telehealth</span>
                                    <span>$150 USD</span>
                                </div>
                                <div className="flex items-center justify-between text-sm font-bold text-slate-600">
                                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500"/> In-Person</span>
                                    <span>$200 USD</span>
                                </div>
                            </div>

                            <button 
                                className={`w-full py-4 rounded-xl text-white font-bold transition-all shadow-lg ${
                                    selectedSlot ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 hover:-translate-y-0.5' : 'bg-slate-300 cursor-not-allowed shadow-none'
                                }`}
                                disabled={!selectedSlot}
                            >
                                {selectedSlot ? 'Confirm Appointment' : 'Select a Time'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
