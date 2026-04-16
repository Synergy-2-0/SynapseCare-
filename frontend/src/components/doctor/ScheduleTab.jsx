import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { 
    format, addDays, startOfWeek, addWeeks, subWeeks, subDays, 
    setHours, isSameDay, startOfMonth, eachDayOfInterval, 
    isSameMonth
} from 'date-fns';
import { ChevronLeft, ChevronRight, Video, User, List, Calendar as CalendarIcon, Grid, Settings } from 'lucide-react';
import ManageScheduleModal from './ManageScheduleModal';
import SlotQuickActionModal from './SlotQuickActionModal';
import { appointmentApi } from '@/lib/api';

const getStatusColor = (status) => {
    const colors = {
        'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
        'PENDING_PAYMENT': 'bg-amber-100 text-amber-700 border-amber-200',
        'CONFIRMED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'IN_PROGRESS': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'COMPLETED': 'bg-slate-100 text-slate-500 border-slate-200',
        'CANCELLED': 'bg-rose-100 text-rose-700 border-rose-200 opacity-60',
        'BLOCKED': 'bg-slate-800 text-slate-100 border-slate-900 shadow-inner',
        'AVAILABLE': 'bg-emerald-600 text-white border-emerald-700 shadow-md font-bold'
    };
    return colors[status] || 'bg-indigo-50 border-indigo-100 text-indigo-700';
};

const normalizeDayKey = (value) => {
    if (!value) return '';
    return String(value).trim().toUpperCase().slice(0, 3);
};

const parseApptDate = (date) => {
    if (!date) return null;
    let dStr = null;
    if (Array.isArray(date) && date.length >= 3) {
        dStr = `${date[0]}-${String(date[1]).padStart(2, '0')}-${String(date[2]).padStart(2, '0')}`;
    } else if (typeof date === 'string') {
        dStr = date.split('T')[0];
    } else {
        try {
            dStr = format(new Date(date), 'yyyy-MM-dd');
        } catch {
            return null;
        }
    }
    // Normalize to exact YYYY-MM-DD
    return dStr;
};

const parseApptHour = (time) => {
    if (!time) return null;
    let h = null;
    if (Array.isArray(time)) h = parseInt(time[0], 10);
    else if (typeof time === 'string') h = parseInt(time.split(':')[0], 10);
    
    if (h !== null && isNaN(h)) return null;
    return h;
};

const parseTimeToMinutes = (value) => {
    if (!value) return null;
    const [hours, minutes = '0'] = String(value).split(':');
    return (parseInt(hours, 10) * 60) + parseInt(minutes, 10);
};

const isHourWithinAvailability = (availabilityRow, hour) => {
    // If no row or explicitly marked as not working, the clinician is unavailable.
    if (!availabilityRow || !availabilityRow.isWorking) return false;

    // Use a strict minute-based check for granular engagement windows.
    const startMinutes = parseTimeToMinutes(availabilityRow.startTime);
    const endMinutes = parseTimeToMinutes(availabilityRow.endTime);
    if (startMinutes === null || endMinutes === null) return false;

    const slotStart = hour * 60;
    const slotEnd = (hour + 1) * 60;
    
    // An hour is available if its timeframe intersects with the clinician's working window.
    return slotStart < endMinutes && slotEnd > startMinutes;
};

