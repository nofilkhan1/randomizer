# Design direction

## Product

An English-language, full-screen live show controller for a university classroom, optimized for a 16:9 projector at 1366×768 and 1920×1080, with a compact phone layout. Its one job is to carry a dramatic volunteer reveal from a quiet ready state through a controlled spin.

## Visual system

- **Coal** `#0B0F14` — full-bleed stage background.
- **Panel** `#151D26` — recessed roster and control surfaces.
- **Voltage lime** `#BAFF39` — primary action, selection glow, and reveal.
- **Signal cyan** `#37DDF3` — broadcast details and secondary energy.
- **Tension amber** `#FFB547` — suspense captions.
- **Paper white** `#F5F7F5` — high-contrast display type.

Display typography uses locally bundled Barlow Condensed. Manrope handles interface copy, and DM Mono keeps roll numbers tabular and precise. The slot machine is the visual signature: a beveled, glassy signal window, neon rails, and digit turnover whose easing follows the deceleration curve. A dim broadcast grid and drifting particles frame the stage; cyan and lime light beams stay reserved for the reveal.

## Layout and behavior

The stage fills the viewport. A compact broadcast header frames the oversized title, centered slot, single primary action, and full roster ticker. Secondary controls stay quiet in the top-right. The active roster entry follows the slot; the final result holds steady until reset.

Motion and audio carry the reveal rather than competing with it. Reduced-motion preferences shorten transitions and suppress confetti; sound begins muted. All fonts and runtime assets ship locally. Keyboard focus stays visible, the spin button is a native button, and Space does not intercept text entry or button activation.

## Token mapping

Colors and font roles are CSS custom properties in `src/styles.css` (`--bg`, `--panel`, `--lime`, `--cyan`, `--amber`, `--white`, `--display`, `--body`, and `--mono`). Tailwind is available for utility composition; the stage's custom geometry and animation are owned by `src/styles.css`.
