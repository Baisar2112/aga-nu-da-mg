import { useState, type MouseEvent } from 'react';
import type { GameState } from '../../game/types';

interface Props {
  state: GameState;
  onComputer: () => void;
  onDrawer: () => void;
  onBox: () => void;
  onChick: () => void;
  onAim: (atWindow: boolean) => void;
  onFlashlight: () => void;
}

export function OfficeScene({ state, onComputer, onDrawer, onBox, onChick, onAim, onFlashlight }: Props) {
  const [pointer, setPointer] = useState({ x: 50, y: 45 });
  const anims = state.animatronics;
  const moveLight = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 100;
    const y = (event.clientY - rect.top) / rect.height * 100;
    setPointer({ x, y });
    onAim(x > 28 && x < 72 && y < 72);
  };
  const windowThreat = [anims.dog, anims.freddy].find((anim) => anim.mode === 'window');
  return (
    <main className="office" onMouseMove={moveLight} onContextMenu={(event) => { event.preventDefault(); onFlashlight(); }}>
      <div className="ceiling"><i /><i /><i /></div>
      <Door side="left" closed={state.leftDoor.closed} moving={state.leftDoor.moving} />
      <Door side="right" closed={state.rightDoor.closed} moving={state.rightDoor.moving} />
      <div className="door-control door-control--left"><i /><i /></div>
      <div className="door-control door-control--right"><i /><i /></div>
      <div className="window-frame"><div className="window-glass">
        <i className="rain rain--one" /><i className="rain rain--two" />
        {windowThreat && <div className={`window-creature ${state.flashlightOn && state.flashlightAtWindow ? 'visible' : ''}`}><span>●</span><span>●</span><b>{windowThreat.name === 'freddy' ? 'ФРЕДДИ' : 'СОБАКА'}</b></div>}
      </div></div>
      {anims.crocodile.mode === 'door' && <div className={`left-threat ${state.flashlightOn && !state.flashlightAtWindow ? 'revealed' : ''}`}><i /><b>КРОКОДИЛ</b></div>}
      {anims.dog.mode === 'door' && <div className="right-eyes"><i /><i /></div>}
      {anims.fox.mode === 'running' && <div className="fox-shadow">БЕГ →</div>}
      <button className={`chick ${anims.chick.mode === 'office' ? 'chick--present' : ''} ${anims.chick.mode === 'office' && state.flashlightOn ? 'chick--lit' : ''}`} onClick={onChick} aria-label="Прогнать цыплёнка"><i>●</i><i>●</i><b>▲</b></button>
      <button className="fuse-box" onClick={onBox}><span>⚡</span><small>ЩИТОК</small></button>
      <div className="desk">
        <button className={`desk-monitor ${state.computer !== 'OFF' ? 'desk-monitor--on' : ''}`} onClick={onComputer}><span>{state.computer === 'OFF' ? '' : 'SECURITY OS'}</span></button>
        <div className="keyboard" />
        <button className={`drawer ${state.drawerOpen ? 'drawer--open' : ''}`} onClick={onDrawer}><span>ТУМБОЧКА</span>{state.drawerOpen && <i>{state.hasTape ? '🔦' : '🔦  🟦'}</i>}</button>
      </div>
      {state.flashlightOn && <div className="flashlight-beam" style={{ '--light-x': `${pointer.x}%`, '--light-y': `${pointer.y}%` } as React.CSSProperties} />}
    </main>
  );
}

function Door({ side, closed, moving }: { side: 'left' | 'right'; closed: boolean; moving: boolean }) {
  return <div className={`office-door office-door--${side} ${closed ? 'office-door--closed' : ''} ${moving ? 'office-door--moving' : ''}`}><div className="door-slab"><i /><i /><i /></div></div>;
}
