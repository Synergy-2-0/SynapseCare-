/**
 * Utility functions for SynapseCare Doctor Portal
 */

// Date formatting
export const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

// Time formatting
 export const formatTime = (time) => {
    if (!time) return '';
    try {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch {
        return time;
    }
};

// Currency formatting (Sri Lankan Rupees)
export const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '';
    return `Rs. ${parseFloat(amount).toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};

// Appointment status color mapping
export const getStatusColor = (status) => {
    const statusColors = {
        PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
        CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
        PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        COMPLETED: 'bg-teal-50 text-teal-700 border-teal-200',
        CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return statusColors[status] || 'bg-slate-50 text-slate-700 border-slate-200';
};

// Verification status color mapping
export const getVerificationColor = (status) => {
    const statusColors = {
        PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
        APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        REJECTED: 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return statusColors[status] || 'bg-slate-50 text-slate-700 border-slate-200';
};

// Get day of week from date
export const getDayOfWeek = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
};

// Format age from date of birth
export const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return `${age} years`;
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Debounce function for search inputs
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Check if appointment is today
export const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const compareDate = new Date(date);
    return today.toDateString() === compareDate.toDateString();
};

// Get time slots for a day
export const generateTimeSlots = (startTime, endTime, intervalMinutes = 30) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    let current = new Date(start);
    while (current < end) {
        slots.push(current.toTimeString().substring(0, 5));
        current = new Date(current.getTime() + intervalMinutes * 60000);
    }

    return slots;
};
