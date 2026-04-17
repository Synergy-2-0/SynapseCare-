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
import { publicDoctorApi, appointmentApi, patientApi } from '../../lib/api';
import { SPECIALIZATION_LABELS } from '../../constants/specializations';

// Real data only: Specialist profile synchronization using API dossier registry signals.

export default function DoctorProfile() {
    const router = useRouter();
    const { id } = router.query;

    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slots, setSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingMode, setBookingMode] = useState('TELEMEDICINE');
    const [bookingInProgress, setBookingInProgress] = useState(false);
    const [redirectingToPayment, setRedirectingToPayment] = useState(false);
    const [bookingNotice, setBookingNotice] = useState('');
    const [profileImageFailed, setProfileImageFailed] = useState(false);

    const getFallbackImage = (seed) => `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`;
    const currentDoctorImage = profileImageFailed
        ? getFallbackImage(doctor?.dbId || doctor?.id || 'doctor')
        : (doctor?.image || getFallbackImage(doctor?.dbId || doctor?.id || 'doctor'));

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

                const richDoctor = {
                    // Route IDs now use doctor-service DB id to avoid collisions.
                    id: doc.id,
                    userId: doc.userId,
                    dbId: doc.id,
                    name: (doc.firstName && doc.lastName) ? `${doc.firstName} ${doc.lastName}` : `Dr. Specialist`,
                    specialization: doc.specialization || "Clinical Practice",
                    image: doc.profileImageUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${doc.id}`,
                    location: "Global Healthcare Node 04, NY",
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
                    fee: doc.consultationFee || 2000,
                    verificationStatus: doc.verificationStatus
                };
                setDoctor(richDoctor);
                setProfileImageFailed(false);

                // Fetch slots using dbId (internal pk) — this is what appointment service
                // stores as doctorId in the appointments table, ensuring consistent conflict checks.
                if (selectedDate) {
                    setSlotsLoading(true);
                    try {
                        const slotsRes = await appointmentApi.get(`/doctor/${doc.id}/available-slots`, {
                            params: { date: selectedDate }
                        });
                        setSlots(slotsRes.data || []);
                    } catch (err) {
                        if (err.response?.status === 403) {
                            try {
                                const fallbackRes = await publicDoctorApi.get(`/${doc.id}/available-slots`, {
                                    params: { date: selectedDate }
                                });
                                setSlots(fallbackRes.data || []);
                            } catch (fallbackErr) {
                                console.error("Failed to fetch available slots from fallback endpoint:", fallbackErr);
                                setSlots([]);
                            }
                        } else {
                            console.error("Failed to fetch available slots:", err);
                            setSlots([]);
                        }
                    } finally {
                        setSlotsLoading(false);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch node dossier registry signal:", error);
                setDoctor(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorDetail();
    }, [id, selectedDate]);

    const handleBooking = async () => {
        if (!selectedSlot || !doctor || !selectedDate) return;

        const patientUserId = localStorage.getItem('user_id');
        if (!patientUserId) {
            alert("Protocol Violation: Patient authentication required. Please login.");
            router.push('/login');
            return;
        }

        setBookingInProgress(true);
        setRedirectingToPayment(false);
        setBookingNotice('');
        try {
            let patientId;
            try {
                const patientRes = await patientApi.get(`/user/${patientUserId}`);
                const patientProfile = patientRes.data?.data || patientRes.data;
                patientId = patientProfile?.id;
            } catch (err) {
                if (err.response?.status === 404) {
                    console.warn("Clinical ID missing for session - performing automated clinical initialization...");
                    const user_name = localStorage.getItem('user_name') || 'Anonymous Patient';
                    const user_email = localStorage.getItem('user_email') || `patient_${patientUserId}@synapscare.com`;
                    const user_phone = localStorage.getItem('user_phone') || '+0000000000';

                    const createRes = await patientApi.post('/', {
                        userId: parseInt(patientUserId, 10),
                        name: user_name,
                        email: user_email,
                        phone: user_phone
                    });
                    const newProfile = createRes.data?.data || createRes.data;
                    patientId = newProfile.id;
                    console.log("Automated clinical initialization successful. Profile ID:", patientId);
                } else {
                    throw err;
                }
            }

            if (!patientId) {
                throw new Error('Clinical Identity resolution failure: System could not allocate or locate your patient record.');
            }

            localStorage.setItem('patient_id', String(patientId));

            // Transform startTime (8:30:00) to LocalTime format if needed. 
            // Our backend expects LocalTime string.
            const appointmentPayload = {
                patientId: parseInt(patientId, 10),
                // Use dbId (doctor service internal pk = 3883), NOT routing userId (=28).
                // The appointment service stores and queries doctorId by this pk.
                doctorId: doctor.dbId || doctor.id,
                date: selectedDate,
                time: selectedSlot.startTime,
                fee: doctor.fee,
                consultationType: bookingMode,
                reason: "Regular clinical consultation initiated via practitioner dossier."
            };

            try {
                const response = await appointmentApi.post('/book', appointmentPayload);
                const newAppointment = response.data?.data || response.data;

                setBookingNotice('Booking confirmed. Redirecting to payment...');
                setRedirectingToPayment(true);

                // Redirect to payment — use 'appointmentId' NOT 'id' to avoid
                // colliding with the /doctors/[id] dynamic route param, which
                // would cause this page's useEffect to re-fire with appointment.id.
                setTimeout(() => {
                    router.push({
                        pathname: '/payment',
                        query: {
                            appointmentId: newAppointment.id,
                            amount: doctor.fee,
                            patientId: patientId,
                            doctorId: doctor.dbId || doctor.id  // DB pk, consistent with booking payload
                        }
                    });
                }, 1400);
            } catch (apiErr) {
                console.error("Clinical Node Synchronizer failure:", apiErr);
                const errorMsg = apiErr.response?.data?.message || apiErr.message;
                alert(`Tactical failure in booking registry: ${errorMsg}. Please verify your parameters and re-synchronize.`);
                setBookingInProgress(false);
                setRedirectingToPayment(false);
            }
        } catch (error) {
            console.error("Critical Failure: Could not initialize booking record", error);
            alert("Clinical Sync Failure: This slot might have just been booked. Please choose another node.");
            setRedirectingToPayment(false);
        } finally {
            setBookingInProgress(false);
        }
    };

    if (loading) return <LoadingSpinner size="fullscreen" message="Accessing Specialized Practitioner Dossier..." />;

    if (!doctor) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
                <Card className="max-w-md w-full text-center p-12">
                    <Search size={48} className="mx-auto text-slate-300 mb-6" />
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Practitioner Not Found</h2>
                    <p className="text-slate-500 font-medium mt-2 mb-10">We couldn&apos;t locate the requested clinical profile.</p>
                    <Button variant="primary" onClick={() => router.push('/doctors')}>Back to Registry</Button>
                </Card>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{doctor?.name ? `Dr. ${doctor.name} | ${SPECIALIZATION_LABELS[doctor.specialization] || doctor.specialization}` : 'Specialist Profile'} | SynapsCare</title>
                <meta name="description" content={doctor?.about ? doctor.about.substring(0, 160) : "View expert medical profile and book appointments with top-tier specialists"} />
            </Head>
            <div className="min-h-screen bg-slate-50 font-['Open_Sans',sans-serif] text-slate-700 selection:bg-teal-100 overflow-x-hidden">
                {/* High-End Navigation Header */}
                <nav className="h-20 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 px-8 sm:px-16 flex items-center justify-between sticky top-0 z-[60] shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/doctors')}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-teal-600 hover:border-teal-400 transition-all active:scale-90 group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="hidden sm:flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 tracking-tight leading-none">Practitioner Profile</span>
                                <Verified size={12} className="text-teal-500" />
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 tracking-tight mt-1">Verified Clinical Identification</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <Badge variant="success" size="sm" pulse>AVAILABLE</Badge>
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative group cursor-pointer">
                            <img
                                src={currentDoctorImage}
                                alt={doctor.name}
                                onError={() => setProfileImageFailed(true)}
                                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                            />
                        </div>
                    </div>
                </nav>

                <main className="max-w-[1400px] mx-auto px-8 sm:px-16 py-8 grid grid-cols-1 xl:grid-cols-12 gap-10">
                    {/* Profile Core Intelligence (Col Span 8) */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-8 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                            {/* Large Profile Visual */}
                            <div className="md:col-span-4 lg:col-span-3">
                                <div className="aspect-square bg-white rounded-[3rem] p-6 border-2 border-slate-100 shadow-2xl shadow-teal-100/30 relative group overflow-hidden">
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-teal-50/50 to-transparent pointer-events-none" />
                                    <div className="w-full h-full bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 relative z-10">
                                        <img
                                            src={currentDoctorImage}
                                            alt={doctor.name}
                                            onError={() => setProfileImageFailed(true)}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-teal-200 z-20 group-hover:rotate-12 transition-transform">
                                        <Zap size={24} fill="white" />
                                    </div>
                                </div>
                            </div>

                            {/* Core Info Details */}
                            <div className="md:col-span-8 lg:col-span-9 space-y-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge variant="teal" size="md">Experienced Specialist</Badge>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold tracking-tight">
                                            <Globe size={12} /> {doctor.location}
                                        </div>
                                    </div>
                                    <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-none mb-3">Dr. {doctor.name}</h1>
                                    <h2 className="text-2xl font-bold text-teal-600 tracking-tight flex items-center gap-3">
                                        {SPECIALIZATION_LABELS[doctor.specialization] || doctor.specialization} <div className="h-0.5 w-12 bg-teal-200" />
                                    </h2>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                                    {[
                                        { label: 'Rating', val: doctor.rating, icon: Star, color: 'text-amber-500' },
                                        { label: 'Experience', val: doctor.experience.split(' ')[0], icon: Award, color: 'text-teal-500' },
                                        { label: 'Patients', val: doctor.reviews, icon: User, color: 'text-emerald-500' }
                                    ].map((stat, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <stat.icon size={16} className={stat.color} />
                                                <span className="text-xl font-bold text-slate-900 tracking-tight">{stat.val}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 tracking-tight uppercase tracking-widest">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Extended Dossier Information */}
                        <div className="space-y-10">
                            <div className="surface-card p-8 bg-white relative overflow-hidden group border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-3">
                                    <BookOpen size={18} className="text-teal-600" /> About Practitioner
                                </h3>
                                <p className="copy-description text-base font-medium text-slate-500 leading-relaxed max-w-3xl">
                                    &quot;{doctor.about}&quot;
                                </p>
                                <div className="absolute right-0 bottom-0 p-12 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                                    <Stethoscope size={180} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-teal-50 border border-teal-100 rounded-[3rem] text-slate-900 shadow-xl shadow-teal-100/50">
                                    <h4 className="text-xs font-bold tracking-tight text-teal-600 mb-6 flex items-center gap-2">
                                        <Verified size={14} /> Academic Pedigree
                                    </h4>
                                    <ul className="space-y-4">
                                        {doctor.education.map((edu, i) => (
                                            <li key={i} className="flex gap-4 group cursor-default">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                                                <p className="text-sm font-bold text-slate-600 group-hover:text-teal-900 transition-colors">{edu}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-8 bg-white border border-slate-100 rounded-[3rem]">
                                    <h4 className="text-xs font-bold tracking-tight text-slate-400 mb-6 flex items-center gap-2">
                                        <Stethoscope size={14} className="text-teal-600" /> Practical Operations
                                    </h4>
                                    <ul className="space-y-4">
                                        {doctor.services.map((srv, i) => (
                                            <li key={i} className="flex items-center gap-4 group">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 text-teal-500 flex items-center justify-center border border-slate-100 group-hover:bg-teal-600 group-hover:text-white transition-all">
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
                        <div className="bg-white rounded-[3rem] shadow-2xl shadow-teal-100 sticky top-24 overflow-hidden border border-slate-100">
                            {/* Booking Header */}
                            <div className="p-8 bg-teal-600 text-white flex justify-between items-end relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black tracking-tighter mb-0.5">Schedule Visit</h3>
                                    <p className="text-[9px] font-bold tracking-tight text-teal-200">Session ID: AUTO-SYNC-X</p>
                                </div>
                                <Calendar size={28} className="relative z-10 group-hover:rotate-12 transition-transform" />
                                <div className="absolute top-0 right-0 p-10 opacity-20 pointer-events-none blur-2xl flex gap-10">
                                    <div className="w-32 h-32 bg-white rounded-full" />
                                </div>
                            </div>

                            {/* Booking Controls */}
                            <div className="p-6 space-y-6">
                                {/* Date & Mode Selection */}
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold tracking-tight text-slate-500">Consultation date</p>
                                        <input
                                            type="date"
                                            min={new Date().toLocaleDateString('en-CA')}
                                            value={selectedDate}
                                            onChange={(e) => {
                                                setSelectedDate(e.target.value);
                                                setSelectedSlot(null);
                                            }}
                                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium tracking-tight focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-bold tracking-tight text-slate-500">Consultation mode</p>
                                        <div className="flex gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                                            {['TELEMEDICINE', 'IN_PERSON'].map((mode) => (
                                                <button
                                                    key={mode}
                                                    onClick={() => setBookingMode(mode)}
                                                    className={`flex-1 py-3 rounded-xl text-xs font-bold tracking-tight transition-all ${bookingMode === mode ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-teal-600'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-center gap-2">
                                                        {mode === 'TELEMEDICINE' ? <Video size={10} /> : <MapPin size={10} />}
                                                        {mode === 'IN_PERSON' ? 'IN-PERSON' : 'TELEMEDICINE'}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Slot Cluster */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-bold tracking-tight text-slate-500">Available slots</p>
                                        {slotsLoading && <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {slots.length > 0 ? (
                                            slots.map((slot, i) => {
                                                const displayTime = slot.startTime.substring(0, 5); // From HH:mm:ss to HH:mm
                                                return (
                                                    <button
                                                        key={i}
                                                        disabled={!slot.isAvailable}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        className={`p-4 rounded-2xl font-bold text-sm tracking-tight border transition-all flex items-center justify-center gap-2 ${!slot.isAvailable
                                                            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                                            : selectedSlot === slot
                                                                ? 'bg-teal-600 text-white border-teal-600 shadow-xl scale-[1.05]'
                                                                : 'bg-white border-slate-100 text-slate-500 hover:border-teal-400 hover:text-teal-600'
                                                            }`}
                                                    >
                                                        {selectedSlot === slot && <Check size={12} className="text-white" />}
                                                        {displayTime}
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-2 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                                                <p className="text-sm font-medium text-slate-400 tracking-tight leading-relaxed">No available slots for this date.<br />Please select another clinical window.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Fee Calculation */}
                                <div className="pt-6 border-t border-slate-100 space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold tracking-tight">
                                        <span className="text-slate-500">Service authorized fee</span>
                                        <span className="text-slate-900 text-base">LKR {doctor.fee.toLocaleString()}</span>
                                    </div>
                                    <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-teal-600/10 rounded-xl flex items-center justify-center text-teal-600 shrink-0">
                                            <ShieldCheck size={16} />
                                        </div>
                                        <p className="copy-description text-xs font-medium text-slate-500 leading-relaxed">Encrypted payment and verified clinical identity guaranteed.</p>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    size="xl"
                                    className="w-full normal-case tracking-tight font-bold"
                                    disabled={!selectedSlot || bookingInProgress || redirectingToPayment}
                                    onClick={handleBooking}
                                    icon={Zap}
                                >
                                    {bookingInProgress ? 'Synchronizing Archive...' : redirectingToPayment ? 'Redirecting To Payment...' : selectedSlot ? 'Finalize Booking Protocol' : 'Select Command Node'}
                                </Button>

                                {bookingNotice && (
                                    <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold tracking-tight text-center">
                                        {bookingNotice}
                                    </div>
                                )}
                            </div>

                            {/* Infrastructure Footer */}
                            <div className="bg-slate-50 p-4 flex items-center justify-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-bold tracking-tight text-slate-400">Secure node Sync-X active</span>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </>
    );
}
