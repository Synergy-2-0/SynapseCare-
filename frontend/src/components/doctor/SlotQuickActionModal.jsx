import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, CalendarPlus, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi } from '@/lib/api';

const SlotQuickActionModal = ({ slot, doctorId, onClose, onSlotBlocked }) => {
    const [loading, setLoading] = useState(false);

    if (!slot) return null;

    const handleBlockSlot = async () => {
        if (!doctorId) {
            toast.error('Doctor ID not found');
            return;
        }

        try {
            setLoading(true);
            const payload = {
                date: format(slot.day, 'yyyy-MM-dd'),
                time: (() => {
                    const timeText = slot.timeStr.replace(/\s+/g, ' ').trim();
                    const [timePart, periodPart] = timeText.split(' ');
                    const [hourPart] = timePart.split(':');
                    let hour = parseInt(hourPart, 10);
                    const period = (periodPart || '').toUpperCase();
                    if (period === 'PM' && hour < 12) hour += 12;
                    if (period === 'AM' && hour === 12) hour = 0;
                    return `${String(hour).padStart(2, '0')}:00:00`;
                })(),
                reason: 'Doctor blocked this slot'
            };

            await appointmentApi.post(`/schedule/doctor/${doctorId}/blocked-slots`, payload);
            
            toast.success(`Slot blocked on ${format(slot.day, 'MMM d')} at ${slot.timeStr}`);
            if (onSlotBlocked) {
                onSlotBlocked({ day: slot.day, timeStr: slot.timeStr });
            }
        } catch (error) {
            console.error('Error blocking slot:', error);
            toast.error('Failed to block slot');
        } finally {
            setLoading(false);
            onClose();
        }
    };

    const handleAction = (actionType) => {
        if (actionType === 'block') {
            handleBlockSlot();
        } else {
            toast.success(`Walk-in logic triggered for ${format(slot.day, 'MMM d')} at ${slot.timeStr}`);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="text-lg font-bold text-slate-800">Quick Slot Action</h3>
                    <button onClick={onClose} className="p-1.5 bg-white hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-5 text-center">
                    <div className="text-sm text-slate-500 font-medium mb-1">Selected Slot:</div>
                    <div className="text-lg font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl py-2 mb-6">
                        {format(slot.day, 'EEEE, MMM d, yyyy')} <br />
                        <span className="text-sm opacity-80">{slot.timeStr}</span>
                    </div>

                    <div className="grid gap-3">
                        <button 
                            onClick={() => handleAction('walkin')}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-700 border border-emerald-200 rounded-xl font-bold transition-all"
                        >
                            <CalendarPlus className="w-5 h-5" /> {loading ? 'Processing...' : 'Book Walk-in Patient'}
                        </button>
                        <button 
                            onClick={() => handleAction('block')}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed text-rose-700 border border-rose-200 rounded-xl font-bold transition-all"
                        >
                            <ShieldAlert className="w-5 h-5" /> {loading ? 'Blocking...' : 'Block this Slot'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlotQuickActionModal;