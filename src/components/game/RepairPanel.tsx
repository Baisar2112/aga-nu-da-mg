import type { GameState } from '../../game/types';

const colors = ['#ef4444', '#f59e0b', '#22c55e', '#38bdf8', '#a855f7'];

interface Props {
  state: GameState;
  selectWire: (wire: number, end: 'left' | 'right') => void;
  close: () => void;
}

export function RepairPanel({ state, selectWire, close }: Props) {
  return (
    <div className="panel-backdrop">
      <section className="repair-panel">
        <div className="panel-title">
          <div><small>ЭЛЕКТРОЩИТОК</small><h2>Соедините 5 проводов</h2></div>
          <button className="icon-button" onClick={close}>×</button>
        </div>
        <p>Выберите оборванный конец слева, затем такой же справа.</p>
        <div className="wires">
          <div className="wire-column">
            {colors.map((color, index) => <WireEnd key={color} color={color} fixed={state.wiresFixed.includes(index)} selected={state.selectedWire === index} onClick={() => selectWire(index, 'left')} />)}
          </div>
          <div className="wire-gap">ИЗОЛЕНТА</div>
          <div className="wire-column">
            {[2, 4, 0, 3, 1].map((index) => <WireEnd key={index} color={colors[index]} fixed={state.wiresFixed.includes(index)} selected={false} onClick={() => selectWire(index, 'right')} />)}
          </div>
        </div>
        <strong className="repair-progress">Готово: {state.wiresFixed.length} / 5</strong>
      </section>
    </div>
  );
}

function WireEnd({ color, fixed, selected, onClick }: { color: string; fixed: boolean; selected: boolean; onClick: () => void }) {
  return <button className={`wire ${fixed ? 'wire--fixed' : ''} ${selected ? 'wire--selected' : ''}`} style={{ '--wire': color } as React.CSSProperties} onClick={onClick} disabled={fixed}><i /></button>;
}
