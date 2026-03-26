import { useState, useEffect, useRef } from 'react';

/**
 * useIntersectionObserver Hook
 *
 * Detects when an element enters the viewport
 * Useful for triggering scroll-based animations
 *
 * @param {object} options - IntersectionObserver options
 * @param {number|number[]} options.threshold - Visibility threshold (0-1) (default: 0.2)
 * @param {string} options.rootMargin - Margin around root (default: '0px')
 * @param {boolean} options.triggerOnce - Only trigger once (default: true)
 * @param {Element} options.root - Root element (default: viewport)
 *
 * @returns {[React.RefObject, boolean]} - [ref to attach to element, isVisible boolean]
 *
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });
 *
 * return (
 *   <motion.div
 *     ref={ref}
 *     initial={{ opacity: 0, y: 20 }}
 *     animate={isVisible ? { opacity: 1, y: 0 } : {}}
 *   >
 *     Content animates when scrolled into view
 *   </motion.div>
 * );
 */
const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0.2,
    rootMargin = '0px',
    triggerOnce = true,
    root = null
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: assume visible if IntersectionObserver not supported
      setIsVisible(true);
      return;
    }

    // Create observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        if (isIntersecting) {
          setIsVisible(true);

          // If triggerOnce, disconnect after first trigger
          if (triggerOnce && observerRef.current) {
            observerRef.current.disconnect();
          }
        } else if (!triggerOnce) {
          // If not triggerOnce, toggle visibility based on intersection
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
        root
      }
    );

    // Start observing
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, root, triggerOnce]);

  return [elementRef, isVisible];
};

export default useIntersectionObserver;
