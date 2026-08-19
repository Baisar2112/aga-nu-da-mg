import { useState, type PointerEvent } from 'react';
import { DEFAULT_OFFICE_BRIGHTNESS } from '../../game/constants';
import type { GameState } from '../../game/types';
import { DoorThreats, WindowThreat } from './ThreatSprites';

interface Props {
  state: GameState;
  onDrawer: () => void;
  onBox: () => void;
  onChick: () => void;
  onAim: (atRoomEight: boolean) => void;
  onFlashlight: () => void;
  onLeftDoor: () => void;
  onRightDoor: () => void;
}

export function OfficeScene(props: Props) {
  const { state, onDrawer, onBox, onChick, onAim, onFlashlight, onLeftDoor, onRightDoor } = props;
  const [pointer, setPointer] = useState({ x: 50, y: 42 });
  const anims = state.animatronics;
  const moveLight = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 100;
    const y = (event.clientY - rect.top) / rect.height * 100;
    setPointer({ x, y });
    onAim(x > 27 && x < 73 && y > 14 && y < 67);
  };
  const touchFlashlight = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'touch') return;
    if ((event.target as HTMLElement).closest('button, [data-touch-ignore]')) return;
    moveLight(event);
    if (state.hasFlashlight) onFlashlight();
  };
  const officeClass = `office${state.problems.outageActive ? ' office--power-outage' : ''}`;
  const brightness = .4 + (state.rules.officeBrightness ?? DEFAULT_OFFICE_BRIGHTNESS) * .015;
  const officeStyle = { '--office-brightness': brightness } as React.CSSProperties;
  return <main className={officeClass} style={officeStyle} onPointerMove={moveLight} onPointerUp={touchFlashlight}
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
    <Door side="left" closed={state.leftDoor.closed} moving={state.leftDoor.moving} blocked={state.leftDoor.blocked} />
    <Door side="right" closed={state.rightDoor.closed} moving={state.rightDoor.moving} blocked={state.rightDoor.blocked} />
    <div className="door-control door-control--left"><i /><i /></div>
    <div className="door-control door-control--right"><i /><i /></div>
    <WallDoorButton side="left" closed={state.leftDoor.closed} onClick={onLeftDoor} />
    <WallDoorButton side="right" closed={state.rightDoor.closed} onClick={onRightDoor} />
    <div className="window-frame">
      <div className="room-eight"><span className="room-eight__sign">ROOM 8</span><i /><i /><i /></div>
      <WindowThreat animatronics={anims} isLit={state.flashlightOn && state.flashlightAtWindow} />
    </div>
    <DoorThreats animatronics={anims} leftIsLit={state.flashlightOn && !state.flashlightAtWindow} />
    <button className={`chick ${anims.chick.mode === 'office' ? 'chick--present' : ''} ${anims.chick.mode === 'office' && state.flashlightOn ? 'chick--lit' : ''}`}
      onClick={onChick} aria-label="Прогнать Цыплёнка">
      <img src="/images/chick-fuse-box.png" alt="" aria-hidden="true" />
    </button>
    <button className="fuse-box" onClick={onBox} disabled={!state.problems.outageActive}
      aria-label="Электрощиток" />
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
      <button className={`drawer ${state.drawerOpen ? 'drawer--open' : ''}`} onClick={onDrawer}
        disabled={state.drawerOpen} aria-label="Открыть верхний правый ящик" />
    </div>
    {state.flashlightOn && <div className="flashlight-beam" style={{ '--light-x': `${pointer.x}%`, '--light-y': `${pointer.y}%` } as React.CSSProperties} />}
  </main>;
}

function Door({ side, closed, moving, blocked }: { side: 'left' | 'right'; closed: boolean; moving: boolean; blocked: boolean }) {
  return <div className={`office-door office-door--${side} ${closed ? 'office-door--closed' : ''} ${moving ? 'office-door--moving' : ''} ${blocked ? 'office-door--blocked' : ''}`}><div className="door-slab"><i /><i /><i /></div></div>;
}

function WallDoorButton({ side, closed, onClick }: { side: 'left' | 'right'; closed: boolean; onClick: () => void }) {
  const label = side === 'left' ? 'Левая дверь' : 'Правая дверь';
  return <button className={`wall-door-button wall-door-button--${side}`} type="button"
    aria-label={label} aria-pressed={closed} onClick={onClick}>
    <span aria-hidden="true" />
  </button>;
}
