import React, { useState } from 'react';
import { 
    format, addDays, startOfWeek, addWeeks, subWeeks, subDays, 
    setHours, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, 
    isSameMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, Video, User, List, Calendar as CalendarIcon, Grid, Settings } from 'lucide-react';
import ManageScheduleModal from './ManageScheduleModal';
import SlotQuickActionModal from './SlotQuickActionModal';

const getStatusColor = (status) => {
    switch (status) {
        case 'CONFIRMED':
        case 'PAID':
            return 'bg-blue-50 border-blue-200 text-blue-800 hover:border-blue-400';
        case 'IN_PROGRESS':
            return 'bg-green-50 border-green-400 text-green-900 border-2 animate-pulse';
        case 'COMPLETED':
            return 'bg-gray-100 border-gray-300 text-gray-600';
        case 'MISSED':
        case 'CANCELLED':
            return 'bg-red-50 border-red-200 text-red-700';
        case 'BLOCKED':
            return 'bg-slate-800 border-slate-900 text-white';
        default: // PENDING / AVAILABLE
            return 'bg-amber-50 border-amber-200 text-amber-800 hover:border-amber-400';
    }
};

const ScheduleTab = ({ appointments = [], onAppointmentClick, doctorId }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('week'); // 'day', 'week', 'month'
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedEmptySlot, setSelectedEmptySlot] = useState(null);
    
    // Dates math
    const startDateWeek = startOfWeek(currentDate, { weekStarts: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDateWeek, i));
    const hours = Array.from({ length: 11 }).map((_, i) => i + 8); // 8 AM to 6 PM

    const monthStart = startOfMonth(currentDate);
    const monthStartGrid = startOfWeek(monthStart, { weekStarts: 1 });
    const monthDaysGrid = Array.from({ length: 42 }).map((_, i) => addDays(monthStartGrid, i));

    const goNext = () => {
        if (view === 'day') setCurrentDate(addDays(currentDate, 1));
        else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(monthStart, 32)); // jump to next month safely
    };
    
    const goPrev = () => {
        if (view === 'day') setCurrentDate(subDays(currentDate, 1));
        else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(addDays(monthStart, -1)); // prev month
    };

    const isTelemed = (appt) => appt.type === 'TELEMEDICINE' || appt.mode === 'TELEMEDICINE';

    // Renders a single appointment chip
    const renderAppt = (appt) => {
        const telemed = isTelemed(appt);
        const colorClasses = getStatusColor(appt.status);

        return (
            <div 
                key={appt.id} 
                onClick={() => onAppointmentClick && onAppointmentClick(appt)}
                className={`w-full rounded-xl p-2.5 cursor-pointer shadow-sm border transition-all hover:scale-[1.02] hover:shadow-md mb-2 ${colorClasses}`}
            >
                <div className="flex items-center gap-1.5 justify-between mb-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                        {telemed ? <Video className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {telemed ? 'Video' : 'Clinic'}
                    </span>
                    <span className="text-[10px] font-semibold opacity-70">{appt.time}</span>
                </div>
                <div className="text-xs font-bold leading-tight line-clamp-2">
                    Pt #{appt.patientId}
                </div>
                <div className="text-[9px] mt-1 font-semibold uppercase opacity-80">{appt.status}</div>
            </div>
        );
    };

    return (
        <div className="surface-card bg-white p-6 xl:p-8 min-h-[600px] flex flex-col">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h3 className="text-3xl font-serif text-slate-900">Schedule & Availability</h3>
                    <p className="text-slate-500 font-medium mt-1">Manage your clinic and telemedicine hours.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <button 
                        onClick={() => setIsSettingsOpen(true)} 
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold transition-all shadow-sm border border-indigo-100"
                    >
                        <Settings className="w-4 h-4" /> Manage Availability
                    </button>
                    
                    {/* View Toggles */}
                    <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/60 shadow-inner">
                        <button 
                            onClick={() => setView('day')} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'day' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <List className="w-4 h-4" /> Day
                        </button>
                        <button 
                            onClick={() => setView('week')} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <CalendarIcon className="w-4 h-4" /> Week
                        </button>
                        <button 
                            onClick={() => setView('month')} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Grid className="w-4 h-4" /> Month
                        </button>
                    </div>

                    {/* Date Navigation */}
                    <div className="flex items-center gap-3 bg-slate-50/80 p-2 rounded-2xl border border-slate-200/60 shadow-inner min-w-[280px] justify-between">
                        <button onClick={goPrev} className="p-2 bg-white hover:bg-slate-100 rounded-xl shadow-sm text-slate-600 border border-slate-200/50">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="font-semibold text-slate-700 text-center tracking-wide text-sm whitespace-nowrap">
                            {view === 'day' && format(currentDate, 'EEEE, MMM d, yyyy')}
                            {view === 'week' && `${format(startDateWeek, 'MMM d')} - ${format(addDays(startDateWeek, 6), 'MMM d, yyyy')}`}
                            {view === 'month' && format(currentDate, 'MMMM yyyy')}
                        </span>
                        <button onClick={goNext} className="p-2 bg-white hover:bg-slate-100 rounded-xl shadow-sm text-slate-600 border border-slate-200/50">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Stage */}
            <div className="flex-1 min-h-[600px] border border-slate-200/60 rounded-[2xl] bg-slate-50/30 shadow-inner overflow-hidden flex flex-col">
                
                {view === 'week' && (
                    <div className="flex-1 overflow-auto relative">
                        <div className="grid grid-cols-8 min-w-[900px]">
                            <div className="p-4 border-b border-r border-slate-200/60 text-center font-bold text-slate-400 text-xs uppercase tracking-widest sticky top-0 bg-slate-50/95 backdrop-blur-md z-20 flex flex-col justify-end pb-3">Time</div>
                            {weekDays.map(day => {
                                const isToday = isSameDay(day, new Date());
                                return (
                                    <div key={day.toString()} className={`p-3 border-b border-slate-200/60 text-center sticky top-0 z-10 backdrop-blur-md ${isToday ? 'bg-teal-50 border-teal-100 ring-1 ring-teal-500/20' : 'bg-slate-50/95'}`}>
                                        <div className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${isToday ? 'text-teal-600' : 'text-slate-400'}`}>{format(day, 'EEE')}</div>
                                        <div className={`text-xl font-serif ${isToday ? 'text-teal-700 font-bold' : 'text-slate-700'}`}>{format(day, 'd')}</div>
                                        {isToday && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500"></div>}
                                    </div>
                                );
                            })}
                            {hours.map(hour => (
                                <React.Fragment key={hour}>
                                    <div className="p-3 border-r border-b border-slate-200/60 flex items-center justify-center text-[10px] font-bold tracking-widest uppercase text-slate-400 bg-white sticky left-0 z-10">
                                        {format(setHours(new Date(), hour), 'h a')}
                                    </div>
                                    {weekDays.map(day => {
                                        const isToday = isSameDay(day, new Date());
                                        const slotAppts = appointments.filter(a => {
                                            if(!a.date || !a.time) return false;
                                            const isSameD = isSameDay(day, new Date(a.date));
                                            const hStr = hour > 12 ? (hour-12).toString() : hour.toString();
                                            const isSameH = a.time.startsWith(hStr + ':');
                                            return isSameD && isSameH;
                                        });

                                        return (
                                            <div key={day.toString()+hour} className={`border-b border-r border-slate-200/60 p-2 min-h-[100px] relative group ${isToday ? 'bg-teal-50/10 hover:bg-teal-50/30' : 'bg-white hover:bg-slate-50'}`}>
                                                {slotAppts.map(renderAppt)}
                                                {!slotAppts.length && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => setSelectedEmptySlot({ day, timeStr: format(setHours(new Date(), hour), 'h a') })}
                                                            className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center justify-center font-bold"
                                                        >+</button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'day' && (
                    <div className="flex-1 overflow-auto relative p-6">
                        <h4 className="text-xl font-serif text-slate-800 mb-6">{format(currentDate, 'EEEE, MMMM d')}</h4>
                        <div className="flex flex-col gap-0 border-l-2 border-slate-100 ml-16">
                            {hours.map(hour => {
                                const slotAppts = appointments.filter(a => {
                                    if(!a.date || !a.time) return false;
                                    const isSameD = isSameDay(currentDate, new Date(a.date));
                                    const hStr = hour > 12 ? (hour-12).toString() : hour.toString();
                                    const isSameH = a.time.startsWith(hStr + ':');
                                    return isSameD && isSameH;
                                });

                                return (
                                    <div key={hour} className="relative pl-8 py-4 border-b border-slate-100 min-h-[120px]">
                                        <div className="absolute left-[-40px] top-4 w-16 text-right">
                                            <span className="text-xs font-bold text-slate-400 tracking-widest">{format(setHours(new Date(), hour), 'h a')}</span>
                                        </div>
                                        <div className="absolute left-[-5px] top-[22px] w-2 h-2 rounded-full bg-slate-200 ring-4 ring-white border border-slate-300"></div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {slotAppts.map(renderAppt)}
                                            {!slotAppts.length && (
                                                <div 
                                                    onClick={() => setSelectedEmptySlot({ day: currentDate, timeStr: format(setHours(new Date(), hour), 'h a') })}
                                                    className="border border-dashed border-slate-200 rounded-xl flex items-center justify-center p-4 text-sm text-slate-400 italic hover:bg-slate-50 cursor-pointer transition-colors hover:text-indigo-500"
                                                >
                                                    + Click to add walk-in or block slot
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {view === 'month' && (
                    <div className="flex-1 flex flex-col">
                        <div className="grid grid-cols-7 border-b border-slate-200/60 bg-slate-50/95 sticky top-0 z-10">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                <div key={d} className="p-3 text-center text-[11px] font-bold text-slate-500 uppercase tracking-widest">{d}</div>
                            ))}
                        </div>
                        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                            {monthDaysGrid.map((day, idx) => {
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isToday = isSameDay(day, new Date());
                                const dayAppts = appointments.filter(a => a.date && isSameDay(new Date(a.date), day));
                                
                                return (
                                    <div key={idx} className={`border-b border-r border-slate-200/60 p-2 relative group flex flex-col min-h-[120px] ${!isCurrentMonth ? 'bg-slate-50/50 opacity-60' : 'bg-white hover:bg-slate-50'} ${isToday ? 'ring-inset ring-2 ring-teal-400 bg-teal-50/10' : ''}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-teal-500 text-white shadow-md' : 'text-slate-600'}`}>
                                                {format(day, 'd')}
                                            </span>
                                            {dayAppts.length > 0 && (
                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                                    {dayAppts.length} appts
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1 custom-scrollbar">
                                            {dayAppts.map(appt => {
                                                const telemed = isTelemed(appt);
                                                return (
                                                    <div key={appt.id} onClick={() => onAppointmentClick && onAppointmentClick(appt)} className={`text-[10px] p-1.5 rounded bg-slate-100 text-slate-700 font-medium truncate cursor-pointer hover:bg-slate-200 transition-colors flex items-center gap-1 border border-slate-200`}>
                                                        {telemed ? <Video className="w-3 h-3 text-indigo-500" /> : <User className="w-3 h-3 text-emerald-500" />}
                                                        {appt.time} - #{appt.patientId}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-wrap gap-6 items-center justify-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-300"></div> Pending
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300"></div> Confirmed/Paid
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-100 border-2 border-green-500"></div> In Progress
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-400"></div> Completed
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div> Missed/Cancelled
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-slate-700 border border-slate-800"></div> Blocked (Leave)
                </div>
            </div>

              <ManageScheduleModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} doctorId={doctorId} />
            <SlotQuickActionModal slot={selectedEmptySlot} doctorId={doctorId} onClose={() => setSelectedEmptySlot(null)} onSlotBlocked={() => setSelectedEmptySlot(null)} />
        </div>
    );
};

export default ScheduleTab;
