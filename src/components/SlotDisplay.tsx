import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type SlotDisplayProps = {
  value: string;
  spinning: boolean;
  spinProgress: number;
  revealed: boolean;
};

export function SlotDisplay({ value, spinning, spinProgress, revealed }: SlotDisplayProps) {
  const reduceMotion = useReducedMotion();
  const digitDuration = 0.045 + spinProgress * 0.235;
  return (
    <div className={`slot-machine${spinning ? ' slot-machine--spinning' : ''}${revealed ? ' slot-machine--revealed' : ''}`} aria-live="polite" aria-atomic="true">
      <div className="slot-halo" aria-hidden="true" />
      <div className="slot-frame">
        <span className="slot-edge slot-edge--left" aria-hidden="true" />
        <span className="slot-edge slot-edge--right" aria-hidden="true" />
        <div className="slot-window">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              className="slot-number"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 54, rotateX: -46, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: spinning && !reduceMotion ? 'blur(1.7px)' : 'blur(0px)' }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -48, rotateX: 38, filter: 'blur(8px)' }}
              transition={{ duration: reduceMotion ? 0.01 : spinning ? digitDuration : 0.34, ease: spinning ? [0.16, 0.7, 0.28, 1] : [0.2, 0.7, 0.25, 1] }}
              aria-label={value}
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="slot-glass" aria-hidden="true" />
        <div className="slot-tick slot-tick--top" aria-hidden="true" />
        <div className="slot-tick slot-tick--bottom" aria-hidden="true" />
      </div>
      <div className="slot-bottomline"><span>CLASS SIGNAL</span><span className="signal-bars" aria-hidden="true"><i /><i /><i /><i /><i /></span><span>{revealed ? 'LOCKED IN' : spinning ? 'SEARCHING' : 'AWAITING SIGNAL'}</span></div>
    </div>
  );
}
