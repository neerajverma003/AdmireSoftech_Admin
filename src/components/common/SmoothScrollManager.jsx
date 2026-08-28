import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const SmoothScrollContext = createContext(null);

export const useSmoothScroll = () => {
  const context = useContext(SmoothScrollContext);
  if (!context) {
    return {
      lenis: null,
      scrollToTop: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      scrollTo: (target) => {
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        }
      },
      scrollToElement: (elem) => {
        if (typeof elem === 'string') {
          const el = document.querySelector(elem);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (elem instanceof HTMLElement) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      },
    };
  }
  return context;
};

export default function SmoothScrollManager({ children }) {
  const location = useLocation();
  const lenisRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const buttonRef = useRef(null);

  // 1. Initialize Lenis + GSAP Ticker Synchronization
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Calm exponential ease out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.25,
      infinite: false,
      autoResize: true,
    });

    lenisRef.current = lenis;

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      if (e.scroll > 320) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    });

    // Update Lenis in GSAP's animation ticker
    const tickerUpdate = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // 2. Smoothly reset scroll to top on route change
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: false, duration: 0.6 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  // 3. Animate the Scroll to Top button with GSAP
  useEffect(() => {
    if (!buttonRef.current) return;

    if (showScrollTop) {
      gsap.to(buttonRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.35,
        ease: 'back.out(1.7)',
        display: 'flex',
        overwrite: 'auto',
      });
    } else {
      gsap.to(buttonRef.current, {
        opacity: 0,
        scale: 0.7,
        y: 12,
        duration: 0.25,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => {
          if (buttonRef.current && !showScrollTop) {
            buttonRef.current.style.display = 'none';
          }
        },
      });
    }
  }, [showScrollTop]);

  // Helper programmatic scroll functions
  const scrollToTop = useCallback((options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 0.9, ...options });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const scrollTo = useCallback((target, options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 0.9, ...options });
    }
  }, []);

  const scrollToElement = useCallback((elementOrSelector, options = {}) => {
    if (!elementOrSelector) return;
    if (lenisRef.current) {
      lenisRef.current.scrollTo(elementOrSelector, {
        offset: -40,
        duration: 0.9,
        ...options,
      });
    } else {
      const el =
        typeof elementOrSelector === 'string'
          ? document.querySelector(elementOrSelector)
          : elementOrSelector;
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisRef.current,
        scrollToTop,
        scrollTo,
        scrollToElement,
      }}
    >
      {children}

      {/* Floating Calm Scroll-To-Top Button */}
      <button
        ref={buttonRef}
        onClick={() => scrollToTop()}
        type="button"
        title="Scroll to Top"
        aria-label="Scroll to top of page"
        style={{ display: 'none' }}
        className="fixed bottom-6 right-6 z-40 h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/30 bg-[#070d1e]/90 text-cyan-400 shadow-[0_4px_24px_-4px_rgba(0,242,254,0.3)] backdrop-blur-md transition-colors hover:border-cyan-400 hover:bg-cyan-500/20 hover:text-white cursor-pointer group"
      >
        <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
      </button>
    </SmoothScrollContext.Provider>
  );
}
