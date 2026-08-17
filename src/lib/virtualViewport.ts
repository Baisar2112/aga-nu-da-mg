import { useLayoutEffect, useRef, useState } from 'react';

export const VIRTUAL_WIDTH = 1920;
export const VIRTUAL_HEIGHT = 1080;

interface ViewportMetrics {
  width: number;
  height: number;
  scale: number;
  worldLeft: number;
  worldTop: number;
  safeTop: number;
  safeRight: number;
  safeBottom: number;
  safeLeft: number;
}

function readPixels(value: string) {
  return Number.parseFloat(value) || 0;
}

function calculateMetrics(probe: HTMLDivElement | null): ViewportMetrics {
  const viewport = window.visualViewport;
  const width = viewport?.width ?? window.innerWidth;
  const height = viewport?.height ?? window.innerHeight;
  const styles = probe ? window.getComputedStyle(probe) : null;
  const safeTop = styles ? readPixels(styles.paddingTop) : 0;
  const safeRight = styles ? readPixels(styles.paddingRight) : 0;
  const safeBottom = styles ? readPixels(styles.paddingBottom) : 0;
  const safeLeft = styles ? readPixels(styles.paddingLeft) : 0;
  const availableWidth = Math.max(1, width - safeLeft - safeRight);
  const availableHeight = Math.max(1, height - safeTop - safeBottom);
  const scale = Math.min(availableWidth / VIRTUAL_WIDTH, availableHeight / VIRTUAL_HEIGHT);

  return {
    width,
    height,
    scale,
    safeTop,
    safeRight,
    safeBottom,
    safeLeft,
    worldLeft: (viewport?.offsetLeft ?? 0) + safeLeft + (availableWidth - VIRTUAL_WIDTH * scale) / 2,
    worldTop: (viewport?.offsetTop ?? 0) + safeTop + (availableHeight - VIRTUAL_HEIGHT * scale) / 2,
  };
}

export function useVirtualViewport() {
  const safeAreaProbe = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<ViewportMetrics>(() => calculateMetrics(null));

  useLayoutEffect(() => {
    const update = () => setMetrics(calculateMetrics(safeAreaProbe.current));
    const viewport = window.visualViewport;
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
    };
  }, []);

  return { metrics, safeAreaProbe };
}
