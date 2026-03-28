import React, { useState } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, setHours, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Video, User } from 'lucide-react';

const ScheduleTab = ({ appointments = [], onAppointmentClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Setup week based on current date state
    const startDate = startOfWeek(currentDate, { weekStarts: 1 }); // Monday
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
    const hours = Array.from({ length: 11 }).map((_, i) => i + 8); // 8 AM to 6 PM

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

    return (
        <div className="surface-card bg-white p-8 xl:p-10 min-h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h3 className="text-3xl font-serif text-slate-900">Schedule & Availability</h3>
                    <p className="text-slate-500 font-medium mt-1">Manage your clinic and telemedicine hours.</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-50/80 p-2.5 rounded-[1.5rem] border border-slate-200/60 shadow-inner">
                    <button onClick={prevWeek} className="p-2.5 bg-white hover:bg-slate-100 rounded-xl shadow-sm transition-all text-slate-600 border border-slate-200/50 hover:border-slate-300">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-slate-700 min-w-[150px] text-center tracking-wide text-sm">
                        {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d, yyyy')}
                    </span>
                    <button onClick={nextWeek} className="p-2.5 bg-white hover:bg-slate-100 rounded-xl shadow-sm transition-all text-slate-600 border border-slate-200/50 hover:border-slate-300">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto border border-slate-200/60 rounded-[2rem] bg-slate-50/30 ring-1 ring-slate-100 shadow-inner max-h-[700px] relative">
                <div className="grid grid-cols-8 min-w-[900px]">
                    {/* Time Column Header */}
                    <div className="p-5 border-b border-r border-slate-200/60 text-center font-bold text-slate-400 text-xs uppercase tracking-widest sticky top-0 bg-slate-50/95 backdrop-blur-md z-10 flex flex-col justify-end pb-4">Time</div>
                    
                    {/* Days Headers */}
                    {weekDays.map(day => {
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div key={day.toString()} className={`p-5 border-b border-slate-200/60 text-center sticky top-0 z-10 backdrop-blur-md ${isToday ? 'bg-teal-50 border-teal-100 ring-1 ring-teal-500/20' : 'bg-slate-50/95'}`}>
                                <div className={`text-[11px] font-bold uppercase tracking-widest mb-1.5 ${isToday ? 'text-teal-600' : 'text-slate-400'}`}>{format(day, 'EEE')}</div>
                                <div className={`text-2xl font-serif ${isToday ? 'text-teal-700 font-bold' : 'text-slate-700'}`}>{format(day, 'd')}</div>
                                {isToday && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500"></div>}
                            </div>
                        );
                    })}

                    {/* Time Rows */}
                    {hours.map(hour => (
                        <React.Fragment key={hour}>
                            {/* Time Label */}
                            <div className="p-4 border-r border-b border-slate-200/60 flex items-center justify-center text-[11px] font-bold tracking-widest uppercase text-slate-400 bg-white">
                                {format(setHours(new Date(), hour), 'h a')}
                            </div>
                            
                            {/* Day Slots */}
                            {weekDays.map(day => {
                                const isToday = isSameDay(day, new Date());
                                // Mock mapping logic for appointments array to this calendar slot
                                const slotAppts = appointments.filter(a => {
                                    if(!a.date || !a.time) return false;
                                    const apptDate = new Date(a.date);
                                    const isSameD = isSameDay(day, apptDate);
                                    // fuzzy match time like "10:xx AM" to the hour block 10
                                    const hStr = hour > 12 ? (hour-12).toString() : hour.toString();
                                    const isSameH = a.time.startsWith(hStr + ':');
                                    return isSameD && isSameH;
                                });

                                return (
                                    <div key={day.toString()+hour} className={`border-b border-r border-slate-200/60 p-2 min-h-[90px] transition-colors relative group ${isToday ? 'bg-teal-50/10 hover:bg-teal-50/30' : 'bg-white hover:bg-slate-50'}`}>
                                        {slotAppts.map(appt => {
                                            const isTelemed = appt.type === 'TELEMEDICINE' || appt.mode === 'TELEMEDICINE';
                                            return (
                                                <div 
                                                    key={appt.id} 
                                                    onClick={() => onAppointmentClick && onAppointmentClick(appt)}
                                                    className={`w-full h-full rounded-xl p-2.5 cursor-pointer shadow-sm border transition-all hover:scale-[1.02] hover:shadow-md hover:-translate-y-[1px] ${
                                                        isTelemed 
                                                        ? 'bg-indigo-50 border-indigo-100 hover:border-indigo-300' 
                                                        : 'bg-emerald-50 border-emerald-100 hover:border-emerald-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-1.5 justify-between mb-1.5">
                                                        <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${isTelemed ? 'text-indigo-600' : 'text-emerald-700'}`}>
                                                            {isTelemed ? <Video className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                                            {isTelemed ? 'Video' : 'Clinic'}
                                                        </span>
                                                        <span className={`text-[10px] font-semibold opacity-70 ${isTelemed ? 'text-indigo-800' : 'text-emerald-800'}`}>{appt.time}</span>
                                                    </div>
                                                    <div className={`text-xs font-bold leading-tight line-clamp-2 ${isTelemed ? 'text-indigo-950' : 'text-emerald-950'}`}>
                                                        Pt #{appt.patientId}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {!slotAppts.length && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:bg-teal-50 hover:text-teal-600 flex items-center justify-center font-bold text-lg shadow-sm border border-transparent hover:border-teal-200 transition-all cursor-pointer">
                                                    +
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScheduleTab;