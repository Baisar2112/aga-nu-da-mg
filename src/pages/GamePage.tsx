import { useEffect } from 'react';
import { ComputerScreen } from '../components/game/ComputerScreen';
import { EndScreen } from '../components/game/EndScreen';
import { GameHud } from '../components/game/GameHud';
import { OfficeScene } from '../components/game/OfficeScene';
import { RepairPanel } from '../components/game/RepairPanel';
import { useGame } from '../game/useGame';
import { useGameSounds } from '../game/useGameSounds';

export function GamePage() {
  const game = useGame();
  const { state, action } = game;
  useGameSounds(state.message);
  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === 'KeyA') game.toggleDoor('left');
      if (event.code === 'KeyD') game.toggleDoor('right');
      if (event.code === 'Space') { event.preventDefault(); game.enterComputer(); }
    };
    window.addEventListener('keydown', keyDown);
    return () => window.removeEventListener('keydown', keyDown);
  }, [game.toggleDoor, game.enterComputer]);

  const selectWire = (wire: number, end: 'left' | 'right') => action((next) => {
    if (end === 'left') next.selectedWire = wire;
    else if (next.selectedWire === wire) {
      next.wiresFixed.push(wire);
      next.selectedWire = null;
      if (next.wiresFixed.length === 5) {
        next.problems.outageActive = false;
        next.problems.outageDone = true;
        next.repairOpen = false;
        Object.assign(next, { message: 'Электричество восстановлено!', messageTime: 4 });
      }
    } else next.selectedWire = null;
  });

  const computerVisible = ['WORKING', 'CAMERA_VIEW', 'REBOOTING'].includes(state.computer);
  return <div className="game-shell">
    <GameHud state={state} />
    <OfficeScene state={state} onComputer={game.toggleComputer} onFlashlight={() => game.setFlashlight(!state.flashlightOn)}
      onAim={(atWindow) => action((next) => { next.flashlightAtWindow = atWindow; })}
      onDrawer={() => action((next) => { next.drawerOpen = !next.drawerOpen; if (next.drawerOpen) next.hasTape = true; })}
      onBox={() => action((next) => { if (next.problems.outageActive && next.hasTape) next.repairOpen = true; else Object.assign(next, { message: next.hasTape ? 'Щиток сейчас исправен.' : 'Сначала возьмите синюю изоленту.', messageTime: 3 }); })}
      onChick={() => action((next) => { if (next.animatronics.chick.mode === 'office') { next.animatronics.chick.mode = 'retreating'; next.animatronics.chick.timer = 3; Object.assign(next, { message: 'Цыплёнок прогнан.', messageTime: 3 }); } })} />
    <div className="controls-hint"><span><kbd>A</kbd> левая дверь</span><span><kbd>SPACE</kbd> компьютер</span><span><kbd>D</kbd> правая дверь</span><span><kbd>ПКМ</kbd> фонарик</span></div>
    {state.message && <div className="game-message">{state.message}</div>}
    {computerVisible && <ComputerScreen state={state} selectCamera={(camera) => action((next) => { next.selectedCamera = camera; next.computer = 'CAMERA_VIEW'; })} reboot={() => action((next) => { next.computer = 'REBOOTING'; next.rebootTime = 15; next.flashlightPulse = 0; })} close={game.toggleComputer} />}
    {state.repairOpen && <RepairPanel state={state} selectWire={selectWire} close={() => action((next) => { next.repairOpen = false; })} />}
    {(state.gameOver || state.won) && <EndScreen won={state.won} reason={state.gameOver} restart={game.restart} />}
  </div>;
}
