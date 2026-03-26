import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate, formatTime, getStatusColor } from '../../lib/utils';

/**
 * AppointmentCard Component
 *
 * Displays a single appointment with patient info and actions
 *
 * @param {object} appointment - Appointment data
 * @param {function} onViewDetails - View details handler
 * @param {function} onAccept - Accept appointment handler (optional)
 * @param {function} onReject - Reject appointment handler (optional)
 */
const AppointmentCard = ({
    appointment,
    onViewDetails,
    onAccept,
    onReject
}) => {
    if (!appointment) return null;

    return (
        <div className="p-4 bg-white rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
            <div className="flex items-center gap-4 flex-1">
                {/* Patient Avatar */}
                <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg flex items-center justify-center font-bold shadow-sm shrink-0">
                    <span className="text-sm">
                        {appointment.patientName
                            ? appointment.patientName.substring(0, 2).toUpperCase()
                            : 'PT'
                        }
                    </span>
                </div>

                {/* Appointment Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="text-base font-semibold text-slate-900 leading-none truncate">
                            {appointment.patientName || `Patient #${appointment.patientId}`}
                        </div>
                        <Badge
                            variant={
                                appointment.status === 'COMPLETED' ? 'neutral' :
                                appointment.status === 'PAID' || appointment.status === 'CONFIRMED' ? 'success' :
                                appointment.status === 'CANCELLED' ? 'danger' :
                                'warning'
                            }
                            size="sm"
                        >
                            {appointment.status}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatDate(appointment.appointmentDate)}
                        </div>
                        {appointment.appointmentTime && (
                            <div className="text-xs">
                                {formatTime(appointment.appointmentTime)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-center shrink-0">
                {onViewDetails && (
                    <button
                        onClick={() => onViewDetails(appointment)}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-blue-50 hover:border-blue-200 transition-all whitespace-nowrap"
                    >
                        Details
                    </button>
                )}
                {onAccept && (
                    <button
                        onClick={() => onAccept(appointment)}
                        className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shadow-sm hover:bg-emerald-600 hover:text-white transition-all"
                        title="Accept appointment"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                )}
                {onReject && (
                    <button
                        onClick={() => onReject(appointment)}
                        className="p-2 bg-rose-100 text-rose-700 rounded-lg shadow-sm hover:bg-rose-600 hover:text-white transition-all"
                        title="Cancel appointment"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default AppointmentCard;