const ScheduleTab = ({ appointments = [], onAppointmentClick, doctorId, onRefresh }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('week'); // 'day', 'week', 'month'
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedEmptySlot, setSelectedEmptySlot] = useState(null);
    const [availabilityRows, setAvailabilityRows] = useState([]);
    const [leaveRows, setLeaveRows] = useState([]);

    const fetchAvailability = useCallback(async () => {
        if (!doctorId) return;
        try {
            const res = await appointmentApi.get(`/schedule/doctor/${doctorId}/availability`);
            setAvailabilityRows(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Clinical Node availability retrieval failure', error);
            setAvailabilityRows([]);
        }
    }, [doctorId]);

    const fetchLeaves = useCallback(async () => {
        if (!doctorId) return;
        try {
            const res = await appointmentApi.get(`/schedule/doctor/${doctorId}/leaves`);
            setLeaveRows(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error('Tactical leave registry lookup failure', error);
            setLeaveRows([]);
        }
    }, [doctorId]);

    useEffect(() => {
        let mounted = true;
        // Defer execution to resolve synchronous setState warning in mounting phase
        const timer = setTimeout(() => {
            if (mounted) {
                fetchAvailability();
                fetchLeaves();
            }
        }, 0);
        return () => { 
            mounted = false; 
            clearTimeout(timer);
        };
    }, [fetchAvailability, fetchLeaves]);

    const blockedLeaveDates = useMemo(() => {
        const dates = new Set();
        leaveRows.forEach((leave) => {
            if (!leave?.startDate || !leave?.endDate) return;
            const start = new Date(`${leave.startDate}T00:00:00`);
            const end = new Date(`${leave.endDate}T00:00:00`);
            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                eachDayOfInterval({ start, end }).forEach((date) => {
                    dates.add(format(date, 'yyyy-MM-dd'));
                });
            }
        });
        return dates;
    }, [leaveRows]);

    const isLeaveDay = useCallback((date) => blockedLeaveDates.has(format(date, 'yyyy-MM-dd')), [blockedLeaveDates]);

    const availabilityByDay = useMemo(() => {
        return availabilityRows.reduce((acc, row) => {
            const key = normalizeDayKey(row.dayOfWeek);
            if (key && !acc[key]) acc[key] = row;
            return acc;
        }, {});
    }, [availabilityRows]);
    
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

    const renderAppt = (appt) => {
        const colorClasses = getStatusColor(appt.status);
        const isBlocked = appt.status === 'BLOCKED';
        const isExtra = appt.status === 'AVAILABLE';
        
        let label = `Pt #${appt.patientId}`;
        if (isBlocked) label = 'Blocked Slot';
        if (isExtra) label = 'Extra Availability';

        const timeLabel = appt.time ? appt.time.substring(0, 5) : '--:--';

        return (
            <div 
                key={appt.id} 
                onClick={() => onAppointmentClick && onAppointmentClick(appt)}
                className={`w-full rounded-xl p-2.5 cursor-pointer shadow-sm border transition-all hover:scale-[1.02] hover:shadow-md mb-2 ${colorClasses}`}
            >
                <div className="flex items-center gap-1.5 justify-between mb-1.5">
                    <span className="text-[10px] font-semibold opacity-70">{timeLabel}</span>
                </div>
                <div className="text-xs font-bold leading-tight line-clamp-2">
                    {label}
                </div>
                {!isExtra && <div className="text-[9px] mt-1 font-semibold uppercase opacity-80">{appt.status}</div>}
            </div>
        );
    };

    const renderAvailabilityBadge = (availabilityRow) => {
        if (!availabilityRow) {
            return <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">No schedule</span>;
        }

        if (!availabilityRow.isWorking) {
            return <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Off</span>;
        }

        return (
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                {String(availabilityRow.startTime).slice(0, 5)} - {String(availabilityRow.endTime).slice(0, 5)}
            </span>
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
                                const dayAvailability = availabilityByDay[normalizeDayKey(format(day, 'EEE'))];
                                return (
                                    <div key={day.toString()} className={`p-3 border-b border-slate-200/60 text-center sticky top-0 z-10 backdrop-blur-md ${isToday ? 'bg-teal-50 border-teal-100 ring-1 ring-teal-500/20' : 'bg-slate-50/95'}`}>
                                        <div className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${isToday ? 'text-teal-600' : 'text-slate-400'}`}>{format(day, 'EEE')}</div>
                                        <div className={`text-xl font-serif ${isToday ? 'text-teal-700 font-bold' : 'text-slate-700'}`}>{format(day, 'd')}</div>
                                        <div className="mt-1 flex justify-center">
                                            {isLeaveDay(day) ? (
                                                <span className="px-2 py-0.5 rounded-full bg-slate-700 text-white text-[9px] font-black uppercase tracking-widest border border-slate-800">
                                                    Blocked
                                                </span>
                                            ) : dayAvailability?.isWorking ? (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest border border-emerald-200">
                                                    Available
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-widest border border-rose-200">
                                                    Off
                                                </span>
                                            )}
                                        </div>
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
                                        const dayAvailability = availabilityByDay[normalizeDayKey(format(day, 'EEE'))];
                                        const cellAvailable = isHourWithinAvailability(dayAvailability, hour);
                                        const slotAppts = appointments.filter(a => {
                                            if(!a.date || !a.time) return false;
                                            
                                            const apptDateStr = parseApptDate(a.date);
                                            const targetDateStr = format(day, 'yyyy-MM-dd');
                                            const isSameD = targetDateStr === apptDateStr;
                                            
                                            const apptHour = parseApptHour(a.time);
                                            const isSameH = apptHour === hour;
                                            
                                            return isSameD && isSameH;
                                        });

                                        const dayBlocked = isLeaveDay(day);

                                        return (
                                            <div 
                                                key={day.toString() + hour} 
                                                className={`border-b border-r border-slate-200/60 p-2 min-h-[120px] relative group transition-colors
                                                    ${dayBlocked ? 'bg-slate-800 border-slate-900' : cellAvailable ? 'bg-emerald-50/50 hover:bg-emerald-50/80' : 'bg-slate-50/80 opacity-40'} 
                                                    ${isToday ? 'ring-1 ring-inset ring-teal-400' : ''}`}
                                            >
                                                {/* Open Status Indicator - Removed Pulse/Icon as requested */}
                                                {!slotAppts.length && !dayBlocked && cellAvailable && (
                                                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                                                        Open
                                                    </div>
                                                )}

                                                {/* Blocked Status Indicator (Leave) - Removed Shield icon */}
                                                {!slotAppts.length && dayBlocked && (
                                                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-50">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                                                Blocked
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Appointment Chips */}
                                                <div className="relative z-10 space-y-2">
                                                    {slotAppts.map(renderAppt)}
                                                </div>

                                                {!slotAppts.length && !dayBlocked && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/40 backdrop-blur-[2px] z-20">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedEmptySlot({ day, timeStr: format(setHours(new Date(), hour), 'h a'), isAvailable: cellAvailable });
                                                            }}
                                                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-xl transition-all scale-90 group-hover:scale-100 ${cellAvailable ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-700 text-white hover:bg-slate-900'}`}
                                                        >+</button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                )}

                {view === 'day' && (
                    <div className="flex-1 overflow-auto relative p-6">
                        <h4 className="text-xl font-serif text-slate-800 mb-6">{format(currentDate, 'EEEE, MMMM d')}</h4>
                                {isLeaveDay(currentDate) && (
                                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest border border-slate-800">
                                        Blocked (Leave)
                                    </div>
                                )}
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
                                                    className={`border border-dashed rounded-xl flex items-center justify-center p-4 text-sm italic cursor-pointer transition-colors hover:text-indigo-500 ${isHourWithinAvailability(availabilityByDay[normalizeDayKey(format(currentDate, 'EEE'))], hour) ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
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
                                const dayAvailability = availabilityByDay[normalizeDayKey(format(day, 'EEE'))];
                                const dayBlocked = isLeaveDay(day);
                                
                                return (
                                    <div key={idx} className={`border-b border-r border-slate-200/60 p-2 relative group flex flex-col min-h-[120px] ${dayBlocked ? 'bg-slate-100/90 hover:bg-slate-100' : !isCurrentMonth ? 'bg-slate-50/50 opacity-60' : 'bg-white hover:bg-slate-50'} ${isToday ? 'ring-inset ring-2 ring-teal-400 bg-teal-50/10' : ''} ${dayBlocked ? 'before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-slate-700' : dayAvailability?.isWorking ? 'before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-emerald-400' : ''}`}>
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
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            {dayBlocked ? (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full border border-slate-300">
                                                    Blocked
                                                </span>
                                            ) : renderAvailabilityBadge(dayAvailability)}
                                            {!dayBlocked && dayAvailability?.isWorking && (
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1 custom-scrollbar">
                                            {dayAppts.map(appt => {
                                                const telemed = isTelemed(appt);
                                                const blocked = appt.status === 'BLOCKED';
                                                return (
                                                    <div key={appt.id} onClick={() => onAppointmentClick && onAppointmentClick(appt)} className={`text-[10px] p-1.5 rounded font-medium truncate cursor-pointer hover:opacity-90 transition-colors flex items-center gap-1 border ${getStatusColor(appt.status)}`}>
                                                        {blocked ? <Settings className="w-3 h-3" /> : telemed ? <Video className="w-3 h-3 text-indigo-500" /> : <User className="w-3 h-3 text-emerald-500" />}
                                                        {appt.time} - {blocked ? 'Blocked Slot' : `#${appt.patientId}`}
                                                    </div>
                                                );
                                            })}
                                            {dayBlocked && !dayAppts.length && (
                                                <div className="text-[10px] font-bold text-slate-700 bg-slate-200 border border-slate-300 rounded-lg px-2 py-1 text-center uppercase tracking-widest">
                                                    Blocked (Leave)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-wrap gap-10 items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-400 shadow-sm shadow-emerald-500/20"></div> 
                    <span className="text-emerald-700">Open (Available)</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-lg bg-slate-800 border border-slate-900 shadow-md"></div> 
                    <span className="text-slate-600">Blocked (Clinical/Leave)</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-lg bg-blue-100 border border-blue-300"></div> 
                    <span className="text-blue-700 font-bold italic opacity-70">Booked Appointment</span>
                </div>
            </div>

                            <ManageScheduleModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} doctorId={doctorId} onSaved={() => { fetchAvailability(); fetchLeaves(); }} />
                            <SlotQuickActionModal slot={selectedEmptySlot} doctorId={doctorId} onClose={() => setSelectedEmptySlot(null)} onSlotBlocked={() => { setSelectedEmptySlot(null); if (onRefresh) onRefresh(); }} />
        </div>
    );
};

export default ScheduleTab;
