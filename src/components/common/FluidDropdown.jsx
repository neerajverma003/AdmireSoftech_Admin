import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * FluidDropdown — Animated fluid-style dropdown with icon support
 *
 * Props:
 *  - trigger: ReactNode  — custom trigger element (replaces default)
 *  - label: string       — trigger label text (when no custom trigger)
 *  - items: Array<{ id, label, icon?, color?, onClick?, divider? }>
 *  - align: 'left' | 'right'   (default: 'right')
 *  - width: string   (default: 'w-56')
 *  - className: string
 */
export function FluidDropdown({
  trigger,
  label = 'Options',
  items = [],
  align = 'right',
  width = 'w-56',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleItemClick = (item) => {
    if (item.onClick) item.onClick();
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Trigger */}
      <div onClick={() => setOpen((p) => !p)} className="cursor-pointer select-none">
        {trigger ?? (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 text-sm font-semibold hover:border-cyan-500/40 transition-all">
            {label}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180 text-cyan-400' : 'text-slate-400'}`}
            />
          </button>
        )}
      </div>

      {/* Animated Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 ${width} z-50 rounded-2xl overflow-hidden`}
            style={{
              background: 'linear-gradient(145deg, #091024 0%, #0b142e 100%)',
              border: '1px solid rgba(56, 189, 248, 0.12)',
              boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(56,189,248,0.06)',
            }}
          >
            <div className="p-1.5">
              {items.map((item, idx) => {
                if (item.divider) {
                  return <div key={`div-${idx}`} className="my-1.5 border-t border-slate-800/80" />;
                }
                const Icon = item.icon;
                const isHovered = hovered === idx;
                return (
                  <motion.button
                    key={item.id ?? idx}
                    onClick={() => handleItemClick(item)}
                    onHoverStart={() => setHovered(idx)}
                    onHoverEnd={() => setHovered(null)}
                    className="relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-left overflow-hidden"
                    style={{ color: item.danger ? '#f87171' : isHovered ? (item.color || '#00f2fe') : '#cbd5e1' }}
                  >
                    {/* Fluid fill background */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          key="bg"
                          layoutId={`fluid-bg-${idx}`}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.15, ease: 'easeOut' }}
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: item.danger
                              ? 'rgba(239, 68, 68, 0.08)'
                              : `radial-gradient(ellipse at left, ${item.color || 'rgba(0,242,254,0.1)'} 0%, transparent 70%)`,
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {Icon && (
                      <motion.span
                        animate={{ scale: isHovered ? 1.15 : 1 }}
                        transition={{ duration: 0.15 }}
                        className="relative shrink-0"
                        style={{ color: item.danger ? '#f87171' : item.color || '#64748b' }}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.span>
                    )}
                    <span className="relative truncate">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
