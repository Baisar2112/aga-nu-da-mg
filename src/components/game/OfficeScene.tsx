import { useState, type MouseEvent } from 'react';
import type { GameState } from '../../game/types';

interface Props {
  state: GameState;
  onDrawer: () => void;
  onBox: () => void;
  onChick: () => void;
  onAim: (atRoomEight: boolean) => void;
  onFlashlight: () => void;
}

export function OfficeScene(props: Props) {
  const { state, onDrawer, onBox, onChick, onAim, onFlashlight } = props;
  const [pointer, setPointer] = useState({ x: 50, y: 42 });
  const anims = state.animatronics;
  const moveLight = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 100;
    const y = (event.clientY - rect.top) / rect.height * 100;
    setPointer({ x, y });
    onAim(x > 27 && x < 73 && y > 14 && y < 67);
  };
  const roomThreat = [anims.dog, anims.freddy].find((anim) => anim.mode === 'window');

  return <main className="office" onMouseMove={moveLight}
    onContextMenu={(event) => { event.preventDefault(); if (state.hasFlashlight) onFlashlight(); }}>
    <div className="office-depth" aria-hidden="true">
      <div className="back-wall">
        <div className="wall-checkers" />
        <div className="poster poster--celebrate"><b>CELEBRATE!</b><i /><i /><i /></div>
        <div className="poster poster--rules"><b>RULES</b><i /><i /><i /></div>
        <div className="wall-notes"><i /><i /><i /><i /><i /></div>
      </div>
      <div className="side-wall side-wall--left"><i /></div>
      <div className="side-wall side-wall--right"><i /></div>
      <div className="checker-floor" />
      <div className="hanging-wires"><i /><i /><i /><i /></div>
    </div>
    <div className="ceiling"><i /><i /><i /></div>
    <Door side="left" closed={state.leftDoor.closed} moving={state.leftDoor.moving} />
    <Door side="right" closed={state.rightDoor.closed} moving={state.rightDoor.moving} />
    <div className="door-control door-control--left"><i /><i /></div>
    <div className="door-control door-control--right"><i /><i /></div>
    <div className="window-frame">
      <div className="room-eight"><span className="room-eight__sign">ROOM 8</span><i /><i /><i /></div>
      {roomThreat && <div className={`window-creature ${state.flashlightOn && state.flashlightAtWindow ? 'visible' : ''}`}>
        <span>●</span><span>●</span><b>{roomThreat.name === 'freddy' ? 'ФРЕДДИ' : 'СКРЕППИ'}</b>
      </div>}
    </div>
    {anims.crocodile.mode === 'door' && <div className={`left-threat ${state.flashlightOn && !state.flashlightAtWindow ? 'revealed' : ''}`}><i /><b>КРОКО</b></div>}
    {anims.dog.mode === 'door' && <div className="right-eyes"><i /><i /></div>}
    {anims.fox.mode === 'running' && <div className="fox-shadow">БЕГ →</div>}
    <button className={`chick ${anims.chick.mode === 'office' ? 'chick--present' : ''} ${anims.chick.mode === 'office' && state.flashlightOn ? 'chick--lit' : ''}`} onClick={onChick} aria-label="Прогнать Чика"><i>●</i><i>●</i><b>▲</b></button>
    <button className="fuse-box" onClick={onBox}><span>⚡</span><small>ЩИТОК</small></button>
    <div className="desk">
      <div className="desk-papers"><i /><i /></div>
      <div className="desk-cup"><i /></div>
      <div className="chick-plush" aria-label="Маленькая плюшевая игрушка Чика">
        <i className="chick-plush__tuft" /><i className="chick-plush__eye chick-plush__eye--left" />
        <i className="chick-plush__eye chick-plush__eye--right" /><b className="chick-plush__beak" />
      </div>
      <div className="desk-fan" aria-label="Работающий настольный вентилятор">
        <div className="desk-fan__rotor"><i /><i /><i /><b /></div>
      </div>
      <button className={`drawer ${state.drawerOpen ? 'drawer--open' : ''}`} onClick={onDrawer}>
        <span>ТУМБА</span>
        {state.drawerOpen && <i className="drawer-inside">{!state.hasFlashlight && <b className="drawer-flashlight" />}{!state.hasTape && <b className="drawer-tape" />}</i>}
      </button>
    </div>
    {state.flashlightOn && <div className="flashlight-beam" style={{ '--light-x': `${pointer.x}%`, '--light-y': `${pointer.y}%` } as React.CSSProperties} />}
  </main>;
}

function Door({ side, closed, moving }: { side: 'left' | 'right'; closed: boolean; moving: boolean }) {
  return <div className={`office-door office-door--${side} ${closed ? 'office-door--closed' : ''} ${moving ? 'office-door--moving' : ''}`}><div className="door-slab"><i /><i /><i /></div></div>;
}
