import { useEffect, useState, type FormEvent } from 'react';
import { GAME_MINUTES, NIGHT_SECONDS } from '../../game/constants';
import type { AnimatronicName, GameRules, ProblemRule } from '../../game/types';
import {
  ANIMATRONIC_LABELS, ANIMATRONIC_NAMES, clearDeveloperConfig,
  createConsoleDefaults, loadDeveloperConfig, saveDeveloperConfig,
} from '../../lib/developerConfig';

const PROBLEMS: Array<{ name: keyof GameRules['problems']; label: string }> = [
  { name: 'outage', label: 'Авария питания' },
  { name: 'static', label: 'Помехи камер' },
  { name: 'rage', label: 'Бешенство' },
];

export function DeveloperConsole({ close }: { close: () => void }) {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [rules, setRules] = useState(() => loadDeveloperConfig() ?? createConsoleDefaults());

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.code === 'Escape' && close();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close]);

  const unlock = (event: FormEvent) => {
    event.preventDefault();
    if (password === '2112') setUnlocked(true);
    else setError(true);
  };

  const updateAnim = (name: AnimatronicName, patch: Partial<GameRules['animatronics'][AnimatronicName]>) => {
    setRules((current) => ({ ...current, animatronics: {
      ...current.animatronics,
      [name]: { ...current.animatronics[name], ...patch },
    } }));
  };

  const updateProblem = (name: keyof GameRules['problems'], patch: Partial<ProblemRule>) => {
    setRules((current) => ({ ...current, problems: {
      ...current.problems,
      [name]: { ...current.problems[name], ...patch },
    } }));
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    const normalized = structuredClone(rules);
    ANIMATRONIC_NAMES.forEach((name) => {
      normalized.animatronics[name].spawnTime = clamp(normalized.animatronics[name].spawnTime, 0, NIGHT_SECONDS);
      normalized.animatronics[name].speed = clamp(normalized.animatronics[name].speed, .1, 5);
    });
    PROBLEMS.forEach(({ name }) => {
      normalized.problems[name].at = clamp(normalized.problems[name].at, 0, NIGHT_SECONDS);
    });
    saveDeveloperConfig(normalized);
    close();
  };

  if (!unlocked) return <div className="developer-backdrop">
    <form className="developer-password" onSubmit={unlock}>
      <button className="developer-close" type="button" onClick={close}>×</button>
      <small>RESTRICTED ACCESS</small><h2>ПАРОЛЬ</h2>
      <input autoFocus type="password" inputMode="numeric" maxLength={4} value={password}
        onChange={(event) => { setPassword(event.target.value); setError(false); }} />
      {error && <p>НЕВЕРНЫЙ ПАРОЛЬ</p>}
      <button type="submit">ВОЙТИ</button>
    </form>
  </div>;

  return <div className="developer-backdrop">
    <form className="developer-console" onSubmit={save}>
      <header><div><small>SYSTEM OVERRIDE</small><h2>КОНСОЛЬ РАЗРАБОТЧИКА</h2></div>
        <button className="developer-close" type="button" onClick={close}>×</button></header>
      <section><h3>АНИМАТРОНИКИ</h3>
        {ANIMATRONIC_NAMES.map((name) => <div className="developer-row" key={name}>
          <label><input type="checkbox" checked={rules.animatronics[name].enabled}
            onChange={(event) => updateAnim(name, { enabled: event.target.checked })} /> {ANIMATRONIC_LABELS[name]}</label>
          <GameTimeField label="ПОЯВЛЕНИЕ" value={rules.animatronics[name].spawnTime}
            change={(spawnTime) => updateAnim(name, { spawnTime })} />
          <NumberField label="СКОРОСТЬ" value={rules.animatronics[name].speed} step={.1}
            change={(speed) => updateAnim(name, { speed })} />
        </div>)}
      </section>
      <section><h3>ПРОБЛЕМЫ</h3>
        {PROBLEMS.map(({ name, label }) => <div className="developer-row developer-row--problem" key={name}>
          <label><input type="checkbox" checked={rules.problems[name].enabled}
            onChange={(event) => updateProblem(name, { enabled: event.target.checked })} /> {label}</label>
          <GameTimeField label="МОМЕНТ" value={rules.problems[name].at}
            change={(at) => updateProblem(name, { at })} />
        </div>)}
      </section>
      <p className="developer-note">Настройки применятся после запуска новой игры.</p>
      <footer><button type="button" onClick={() => { clearDeveloperConfig(); setRules(createConsoleDefaults()); }}>СБРОСИТЬ</button>
        <button type="submit">СОХРАНИТЬ</button></footer>
    </form>
  </div>;
}

function NumberField({ label, value, change, step = 1 }: { label: string; value: number; change: (value: number) => void; step?: number }) {
  return <label className="developer-number"><span>{label}</span><input type="number" min={step === 1 ? 0 : .1}
    max={step === 1 ? NIGHT_SECONDS : 5} step={step} value={value} onChange={(event) => change(Number(event.target.value))} /></label>;
}

function GameTimeField({ label, value, change }: { label: string; value: number; change: (value: number) => void }) {
  return <label className="developer-number"><span>{label}, ЧЧ:ММ</span>
    <input type="time" min="00:00" max="06:00" step="60" value={secondsToGameTime(value)}
      onChange={(event) => change(gameTimeToSeconds(event.target.value))} />
  </label>;
}

function secondsToGameTime(seconds: number) {
  const totalMinutes = Math.round(clamp(seconds, 0, NIGHT_SECONDS) * GAME_MINUTES / NIGHT_SECONDS);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function gameTimeToSeconds(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const totalMinutes = clamp(hours * 60 + minutes, 0, GAME_MINUTES);
  return totalMinutes * NIGHT_SECONDS / GAME_MINUTES;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
