import React, { useState, useEffect } from 'react';
import { 
    Video, 
    VideoOff, 
    Mic, 
    MicOff, 
    PhoneOff, 
    MessageSquare, 
    Users, 
    Settings, 
    Maximize,
    Shield,
    Activity,
    Clock,
    User,
    ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';

const TelemedicinePage = () => {
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [duration, setDuration] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => setDuration(d => d + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (s) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-bold italic text-white italic font-bold">
            <nav className="p-10 flex justify-between items-center bg-transparent relative z-50 italic">
                <div className="flex items-center gap-6 italic">
                    <Link href="/dashboard/patient" className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white shadow-2xl hover:bg-white/10 transition-all italic">
                        <ArrowLeft className="w-5 h-5 italic" />
                    </Link>
                    <div className="space-y-1 italic font-bold">
                         <div className="flex items-center gap-3 italic"><h1 className="text-3xl font-black italic tracking-tighter italic font-bold">Video Consultation</h1><div className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest italic animate-pulse">LIVE</div></div>
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-bold flex items-center gap-2 italic">Secured with Private Encryption</p>
                    </div>
                </div>
                <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center gap-6 italic shadow-2xl">
                    <Clock className="w-5 h-5 text-emerald-400 italic" />
                    <span className="text-xl font-black italic italic font-bold tracking-tighter">{formatTime(duration)}</span>
                </div>
            </nav>

            <main className="flex-1 p-10 flex gap-12 italic font-bold overflow-hidden relative">
                <div className="absolute inset-0 bg-indigo-600/5 blur-[150px] pointer-events-none"></div>
                
                <div className="flex-1 relative rounded-[4rem] overflow-hidden bg-slate-900 border-2 border-white/5 shadow-2xl flex items-center justify-center italic">
                    {!cameraOff ? (
                        <div className="absolute inset-0 flex items-center justify-center italic">
                             <div className="text-center italic animate-pulse">
                                <Video className="w-24 h-24 text-indigo-400 mx-auto mb-8 italic opacity-40 shrink-0" />
                                <h2 className="text-3xl font-black italic italic font-bold tracking-tight">Waiting for Doctor to join...</h2>
                                <p className="text-slate-400 text-lg font-bold italic font-bold uppercase tracking-widest mt-2 italic shadow-sm">Your specialist will be here shortly</p>
                             </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-6 italic font-bold">
                             <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center italic"><User className="w-14 h-14 text-slate-700 italic" /></div>
                             <span className="text-slate-500 font-black uppercase text-xs tracking-[0.3em] italic italic font-bold">Camera Turned Off</span>
                        </div>
                    )}
                    
                    <div className="absolute bottom-12 right-12 w-80 aspect-video bg-slate-950 rounded-[2.5rem] border-2 border-white/10 shadow-2xl overflow-hidden z-20 italic">
                        <div className="absolute inset-0 flex items-center justify-center italic">
                            <span className="text-xs text-slate-700 font-black uppercase tracking-[0.2em] italic font-bold italic italic font-bold italic">You</span>
                        </div>
                    </div>

                    <div className="absolute top-12 left-12 italic">
                         <div className="px-6 py-3 bg-slate-950/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-4 italic shadow-2xl">
                             <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse italic"></div>
                             <span className="font-black text-xs uppercase tracking-widest italic font-bold">Connection Stable</span>
                         </div>
                    </div>
                </div>

                <div className="w-[450px] flex flex-col gap-12 italic font-bold">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-[3.5rem] p-10 flex flex-col italic shadow-2xl overflow-hidden">
                         <div className="flex justify-between items-center mb-10 italic font-bold">
                             <h3 className="text-xl font-black italic tracking-tighter italic font-bold">Shared Records</h3>
                             <Users className="w-5 h-5 text-indigo-400 italic" />
                         </div>
                         <div className="flex-1 overflow-y-auto space-y-6 italic font-bold custom-scrollbar">
                             {[
                                { name: 'Health_Report_002.pdf', size: '2.4 MB', type: 'Medical' },
                                { name: 'MRI_Scan_Results.jpg', size: '184 MB', type: 'Imaging' }
                             ].map((f, i) => (
                                 <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:bg-white/10 transition-all italic font-bold">
                                     <div className="flex items-center gap-4 italic italic font-bold mb-4">
                                         <Activity className="w-6 h-6 text-indigo-400 italic shrink-0" />
                                         <div><div className="text-sm font-black italic italic font-bold group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{f.name}</div><div className="text-[10px] text-slate-500 font-black tracking-widest uppercase italic">{f.size} • {f.type}</div></div>
                                     </div>
                                     <button className="w-full py-3 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg italic transition-all active:scale-[0.98]">Review Document</button>
                                 </div>
                             ))}
                         </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10 flex gap-4 justify-between items-center italic shadow-2xl">
                         <button onClick={() => setMuted(!muted)} className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${muted ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'} italic`}>
                             {muted ? <MicOff className="w-6 h-6 italic" /> : <Mic className="w-6 h-6 italic" />}
                         </button>
                         <button onClick={() => setCameraOff(!cameraOff)} className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${cameraOff ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'} italic`}>
                             {cameraOff ? <VideoOff className="w-6 h-6 italic" /> : <Video className="w-6 h-6 italic" />}
                         </button>
                         <button className="w-16 h-16 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all italic"><Maximize className="w-6 h-6 italic" /></button>
                         <button onClick={() => router.push('/dashboard/patient')} className="flex-1 h-16 bg-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-rose-600/30 hover:bg-rose-500 transition-all italic flex items-center justify-center gap-3 active:scale-[0.98]">
                            <PhoneOff className="w-6 h-6 italic" /> End Call
                         </button>
                    </div>
                </div>
            </main>

            <footer className="p-10 flex justify-center gap-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">
                 <div className="flex items-center gap-3 italic"><Shield className="w-3 h-3 text-emerald-500 italic" /> Secure Connection</div>
                 <div className="flex items-center gap-3 italic"><Users className="w-3 h-3 text-indigo-400 italic" /> Private Session</div>
                 <div className="flex items-center gap-3 italic"><Activity className="w-3 h-3 text-rose-500 italic" /> HD Quality</div>
            </footer>
        </div>
    );
};

export default TelemedicinePage;
