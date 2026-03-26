import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Clock, DollarSign, Calendar } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

/**
 * DoctorRecommendationCard Component
 *
 * Displays doctor information with booking action.
 *
 * @param {object} doctor - Doctor data object
 * @param {string} matchedSpecialty - The specialty that matched the search
 * @param {function} onBook - Callback when "Book" is clicked
 * @param {function} onViewProfile - Callback when "View Profile" is clicked
 * @param {string} className - Additional CSS classes
 */
const DoctorRecommendationCard = ({
    doctor,
    matchedSpecialty,
    onBook,
    onViewProfile,
    className = ''
}) => {
    const {
        id,
        userId,
        specialization,
        qualifications,
        experience,
        consultationFee,
        bio,
        profileImageUrl,
        isAvailable
    } = doctor;

    const initials = specialization
        ? specialization.substring(0, 2).toUpperCase()
        : 'DR';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`
                bg-white border border-slate-200 rounded-2xl p-5
                shadow-sm hover:shadow-md hover:border-blue-200
                transition-all duration-300
                ${className}
            `}
        >
            <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {profileImageUrl ? (
                        <img
                            src={profileImageUrl}
                            alt={specialization}
                            className="w-14 h-14 rounded-xl object-cover"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                            {initials}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h4 className="text-base font-semibold text-slate-900 truncate">
                                Dr. {specialization || 'Specialist'}
                            </h4>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {specialization}
                            </p>
                        </div>
                        {isAvailable ? (
                            <Badge variant="success" size="sm">Available</Badge>
                        ) : (
                            <Badge variant="neutral" size="sm">Unavailable</Badge>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-600">
                        {experience && (
                            <span className="flex items-center gap-1">
                                <Clock size={14} className="text-slate-400" />
                                {experience} yrs exp
                            </span>
                        )}
                        {consultationFee && (
                            <span className="flex items-center gap-1">
                                <DollarSign size={14} className="text-slate-400" />
                                ${consultationFee}
                            </span>
                        )}
                    </div>

                    {/* Qualifications */}
                    {qualifications && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-1">
                            {qualifications}
                        </p>
                    )}

                    {/* Matched specialty indicator */}
                    {matchedSpecialty && matchedSpecialty !== specialization && (
                        <p className="text-xs text-blue-600 mt-2">
                            Matched for: {matchedSpecialty}
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                {onViewProfile && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewProfile(doctor)}
                        className="flex-1"
                    >
                        View Profile
                    </Button>
                )}
                {onBook && isAvailable && (
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onBook(doctor)}
                        className="flex-1"
                    >
                        <Calendar size={14} className="mr-1" />
                        Book Appointment
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

export default DoctorRecommendationCard;
