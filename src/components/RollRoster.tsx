import { motion } from 'framer-motion';
import { ALL_ROLLS } from '../data/rolls';

type RollRosterProps = { activeRoll: string | null; spinning: boolean };

export function RollRoster({ activeRoll, spinning }: RollRosterProps) {
  return (
    <section className={`roster-panel${spinning ? ' roster-panel--spinning' : ''}`} aria-label="Class roll call">
      <div className="roster-heading">
        <span className="roster-heading__label"><span className="live-dot" /> ROLL CALL</span>
        <span className="roster-heading__count">46 IN THE ROOM</span>
      </div>
      <div className="roster-grid">
        {ALL_ROLLS.map((roll, index) => (
          <motion.span
            key={roll}
            className={`roster-roll${activeRoll === roll ? ' roster-roll--active' : ''}`}
            animate={spinning && index % 5 === 0 ? { opacity: [0.42, 0.82, 0.42] } : undefined}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: (index % 5) * 0.09 }}
          >
            {roll}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
