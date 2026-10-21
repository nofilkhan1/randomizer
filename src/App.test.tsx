import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

describe('stage controls', () => {
  afterEach(() => {
    document.fullscreenElement && document.exitFullscreen?.();
  });

  it('toggles sound and provides a working full-viewport fallback when fullscreen is unavailable', () => {
    render(<App />);

    const soundButton = screen.getByRole('button', { name: 'Turn sound on' });
    fireEvent.click(soundButton);
    expect(screen.getByRole('button', { name: 'Turn sound off' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Turn sound off' }));
    expect(screen.getByRole('button', { name: 'Turn sound on' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Enter fullscreen' }));
    expect(document.querySelector('.stage')).toHaveClass('stage--pseudo-fullscreen');
    expect(screen.getByRole('button', { name: 'Exit fullscreen' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.querySelector('.stage')).not.toHaveClass('stage--pseudo-fullscreen');
    expect(screen.getByRole('button', { name: 'Enter fullscreen' })).toBeInTheDocument();
  });
});
