import { useEffect, useState } from 'react';

const NUMERIC = /^(-?)([\d,]+)(?:\.(\d+))?$/;

interface NumericParts { sign: string; target: number; decimals: number; grouped: boolean; }

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

function parseNumeric(value: string): NumericParts | null {
  const m = NUMERIC.exec(value.trim());
  if (!m) return null;
  const target = Number(`${m[2].replaceAll(',', '')}${m[3] ? `.${m[3]}` : ''}`);
  if (!Number.isFinite(target)) return null;
  return { sign: m[1], target, decimals: (m[3] ?? '').length, grouped: m[2].includes(',') };
}

function format(n: number, p: NumericParts): string {
  const [i, d] = n.toFixed(p.decimals).split('.');
  const int = p.grouped ? Number(i).toLocaleString('en-US') : i;
  return `${p.sign}${int}${d !== undefined ? `.${d}` : ''}`;
}

/** 結果の大きな数字を 0 から目標値まで短く数え上げる。reduced-motion のときは数え上げない。 */
export function useCountUp(value: string, durationMs = 720): string {
  const [frame, setFrame] = useState<{ forValue: string; text: string } | null>(null);

  useEffect(() => {
    const p = parseNumeric(value);
    if (!p || prefersReducedMotion()) return undefined;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number): void => {
      const progress = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setFrame({ forValue: value, text: progress < 1 ? format(p.target * eased, p) : value });
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return frame && frame.forValue === value ? frame.text : value;
}
