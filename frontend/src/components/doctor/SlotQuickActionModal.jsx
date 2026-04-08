import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, ShieldAlert, CalendarPlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi } from '@/lib/api';

const SlotQuickActionModal = ({ slot, doctorId, onClose, onSlotBlocked }) => {
    const [loading, setLoading] = useState(false);
    const [untilTime, setUntilTime] = useState('');
    const [fromTime, setFromTime] = useState('06:00');

    useEffect(() => {
        if (slot) {
            // Requirement defaults: 6 AM to clicked slot
            setFromTime('06:00');
            const clickedTime = parseTimeStr(slot.timeStr);
            setUntilTime(clickedTime.substring(0, 5));
        }
    }, [slot]);

    if (!slot) return null;

    function parseTimeStr(timeStr) {
        const timeText = timeStr.replace(/\s+/g, ' ').trim();
        const [timePart, periodPart] = timeText.split(' ');
        const [hourPart] = timePart.split(':');
        let hour = parseInt(hourPart, 10);
        const period = (periodPart || '').toUpperCase();
        if (period === 'PM' && hour < 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return `${String(hour).padStart(2, '0')}:00:00`;
    };

    const handleApplyBlock = async () => {
        if (!doctorId) return;
        try {
            setLoading(true);
            
            // Dynamic start and end times
            const startHour = parseInt(fromTime.split(':')[0], 10);
            const endHour = parseInt(untilTime.split(':')[0], 10);

            const batchRequests = [];
            // Block from startHour up to and including the selected endHour
            for (let h = startHour; h <= endHour; h++) {
                batchRequests.push({
                    date: format(slot.day, 'yyyy-MM-dd'),
                    time: `${String(h).padStart(2, '0')}:00:00`,
                    reason: 'Batch Clinical Block'
                });
            }

            if (batchRequests.length > 0) {
                await appointmentApi.post(`/doctor/${doctorId}/blocked-slots/bulk`, batchRequests);
                const startLabel = startHour > 12 ? `${startHour-12} PM` : (startHour === 12 ? '12 PM' : (startHour === 0 ? '12 AM' : `${startHour} AM`));
                const endLabel = endHour > 12 ? `${endHour-12} PM` : (endHour === 12 ? '12 PM' : (endHour === 0 ? '12 AM' : `${endHour} AM`));
                toast.success(`Schedule blocked from ${startLabel} to ${endLabel}`);
            }
            
            if (onSlotBlocked) onSlotBlocked();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to apply block');
        } finally {
            setLoading(false);
        }
    };

    const handleAddExtraSlot = async () => {
        if (!doctorId) return;
        try {
            setLoading(true);
            const startTime = parseTimeStr(slot.timeStr);
            const payload = {
                date: format(slot.day, 'yyyy-MM-dd'),
                time: startTime
            };
            await appointmentApi.post(`/doctor/${doctorId}/extra-slots`, payload);
            toast.success(`Extra slot added for ${slot.timeStr}`);
            if (onSlotBlocked) onSlotBlocked();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add extra slot');
        } finally {
            setLoading(false);
        }
    };

    const timeOptions = Array.from({ length: 18 }).map((_, i) => {
        const h = i + 5; // 5 AM to 10 PM
        const label = h > 12 ? `${h-12} PM` : (h === 12 ? '12 PM' : `${h} AM`);
        const value = `${String(h).padStart(2, '0')}:00`;
        return { label, value };
    });

    const isAvailable = slot.isAvailable;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
                {/* Header */}
                <div className="bg-slate-50 p-8 border-b border-slate-100 relative">
                    <div className="absolute top-4 right-4">
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Manage Clinical Availability</div>
                    <h3 className="text-2xl font-serif text-slate-900 text-center">{format(slot.day, 'EEEE, MMM d')}</h3>
                    <div className="flex justify-center mt-4">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${isAvailable ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {slot.timeStr} • {isAvailable ? 'Standard Slot' : 'Extra Availability'}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 space-y-8">
                    {isAvailable ? (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Clinical Block Range</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center gap-3">
                                        <select 
                                            value={fromTime} 
                                            onChange={(e) => setFromTime(e.target.value)}
                                            className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-300 appearance-none transition-all"
                                        >
                                            {timeOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>From {opt.label}</option>
                                            ))}
                                        </select>
                                        <div className="text-slate-300 font-black">→</div>
                                        <select 
                                            value={untilTime} 
                                            onChange={(e) => setUntilTime(e.target.value)}
                                            className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-bold outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-300 appearance-none transition-all"
                                        >
                                            {timeOptions.filter(o => parseInt(o.value) >= parseInt(fromTime)).map(opt => (
                                                <option key={opt.value} value={opt.value}>Until {opt.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 font-medium leading-relaxed italic text-center px-4">
                                This will restrict patient bookings for the selected range.
                            </p>

                            <button 
                                onClick={handleApplyBlock}
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                                Apply Clinical Block
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50 text-center">
                                <CalendarPlus className="w-8 h-8 text-indigo-500 mx-auto mb-3" />
                                <h4 className="font-bold text-slate-800 mb-1">Add Extra Availability</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">Opening this slot allows patients to book an appointment even if it&apos;s outside your standard clinic hours.</p>
                            </div>

                            <button 
                                onClick={handleAddExtraSlot}
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
                                Add Extra Slot for {slot.timeStr}
                            </button>
                        </div>
                    )}
                </div>

                <div className="px-8 pb-8 text-center">
                    <button onClick={onClose} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
                        Cancel Action
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SlotQuickActionModal;