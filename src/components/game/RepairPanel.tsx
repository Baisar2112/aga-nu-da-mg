import { useState, type PointerEvent } from 'react';
import type { GameState } from '../../game/types';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#38bdf8', '#a855f7'];
const RIGHT_ORDER = [2, 4, 0, 3, 1];
const rowY = (row: number) => 70 + row * 90;

interface DragState {
  wire: number;
  side: 'left' | 'right';
  x: number;
  y: number;
}

interface Props {
  state: GameState;
  connectWire: (wire: number) => void;
  close: () => void;
}

export function RepairPanel({ state, connectWire, close }: Props) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const pointFromEvent = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * 1000 / rect.width, y: (event.clientY - rect.top) * 500 / rect.height };
  };
  const finishDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)
      ?.closest<SVGGElement>('[data-wire-end]');
    const sameWire = Number(target?.dataset.wire) === drag.wire;
    const oppositeSide = target?.dataset.side !== drag.side;
    if (sameWire && oppositeSide) connectWire(drag.wire);
    setDrag(null);
  };

  return <div className="panel-backdrop">
    <section className="repair-panel">
      <div className="panel-title">
        <div><small>ЭЛЕКТРОЩИТОК</small><h2>СОЕДИНИТЕ 5 ПРОВОДОВ</h2></div>
        <button className="icon-button" onClick={close}>×</button>
      </div>
      <p>Зажмите оборванный конец и протяните его к проводу такого же цвета.</p>
      <svg className="wire-board" viewBox="0 0 1000 500" onPointerMove={(event) => {
        if (drag) setDrag({ ...drag, ...pointFromEvent(event) });
      }} onPointerUp={finishDrag} onPointerCancel={() => setDrag(null)}>
        <rect className="wire-board__case" x="5" y="5" width="990" height="490" />
        {COLORS.map((color, wire) => {
          const leftY = rowY(wire);
          const rightY = rowY(RIGHT_ORDER.indexOf(wire));
          if (state.wiresFixed.includes(wire)) {
            const middleY = (leftY + rightY) / 2;
            const tapeAngle = Math.atan2(rightY - leftY, 910) * 180 / Math.PI;
            return <g className="joined-wire" key={color} style={{ '--wire': color } as React.CSSProperties}>
              <path d={`M 45 ${leftY} C 340 ${leftY}, 660 ${rightY}, 955 ${rightY}`} />
              <g transform={`rotate(${tapeAngle} 500 ${middleY})`}>
                <rect className="wire-tape" x="466" y={middleY - 18} width="68" height="36" />
                <path className="wire-tape__stripe" d={`M 478 ${middleY - 17} V ${middleY + 17} M 494 ${middleY - 17} V ${middleY + 17} M 510 ${middleY - 17} V ${middleY + 17}`} />
              </g>
            </g>;
          }
          return <g key={color} style={{ '--wire': color } as React.CSSProperties}>
            <WireHalf wire={wire} side="left" path={`M 45 ${leftY} C 180 ${leftY}, 300 ${leftY - 12}, 420 ${leftY}`} tipX={420} tipY={leftY}
              start={(side) => setDrag({ wire, side, x: 420, y: leftY })} />
            <WireHalf wire={wire} side="right" path={`M 580 ${rightY} C 700 ${rightY + 12}, 820 ${rightY}, 955 ${rightY}`} tipX={580} tipY={rightY}
              start={(side) => setDrag({ wire, side, x: 580, y: rightY })} />
          </g>;
        })}
        {drag && <path className="dragged-wire" style={{ '--wire': COLORS[drag.wire] } as React.CSSProperties}
          d={`M ${drag.side === 'left' ? 420 : 580} ${drag.side === 'left' ? rowY(drag.wire) : rowY(RIGHT_ORDER.indexOf(drag.wire))} L ${drag.x} ${drag.y}`} />}
      </svg>
      <strong className="repair-progress">ГОТОВО: {state.wiresFixed.length} / 5</strong>
    </section>
  </div>;
}

function WireHalf({ wire, side, path, tipX, tipY, start }: {
  wire: number; side: 'left' | 'right'; path: string; tipX: number; tipY: number;
  start: (side: 'left' | 'right') => void;
}) {
  return <g className="wire-half" data-wire-end data-wire={wire} data-side={side}
    onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); start(side); }}>
    <path d={path} />
    <circle cx={tipX} cy={tipY} r="25" />
  </g>;
}
