import { useState } from 'react';
import type { GameState } from '../../game/types';
import { CameraMap } from './CameraMap';
import { GuardNote } from './GuardNote';
import { RebootScreen } from './RebootScreen';

interface Props {
  state: GameState;
  selectCamera: (camera: number) => void;
  reboot: () => void;
}

export function ComputerScreen({ state, selectCamera, reboot }: Props) {
  const [notesOpen, setNotesOpen] = useState(false);

  return <div className="computer-overlay tablet-overlay">
    <section className={`monitor-ui tablet-ui ${state.problems.staticActive ? 'monitor-ui--static' : ''}`}>
      <header><span>TABLET / SECURITY CAMERAS</span><b>SPACE — ОПУСТИТЬ</b></header>
      {state.computer === 'REBOOTING' ? <RebootScreen seconds={state.rebootTime} />
        : notesOpen ? <GuardNote onBack={() => setNotesOpen(false)} />
          : <div className="tablet-layout">
            <div className="tablet-workspace">
              <CameraMap selected={state.selectedCamera} selectCamera={selectCamera} />
            </div>
            <aside className="tablet-actions">
              <button className="reboot-button" onClick={reboot}>
                <span className="reboot-button__lamp" />
                <strong>REBOOT</strong><small>ПЕРЕЗАГРУЗКА</small>
              </button>
              <button className="notebook-button" onClick={() => setNotesOpen(true)}>
                <span className="notebook-button__rings" aria-hidden="true" />
                <strong>БЛОКНОТ</strong><small>ЗАПИСЬ ОХРАННИКА</small>
              </button>
            </aside>
          </div>}
    </section>
  </div>;
}
