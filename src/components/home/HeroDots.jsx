import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { mountDotField } from '../../lib/dotField';

/**
 * Dot field behind the top of the home page, from the Shellui windows layout.
 * Portaled to <body> so it spans the whole frame: in the floating layout it runs
 * under the glass sidebar, while the SDK's inset padding keeps content clear of it.
 * Canvas while motion is allowed, a static CSS grid under reduced motion.
 */
export default function HeroDots() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    let destroy = null;
    const start = () => {
      if (!destroy && !reduce?.matches) destroy = mountDotField(host);
    };
    const stop = () => {
      destroy?.();
      destroy = null;
    };
    const onChange = () => (reduce?.matches ? stop() : start());
    reduce?.addEventListener?.('change', onChange);
    start();
    return () => {
      reduce?.removeEventListener?.('change', onChange);
      stop();
    };
  }, []);

  return createPortal(
    <div
      ref={hostRef}
      aria-hidden
      className="pg-hero-dots"
    />,
    document.body,
  );
}
