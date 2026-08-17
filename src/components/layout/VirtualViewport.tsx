import type { CSSProperties, ReactNode } from 'react';
import { useVirtualViewport, VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from '../../lib/virtualViewport';

interface Props {
  className?: string;
  world: ReactNode;
  children: ReactNode;
}

export function VirtualViewport({ className = '', world, children }: Props) {
  const { metrics, safeAreaProbe } = useVirtualViewport();
  const rootStyle = {
    '--safe-top': `${metrics.safeTop}px`,
    '--safe-right': `${metrics.safeRight}px`,
    '--safe-bottom': `${metrics.safeBottom}px`,
    '--safe-left': `${metrics.safeLeft}px`,
  } as CSSProperties;
  const worldStyle = {
    width: VIRTUAL_WIDTH,
    height: VIRTUAL_HEIGHT,
    transform: `translate3d(${metrics.worldLeft}px, ${metrics.worldTop}px, 0) scale(${metrics.scale})`,
  };

  return <div className={`game-viewport ${className}`} style={rootStyle}>
    <div ref={safeAreaProbe} className="safe-area-probe" aria-hidden="true" />
    <div className="game-world" style={worldStyle}>{world}</div>
    <div className="game-ui-layer">{children}</div>
  </div>;
}
