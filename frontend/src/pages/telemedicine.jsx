import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { telemedicineApi } from '../lib/api';
import { Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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

                let sessionRes;
                try {
                    sessionRes = await telemedicineApi.get(`/appointments/${appointmentId}/session`);
                } catch (sessionErr) {
                    if (sessionErr?.response?.status !== 404) {
                        throw sessionErr;
                    }
                    sessionRes = await telemedicineApi.get(`/sessions/appointment/${appointmentId}`);
                }

                const sessionData = sessionRes.data?.data;
                if (!sessionData) {
                    throw new Error('Session not found for this appointment');
                }

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

                setSession(joinRes.data?.data);

                const script = document.createElement('script');
                script.src = 'https://meet.jit.si/external_api.js';
                script.async = true;
                script.onload = () => setJitsiLoaded(true);
                document.body.appendChild(script);
            } catch (err) {
                console.error('Telemedicine join failed', err);
                setError(err.response?.data?.message || 'Session initialization failed. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const timer = setInterval(() => setDuration((d) => d + 1), 1000);
        return () => {
            clearInterval(timer);
            if (jitsiApiRef.current) jitsiApiRef.current.dispose();
        };
    }, [appointmentId, router]);

    useEffect(() => {
        if (jitsiLoaded && session && jitsiContainerRef.current) {
            const options = {
                roomName: session.roomName,
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: localStorage.getItem('user_name') || 'SynapsCare User'
                },
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: false,
                    disableDeepLinking: true,
                    enableWelcomePage: false
                },
                interfaceConfigOverwrite: {
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_BACKGROUND: '#000000'
                }
            };

            if (session.accessToken) {
                options.jwt = session.accessToken;
            }

            jitsiApiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', options);
            jitsiApiRef.current.addEventListeners({
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
                        notes: 'Session ended by doctor'
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

    if (loading) return <LoadingSpinner size="fullscreen" message="Connecting to session..." />;

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-8">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="max-w-md w-full text-center p-10 bg-slate-900 border-rose-500/20">
                        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-3">Unable To Join</h2>
                        <p className="text-slate-400 mb-8 text-sm">{error}</p>
                        <Button variant="danger" size="lg" className="w-full" onClick={() => router.back()}>
                            Go Back
                        </Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Telemedicine Session | SynapsCare</title>
                <meta name="description" content="Secure telemedicine video consultation" />
            </Head>
            <div className="h-screen bg-black relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    ref={jitsiContainerRef}
                    className="h-full w-full"
                />

                <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none flex items-center justify-between">
                    <button
                        onClick={handleEndCall}
                        className="pointer-events-auto h-11 w-11 rounded-xl bg-black/60 text-white border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors"
                        aria-label="Exit session"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="bg-black/60 text-white border border-white/20 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2">
                        <Clock size={14} />
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TelemedicinePage;
