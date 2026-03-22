import React, { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Shield, Users, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const TelemedicinePage = () => {
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col p-4 md:p-8 text-white relative overflow-hidden font-bold italic">
            <header className="relative z-10 flex justify-between items-center mb-8 italic">
                <div className="flex items-center gap-4 italic font-bold">
                    <Link href="/dashboard/patient" className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors italic"><ArrowLeft className="w-5 h-5 italic" /></Link>
                    <div>
                        <h1 className="text-xl font-black italic italic">Secure Consultation Hub</h1>
                        <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic italic"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse italic"></span> Point-to-Point Encryption</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8 italic font-bold">
                <div className="lg:col-span-3 relative rounded-[3rem] overflow-hidden bg-slate-800 border-2 border-white/5 shadow-2xl flex items-center justify-center italic">
                    <div className="text-center italic">
                        <div className="w-32 h-32 bg-primary/20 text-primary rounded-full flex items-center justify-center text-4xl font-black mx-auto mb-6 italic">DR</div>
                        <h2 className="text-2xl font-black italic">Dr. Lead Consultant</h2>
                        <p className="text-slate-400 font-bold italic opacity-70 italic">Establishing node connection...</p>
                    </div>
                </div>

                <div className="flex-1 bg-white/5 border border-white/10 rounded-[2rem] p-8 flex flex-col gap-6 backdrop-blur-sm italic font-bold italic font-bold">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6 italic">
                        <MessageSquare className="w-6 h-6 text-primary italic" />
                        <h3 className="font-black text-lg italic">Clinical Records</h3>
                    </div>
                </div>
            </div>

            <div className="relative z-10 flex justify-center items-center gap-6 pb-4 italic">
                <button onClick={() => setMuted(!muted)} className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all italic ${muted ? 'bg-rose-500 text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>{muted ? <MicOff className="w-6 h-6 italic" /> : <Mic className="w-6 h-6 italic" />}</button>
                <button onClick={() => setCameraOff(!cameraOff)} className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all italic ${cameraOff ? 'bg-rose-500 text-white' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>{cameraOff ? <VideoOff className="w-6 h-6 italic" /> : <Video className="w-6 h-6 italic" />}</button>
                <Link href="/dashboard/patient" className="w-20 h-20 bg-rose-600 hover:bg-rose-700 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-rose-900/40 hover:scale-110 active:scale-95 transition-all italic font-bold"><PhoneOff className="w-8 h-8 italic" /></Link>
            </div>
        </div>
    );
};

export default TelemedicinePage;
