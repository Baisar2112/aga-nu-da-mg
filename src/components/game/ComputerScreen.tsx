import type { GameState } from '../../game/types';
import { CameraMap } from './CameraMap';
import { GuardNote } from './GuardNote';
import { RebootScreen } from './RebootScreen';

interface Props {
  state: GameState;
  selectCamera: (camera: number) => void;
  reboot: () => void;
  close: () => void;
  notesOpen: boolean;
  setNotesOpen: (open: boolean) => void;
}

export function ComputerScreen({ state, selectCamera, reboot, close, notesOpen, setNotesOpen }: Props) {
  const movementDetected = Object.values(state.animatronics).some((animatronic) => {
    const isOnCamera = animatronic.mode === 'waiting' || animatronic.mode === 'moving';
    if (isOnCamera && Number(animatronic.route[animatronic.routeIndex]) === state.selectedCamera) return true;
    if (animatronic.mode === 'window') return state.selectedCamera === 8;
    if (animatronic.mode !== 'door') return false;
    const doorSide = animatronic.route[animatronic.route.length - 1];
    return doorSide === 'left' ? state.selectedCamera === 7 : state.selectedCamera === 6;
  });

  return <div className="computer-overlay tablet-overlay">
    <section className="monitor-ui tablet-ui">
      <header><span>TABLET / SECURITY CAMERAS</span><b>SPACE — ОПУСТИТЬ</b>
        <button className="tablet-close" type="button" onClick={close} aria-label="Опустить планшет">×</button>
      </header>
      {state.computer === 'REBOOTING' ? <RebootScreen seconds={state.rebootTime} />
        : notesOpen ? <GuardNote onBack={() => setNotesOpen(false)} />
          : <div className="tablet-layout">
            <div className="tablet-workspace">
              <CameraMap selected={state.selectedCamera} movementDetected={movementDetected}
                movementUnavailable={state.problems.staticActive}
                watcherPosition={state.watcher.position}
                selectCamera={selectCamera} />
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
