import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

/**
 * Custom hook for silky-smooth, calm inertial scrolling with GSAP.
 * Intercepts wheel events on a scroll container and uses GSAP power3/power2 easing
 * to decelerate scroll movement smoothly.
 * 
 * @param {Object} options Configuration options
 * @param {number} options.speed Multiplier for wheel sensitivity (default: 1.0)
 * @param {number} options.smoothness Duration of deceleration in seconds (default: 0.85)
 * @param {string} options.ease GSAP ease equation (default: 'power3.out')
 * @returns {Object} { containerRef, scrollTo, scrollToElement }
 */
export function useGsapSmoothScroll({
  speed = 1.0,
  smoothness = 0.85,
  ease = 'power3.out',
} = {}) {
  const containerRef = useRef(null);
  const targetScrollRef = useRef(0);
  const isTweeningRef = useRef(false);
  const tweenRef = useRef(null);

  // Sync virtual scroll position when container size or scroll changes natively
  const syncScrollPosition = useCallback(() => {
    if (containerRef.current && !isTweeningRef.current) {
      targetScrollRef.current = containerRef.current.scrollTop;
    }
  }, []);

  /**
   * Smoothly scroll container to a specific numeric position
   */
  const scrollTo = useCallback(
    (targetY, customDuration = smoothness) => {
      const container = containerRef.current;
      if (!container) return;

      const maxScroll = container.scrollHeight - container.clientHeight;
      const clampedY = Math.max(0, Math.min(maxScroll, targetY));

      targetScrollRef.current = clampedY;
      isTweeningRef.current = true;

      if (tweenRef.current) {
        tweenRef.current.kill();
      }

      tweenRef.current = gsap.to(container, {
        scrollTop: clampedY,
        duration: customDuration,
        ease: ease,
        overwrite: 'auto',
        onComplete: () => {
          isTweeningRef.current = false;
        },
      });
    },
    [ease, smoothness]
  );

  /**
   * Smoothly scroll to bring a specific DOM element into view
   */
  const scrollToElement = useCallback(
    (element, { offset = 0, duration = smoothness } = {}) => {
      const container = containerRef.current;
      if (!container || !element) return;

      const containerRect = container.getBoundingClientRect();
      const elemRect = element.getBoundingClientRect();

      // Check if element is already comfortably visible
      const isVisible =
        elemRect.top >= containerRect.top + 20 &&
        elemRect.bottom <= containerRect.bottom - 20;

      if (isVisible) return;

      const relativeTop = elemRect.top - containerRect.top + container.scrollTop;
      const targetY = relativeTop - container.clientHeight / 2 + elemRect.height / 2 + offset;

      scrollTo(targetY, duration);
    },
    [scrollTo, smoothness]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize target scroll position
    targetScrollRef.current = container.scrollTop;

    const handleWheel = (e) => {
      // Allow user to zoom (Ctrl + wheel) or horizontal scroll without blocking
      if (e.ctrlKey || e.shiftKey) return;

      const maxScroll = container.scrollHeight - container.clientHeight;
      if (maxScroll <= 0) return; // No scrollable content

      // Normalize delta across different browsers / input devices (touchpads vs mousewheels)
      let delta = e.deltaY;
      if (e.deltaMode === 1) {
        // Line mode (Firefox mouse wheel)
        delta *= 35;
      } else if (e.deltaMode === 2) {
        // Page mode
        delta *= container.clientHeight;
      }

      // Check if we are at boundary and scrolling further out
      const isAtTop = container.scrollTop <= 0 && delta < 0;
      const isAtBottom = container.scrollTop >= maxScroll && delta > 0;

      // Prevent harsh default browser jump and handle smoothly
      e.preventDefault();

      if (isAtTop || isAtBottom) {
        // Subtle bounce/elastic resistance effect at bounds if desired
        return;
      }

      // Calculate next target with calm momentum
      const newTarget = Math.max(
        0,
        Math.min(maxScroll, targetScrollRef.current + delta * speed)
      );

      targetScrollRef.current = newTarget;
      isTweeningRef.current = true;

      if (tweenRef.current) {
        tweenRef.current.kill();
      }

      tweenRef.current = gsap.to(container, {
        scrollTop: newTarget,
        duration: smoothness,
        ease: ease,
        overwrite: 'auto',
        onComplete: () => {
          isTweeningRef.current = false;
        },
      });
    };

    // Keyboard smooth navigation when container is hovered or active
    const handleKeyDown = (e) => {
      if (!container.contains(document.activeElement) && !container.matches(':hover')) {
        return;
      }

      let step = 0;
      if (e.key === 'ArrowDown') step = 80;
      else if (e.key === 'ArrowUp') step = -80;
      else if (e.key === 'PageDown') step = container.clientHeight * 0.75;
      else if (e.key === 'PageUp') step = -container.clientHeight * 0.75;
      else if (e.key === 'Home') {
        e.preventDefault();
        scrollTo(0, 0.9);
        return;
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollTo(container.scrollHeight, 0.9);
        return;
      }

      if (step !== 0) {
        e.preventDefault();
        const maxScroll = container.scrollHeight - container.clientHeight;
        const target = Math.max(0, Math.min(maxScroll, targetScrollRef.current + step));
        scrollTo(target, smoothness * 0.7);
      }
    };

    // Track native scroll events (scrollbar drag, touchpad swipe) to keep target in sync
    const handleScroll = () => {
      syncScrollPosition();
    };

    // Passive false is crucial so preventDefault() can stop native harsh scroll jumps
    container.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('scroll', handleScroll);
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
    };
  }, [speed, smoothness, ease, scrollTo, syncScrollPosition]);

  return {
    containerRef,
    scrollTo,
    scrollToElement,
  };
}
