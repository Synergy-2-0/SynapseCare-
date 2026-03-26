import { useState, useEffect, useRef } from 'react';

/**
 * useCountUp Hook
 *
 * Animates a number from a start value to an end value
 * Uses requestAnimationFrame for smooth, performant animations
 *
 * @param {number} end - Target number to count to
 * @param {object} options - Configuration options
 * @param {number} options.start - Starting number (default: 0)
 * @param {number} options.duration - Animation duration in ms (default: 1500)
 * @param {number} options.decimals - Number of decimal places (default: 0)
 * @param {string} options.prefix - String to prepend (e.g., "$")
 * @param {string} options.suffix - String to append (e.g., "%")
 * @param {string} options.easing - Easing function: 'linear', 'easeOut', 'easeInOut' (default: 'easeOut')
 * @param {boolean} options.enabled - Whether animation is enabled (default: true)
 * @param {number} options.delay - Delay before starting animation in ms (default: 0)
 *
 * @returns {string} - Formatted number with prefix/suffix
 *
 * @example
 * const value = useCountUp(1250, { prefix: '$', decimals: 2 });
 * // Animates from $0.00 to $1250.00
 *
 * @example
 * const percentage = useCountUp(85, { suffix: '%', duration: 1000 });
 * // Animates from 0% to 85%
 */
const useCountUp = (end, options = {}) => {
  const {
    start = 0,
    duration = 1500,
    decimals = 0,
    prefix = '',
    suffix = '',
    easing = 'easeOut',
    enabled = true,
    delay = 0
  } = options;

  const [count, setCount] = useState(start);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);
  const timeoutRef = useRef(null);

  // Easing functions
  const easingFunctions = {
    linear: (t) => t,
    easeOut: (t) => 1 - Math.pow(1 - t, 3), // Cubic easeOut
    easeInOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  };

  const easeFn = easingFunctions[easing] || easingFunctions.easeOut;

 useEffect(() => {
    // If animation is disabled, just set to end value
    if (!enabled) {
      setCount(end);
      return;
    }

    // If end value hasn't changed, don't restart animation
    if (count === end && startTimeRef.current !== null) {
      return;
    }

    const startAnimation = () => {
      const animate = (currentTime) => {
        if (!startTimeRef.current) {
          startTimeRef.current = currentTime;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = easeFn(progress);
        const currentCount = start + (end - start) * easedProgress;

        setCount(currentCount);

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        } else {
          setCount(end); // Ensure we end exactly at the target
          startTimeRef.current = null;
        }
      };

      frameRef.current = requestAnimationFrame(animate);
    };

    // Start animation with optional delay
    if (delay > 0) {
      timeoutRef.current = setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }

    // Cleanup
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      startTimeRef.current = null;
    };
  }, [end, start, duration, easing, enabled, delay]);

  // Format the number with decimals
  const formattedCount = count.toFixed(decimals);

  // Return formatted string with prefix and suffix
  return `${prefix}${formattedCount}${suffix}`;
};

export default useCountUp;
