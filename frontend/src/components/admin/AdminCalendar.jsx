import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const AdminMiniCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50 text-slate-900">
                <button onClick={prevMonth} className="p-1.5 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 transition-all text-slate-400 hover:text-teal-600 shadow-sm">
                    <ChevronLeft size={14} strokeWidth={2.5} />
                </button>
                <div className="text-center">
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h2>
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-0.5 whitespace-nowrap">Platform Schedule</p>
                </div>
                <button onClick={nextMonth} className="p-1.5 rounded-lg bg-white border border-slate-100 hover:bg-slate-50 transition-all text-slate-400 hover:text-teal-600 shadow-sm">
                    <ChevronRight size={14} strokeWidth={2.5} />
                </button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        return (
            <div className="grid grid-cols-7 mb-2 mt-4 px-3">
                {days.map((day, idx) => (
                    <div key={idx} className="text-center text-[8px] font-black text-teal-500 uppercase tracking-widest opacity-60">{day}</div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = 'd';
        let formattedDate = '';

        const allDays = eachDayOfInterval({ start: startDate, end: endDate });

        return (
            <div className="grid grid-cols-7 px-3 pb-6">
                {allDays.map((d, i) => {
                    formattedDate = format(d, dateFormat);
                    const isSelected = isSameDay(d, selectedDate);
                    const isCurrentMonth = isSameMonth(d, monthStart);
                    
                    return (
                        <div
                            key={i}
                            className={`aspect-square flex flex-col items-center justify-center relative cursor-pointer group transition-all`}
                            onClick={() => setSelectedDate(d)}
                        >
                            <div className={`
                                w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 relative z-10 text-xs
                                ${isSelected ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 scale-105 font-bold' : 'text-slate-900'}
                                ${!isSelected && isCurrentMonth ? 'font-bold hover:bg-teal-50 hover:text-teal-600' : ''}
                                ${!isCurrentMonth ? 'text-slate-300' : ''}
                            `}>
                                {formattedDate}
                                {!isSelected && isCurrentMonth && (i % 3 === 0) && (
                                    <div className="absolute bottom-1 w-0.5 h-0.5 rounded-full bg-teal-300" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-50 transition-all hover:shadow-md overflow-hidden">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
};

export default AdminMiniCalendar;
