import { useState } from 'react';
import { label } from '../../game/animatronics';
import type { GameState } from '../../game/types';

interface Props {
  state: GameState;
  selectCamera: (camera: number) => void;
  reboot: () => void;
  close: () => void;
}

export function ComputerScreen({ state, selectCamera, reboot, close }: Props) {
  const [notesOpen, setNotesOpen] = useState(false);
  const visible = Object.values(state.animatronics).filter((anim) => {
    const inOffice = ['door', 'window', 'running', 'office'].includes(anim.mode);
    return anim.mode !== 'hidden' && (anim.route[anim.routeIndex] === String(state.selectedCamera) || (state.selectedCamera === 9 && inOffice));
  });
  return (
    <div className="computer-overlay">
      <section className={`monitor-ui ${state.problems.staticActive ? 'monitor-ui--static' : ''}`}>
        <header>
          <span>SECURITY OS / {state.computer}</span>
          <button className="monitor-close" onClick={close}>ВЫЙТИ</button>
        </header>
        {state.computer === 'REBOOTING' ? (
          <div className="reboot-screen"><div className="spinner" /><h2>ПЕРЕЗАГРУЗКА</h2><p>{Math.ceil(state.rebootTime)} сек.</p></div>
        ) : notesOpen ? (
          <Notes onBack={() => setNotesOpen(false)} />
        ) : (
          <div className="camera-layout">
            <div className="camera-feed">
              <span className="rec">● REC</span><b>КАМЕРА {state.selectedCamera}</b>
              <div className="feed-room"><i />
                {visible.length ? visible.map((anim) => <strong key={anim.name}>{label(anim.name)}</strong>) : <small>Движения нет</small>}
              </div>
              {state.problems.staticActive && <div className="static-noise">ПОМЕХИ</div>}
            </div>
            <div className="camera-map">
              <h3>СХЕМА ОБЪЕКТА</h3>
              <div className="camera-grid">
                {Array.from({ length: 9 }, (_, index) => index + 1).map((camera) =>
                  <button key={camera} className={state.selectedCamera === camera ? 'active' : ''} onClick={() => selectCamera(camera)}>{camera}</button>)}
              </div>
              <button className="terminal-button" onClick={() => setNotesOpen(true)}>ЗАПИСИ ОХРАННИКА</button>
              <button className="terminal-button danger" onClick={reboot}>ПЕРЕЗАГРУЗИТЬ</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Notes({ onBack }: { onBack: () => void }) {
  return <div className="notes"><button onClick={onBack}>← К камерам</button><h2>Записи прошлого охранника</h2><p>Не доверяй тишине. Крокодила остановит левая дверь. Собака боится света у окна.</p><p>Услышишь быстрый бег справа — закрывай дверь. С Фредди всё сложнее: слева сначала ослепи его, а у окна часто моргай фонариком.</p><p className="scribble">06:00 — и всё закончится.</p></div>;
}
