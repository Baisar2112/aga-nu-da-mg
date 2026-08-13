import { useState } from 'react';
import { label } from '../../game/animatronics';
import type { GameState } from '../../game/types';
import { CameraMap } from './CameraMap';

interface Props {
  state: GameState;
  selectCamera: (camera: number) => void;
  reboot: () => void;
}

export function ComputerScreen({ state, selectCamera, reboot }: Props) {
  const [notesOpen, setNotesOpen] = useState(false);
  const visible = Object.values(state.animatronics).filter((anim) => {
    const nearOffice = ['door', 'window', 'running', 'office'].includes(anim.mode);
    return anim.mode !== 'hidden' &&
      (anim.route[anim.routeIndex] === String(state.selectedCamera) || (state.selectedCamera === 9 && nearOffice));
  });

  return <div className="computer-overlay tablet-overlay">
    <section className={`monitor-ui tablet-ui ${state.problems.staticActive ? 'monitor-ui--static' : ''}`}>
      <header><span>TABLET / SECURITY CAMERAS</span><b>SPACE — ОПУСТИТЬ</b></header>
      {state.computer === 'REBOOTING' ? <RebootScreen seconds={state.rebootTime} />
        : notesOpen ? <Notes onBack={() => setNotesOpen(false)} />
          : <div className="tablet-layout">
            <CameraMap selected={state.selectedCamera} selectCamera={selectCamera} />
            <CameraFeed camera={state.selectedCamera} visible={visible.map((anim) => label(anim.name))}
              hasStatic={state.problems.staticActive} />
            <aside className="tablet-actions">
              <button onClick={() => setNotesOpen(true)}><span>▤</span>БЛОКНОТ</button>
              <button className="danger" onClick={reboot}><span>↻</span>ПЕРЕЗАГРУЗКА</button>
            </aside>
          </div>}
    </section>
  </div>;
}

function CameraFeed({ camera, visible, hasStatic }: { camera: number; visible: string[]; hasStatic: boolean }) {
  return <div className="camera-feed tablet-feed">
    <span className="rec">● REC</span><b>КАМЕРА {camera}</b>
    <div className={`feed-room feed-room--${camera}`}>
      {camera === 1 && <div className="long-corridor"><i /><i /><i /><i /></div>}
      {visible.length ? visible.map((name) => <strong key={name}>{name}</strong>) : <small>ДВИЖЕНИЯ НЕТ</small>}
    </div>
    {hasStatic && <div className="static-noise">ПОМЕХИ</div>}
  </div>;
}

function RebootScreen({ seconds }: { seconds: number }) {
  return <div className="reboot-screen"><div className="spinner" /><h2>ПЕРЕЗАГРУЗКА</h2><p>{Math.ceil(seconds)} СЕК.</p></div>;
}

function Notes({ onBack }: { onBack: () => void }) {
  return <div className="notes tablet-notes">
    <button onClick={onBack}>← К КАМЕРАМ</button><h2>ЗАПИСИ ОХРАННИКА</h2>
    <p>Не доверяй тишине. Кроко остановит левая дверь. Скреппи боится света у проёма в комнату 8.</p>
    <p>Услышишь быстрый бег справа — закрывай дверь. Фредди слева сначала ослепи, затем закрывай дверь.</p>
    <p className="scribble">06:00 — и всё закончится.</p>
  </div>;
}
