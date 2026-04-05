import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { telemedicineApi } from '../lib/api';
import {
    Video,
    Shield,
    Clock,
    User,
    ArrowLeft,
    AlertCircle,
    CheckCircle2,
    Zap,
    Cpu,
    Globe,
    Lock,
    Maximize,
    Wifi
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const TelemedicinePage = () => {
    const router = useRouter();
    const { appointmentId } = router.query;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [session, setSession] = useState(null);
    const [duration, setDuration] = useState(0);
    const [jitsiLoaded, setJitsiLoaded] = useState(false);
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);

    const resolveRoomName = (sessionData) => {
        if (sessionData?.roomName) return sessionData.roomName;
        const meetingLink = sessionData?.meetingLink || sessionData?.meetingUrl || sessionData?.sessionUrl;
        if (!meetingLink) return null;
        try {
            const url = new URL(meetingLink);
            const pathRoom = url.pathname?.replace(/^\/+/, '');
            return pathRoom || null;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        if (!appointmentId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const userId = localStorage.getItem('user_id');
                const role = localStorage.getItem('user_role');

                // Step 1: Get or create session by appointmentId
                // Support both endpoint shapes while services are on mixed versions.
                let sessionRes;
                try {
                    sessionRes = await telemedicineApi.get(`/appointments/${appointmentId}/session`);
                } catch (sessionErr) {
                    if (sessionErr?.response?.status !== 404) {
                        throw sessionErr;
                    }
                    sessionRes = await telemedicineApi.get(`/sessions/appointment/${appointmentId}`);
                }

                const sessionData = sessionRes.data.data;

                if (!sessionData) {
                    throw new Error('Session not found for this appointment');
                }

                // Step 2: Join session with role-based endpoint
                let joinRes;
                if (role === 'DOCTOR') {
                    try {
                        joinRes = await telemedicineApi.post(`/sessions/${sessionData.sessionId}/join/doctor`, null, {
                            params: { doctorId: userId }
                        });
                    } catch (joinErr) {
                        const status = joinErr?.response?.status;
                        const fallbackRoom = resolveRoomName(sessionData);
                        if ((status === 500 || status === 404) && fallbackRoom) {
                            console.warn('Doctor join endpoint failed; falling back to direct room join using session payload', {
                                status,
                                sessionId: sessionData.sessionId,
                                roomName: fallbackRoom
                            });
                            joinRes = {
                                data: {
                                    data: {
                                        ...sessionData,
                                        roomName: fallbackRoom,
                                        accessToken: null
                                    }
                                }
                            };
                        } else {
                            throw joinErr;
                        }
                    }
                } else {
                    try {
                        joinRes = await telemedicineApi.post(`/sessions/${sessionData.sessionId}/join/patient`, null, {
                            params: { patientId: userId }
                        });
                    } catch (joinErr) {
                        const status = joinErr?.response?.status;
                        const fallbackRoom = resolveRoomName(sessionData);
                        if ((status === 500 || status === 404) && fallbackRoom) {
                            console.warn('Patient join endpoint failed; falling back to direct room join using session payload', {
                                status,
                                sessionId: sessionData.sessionId,
                                roomName: fallbackRoom
                            });
                            joinRes = {
                                data: {
                                    data: {
                                        ...sessionData,
                                        roomName: fallbackRoom,
                                        accessToken: null
                                    }
                                }
                            };
                        } else {
                            throw joinErr;
                        }
                    }
                }

                setSession(joinRes.data.data);

                // Load Jitsi script
                const script = document.createElement('script');
                script.src = 'https://meet.jit.si/external_api.js';
                script.async = true;
                script.onload = () => setJitsiLoaded(true);
                document.body.appendChild(script);

            } catch (err) {
                console.error('Telemedicine join failed', err);
                setError(err.response?.data?.message || 'Unauthorized: Secure session initialization failed. Verify payment status.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const timer = setInterval(() => setDuration(d => d + 1), 1000);
        return () => {
            clearInterval(timer);
            if (jitsiApiRef.current) jitsiApiRef.current.dispose();
        };
    }, [appointmentId, router]);

    useEffect(() => {
        if (jitsiLoaded && session && jitsiContainerRef.current) {
            const domain = 'meet.jit.si';
            const options = {
                roomName: session.roomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: localStorage.getItem('user_name') || 'Healthcare Specialist'
                },
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                    enableWelcomePage: false
                },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'fullscreen', 'fodeviceselection', 'hangup', 'chat', 'settings', 'tileview', 'videobackgroundblur'
                    ],
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_BACKGROUND: '#0f172a'
                }
            };

            if (session.accessToken) {
                options.jwt = session.accessToken;
            }

            jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
            
            jitsiApiRef.current.addEventListeners({
                videoConferenceJoined: () => console.log('Node Integrated Successfully'),
                videoConferenceLeft: () => handleEndCall()
            });
        }
    }, [jitsiLoaded, session]);

    const handleEndCall = async () => {
        if (jitsiApiRef.current) jitsiApiRef.current.dispose();

        try {
            const role = localStorage.getItem('user_role');
            const userId = localStorage.getItem('user_id');

            if (role === 'DOCTOR' && session) {
                await telemedicineApi.post(`/sessions/${session.sessionId}/end`, null, {
                    params: {
                        doctorId: userId,
                        notes: 'Session terminated by specialist terminal'
                    }
                });
            }
        } catch (e) {
            console.error('Session end signal failed', e);
        }

        const role = localStorage.getItem('user_role');
        router.push(role === 'DOCTOR' ? '/doctor/dashboard' : '/dashboard/patient');
    };

    const formatTime = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    if (loading) return <LoadingSpinner size="fullscreen" message="Establishing High-Security Video Node..." />;

    if (error) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 selection:bg-rose-500/30">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="max-w-md w-full text-center p-12 bg-slate-900 border-rose-500/20 shadow-2xl shadow-rose-900/20">
                        <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                            <AlertCircle className="w-10 h-10 text-rose-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-4 italic uppercase tracking-widest">Access Terminated</h2>
                        <p className="text-slate-400 font-medium mb-10 leading-relaxed text-sm">"{error}"</p>
                        <Button variant="danger" size="lg" className="w-full" onClick={() => router.back()}>
                             Return to Safety
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Secure Neural Link | Telemedicine Session | SynapsCare</title>
                <meta name="description" content="High-security encrypted video consultation node for specialized clinical care" />
            </Head>
            <div className="min-h-screen bg-[#050505] flex flex-col font-sans selection:bg-indigo-500/30 overflow-hidden">
            {/* Enterprise Telemedicine Header */}
            <header className="h-24 px-10 flex justify-between items-center border-b border-white/5 bg-slate-950/50 backdrop-blur-3xl shrink-0 z-[60] relative">
                <div className="flex items-center gap-10">
                    <button
                        onClick={handleEndCall}
                        className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-rose-600 hover:border-rose-500 transition-all active:scale-90 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    
                    <div className="flex flex-col">
                        <div className="flex items-center gap-4 mb-1">
                            <h1 className="text-xl font-black text-white tracking-tighter leading-none italic uppercase tracking-widest">Neural Link <span className="text-indigo-500">#{appointmentId}</span></h1>
                            <Badge variant="success" size="sm" pulse>LIVE NODE</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                            <span className="flex items-center gap-1.5"><Lock size={10} className="text-emerald-500" /> 256-Bit Encrypted</span>
                            <span className="flex items-center gap-1.5"><Cpu size={10} className="text-indigo-500" /> Infrastructure Node: AP-{appointmentId}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/5 rounded-2xl">
                         <div className="flex flex-col items-end">
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Duration</span>
                             <span className="text-sm font-black text-white leading-none mt-1">{formatTime(duration)}</span>
                         </div>
                         <div className="w-px h-6 bg-white/10" />
                         <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
                    </div>
                </div>
            </header>

            {/* Immersive Video Canvas */}
            <main className="flex-1 overflow-hidden relative flex bg-black">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    ref={jitsiContainerRef} 
                    className="flex-1"
                />

                {/* Cyber HUD Overlays */}
                <div className="absolute top-8 left-8 pointer-events-none z-50 space-y-4">
                     <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">Carrier Signal Optimal</span>
                     </div>
                     <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3">
                         <Wifi size={14} className="text-indigo-400" />
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">Latency: 24ms</span>
                     </div>
                </div>

                <div className="absolute bottom-10 right-10 pointer-events-none z-50">
                    <div className="p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3">
                         <div className="text-right">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Node</p>
                             <p className="text-xs font-bold text-white uppercase tracking-widest leading-none">Specialist Terminal</p>
                         </div>
                         <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white border border-indigo-500/50 shadow-lg shadow-indigo-600/20">
                             <User size={18} strokeWidth={2.5} />
                         </div>
                    </div>
                </div>
            </main>

            {/* Strategic Command Bar */}
            <footer className="h-28 px-10 border-t border-white/5 bg-slate-950/80 backdrop-blur-3xl flex justify-between items-center z-50 shrink-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 text-xs font-black text-slate-500 uppercase tracking-widest italic group">
                         <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
                            <span>Neural Stream: Synchronized</span>
                         </div>
                         <span className="hidden lg:inline-block opacity-40">Global Healthcare Infrastructure v3.0</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all active:scale-90">
                         <Maximize size={22} />
                    </button>
                    <button 
                        onClick={handleEndCall}
                        className="px-12 h-14 bg-rose-600 text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-rose-900/50 hover:bg-rose-700 active:scale-95 transition-all flex items-center gap-4"
                    >
                        Terminate Node Connection <PhoneOff size={16} strokeWidth={3} />
                    </button>
                </div>
            </footer>

            {/* Decorative Scanlines */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
        </>
    );
};

// Simple utility component
const PhoneOff = ({ size, strokeWidth, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.04 19.75 19.75 0 0 1-5.81-5.81A19.79 19.79 0 0 1 2.45 4.5 2 2 0 0 1 4.45 2.5h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
        <line x1="23" y1="1" x2="1" y2="23" />
    </svg>
)

export default TelemedicinePage;
