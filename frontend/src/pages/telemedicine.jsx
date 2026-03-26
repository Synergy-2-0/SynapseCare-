import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    MessageSquare,
    Maximize,
    Shield,
    Clock,
    User,
    ArrowLeft,
    FileText
} from 'lucide-react';
import Link from 'next/link';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const TelemedicinePage = () => {
    const router = useRouter();
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [duration, setDuration] = useState(0);

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
        <div className="min-h-screen bg-slate-900 flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/patient"
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-semibold text-white">Video Consultation</h1>
                            <Badge variant="success" size="sm">LIVE</Badge>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            End-to-end encrypted
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="text-white font-medium">{formatTime(duration)}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 flex gap-6 overflow-hidden">
                {/* Video Area */}
                <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
                    {!cameraOff ? (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Video className="w-10 h-10 text-slate-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">
                                Waiting for Doctor
                            </h2>
                            <p className="text-slate-400 text-sm">
                                Your specialist will join shortly
                            </p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-10 h-10 text-slate-500" />
                            </div>
                            <p className="text-slate-400 text-sm">Camera Off</p>
                        </div>
                    )}

                    {/* Connection Status */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-900/80 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                        <span className="text-xs text-white">Connected</span>
                    </div>

                    {/* Self View */}
                    <div className="absolute bottom-4 right-4 w-48 aspect-video bg-slate-950 rounded-lg border border-slate-700 flex items-center justify-center">
                        <span className="text-xs text-slate-500">You</span>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 flex flex-col gap-4">
                    {/* Shared Records */}
                    <div className="flex-1 bg-slate-800 rounded-xl p-5 flex flex-col">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            Shared Records
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {[
                                { name: 'Health_Report.pdf', size: '2.4 MB' },
                                { name: 'MRI_Results.jpg', size: '18 MB' }
                            ].map((file, i) => (
                                <div
                                    key={i}
                                    className="p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                    <p className="text-sm text-white font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-slate-400">{file.size}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-slate-800 rounded-xl p-4">
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setMuted(!muted)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                    muted
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-slate-700 text-white hover:bg-slate-600'
                                }`}
                            >
                                {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => setCameraOff(!cameraOff)}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                    cameraOff
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-slate-700 text-white hover:bg-slate-600'
                                }`}
                            >
                                {cameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                            </button>
                            <button className="w-12 h-12 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-colors">
                                <MessageSquare className="w-5 h-5" />
                            </button>
                            <button className="w-12 h-12 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-colors">
                                <Maximize className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard/patient')}
                            className="w-full mt-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                        >
                            <PhoneOff className="w-5 h-5" />
                            End Call
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-3 border-t border-slate-800 flex justify-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Secure
                </span>
                <span className="flex items-center gap-1">
                    <Video className="w-3 h-3" /> HD Video
                </span>
            </footer>
        </div>
    );
};

export default TelemedicinePage;
