import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ComputerScreen } from '../components/game/ComputerScreen';
import { EndScreen } from '../components/game/EndScreen';
import { GameHud } from '../components/game/GameHud';
import { OfficeScene } from '../components/game/OfficeScene';
import { PauseMenu } from '../components/game/PauseMenu';
import { RepairPanel } from '../components/game/RepairPanel';
import { FIRST_PHASE_SECONDS } from '../game/constants';
import { useGame } from '../game/useGame';
import { useGameSounds } from '../game/useGameSounds';

export function GamePage() {
  const [, navigate] = useLocation();
  const [isPaused, setIsPaused] = useState(false);
  const [pauseSelection, setPauseSelection] = useState(0);
  const game = useGame(isPaused);
  const { state, action } = game;
  useGameSounds(state, isPaused);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.code === 'Escape' && !state.gameOver && !state.won) {
        setIsPaused((paused) => !paused);
        setPauseSelection(0);
        return;
      }
      if (isPaused) {
        if (event.code === 'KeyW' || event.code === 'ArrowUp') setPauseSelection(0);
        if (event.code === 'KeyS' || event.code === 'ArrowDown') setPauseSelection(1);
        if (event.code === 'Space' || event.code === 'Enter') {
          event.preventDefault();
          if (pauseSelection === 0) setIsPaused(false);
          else navigate('/');
        }
        return;
      }
      if (event.code === 'KeyA') game.toggleDoor('left');
      if (event.code === 'KeyD') game.toggleDoor('right');
      if (event.code === 'Space') { event.preventDefault(); game.toggleTablet(); }
    };
    window.addEventListener('keydown', keyDown);
    return () => window.removeEventListener('keydown', keyDown);
  }, [game.toggleDoor, game.toggleTablet, isPaused, navigate, pauseSelection, state.gameOver, state.won]);

  const openDrawer = () => action((next) => {
    next.drawerOpen = !next.drawerOpen;
    if (next.drawerOpen && (!next.hasTape || !next.hasFlashlight)) {
      next.hasTape = true;
      next.hasFlashlight = true;
      Object.assign(next, { message: 'Вы забрали фонарик и изоленту.', messageTime: 4 });
    }
  });

  const selectWire = (wire: number, end: 'left' | 'right') => action((next) => {
    if (end === 'left') next.selectedWire = wire;
    else if (next.selectedWire === wire) {
      next.wiresFixed.push(wire);
      next.selectedWire = null;
      if (next.wiresFixed.length === 3 && next.elapsed < FIRST_PHASE_SECONDS) {
        Object.assign(next, { message: 'Три провода готовы: у дверей есть 6 секунд!', messageTime: 4 });
      }
      if (next.wiresFixed.length === 5) {
        next.problems.outageActive = false;
        next.problems.outageDone = true;
        next.repairOpen = false;
        Object.assign(next, { message: 'Электричество восстановлено!', messageTime: 4 });
      }
    } else next.selectedWire = null;
  });

  const computerVisible = ['WORKING', 'CAMERA_VIEW', 'REBOOTING'].includes(state.computer);
  return <div className={`game-shell${isPaused ? ' game-shell--paused' : ''}`}>
    <GameHud state={state} />
    <OfficeScene state={state} onDrawer={openDrawer}
      onFlashlight={() => game.setFlashlight(!state.flashlightOn)}
      onAim={(atRoomEight) => action((next) => { next.flashlightAtWindow = atRoomEight; })}
      onBox={() => action((next) => {
        if (next.problems.outageActive && next.hasTape) next.repairOpen = true;
        else Object.assign(next, { message: next.hasTape ? 'Щиток сейчас исправен.' : 'Сначала найдите изоленту.', messageTime: 3 });
      })}
      onChick={() => action((next) => {
        if (next.animatronics.chick.mode === 'office') {
          next.animatronics.chick.mode = 'retreating';
          next.animatronics.chick.timer = next.problems.rageActive ? 3 : 1;
          Object.assign(next, { message: 'Чик прогнан.', messageTime: 3 });
        }
      })} />
    <div className="controls-hint"><span><kbd>A</kbd> ЛЕВАЯ ДВЕРЬ</span><span><kbd>SPACE</kbd> ПЛАНШЕТ</span><span><kbd>D</kbd> ПРАВАЯ ДВЕРЬ</span><span><kbd>ПКМ</kbd> {state.hasFlashlight ? 'ФОНАРИК' : 'НЕТ ФОНАРИКА'}</span></div>
    {state.message && <div className="game-message">{state.message}</div>}
    {computerVisible && <ComputerScreen state={state} selectCamera={(camera) => action((next) => { next.selectedCamera = camera; next.computer = 'CAMERA_VIEW'; })} reboot={() => action((next) => { next.computer = 'REBOOTING'; next.rebootTime = 15; next.flashlightPulse = 0; })} />}
    {state.repairOpen && <RepairPanel state={state} selectWire={selectWire} close={() => action((next) => { next.repairOpen = false; })} />}
    {isPaused && <PauseMenu selected={pauseSelection} onSelect={setPauseSelection}
      onContinue={() => setIsPaused(false)} onExit={() => navigate('/')} />}
    {(state.gameOver || state.won) && <EndScreen won={state.won} reason={state.gameOver}
      restart={game.restart} openMenu={() => navigate('/')} />}
  </div>;
}
