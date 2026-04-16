import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Heart, FileText, Brain, PlayCircle, PlusCircle, UploadCloud, ShieldCheck, Clock } from 'lucide-react';
import { supabaseStorage } from '../../lib/supabase';
import { patientApi, medicalHistoryApi, appointmentApi } from '../../lib/api';
import FileUpload from '../ui/FileUpload';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function PatientContextDrawer({ isOpen, onClose, appointment, doctorId: propDoctorId }) {
    const [patientData, setPatientData] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const isBlocked = appointment?.status === 'BLOCKED';
    const isAvailable = appointment?.status === 'AVAILABLE';
    const resolvedPatientId = (isBlocked || isAvailable) ? null : (appointment?.patientId || appointment?.id);
    const resolvedAppointmentId = appointment?.appointmentId || (appointment?.date && appointment?.time ? appointment?.id : null);

    const resolvedWeight = patientData?.weight ?? patientData?.weightKg ?? patientData?.weight_kg;
    const resolvedHeight = patientData?.height ?? patientData?.heightCm ?? patientData?.height_cm;

    useEffect(() => {
        if (isOpen && resolvedPatientId && !isBlocked && !isAvailable) {
            const fetchPatientContext = async () => {
                setLoading(true);
                try {
                    const pRes = await patientApi.get(`/${resolvedPatientId}`);
                    setPatientData(pRes.data?.data || pRes.data || {});

                    try {
                        const rRes = await medicalHistoryApi.get(`/reports/patient/${resolvedPatientId}`);
                        setReports(rRes.data?.data || rRes.data || []);
                    } catch (reportErr) {
                        console.warn('Could not load patient reports:', reportErr?.message || reportErr);
                        setReports([]);
                    }
                } catch (err) {
                    console.error("Clinical Context Fetch Failure:", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchPatientContext();
        } else if (isBlocked || isAvailable) {
            setPatientData(null);
            setReports([]);
        }
    }, [isOpen, resolvedPatientId, isBlocked]);

    if (!appointment) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Dark Glass Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                    />

                    {/* Right-Side Drawer */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 200 } }}
                        exit={{ x: '100%', opacity: 0 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-[500px] bg-white border-l border-slate-200 z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <div className="flex items-center gap-3 text-xs font-bold text-teal-600 uppercase tracking-widest mb-2">
                                    {isBlocked ? <ShieldCheck className="w-4 h-4 text-slate-500" /> : isAvailable ? <PlusCircle className="w-4 h-4 text-emerald-600" /> : <Activity className="w-4 h-4" />} 
                                    {isBlocked ? 'Clinical Block Registry' : isAvailable ? 'Extra Availability' : 'Clinical Case Management'}
                                </div>
                                <h2 className="text-3xl font-sans text-slate-900">
                                    {isBlocked ? 'Blocked Slot' : isAvailable ? 'Extra Availability' : (appointment.patientName || appointment.name || `Patient #${resolvedPatientId}`)}
                                </h2>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 shadow-sm transition-all group">
                                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Body content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20">
                            {loading && !isBlocked && !isAvailable ? (
                                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Querying Cloud Identity...</p>
                                </div>
                            ) : (
                                <>
                                    {/* AI Summary Block / Block Description */}
                                    <div className={`p-6 rounded-[2rem] border ${isBlocked ? 'bg-slate-100 border-slate-200' : isAvailable ? 'bg-emerald-50 border-emerald-100' : 'bg-gradient-to-br from-teal-50 to-slate-50 border-teal-100/50'}`}>
                                        <div className="flex items-center gap-2 mb-4">
                                            {isBlocked ? <Clock className="w-5 h-5 text-slate-500" /> : isAvailable ? <PlusCircle className="w-5 h-5 text-emerald-600" /> : <Brain className="w-5 h-5 text-indigo-600" />}
                                            <div className={`text-xs font-bold uppercase tracking-widest ${isBlocked ? 'text-slate-500' : isAvailable ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                                {isBlocked ? 'Temporal Lock Details' : isAvailable ? 'Extra Availability' : 'Synapcare Clinical Insight'}
                                            </div>
                                        </div>
                                        <div className="text-slate-700 text-sm leading-relaxed font-bold">
                                            {isBlocked ? (
                                                `This slot was manually blocked for clinical administrative reasons at ${parseApptHour(appointment.time)}:00 ${parseApptHour(appointment.time) >= 12 ? 'PM' : 'AM'}. Patient bookings are restricted for this duration.`
                                            ) : isAvailable ? (
                                                `You have opened this slot for additional patient consultations at ${parseApptHour(appointment.time)}:00 ${parseApptHour(appointment.time) >= 12 ? 'PM' : 'AM'}. Patients can now book this time in your public profile.`
                                            ) : appointment.reason ? (
                                                `Chief Complaint: "${appointment.reason}" recorded for session at ${parseApptHour(appointment.time)}:00 ${parseApptHour(appointment.time) >= 12 ? 'PM' : 'AM'}.`
                                            ) : (
                                                `Patient scheduled for active consultation at ${parseApptHour(appointment.time)}:00 ${parseApptHour(appointment.time) >= 12 ? 'PM' : 'AM'}. Initial triage suggests standard clinical review.`
                                            )}
                                        </div>
                                    </div>

                                    {!isBlocked && !isAvailable && (
                                        <>
                                     {/* Vitals Grid */}
                                     <div>
                                         <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
                                             <Heart className="w-4 h-4" /> Live Health Markers
                                         </h4>
                                         <div className="grid grid-cols-2 gap-4">
                                             <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                                 <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Blood Group</div>
                                                 <div className="text-xl font-black text-rose-600">{patientData?.bloodGroup || 'N/A'}</div>
                                             </div>
                                             <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                                 <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weight / Height</div>
                                                 <div className="text-xl font-bold text-slate-900">{resolvedWeight ?? '--'} kg / {resolvedHeight ?? '--'} cm</div>
                                             </div>
                                             <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                                 <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
                                                 <div className="text-xl font-bold text-teal-600">ACTIVE</div>
                                             </div>
                                             <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                                                 <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID Registry</div>
                                                 <div className="text-xl font-bold text-slate-900">P-{resolvedPatientId}</div>
                                             </div>
                                         </div>
                                     </div>

                                     {/* Clinical Profile */}
                                     <div className="surface-card p-6 bg-white border border-slate-100">
                                         <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-700 mb-4">
                                             <FileText className="w-4 h-4" /> Identity Profile
                                         </h4>
                                         <ul className="space-y-4">
                                             <li className="flex items-start gap-4">
                                                 <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div>
                                                 <div>
                                                     <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Clinical Allergies</div>
                                                     <div className="text-sm font-bold text-slate-800">{patientData?.allergies || 'No known allergies reported'}</div>
                                                 </div>
                                             </li>
                                             <li className="flex items-start gap-4">
                                                 <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                                                 <div>
                                                     <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Chronic Illnesses</div>
                                                     <div className="text-sm font-bold text-slate-800">{patientData?.chronicIllnesses || 'No chronic conditions on record'}</div>
                                                 </div>
                                             </li>
                                         </ul>
                                     </div>

                                     {/* Clinical Media Registry */}
                                     <div className="space-y-4">
                                         <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
                                             <PlayCircle size={18} /> Clinical Dossier
                                         </h4>
                                         <div className="space-y-3">
                                             {reports.length > 0 ? reports.map((r, i) => (
                                                 <a
                                                     key={i}
                                                     href={r.fileUrl}
                                                     target="_blank"
                                                     rel="noopener noreferrer"
                                                     className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-teal-400 hover:shadow-md transition-all group"
                                                 >
                                                     <div className="flex items-center gap-3">
                                                         <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600">
                                                             <FileText size={20} />
                                                         </div>
                                                         <div>
                                                             <p className="text-sm font-bold text-slate-800">{r.fileName}</p>
                                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{r.reportType || 'CLINICAL_ARTIFACT'}</p>
                                                         </div>
                                                     </div>
                                                     <span className="text-[9px] font-black bg-slate-50 px-2 py-1 rounded text-slate-400 uppercase tracking-widest">{format(new Date(r.createdAt || Date.now()), 'MMM d')}</span>
                                                 </a>
                                             )) : (
                                                 <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dotted border-slate-200">
                                                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No clinical artifacts found</p>
                                                 </div>
                                             )}
                                         </div>
                                     </div>
                                        </>
                                    )}

                                    {!isBlocked && !isAvailable && (
                                        <div className="space-y-4 p-6 bg-slate-900 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full pointer-events-none" />
                                            <div className="flex items-center gap-2 relative z-10">
                                                <div className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center">
                                                    <UploadCloud size={18} strokeWidth={3} className="text-teal-400" />
                                                </div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-white/90">Diagnostics Sync</div>
                                            </div>

                                            <FileUpload
                                                label="Sync Critical Artifact"
                                                description="Cloud secure S3 pipeline"
                                                onUpload={async (file) => {
                                                    const patientId = resolvedPatientId;
                                                    const doctorId = localStorage.getItem('user_id');
                                                    const path = `clinical-artifacts/${patientId}/${doctorId}_${Date.now()}`;

                                                    const { error } = await supabaseStorage.upload(file, path);
                                                    if (error) throw new Error(error.message);

                                                    const url = supabaseStorage.getPublicUrl(path);
                                                    await medicalHistoryApi.post(`/reports/link`, {
                                                        patientId,
                                                        appointmentId: resolvedAppointmentId,
                                                        fileName: file.name,
                                                        fileUrl: url,
                                                        fileType: file.type || 'application/octet-stream',
                                                        fileSize: file.size,
                                                        description: 'Clinical artifact added by practitioner during live session',
                                                        reportType: 'LAB_RESULT'
                                                    });
                                                    // refresh local shard
                                                    const rRes = await medicalHistoryApi.get(`/reports/patient/${resolvedPatientId}`);
                                                    setReports(rRes.data?.data || rRes.data || []);
                                                }}
                                                className="bg-white/5 border-white/10 text-white rounded-2xl"
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Action Footer */}
                        <div className="p-6 border-t border-slate-100 bg-white flex flex-col gap-3">
                            {isAvailable ? (
                                <button
                                    onClick={async () => {
                                        try {
                                            const doctorId = propDoctorId || localStorage.getItem('user_id');
                                            await appointmentApi.post(`/doctor/${doctorId}/extra-slots/${appointment.id}/block`);
                                            onClose();
                                            if (typeof window !== 'undefined') window.location.reload();
                                        } catch (err) {
                                            console.error("Failed to block slot", err);
                                        }
                                    }}
                                    className="w-full py-4 rounded-[1.2rem] bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 uppercase tracking-widest text-[10px]"
                                >
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Convert to Clinical Block
                                </button>
                            ) : isBlocked ? (
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 rounded-[1.2rem] bg-slate-100 text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all border border-slate-200 uppercase tracking-widest text-[10px]"
                                >
                                    Dismiss Record
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        if (resolvedAppointmentId) {
                                            router.push(`/telemedicine?appointmentId=${resolvedAppointmentId}`);
                                        }
                                    }}
                                    disabled={!resolvedAppointmentId}
                                    className="w-full py-4 rounded-[1.2rem] bg-teal-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 hover:bg-teal-700 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PlayCircle className="w-5 h-5" /> {resolvedAppointmentId ? 'Begin Appointment' : 'Select Appointment from Queue'}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Helper duplicates for internal drawer use if not passed via props
const parseApptDate = (date) => {
    if (!date) return null;
    if (Array.isArray(date) && date.length >= 3) {
        return `${date[0]}-${String(date[1]).padStart(2, '0')}-${String(date[2]).padStart(2, '0')}`;
    }
    if (typeof date === 'string') return date.split('T')[0];
    return date;
};

const parseApptHour = (time) => {
    if (!time) return 0;
    if (Array.isArray(time)) return parseInt(time[0], 10);
    if (typeof time === 'string') return parseInt(time.split(':')[0], 10);
    return 0;
};
