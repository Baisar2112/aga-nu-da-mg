import type { CSSProperties, ReactNode } from 'react';

export type UiAnchorPoint =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface Props {
  anchor: UiAnchorPoint;
  children: ReactNode;
  className?: string;
  offsetX?: number;
  offsetY?: number;
}

export function UiAnchor({ anchor, children, className = '', offsetX = 0, offsetY = 0 }: Props) {
  const style = {
    '--anchor-x': `${offsetX}px`,
    '--anchor-y': `${offsetY}px`,
  } as CSSProperties;

  return <div className={`ui-anchor ui-anchor--${anchor} ${className}`} style={style}>{children}</div>;
}

interface PercentPositionProps {
  x: number;
  y: number;
  children: ReactNode;
  className?: string;
}

export function UiPercentPosition({ x, y, children, className = '' }: PercentPositionProps) {
  const style = {
    '--position-x': `${Math.min(100, Math.max(0, x))}%`,
    '--position-y': `${Math.min(100, Math.max(0, y))}%`,
  } as CSSProperties;

  return <div className={`ui-percent-position ${className}`} style={style}>{children}</div>;
}
