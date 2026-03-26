import React from 'react';

/**
 * EmptyState Component
 *
 * @param {Component} icon - Lucide icon component
 * @param {string} image - Image URL for custom illustration
 * @param {string} title - Empty state title
 * @param {string} description - Empty state description
 * @param {ReactNode} action - Action button or link
 * @param {string} className - Additional CSS classes
 */
const EmptyState = ({
    icon: Icon,
    image,
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <div className={`text-center py-12 px-6 flex flex-col items-center gap-4 ${className}`}>
            {image && (
                <img
                    src={image}
                    alt={title || 'Empty state'}
                    className="w-32 h-32 object-contain mb-2"
                />
            )}
            {Icon && !image && (
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-slate-400" />
                </div>
            )}
            {title && (
                <h3 className="text-lg font-semibold text-slate-700">
                    {title}
                </h3>
            )}
            {description && (
                <p className="text-sm text-slate-500 max-w-sm">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
