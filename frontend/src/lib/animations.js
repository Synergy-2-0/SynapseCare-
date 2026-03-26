/**
 * Professional Animation Library for SynapseCare
 *
 * Design Principles:
 * - Subtle and professional (no bouncy/playful animations)
 * - Trust-building through polish
 * - Healthcare-appropriate timing and easing
 * - Accessibility-first (respects prefers-reduced-motion)
 */

// Professional easing curve (cubic-bezier) - smooth and clinical
export const professionalEasing = [0.43, 0.13, 0.23, 0.96];

// Gentle easing for subtle interactions
export const gentleEasing = [0.25, 0.1, 0.25, 1];

/**
 * Fade In Animation
 * Use for: Page loads, content reveals
 */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: professionalEasing
    }
  }
};

/**
 * Slide Up Animation
 * Use for: Cards, modals, content sections
 */
export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: professionalEasing
    }
  }
};

/**
 * Slide Down Animation
 * Use for: Dropdowns, notifications
 */
export const slideDown = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: professionalEasing
    }
  }
};

/**
 * Slide In from Right
 * Use for: Sidebars, slide-in panels
 */
export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: professionalEasing
    }
  }
};

/**
 * Slide In from Left
 * Use for: Navigation, content panels
 */
export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: professionalEasing
    }
  }
};

/**
 * Subtle Scale Up
 * Use for: Interactive elements, hover states
 */
export const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: professionalEasing
    }
  }
};

/**
 * Stagger Container
 * Use for: Lists, grids, multiple items appearing together
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

/**
 * Stagger Item
 * Use with: staggerContainer
 */
export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: professionalEasing
    }
  }
};

/**
 * Fast Stagger (for longer lists)
 * Use for: Tables, long lists
 */
export const fastStaggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0
    }
  }
};

/**
 * Hover Lift (subtle)
 * Use for: Cards, buttons, interactive elements
 */
export const hoverLift = {
  rest: {
    y: 0,
    transition: { duration: 0.2, ease: gentleEasing }
  },
  hover: {
    y: -2,
    transition: { duration: 0.2, ease: gentleEasing }
  }
};

/**
 * Hover Lift (medium)
 * Use for: Cards that need more emphasis
 */
export const hoverLiftMedium = {
  rest: {
    y: 0,
    transition: { duration: 0.2, ease: gentleEasing }
  },
  hover: {
    y: -4,
    transition: { duration: 0.2, ease: gentleEasing }
  }
};

/**
 * Modal Animation (with subtle spring)
 * Use for: Modals, dialogs, popovers
 */
export const modalAnimation = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2
    }
  }
};

/**
 * Page Transition
 * Use for: Route changes, page navigation
 */
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: professionalEasing
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.25,
      ease: professionalEasing
    }
  }
};

/**
 * Press Animation (for buttons, clickable items)
 * Use for: Buttons, tabs, clickable cards
 */
export const pressAnimation = {
  tap: { scale: 0.98 },
  transition: { duration: 0.1 }
};

/**
 * Icon Pulse (subtle)
 * Use for: Icons on hover, attention-seeking elements
 */
export const iconPulse = {
  rest: { scale: 1 },
  hover: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.4,
      times: [0, 0.5, 1],
      ease: gentleEasing
    }
  }
};

/**
 * Shake Animation (for errors)
 * Use for: Form validation errors, alerts
 */
export const shake = {
  animate: {
    x: [0, -3, 3, -3, 3, 0],
    transition: {
      duration: 0.4,
      ease: [0.36, 0.07, 0.19, 0.97]
    }
  }
};

/**
 * Slide and Fade Exit (for list item removal)
 * Use for: Removing items from lists, dismissing notifications
 */
export const slideAndFadeExit = {
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.25,
      ease: professionalEasing
    }
  }
};

/**
 * Expand/Collapse Animation
 * Use for: Accordion, expandable sections
 */
export const expandCollapse = {
  collapsed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      ease: professionalEasing
    }
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      ease: professionalEasing
    }
  }
};

/**
 * Progress Ring Animation
 * Use for: Circular progress indicators
 */
export const progressRingAnimation = (progress) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: progress / 100,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 1.5,
        ease: professionalEasing
      },
      opacity: {
        duration: 0.3
      }
    }
  }
});

/**
 * Count Animation Configuration
 * Use with: useCountUp hook
 */
export const countAnimationConfig = {
  duration: 1500,
  easing: 'easeOut'
};

/**
 * Scroll Reveal Configuration
 * Use with: useIntersectionObserver hook
 */
export const scrollRevealConfig = {
  threshold: 0.2,
  rootMargin: '0px 0px -100px 0px',
  triggerOnce: true
};

/**
 * Toast Notification Animations
 */
export const toastAnimations = {
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { duration: 0.3, ease: professionalEasing }
  },
  slideInTop: {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
    transition: { duration: 0.3, ease: professionalEasing }
  }
};

/**
 * Badge Appear Animation
 */
export const badgeAppear = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      ease: gentleEasing
    }
  }
};

/**
 * Skeleton Shimmer Config
 * Use for: Loading placeholders
 */
export const shimmerAnimation = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      ease: 'linear',
      repeat: Infinity
    }
  }
};

/**
 * Table Row Animations
 */
export const tableRowAnimations = {
  initial: { opacity: 0, y: 10 },
  animate: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.02,
      duration: 0.3,
      ease: professionalEasing
    }
  }),
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

/**
 * Drag and Drop Animations
 */
export const dragDropConfig = {
  transition: {
    duration: 0.25,
    ease: professionalEasing
  }
};

// Export all as a collection for easy importing
export const animations = {
  fadeIn,
  slideUp,
  slideDown,
  slideInRight,
  slideInLeft,
  scaleUp,
  staggerContainer,
  staggerItem,
  fastStaggerContainer,
  hoverLift,
  hoverLiftMedium,
  modalAnimation,
  pageTransition,
  pressAnimation,
  iconPulse,
  shake,
  slideAndFadeExit,
  expandCollapse,
  progressRingAnimation,
  toastAnimations,
  badgeAppear,
  shimmerAnimation,
  tableRowAnimations,
  dragDropConfig
};

export default animations;
