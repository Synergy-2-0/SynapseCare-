import React from 'react';
import { Calendar as CalendarIcon, Clock, ChevronRight, Check, X, User, Stethoscope } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate, formatTime } from '../../lib/utils';
import { motion } from 'framer-motion';

const AppointmentCard = ({
    appointment,
    onViewDetails,
    onAccept,
    onReject,
    onStartConsultation
}) => {
    if (!appointment) return null;

    const canStartConsultation = ['CONFIRMED', 'PAID'].includes(appointment.status);

    return (
        <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            className="p-6 bg-white rounded-[2rem] border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 hover:border-indigo-100 hover:shadow-premium transition-all duration-300 group"
        >
            <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="w-16 h-16 bg-slate-100 border border-slate-200 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-100 rounded-2xl flex items-center justify-center font-black transition-all duration-500 shadow-inner">
                    <User size={24} strokeWidth={2.5} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap sm:flex-nowrap">
                        <div className="text-xl font-black text-slate-900 tracking-tighter truncate leading-none">
                            {appointment.patientName || `Patient Node-${appointment.patientId}`}
                        </div>
                        <Badge
                            variant={
                                appointment.status === 'COMPLETED' ? 'neutral' :
                                    appointment.status === 'PAID' || appointment.status === 'CONFIRMED' ? 'success' :
                                        appointment.status === 'CANCELLED' ? 'danger' :
                                            'warning'
                            }
                            pulse={appointment.status === 'CONFIRMED'}
                        >
                            {appointment.status}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        <div className="flex items-center gap-2">
                            <CalendarIcon size={12} className="text-indigo-600" />
                            {formatDate(appointment.appointmentDate)}
                        </div>
                        {appointment.appointmentTime && (
                            <div className="flex items-center gap-2">
                                <Clock size={12} className="text-indigo-600" />
                                {formatTime(appointment.appointmentTime)}
                            </div>
                        )}
                        <span className="opacity-40">• Token #{appointment.tokenNumber || '---'}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 items-center shrink-0">
                {onAccept && appointment.status === 'PENDING' && (
                    <button
                        onClick={() => onAccept(appointment)}
                        className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm group/btn"
                        title="Accept Consultation"
                    >
                        <Check size={18} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                )}
                {onReject && appointment.status === 'PENDING' && (
                    <button
                        onClick={() => onReject(appointment)}
                        className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-sm group/btn"
                        title="Decline Request"
                    >
                        <X size={18} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                )}
                {canStartConsultation && onStartConsultation && (
                    <button
                        onClick={() => onStartConsultation(appointment)}
                        className="h-10 px-5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                    >
                        <Stethoscope size={14} strokeWidth={3} />
                        Start Consult
                    </button>
                )}
                {onViewDetails && (
                    <button
                        onClick={() => onViewDetails(appointment)}
                        className="h-10 px-5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
                    >
                        Details <ChevronRight size={14} strokeWidth={3} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default AppointmentCard;
