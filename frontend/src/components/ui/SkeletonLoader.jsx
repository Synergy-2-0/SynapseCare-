import React from 'react';

/**
 * SkeletonLoader Component
 *
 * Loading placeholder with shimmer effect
 * Provides visual feedback while content is loading
 *
 * @param {string} variant - Type of skeleton: 'card', 'stat', 'table-row', 'list-item', 'text', 'avatar', 'button'
 * @param {number} count - Number of skeleton items to render (default: 1)
 * @param {string} className - Additional CSS classes
 * @param {number} lines - Number of text lines (for 'text' variant) (default: 3)
 *
 * @example
 * <SkeletonLoader variant="card" count={3} />
 * <SkeletonLoader variant="text" lines={5} />
 */
const SkeletonLoader = ({ variant = 'card', count = 1, className = '', lines = 3 }) => {
  const baseClass = 'bg-slate-200 rounded animate-shimmer';

  const variants = {
    card: (
      <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm ${className}`}>
        <div className={`h-6 w-3/4 ${baseClass} mb-4`} />
        <div className={`h-4 w-full ${baseClass} mb-2`} />
        <div className={`h-4 w-5/6 ${baseClass} mb-2`} />
        <div className={`h-4 w-2/3 ${baseClass}`} />
      </div>
    ),

    stat: (
      <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-sm ${className}`}>
        <div className="flex justify-between items-center mb-3">
          <div className={`h-10 w-10 rounded-xl ${baseClass}`} />
          <div className={`h-8 w-16 ${baseClass}`} />
        </div>
        <div className="flex justify-between items-center">
          <div className={`h-4 w-24 ${baseClass}`} />
          <div className={`h-3 w-12 ${baseClass}`} />
        </div>
      </div>
    ),

    'table-row': (
      <tr className={className}>
        <td className="px-4 py-3">
          <div className={`h-4 w-32 ${baseClass}`} />
        </td>
        <td className="px-4 py-3">
          <div className={`h-4 w-40 ${baseClass}`} />
        </td>
        <td className="px-4 py-3">
          <div className={`h-4 w-24 ${baseClass}`} />
        </td>
        <td className="px-4 py-3">
          <div className={`h-6 w-20 rounded-full ${baseClass}`} />
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <div className={`h-8 w-16 rounded-md ${baseClass}`} />
            <div className={`h-8 w-16 rounded-md ${baseClass}`} />
          </div>
        </td>
      </tr>
    ),

    'list-item': (
      <div className={`flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 ${className}`}>
        <div className={`h-12 w-12 rounded-full ${baseClass} flex-shrink-0`} />
        <div className="flex-1">
          <div className={`h-4 w-3/4 ${baseClass} mb-2`} />
          <div className={`h-3 w-1/2 ${baseClass}`} />
        </div>
        <div className={`h-8 w-20 rounded-md ${baseClass}`} />
      </div>
    ),

    text: (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`h-4 ${baseClass} mb-2`}
            style={{ width: index === lines - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    ),

    avatar: (
      <div className={`h-12 w-12 rounded-full ${baseClass} ${className}`} />
    ),

    button: (
      <div className={`h-10 w-24 rounded-lg ${baseClass} ${className}`} />
    )
  };

  const SkeletonElement = variants[variant] || variants.card;

  // If count is 1, return single element
  if (count === 1) {
    return SkeletonElement;
  }

  // If count > 1, return array of elements
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-3 last:mb-0">
          {SkeletonElement}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
