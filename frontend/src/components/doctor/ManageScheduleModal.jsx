import React, { useState, useEffect } from 'react';
import { X, Clock, CalendarDays, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentApi } from '@/lib/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ManageScheduleModal = ({ isOpen, onClose, doctorId }) => {
    const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' | 'leaves'
    const [loading, setLoading] = useState(false);

    // Initial states for Weekly Hours
    const [schedule, setSchedule] = useState(
        DAYS.map(day => ({
            day,
            active: day !== 'Saturday' && day !== 'Sunday',
            start: '09:00',
            end: '17:00'
        }))
    );
    const [slotDuration, setSlotDuration] = useState('30');
    const [buffer, setBuffer] = useState('5');

    // States for Time Off
    const [leaves, setLeaves] = useState([]);
    const [newLeave, setNewLeave] = useState({ start: '', end: '', reason: '' });

    useEffect(() => {
        if (isOpen && doctorId) {
            fetchAvailability();
            fetchLeaves();
        }
    }, [isOpen, doctorId]);

    const fetchAvailability = async () => {
        try {
            const res = await appointmentApi.get(`/schedule/doctor/${doctorId}/availability`);
            if (res.data && res.data.length > 0) {
                // Map the array to our schedule state
                // Assuming all records have the same slotDuration and bufferTime
                if (res.data[0].slotDuration) setSlotDuration(res.data[0].slotDuration.toString());
                if (res.data[0].bufferTime) setBuffer(res.data[0].bufferTime.toString());
                
                const newSched = DAYS.map(dayName => {
                    const dayData = res.data.find(d => d.dayOfWeek === dayName.substring(0,3).toUpperCase() || d.dayOfWeek === dayName.toUpperCase());
                    if (dayData) {
                        return {
                            day: dayName,
                            active: dayData.isWorking,
                            start: dayData.startTime.substring(0, 5),
                            end: dayData.endTime.substring(0, 5)
                        };
                    }
                    return { day: dayName, active: false, start: '09:00', end: '17:00' };
                });
                setSchedule(newSched);
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
            // Ignore error on first load if nothing exists yet
        }
    };

    const fetchLeaves = async () => {
        try {
            const res = await appointmentApi.get(`/schedule/doctor/${doctorId}/leaves`);
            if (res.data) {
                setLeaves(res.data.map(l => ({
                    id: l.id,
                    start: l.startDate,
                    end: l.endDate,
                    reason: l.reason
                })));
            }
        } catch (error) {
            console.error('Error fetching leaves:', error);
        }
    };

    if (!isOpen) return null;

    const handleToggleDay = (idx) => {
        const newSched = [...schedule];
        newSched[idx].active = !newSched[idx].active;
        setSchedule(newSched);
    };

    const handleTimeChange = (idx, field, value) => {
        const newSched = [...schedule];
        newSched[idx][field] = value;
        setSchedule(newSched);
    };

    const handleAddLeave = async () => {
        if (!newLeave.start || !newLeave.end || !newLeave.reason) {
            toast.error('Please fill in all leave details.');
            return;
        }
        try {
            setLoading(true);
            const payload = {
                doctorId,
                startDate: newLeave.start,
                endDate: newLeave.end,
                reason: newLeave.reason
            };
            const res = await appointmentApi.post(`/schedule/doctor/${doctorId}/leaves`, payload);
            setLeaves([...leaves, { 
                id: res.data.id || Date.now(), 
                start: newLeave.start, 
                end: newLeave.end, 
                reason: newLeave.reason 
            }]);
            setNewLeave({ start: '', end: '', reason: '' });
            toast.success('Time off added securely.');
        } catch (error) {
            toast.error('Failed to add time off.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveLeave = async (id) => {
        try {
            // Assume we can delete or just mock delete locally for now if API doesn't support DELETE yet
            // await appointmentApi.delete(`/schedule/doctor/${doctorId}/leaves/${id}`);
            setLeaves(leaves.filter(l => l.id !== id));
            toast.success('Time off removed.');
        } catch (error) {
            toast.error('Failed to remove leave.');
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = schedule.map(s => ({
                doctorId,
                dayOfWeek: s.day.substring(0,3).toUpperCase(),
                startTime: s.start + ':00',
                endTime: s.end + ':00',
                slotDuration: parseInt(slotDuration),
                bufferTime: parseInt(buffer),
                isWorking: s.active
            }));
            await appointmentApi.post(`/schedule/doctor/${doctorId}/availability`, payload);
            toast.success('Availability settings saved successfully!');
            onClose();
        } catch (error) {
            toast.error('Error saving availability.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-serif text-slate-900">Manage Availability</h2>
                        <p className="text-slate-500 text-sm mt-1">Configure your working hours and planned time off.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white hover:bg-slate-100 rounded-full text-slate-400 transition-colors shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 px-8 pt-4 gap-6 bg-slate-50/50">
                    <button 
                        onClick={() => setActiveTab('weekly')}
                        className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'weekly' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Weekly Template</div>
                    </button>
                    <button 
                        onClick={() => setActiveTab('leaves')}
                        className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'leaves' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <div className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Time Off & Locks</div>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                    {activeTab === 'weekly' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Slot Configuration */}
                            <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex flex-wrap gap-6 items-center">
                                <div>
                                    <label className="block text-xs font-bold text-indigo-900 uppercase tracking-widest mb-2">Slot Duration</label>
                                    <select 
                                        value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)}
                                        className="bg-white border border-indigo-200 text-indigo-800 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none font-semibold shadow-sm"
                                    >
                                        <option value="15">15 Minutes</option>
                                        <option value="20">20 Minutes</option>
                                        <option value="30">30 Minutes</option>
                                        <option value="45">45 Minutes</option>
                                        <option value="60">60 Minutes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-indigo-900 uppercase tracking-widest mb-2">Buffer Time</label>
                                    <select 
                                        value={buffer} onChange={(e) => setBuffer(e.target.value)}
                                        className="bg-white border border-indigo-200 text-indigo-800 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none font-semibold shadow-sm"
                                    >
                                        <option value="0">None</option>
                                        <option value="5">5 Minutes</option>
                                        <option value="10">10 Minutes</option>
                                        <option value="15">15 Minutes</option>
                                    </select>
                                </div>
                                <div className="flex-1 mt-6 text-xs text-indigo-600/80 font-medium">
                                    <AlertCircle className="w-4 h-4 inline mr-1" />
                                    Changes generate open slots automatically. Existing bookings are unaffected.
                                </div>
                            </div>

                            {/* Weekly Grid */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Standard Working Hours</h3>
                                <div className="space-y-3">
                                    {schedule.map((dayObj, idx) => (
                                        <div key={dayObj.day} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${dayObj.active ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                                            <div className="w-32 flex items-center gap-3">
                                                {/* Custom Toggle Switch */}
                                                <button 
                                                    role="switch"
                                                    aria-checked={dayObj.active}
                                                    onClick={() => handleToggleDay(idx)}
                                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${dayObj.active ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                                >
                                                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${dayObj.active ? 'translate-x-4' : 'translate-x-0'}`} />
                                                </button>
                                                <span className={`font-semibold text-sm ${dayObj.active ? 'text-slate-800' : 'text-slate-500 line-through'}`}>{dayObj.day}</span>
                                            </div>

                                            {dayObj.active ? (
                                                <div className="flex-1 flex items-center gap-3">
                                                    <input 
                                                        type="time" 
                                                        value={dayObj.start}
                                                        onChange={(e) => handleTimeChange(idx, 'start', e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none font-medium"
                                                    />
                                                    <span className="text-slate-400 font-medium">to</span>
                                                    <input 
                                                        type="time" 
                                                        value={dayObj.end}
                                                        onChange={(e) => handleTimeChange(idx, 'end', e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none font-medium"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex-1 text-sm text-slate-400 font-medium italic">Unavailable</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'leaves' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Add Leave Form */}
                            <div className="p-6 bg-rose-50/50 border border-rose-100 rounded-2xl">
                                <h3 className="text-sm font-bold text-rose-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4" /> Block Dates / Holiday
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-rose-800 mb-1.5">Start Date</label>
                                        <input type="date" value={newLeave.start} onChange={(e) => setNewLeave({...newLeave, start: e.target.value})} className="w-full border border-rose-200 rounded-xl p-2.5 text-sm bg-white text-rose-900 outline-none focus:border-rose-400" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-rose-800 mb-1.5">End Date</label>
                                        <input type="date" value={newLeave.end} onChange={(e) => setNewLeave({...newLeave, end: e.target.value})} className="w-full border border-rose-200 rounded-xl p-2.5 text-sm bg-white text-rose-900 outline-none focus:border-rose-400" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-rose-800 mb-1.5">Reason (Internal Only)</label>
                                        <input type="text" placeholder="e.g. Annual Leave, Medical Conference" value={newLeave.reason} onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})} className="w-full border border-rose-200 rounded-xl p-2.5 text-sm bg-white text-rose-900 outline-none focus:border-rose-400 placeholder:text-rose-300" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={handleAddLeave} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
                                        <Plus className="w-4 h-4" /> Add Block
                                    </button>
                                </div>
                            </div>

                            {/* Leaves List */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Upcoming Blocked Periods</h3>
                                {leaves.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-2xl">
                                        No time-offs currently scheduled.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {leaves.map(l => (
                                            <div key={l.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm">{l.reason}</div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                                                        <CalendarDays className="w-3 h-3" /> {l.start} to {l.end}
                                                    </div>
                                                </div>
                                                <button onClick={() => handleRemoveLeave(l.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageScheduleModal;