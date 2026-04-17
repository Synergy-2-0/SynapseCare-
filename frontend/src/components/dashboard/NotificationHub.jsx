import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, 
    MessageSquare, 
    Smartphone, 
    Bell, 
    CheckCircle2, 
    Shield, 
    Activity, 
    Clock, 
    Settings,
    ChevronRight,
    Save,
    RefreshCw
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

/**
 * NotificationHub
 * 
 * High-fidelity, preference-aware notification management console.
 * Allows patients to set a single primary channel for appointment confirmations.
 */
const NotificationHub = () => {
    const { preferences, updatePreferences } = useNotifications();
    const [localPreferences, setLocalPreferences] = useState(null);
    const [saving, setSaving] = useState(false);

    // Sync local state when preferences load
    useEffect(() => {
        if (preferences) {
            // Ensure preferredAppointmentChannel has a default value if null
            setLocalPreferences({
                ...preferences,
                preferredAppointmentChannel: preferences.preferredAppointmentChannel || 'EMAIL'
            });
        }
    }, [preferences]);

    const handleToggle = (key) => {
        setLocalPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleChannelChange = (channel) => {
        setLocalPreferences(prev => ({
            ...prev,
            preferredAppointmentChannel: channel
        }));
    };

    const handleSync = async () => {
        setSaving(true);
        try {
            await updatePreferences(localPreferences);
        } catch (err) {
            console.error('Failed to sync preferences:', err);
        } finally {
            setSaving(false);
        }
    };

    if (!localPreferences) return (
        <div className="flex items-center justify-center py-20">
            <Activity className="animate-spin text-teal-500 opacity-20" size={48} />
        </div>
    );

    const channels = [
        { 
            id: 'EMAIL', 
            name: 'Email Matrix', 
            icon: Mail, 
            color: 'blue', 
            enabled: localPreferences.emailEnabled,
            toggleKey: 'emailEnabled'
        },
        { 
            id: 'WHATSAPP', 
            name: 'WhatsApp Secure', 
            icon: MessageSquare, 
            color: 'green', 
            enabled: localPreferences.whatsappEnabled,
            toggleKey: 'whatsappEnabled'
        },
        { 
            id: 'SMS', 
            name: 'SMS Circuit', 
            icon: Smartphone, 
            color: 'indigo', 
            enabled: localPreferences.smsEnabled,
            toggleKey: 'smsEnabled'
        }
    ];

    return (
        <div className="space-y-12 pb-20">
            {/* Header Identity Shard */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Notification Hub</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-4 flex items-center gap-2">
                        <Shield size={14} className="text-teal-500" /> Secure Clinical Alert Routing
                    </p>
                </div>
                <button 
                    onClick={handleSync}
                    disabled={saving}
                    className={`h-14 px-8 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all ${
                        saving ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-teal-600 shadow-xl shadow-slate-200'
                    }`}
                >
                    {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    {saving ? 'Synchronizing...' : 'Save Preferences'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Channel Masters */}
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Medium Masters</h3>
                    {channels.map((ch) => (
                        <div key={ch.id} className={`p-6 rounded-[2rem] border transition-all duration-500 flex items-center justify-between group ${
                            ch.enabled ? 'bg-white border-slate-100 shadow-premium' : 'bg-slate-50 border-transparent opacity-60'
                        }`}>
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                                    ch.enabled ? `bg-${ch.color}-50 text-${ch.color}-500` : 'bg-slate-200 text-slate-400'
                                }`}>
                                    <ch.icon size={28} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <span className={`block text-sm font-bold tracking-tight ${ch.enabled ? 'text-slate-900' : 'text-slate-400'}`}>
                                        {ch.name}
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {ch.enabled ? 'Service Active' : 'Service Deactivated'}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleToggle(ch.toggleKey)}
                                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
                                    ch.enabled ? 'bg-teal-500' : 'bg-slate-300'
                                }`}
                            >
                                <motion.div 
                                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                                    animate={{ x: ch.enabled ? 24 : 0 }}
                                />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Preferred Confirmation Route */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="surface-card p-10 bg-white shadow-premium relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                        
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Primary Confirmation Channel</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 underline decoration-teal-500/30 decoration-2 underline-offset-8">Select exactly one medium for appointment alerts</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {channels.map((ch) => (
                                    <label 
                                        key={ch.id}
                                        className={`relative cursor-pointer group transition-all duration-500 ${!ch.enabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    >
                                        <input 
                                            type="radio"
                                            name="preferredChannel"
                                            className="sr-only"
                                            checked={localPreferences.preferredAppointmentChannel === ch.id}
                                            onChange={() => ch.enabled && handleChannelChange(ch.id)}
                                            disabled={!ch.enabled}
                                        />
                                        <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center text-center gap-4 ${
                                            localPreferences.preferredAppointmentChannel === ch.id 
                                                ? 'border-teal-500 bg-teal-50/30 ring-4 ring-teal-50' 
                                                : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                                        }`}>
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                                                localPreferences.preferredAppointmentChannel === ch.id 
                                                    ? 'bg-teal-500 text-white rotate-[360deg]' 
                                                    : 'bg-white text-slate-400 shadow-sm'
                                            }`}>
                                                {localPreferences.preferredAppointmentChannel === ch.id ? <CheckCircle2 size={32} /> : <ch.icon size={32} strokeWidth={1.5} />}
                                            </div>
                                            <div>
                                                <span className="block text-sm font-black text-slate-900 tracking-tight uppercase">{ch.name.split(' ')[0]}</span>
                                                <span className="text-[10px] font-bold text-slate-400 block mt-1">Confirmed Path</span>
                                            </div>
                                            <AnimatePresence>
                                                {localPreferences.preferredAppointmentChannel === ch.id && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="h-6 px-3 bg-teal-500 text-white rounded-full flex items-center gap-1"
                                                    >
                                                        <span className="text-[8px] font-black uppercase tracking-widest">Active Route</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="p-8 bg-slate-900 rounded-[2rem] text-white flex items-start gap-5 relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-500/10 blur-2xl pointer-events-none" />
                                <div className="p-3 bg-white/10 rounded-xl">
                                    <Bell className="text-teal-400" size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold tracking-tight uppercase tracking-widest">Routing Logic Intelligence</h4>
                                    <p className="text-xs font-medium text-slate-400 leading-relaxed">
                                        When a specialist confirms your slot, SynapseCare will bypass all other nodes and dispatch your clinical identity shard **ONLY** through the route selected above.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Other Granular Toggles */}
                    <div className="surface-card p-10 bg-white shadow-premium">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-8">Additional Discovery Shards</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            {[
                                { label: 'In-App Alerts', key: 'inAppEnabled', icon: Bell },
                                { label: 'Telemedicine Reminders', key: 'whatsappTelemedicineSession', icon: Clock },
                                { label: 'Prescription Readiness', key: 'whatsappPrescriptionReady', icon: Shield },
                                { label: 'Appointment Reminders', key: 'whatsappAppointmentReminder', icon: Activity }
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0 group cursor-pointer" onClick={() => handleToggle(item.key)}>
                                    <div className="flex items-center gap-4">
                                        <item.icon size={18} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                                        <span className="text-sm font-medium text-slate-600 transition-colors group-hover:text-slate-900">{item.label}</span>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${localPreferences[item.key] ? 'bg-teal-500' : 'bg-slate-200'}`}>
                                        <motion.div 
                                            className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full"
                                            animate={{ x: localPreferences[item.key] ? 20 : 0 }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationHub;
