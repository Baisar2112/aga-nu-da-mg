import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ComputerScreen } from '../components/game/ComputerScreen';
import { EndScreen } from '../components/game/EndScreen';
import { GameHud } from '../components/game/GameHud';
import { OfficeScene } from '../components/game/OfficeScene';
import { PauseMenu } from '../components/game/PauseMenu';
import { RepairPanel } from '../components/game/RepairPanel';
import { TouchControls } from '../components/game/TouchControls';
import { VirtualViewport } from '../components/layout/VirtualViewport';
import { FIRST_PHASE_SECONDS } from '../game/constants';
import { resetAnimatronic } from '../game/animatronics';
import { useGame } from '../game/useGame';
import { useGameSounds } from '../game/useGameSounds';

export function GamePage() {
  const [, navigate] = useLocation();
  const [isPaused, setIsPaused] = useState(false);
  const [pauseSelection, setPauseSelection] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const game = useGame(isPaused, notesOpen);
  const { state, action } = game;
  useGameSounds(state, isPaused);
  const computerVisible = ['WORKING', 'CAMERA_VIEW', 'REBOOTING'].includes(state.computer);

  useEffect(() => {
    if (!computerVisible) setNotesOpen(false);
  }, [computerVisible]);

  const toggleTablet = () => {
    if (computerVisible) setNotesOpen(false);
    game.toggleTablet();
  };

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
      if (event.code === 'Space') { event.preventDefault(); toggleTablet(); }
    };
    window.addEventListener('keydown', keyDown);
    return () => window.removeEventListener('keydown', keyDown);
  }, [computerVisible, game.toggleDoor, game.toggleTablet, isPaused, navigate, pauseSelection, state.gameOver, state.won]);

  const openDrawer = () => action((next) => {
    if (next.drawerOpen) return;
    next.drawerOpen = true;
    if (!next.hasTape || !next.hasFlashlight) {
      next.hasTape = true;
      next.hasFlashlight = true;
      Object.assign(next, { message: 'Вы забрали фонарик и изоленту.', messageTime: 4 });
    }
  });

  const connectWire = (wire: number) => action((next) => {
    if (!next.wiresFixed.includes(wire)) {
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
    }
  });

  const office = <OfficeScene state={state} onDrawer={openDrawer}
      onFlashlight={() => game.setFlashlight(!state.flashlightOn)}
      onAim={(atRoomEight) => action((next) => { next.flashlightAtWindow = atRoomEight; })}
      onBox={() => action((next) => {
        if (next.problems.outageActive && next.hasTape) next.repairOpen = true;
        else Object.assign(next, { message: next.hasTape ? 'Щиток сейчас исправен.' : 'Сначала найдите изоленту.', messageTime: 3 });
      })}
      onChick={() => action((next) => {
        if (next.animatronics.chick.mode === 'office') {
          resetAnimatronic(next.animatronics.chick);
          Object.assign(next, { message: 'Чик прогнан.', messageTime: 3 });
        }
      })} />;

  return <VirtualViewport className={`game-shell${isPaused ? ' game-shell--paused' : ''}`} world={office}>
    <GameHud state={state} />
    <div className="controls-hint"><span><kbd>A</kbd> ЛЕВАЯ ДВЕРЬ</span><span><kbd>SPACE</kbd> ПЛАНШЕТ</span><span><kbd>D</kbd> ПРАВАЯ ДВЕРЬ</span><span><kbd>ПКМ</kbd> {state.hasFlashlight ? 'ФОНАРИК' : 'НЕТ ФОНАРИКА'}</span></div>
    {!isPaused && !computerVisible && !state.repairOpen && !state.gameOver && !state.won &&
      <TouchControls onLeftDoor={() => game.toggleDoor('left')} onRightDoor={() => game.toggleDoor('right')}
        onTablet={toggleTablet}
        onPause={() => { setIsPaused(true); setPauseSelection(0); }} />}
    {computerVisible && <ComputerScreen state={state} close={toggleTablet}
      notesOpen={notesOpen} setNotesOpen={setNotesOpen}
      selectCamera={(camera) => action((next) => { next.selectedCamera = camera; next.computer = 'CAMERA_VIEW'; })}
      reboot={() => action((next) => { next.computer = 'REBOOTING'; next.rebootTime = 15; next.flashlightPulse = 0; })} />}
    {state.repairOpen && <RepairPanel state={state} connectWire={connectWire} close={() => action((next) => { next.repairOpen = false; })} />}
    {isPaused && <PauseMenu selected={pauseSelection} onSelect={setPauseSelection}
      onContinue={() => setIsPaused(false)} onExit={() => navigate('/')} />}
    {(state.gameOver || state.won) && <EndScreen won={state.won} reason={state.gameOver}
      restart={game.restart} openMenu={() => navigate('/')} />}
  </VirtualViewport>;
}
