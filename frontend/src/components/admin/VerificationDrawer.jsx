import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText, Mail, CheckCircle2, AlertCircle, ExternalLink, Download, UserCheck } from 'lucide-react';

const VerificationDrawer = ({ isOpen, onClose, doctor, onApprove, onReject, processingId }) => {
    if (!doctor) return null;

    const profile = doctor.doctorProfile;
    const fullName = [doctor.firstName, doctor.lastName].filter(Boolean).join(' ') || doctor.username || 'System User';

    const documents = [];
    if (profile?.profileImageUrl) documents.push({ label: 'FACIAL ID', url: profile.profileImageUrl, type: 'IMAGE' });
    if (profile?.licenseDocumentUrl) documents.push({ label: 'MEDICAL LICENSE', url: profile.licenseDocumentUrl, type: 'DOCUMENT' });
    
    if (Array.isArray(profile?.documents)) {
        profile.documents.forEach((doc, idx) => {
            if (doc?.url) documents.push({ label: doc.type || `EXTRA DOC ${idx+1}`, url: doc.url, type: 'DOCUMENT' });
        });
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                    />

                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 35, stiffness: 400 }}
                        className="fixed top-0 right-0 bottom-0 w-full md:w-[600px] bg-white shadow-2xl z-[110] flex flex-col overflow-hidden text-slate-800 font-sans"
                    >
                        {/* Clinical Header */}
                        <div className="h-20 border-b border-slate-50 px-8 flex items-center justify-between bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                                    <ShieldCheck size={20} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Credential Verification</h2>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Faculty Audit Protocol</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-50 text-slate-300 hover:text-slate-900 transition-all">
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Audit Body */}
                        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
                            {/* Identity Shard */}
                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex items-center gap-6">
                                <div className="w-20 h-20 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                                    {profile?.profileImageUrl ? (
                                        <img src={profile.profileImageUrl} alt="P" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-bold text-slate-300">{fullName.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{fullName}</h3>
                                        <div className="px-2 py-0.5 bg-amber-50 rounded-md border border-amber-100/50">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600">Pending</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Mail size={12} strokeWidth={1.5} />
                                            <span className="text-[11px] font-medium lowercase font-mono">{doctor.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-teal-600">
                                            <UserCheck size={12} strokeWidth={1.5} />
                                            <span className="text-[11px] font-bold uppercase tracking-widest">Specialist: {profile?.specialization || 'Clinical'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Clinical Metrics Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm transition-all hover:border-teal-100">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">License ID</p>
                                    <p className="text-lg font-bold text-slate-900 font-mono tracking-tighter">#{profile?.licenseNumber || 'N/A'}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm transition-all hover:border-teal-100">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Service Fee</p>
                                    <p className="text-lg font-bold text-slate-900 tabular-nums">LKR {(profile?.consultationFee || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Professional Biography */}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 px-1 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-teal-500" /> BIO SUMMARY
                                </p>
                                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 text-[13px] font-medium leading-relaxed text-slate-600/90 italic">
                                     &ldquo;{profile?.bio || 'No professional biography provided.'}&rdquo;
                                </div>
                            </div>

                            {/* Document Index */}
                            <div className="pb-10">
                                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 px-1 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-teal-500" /> LEGAL ARTIFACTS
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {documents.map((doc, idx) => (
                                        <div key={idx} className="bg-white rounded-xl overflow-hidden border border-slate-100 group transition-all hover:bg-slate-50/30">
                                            <div className="p-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={14} strokeWidth={1.5} className="text-teal-400" />
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{doc.label}</span>
                                                </div>
                                                <a href={doc.url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-slate-300 hover:text-teal-600 hover:bg-white transition-all">
                                                    <Download size={14} strokeWidth={1.5} />
                                                </a>
                                            </div>
                                            <div className="aspect-video bg-slate-100 relative group overflow-hidden flex items-center justify-center">
                                                {doc.url.toLowerCase().endsWith('.pdf') ? (
                                                     <div className="flex flex-col items-center gap-2 text-slate-300 p-4 text-center">
                                                         <FileText size={24} strokeWidth={1.2} />
                                                         <p className="text-[9px] font-bold uppercase tracking-widest">PDF Artifact</p>
                                                     </div>
                                                ) : (
                                                    <img src={doc.url} alt={doc.label} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                                                )}
                                                <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                     <ExternalLink className="text-white drop-shadow-md" size={20} strokeWidth={1.5} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Audit Conclusion Cluster */}
                        <div className="border-t border-slate-50 p-6 grid grid-cols-2 gap-4 bg-white shrink-0">
                            <button
                                onClick={() => onReject(doctor.id)}
                                disabled={processingId === doctor.id}
                                className="h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100 flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                <AlertCircle size={14} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                                <span>Decline Access</span>
                            </button>
                            <button
                                onClick={() => onApprove(doctor.id)}
                                disabled={processingId === doctor.id}
                                className="h-11 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:shadow-xl transition-all border-none flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                <CheckCircle2 size={14} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                                <span>Authorize Profile</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default VerificationDrawer;
