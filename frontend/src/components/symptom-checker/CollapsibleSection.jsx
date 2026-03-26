import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * CollapsibleSection Component
 *
 * Healthcare-styled collapsible sections for symptom checker
 * Features clinical design with proper accessibility
 */
const CollapsibleSection = ({
    title,
    isRequired = false,
    isOpen: controlledIsOpen,
    onToggle,
    children,
    className = '',
    icon: Icon,
    badge
}) => {
    const [internalIsOpen, setInternalIsOpen] = useState(isRequired || false);

    // Use controlled state if provided, otherwise use internal state
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const handleToggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

    return (
        <div className={`border border-slate-200 rounded-lg bg-white ${className}`}>
            {/* Header */}
            <button
                type="button"
                onClick={handleToggle}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    {/* Toggle Icon */}
                    {isOpen ? (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                    ) : (
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                    )}

                    {/* Section Icon */}
                    {Icon && <Icon className="w-5 h-5 text-blue-600" />}

                    {/* Title */}
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 text-left">
                            {title}
                        </h3>
                        {isRequired && (
                            <span className="text-sm font-medium text-rose-600">*</span>
                        )}
                    </div>
                </div>

                {/* Badge */}
                <div className="flex items-center gap-2">
                    {badge && (
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                            {badge}
                        </span>
                    )}
                    <span className="text-xs font-medium text-slate-500">
                        {isOpen ? '[Close]' : '[Expand]'}
                    </span>
                </div>
            </button>

            {/* Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden border-t border-slate-200"
                    >
                        <div className="p-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollapsibleSection;