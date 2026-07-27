import { animate, stagger } from 'animejs';
import { useEffect, useRef } from 'react';

/** Fades + gently slides a screen's root element in on mount. */
export function useScreenEnter<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    animate(ref.current, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 360,
      ease: 'outQuad',
    });
  }, []);
  return ref;
}

/** Staggers a container's direct-descendant matches in — used for the section picker's checklist rows. */
export function staggerRowsIn(container: HTMLElement | null, selector: string) {
  if (!container) return;
  const rows = container.querySelectorAll(selector);
  if (rows.length === 0) return;
  animate(rows, {
    opacity: [0, 1],
    translateX: [-6, 0],
    delay: stagger(25),
    duration: 260,
    ease: 'outQuad',
  });
}

/** A looping pulse, used while something is generating. Caller should revert() it on cleanup. */
export function loopingPulse(el: Element | null) {
  if (!el) return undefined;
  return animate(el, {
    scale: [1, 1.1, 1],
    duration: 1100,
    loop: true,
    ease: 'inOutSine',
  });
}

/** A quick "success pop" — used when a diagram is attached. */
export function popIn(el: Element | null | undefined) {
  if (!el) return;
  animate(el, {
    scale: [0.75, 1.08, 1],
    duration: 380,
    ease: 'outBack',
  });
}
