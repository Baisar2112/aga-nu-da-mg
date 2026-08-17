import type { GameState } from '../../game/types';

type Animatronics = GameState['animatronics'];

interface WindowThreatProps {
  animatronics: Animatronics;
  isLit: boolean;
}

export function WindowThreat({ animatronics, isLit }: WindowThreatProps) {
  const threat = [animatronics.dog, animatronics.freddy]
    .find((animatronic) => animatronic.mode === 'window');
  if (!threat) return null;

  return <img
    className={`threat-sprite threat-sprite--window threat-sprite--${threat.name}-window ${isLit ? 'is-lit' : ''}`}
    src={`/images/${threat.name === 'dog' ? 'dog-window' : 'freddy-window'}.png`}
    alt=""
    aria-hidden="true"
  />;
}

interface DoorThreatsProps {
  animatronics: Animatronics;
  leftIsLit: boolean;
}

export function DoorThreats({ animatronics, leftIsLit }: DoorThreatsProps) {
  const freddySide = animatronics.freddy.mode === 'door'
    ? animatronics.freddy.route[animatronics.freddy.route.length - 1]
    : null;

  return <>
    <div className="door-threat-slot door-threat-slot--left">
      {animatronics.crocodile.mode === 'door' && <img
        className={`threat-sprite threat-sprite--door threat-sprite--crocodile ${leftIsLit ? 'is-lit' : ''}`}
        src="/images/crocodile-left-door.png" alt="" aria-hidden="true" />}
      {freddySide === 'left' && <img
        className={`threat-sprite threat-sprite--door threat-sprite--freddy-door ${leftIsLit ? 'is-lit' : ''}`}
        src="/images/freddy-left-door.png" alt="" aria-hidden="true" />}
    </div>
    <div className="door-threat-slot door-threat-slot--right">
      {animatronics.dog.mode === 'door' && <img
        className="threat-sprite threat-sprite--door threat-sprite--dog-door"
        src="/images/dog-right-door.png" alt="" aria-hidden="true" />}
      {freddySide === 'right' && <img
        className="threat-sprite threat-sprite--door threat-sprite--freddy-door"
        src="/images/freddy-right-door.png" alt="" aria-hidden="true" />}
    </div>
    {animatronics.fox.mode === 'running' && <img
      className="threat-sprite threat-sprite--fox-running"
      src="/images/fox-running.png" alt="" aria-hidden="true" />}
  </>;
}
