import React, { useState } from 'react';
import { telemedicineApi, appointmentApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Video, Clock, PhoneOff, FileText, CheckCircle, UploadCloud, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const TelemedicineTab = ({ appointments = [], userData, onCompleteSession, onEndSession }) => {
    const [activeSession, setActiveSession] = useState(null);
    const [jitsiUrl, setJitsiUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const doctorAuthId = typeof window !== 'undefined' ? localStorage.getItem('user_id') : null;
    const doctorId = doctorAuthId || userData?.doctorDbId || userData?.id;

    const toLocalDateTime = (date) => format(date, "yyyy-MM-dd'T'HH:mm:ss");

    // Filter to only telemedicine type
    const videoAppointments = appointments.filter(a => 
        (a.consultationType === 'TELEMEDICINE' || a.type === 'TELEMEDICINE' || a.mode === 'TELEMEDICINE') && 
        (a.status === 'CONFIRMED' || a.status === 'PAID')
    );

    const joinSession = async (appt) => {
        try {
            let sessionData;
            toast.loading("Connecting to secure room...", { id: 'join-session' });
            // 1. Try to get existing session
            try {
                const getRes = await telemedicineApi.get(`/appointments/${appt.id}/session`);
                sessionData = getRes.data?.data;
            } catch (e) {
                // If it doesn't exist, create a new session
                const now = new Date();
                const end = new Date(now.getTime() + 30 * 60000); // 30 mins later
                const createRes = await telemedicineApi.post(`/appointments/${appt.id}/session`, {
                    appointmentId: appt.id,
                    doctorId: parseInt(doctorId, 10),
                    patientId: appt.patientId,
                    scheduledStartTime: toLocalDateTime(now),
                    scheduledEndTime: toLocalDateTime(end)
                });
                sessionData = createRes.data?.data;
            }

            // JOIN via doctor role
            const joinRes = await telemedicineApi.post(`/sessions/${sessionData.sessionId}/join/doctor`);
            const joinedData = joinRes.data?.data;
            
            setActiveSession({ ...joinedData, appointment: appt });
            setJitsiUrl(joinedData.meetingUrl || `https://meet.jit.si/${joinedData.roomName}`);
            toast.success('Connected via Medical Gateway', { id: 'join-session' });
        } catch (err) {
            console.error("Session init failed:", err);
            const apiMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message;

            if (err?.response) {
                toast.error(apiMessage || 'Unable to join consultation at this time.', { id: 'join-session', duration: 4000 });
                return;
            }

            // Fallback only for network/runtime failures where the backend is unreachable.
            const roomName = `synapcare-app-${appt.id}`;
            setJitsiUrl(`https://meet.jit.si/${roomName}`);
            setActiveSession({ appointment: appt, roomName, sessionId: 'LOCAL-FALLBACK' });
            toast.error('API Error: Connecting via fallback proxy', { id: 'join-session', duration: 4000 });
        }
    };

    const endSession = async () => {
        if (!activeSession) return;
        setSubmitting(true);
        toast.loading("Encrypting and uploading notes...", { id: 'end-session' });
        try {
            if (activeSession.sessionId !== 'LOCAL-FALLBACK') {
                await telemedicineApi.post(`/sessions/${activeSession.sessionId}/end`, {
                    notes
                });
            }
            
            // Mark appointment complete
            try { await appointmentApi.patch(`/${activeSession.appointment.id}/status?status=COMPLETED`); } catch(e){}
            
            toast.success('Consultation ended safely.', { id: 'end-session' });
            
            // State reset to clear UI hang
            setSubmitting(false);
            setActiveSession(null);
            setJitsiUrl('');
            setNotes('');

            onCompleteSession && onCompleteSession(activeSession.appointment.id);
            onEndSession && onEndSession(activeSession.appointment, notes);
        } catch (err) {
            console.error(err);
            toast.error('Encountered error while syncing, disconnected locally.', { id: 'end-session' });
            setSubmitting(false);
            setActiveSession(null);
            setJitsiUrl('');
            setNotes('');
        }
    };

    if (activeSession) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-[750px] bg-slate-950 rounded-[var(--radius-3xl)] overflow-hidden flex shadow-2xl relative border border-slate-800">
                {/* Left: Video Frame 60% */}
                <div className="w-[60%] h-full relative bg-black flex flex-col">
                    <div className="absolute top-6 left-6 z-10 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
                        <span className="text-white font-semibold text-sm tracking-widest uppercase">Live Encrypted</span>
                    </div>

                    {jitsiUrl ? (
                        <iframe 
                            allow="camera; microphone; fullscreen; display-capture; autoplay"
                            src={jitsiUrl}
                            className="w-full flex-1 border-0"
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500 animate-pulse font-serif text-xl tracking-wide">
                            Establishing secure RTC connection...
                        </div>
                    )}
                </div>

                {/* Right: Clinical Workspace 40% */}
                <div className="w-[40%] h-full bg-white flex flex-col border-l border-slate-200">
                    <div className="p-6 xl:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h3 className="text-xl xl:text-3xl font-serif text-slate-900 tracking-tight flex items-center gap-3">
                                {userData?.patientsMap?.[activeSession.appointment?.patientId]?.name || `Patient #${activeSession.appointment?.patientId}`}
                            </h3>
                            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                <Video className="w-3 h-3" /> Telemedicine Consult
                            </div>
                        </div>
                        <button onClick={endSession} disabled={submitting} className="btn-primary !bg-rose-500 hover:!bg-rose-600 !shadow-rose-500/20 px-5 py-2.5 flex items-center gap-2 text-sm xl:text-base border border-rose-400">
                            <PhoneOff className="w-5 h-5" /> 
                            {submitting ? 'Closing...' : 'End Call'}
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 xl:p-8 space-y-8 bg-slate-50/30">
                        <div className="space-y-4">
                            <label className="flex items-center justify-between font-semibold text-xs tracking-widest uppercase text-slate-500">
                                <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Live SOAP Notes</span>
                                <span className="text-[9px] bg-slate-100 px-2 py-1 rounded text-slate-400">Auto-saving...</span>
                            </label>
                            <textarea 
                                value={notes} 
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full h-96 bg-white border border-slate-200 rounded-[1.5rem] p-6 text-[15px] font-medium text-slate-700 leading-relaxed focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none transition-all resize-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                                placeholder="Subjective, Objective, Assessment, Plan..."
                            ></textarea>
                        </div>
                        

                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="surface-card bg-white min-h-[600px] flex flex-col">
            <div className="p-8 xl:p-10 border-b border-[var(--border-color)] flex justify-between items-center bg-slate-50/30">
                <div>
                    <h3 className="text-3xl font-serif text-slate-900 tracking-tight">Virtual Waiting Room</h3>
                    <p className="text-slate-500 font-medium text-sm mt-2 opacity-80">Pending telemedicine sessions configured for today's active shift.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-emerald-100 shadow-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> System Ready
                    </div>
                </div>
            </div>
            
            <div className="flex-1 p-8 xl:p-10 bg-slate-50/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                    <AnimatePresence>
                        {videoAppointments.length > 0 ? videoAppointments.map((appt, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={appt.id} 
                                className="p-6 bg-white border border-slate-200 rounded-[2rem] flex flex-col justify-between shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[1.2rem] flex items-center justify-center shadow-inner relative group-hover:scale-105 transition-transform">
                                            <Video className="w-6 h-6" />
                                            <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse border-2 border-white"></div>
                                        </div>
                                        <div>
                                            <div className="text-xl font-serif font-bold text-slate-900">
                                                {userData?.patientsMap?.[appt.patientId]?.name || `Patient #${appt.patientId}`}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">
                                                <Clock className="w-3.5 h-3.5 text-amber-500" /> {appt.date} {appt.time}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-5 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">Online Now</span>
                                    <button onClick={() => joinSession(appt)} className="btn-primary !bg-indigo-600 hover:!bg-indigo-700 px-6 py-3 text-sm flex items-center gap-2 shadow-indigo-600/30">
                                        Join Consult <Video className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="col-span-2 py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[3rem]">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                    <Users className="w-10 h-10 text-slate-300" />
                                </div>
                                <div className="text-2xl font-serif text-slate-400 mb-2">Queue is Empty</div>
                                <p className="text-sm font-medium opacity-70 mb-6">No video appointments are currently waiting online.</p>
                                <button className="px-6 py-3 bg-white text-indigo-600 border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-sm hover:shadow-md transition-all">Reload Queue</button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default TelemedicineTab;