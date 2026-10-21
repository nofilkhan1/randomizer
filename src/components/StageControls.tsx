import { Maximize2, Minimize2, RotateCcw, Volume2, VolumeX } from 'lucide-react';

type StageControlsProps = {
  soundOn: boolean;
  fullscreen: boolean;
  onSoundToggle: () => void;
  onFullscreenToggle: () => void;
  onReset: () => void;
};

export function StageControls({ soundOn, fullscreen, onSoundToggle, onFullscreenToggle, onReset }: StageControlsProps) {
  return (
    <nav aria-label="Stage controls" className="stage-controls">
      <button type="button" className="utility-button" onClick={onFullscreenToggle} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
        {fullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
        <span>FULLSCREEN</span>
      </button>
      <button type="button" className="utility-button icon-utility" onClick={onSoundToggle} aria-label={soundOn ? 'Turn sound off' : 'Turn sound on'} aria-pressed={soundOn} title={soundOn ? 'Sound on' : 'Sound off'}>
        {soundOn ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        <span>SOUND {soundOn ? 'ON' : 'OFF'}</span>
      </button>
      <button type="button" className="utility-button icon-utility" onClick={onReset} aria-label="Reset roulette" title="Reset">
        <RotateCcw aria-hidden="true" />
        <span>RESET</span>
      </button>
    </nav>
  );
}
