import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, AudioLines, Sparkles } from 'lucide-react';
import { RollRoster } from './components/RollRoster';
import { SlotDisplay } from './components/SlotDisplay';
import { StageControls } from './components/StageControls';
import { useRoulette } from './hooks/useRoulette';
import { useStageSound } from './hooks/useStageSound';

const SPIN_LINES = [
  'qismat loading...',
  'CPU garam, awaam beqarar.',
  'Dua mode activated.',
  'Aaj toh scene ban gaya.',
  'HOLD UP!',
];

function App() {
  const [soundOn, setSoundOn] = useState(false);
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));
  const [spinLine, setSpinLine] = useState(0);
  const [showRoster, setShowRoster] = useState(true);
  const stageRef = useRef<HTMLElement>(null);
  const lineTimerRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const { playSpin, playReveal } = useStageSound(soundOn);
  const handleReveal = useCallback(() => {
    if (!reduceMotion) {
      confetti({ particleCount: 115, spread: 74, startVelocity: 36, origin: { x: 0.5, y: 0.53 }, colors: ['#BAFF39', '#37DDF3', '#ffffff', '#FFB547'], disableForReducedMotion: true });
      window.setTimeout(() => confetti({ particleCount: 52, spread: 110, startVelocity: 23, origin: { x: 0.22, y: 0.7 }, colors: ['#BAFF39', '#37DDF3', '#ffffff'], disableForReducedMotion: true }), 260);
      window.setTimeout(() => confetti({ particleCount: 52, spread: 110, startVelocity: 23, origin: { x: 0.78, y: 0.7 }, colors: ['#BAFF39', '#37DDF3', '#ffffff'], disableForReducedMotion: true }), 430);
    }
    playReveal();
  }, [playReveal, reduceMotion]);
  const roulette = useRoulette(handleReveal);
  const spinning = roulette.phase === 'spinning';
  const revealed = roulette.phase === 'revealed';

  const startSpin = useCallback(() => {
    if (roulette.phase !== 'ready') return;
    setSpinLine(0);
    roulette.spin();
    playSpin();
    if (lineTimerRef.current !== null) window.clearInterval(lineTimerRef.current);
    lineTimerRef.current = window.setInterval(() => setSpinLine((line) => (line + 1) % SPIN_LINES.length), 1270);
  }, [playSpin, roulette]);

  const reset = useCallback(() => {
    roulette.reset();
    if (lineTimerRef.current !== null) window.clearInterval(lineTimerRef.current);
    lineTimerRef.current = null;
    setSpinLine(0);
  }, [roulette]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stageRef.current?.requestFullscreen();
    } catch {
      // Fullscreen can be denied by a browser policy; the stage remains usable.
    }
  }, []);

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat || event.isComposing) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || Boolean(target.closest('input, textarea, select, button, a, [role="button"], [role="checkbox"], [role="switch"]')))) return;
      event.preventDefault();
      startSpin();
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [startSpin]);

  useEffect(() => () => {
    if (lineTimerRef.current !== null) window.clearInterval(lineTimerRef.current);
  }, []);

  return (
    <main ref={stageRef} className={`stage${spinning ? ' stage--spinning' : ''}${revealed ? ' stage--revealed' : ''}`}>
      <div className="ambient-grid" aria-hidden="true" />
      <div className="ambient-grain" aria-hidden="true" />
      <div className="scanline" aria-hidden="true" />
      <div className="stage-inner">
        <header className="topbar">
          <div className="show-mark"><span className="show-mark__icon"><AudioLines aria-hidden="true" /></span><span>LIVE PERFORMANCE</span></div>
          <StageControls soundOn={soundOn} fullscreen={fullscreen} onSoundToggle={() => setSoundOn((on) => !on)} onFullscreenToggle={() => void toggleFullscreen()} onReset={reset} />
        </header>

        <section className="hero" aria-label="Roll call roulette">
          <motion.div className="hero-copy" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: 'easeOut' }}>
            <div className="eyebrow"><span className="eyebrow-rule" />THE ROLL CALL ROULETTE<span className="eyebrow-rule" /></div>
            <h1>THE CHOSEN <span>ONE</span></h1>
            <p className="hero-subtitle">46 entered. One gets the spotlight.</p>
          </motion.div>

          <div className="stage-display">
            <div className="side-decoration side-decoration--left" aria-hidden="true"><span>ROLL<br />CALL</span><i /><i /><i /></div>
            <div className="slot-wrap">
              <div className="slot-caption"><span>✳&nbsp; LIVE DRAW &nbsp;✳</span><span>NO. 046</span></div>
              <SlotDisplay value={roulette.displayedRoll} spinning={spinning} revealed={revealed} />
              <div className="spin-whisper" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={spinning ? `spin-${spinLine}` : revealed ? 'reveal' : 'ready'} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
                    {spinning ? SPIN_LINES[spinLine] : revealed ? 'The room has spoken.' : 'Bhai ki qismat loading...'}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <div className="side-decoration side-decoration--right" aria-hidden="true"><span>MAIN<br />EVENT</span><Sparkles /><i /><i /><i /></div>
          </div>

          <div className="action-area">
            <AnimatePresence mode="wait" initial={false}>
              {revealed ? (
                <motion.div key="winner" className="winner-copy" initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55, ease: [0.2, 0.75, 0.25, 1] }}>
                  <span className="winner-kicker"><Sparkles aria-hidden="true" /> THE SPOTLIGHT IS YOURS <Sparkles aria-hidden="true" /></span>
                  <h2>THE CHOSEN ONE</h2>
                  <p>Khushkismat Insaan <strong>STAGE PAR AA JAYEIN!</strong></p>
                  <span className="winner-footnote">Congratulations... ya condolences?</span>
                </motion.div>
              ) : (
                <motion.div key="cta" className="cta-wrap" initial={false}>
                  <button type="button" className="summon-button" onClick={startSpin} disabled={spinning} aria-busy={spinning}>
                    <span>{spinning ? 'THE MOMENT IS COMING' : 'SUMMON THE CHOSEN ONE'}</span>
                    <ArrowDown className="summon-arrow" aria-hidden="true" />
                    <i className="button-sheen" aria-hidden="true" />
                  </button>
                  <span className="keyboard-hint">PRESS <kbd>SPACE</kbd> TO SPIN</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className={`roster-wrap${showRoster ? '' : ' roster-wrap--collapsed'}`}>
          <button type="button" className="roster-toggle" aria-expanded={showRoster} onClick={() => setShowRoster((show) => !show)}>
            <span>THE ROOM</span><span className="roster-toggle__line" /><span>{showRoster ? 'HIDE' : 'SHOW'} ROLL CALL</span>
          </button>
          <AnimatePresence initial={false}>
            {showRoster && <motion.div key="roster" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}><RollRoster activeRoll={spinning ? roulette.displayedRoll : revealed ? roulette.winner : null} spinning={spinning} /></motion.div>}
          </AnimatePresence>
        </section>

        <footer className="stage-footer"><span><i className="footer-live-dot" /> ON AIR</span><span>ONE ROOM. ONE MOMENT.</span><span>TAKE YOUR SHOT <span className="footer-star">✳</span></span></footer>
      </div>
    </main>
  );
}

export default App;
