import { formatGameTime, getPhase } from '../../game/gameTime';
import type { GameState } from '../../game/types';

export function GameHud({ state }: { state: GameState }) {
  return (
    <header className="game-hud">
      <div className="hud-time">
        <strong>{formatGameTime(state.elapsed)}</strong>
        <span>ФАЗА {getPhase(state.elapsed)}</span>
      </div>
      <div className="hud-meters">
        <Meter label="ЭНЕРГИЯ" value={state.energy} />
        <Meter label="ФОНАРИК" value={state.flashlightBattery} />
      </div>
    </header>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="meter">
      <span>{label}</span>
      <div className="meter__track"><i style={{ width: `${value}%` }} /></div>
      <b>{Math.ceil(value)}%</b>
    </div>
  );
}
