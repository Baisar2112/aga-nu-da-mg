import { UiAnchor } from '../layout/UiAnchor';

interface Props {
  onLeftDoor: () => void;
  onRightDoor: () => void;
  onTablet: () => void;
  onFlashlight: () => void;
  onPause: () => void;
}

export function TouchControls(props: Props) {
  return <nav className="touch-controls" aria-label="Сенсорное управление">
    <UiAnchor anchor="top-right" offsetY={96} className="touch-controls__pause">
      <TouchButton label="Пауза" icon="Ⅱ" onClick={props.onPause} />
    </UiAnchor>
    <UiAnchor anchor="bottom-left" className="touch-controls__group">
      <TouchButton label="Левая дверь" icon="ДЛ" onClick={props.onLeftDoor} />
      <TouchButton label="Планшет" icon="▰" onClick={props.onTablet} />
    </UiAnchor>
    <UiAnchor anchor="bottom-right" className="touch-controls__group">
      <TouchButton label="Фонарик" icon="☀" onClick={props.onFlashlight} />
      <TouchButton label="Правая дверь" icon="ДП" onClick={props.onRightDoor} />
    </UiAnchor>
  </nav>;
}

function TouchButton({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return <button className="touch-button" type="button" onClick={onClick} aria-label={label}>
    <span aria-hidden="true">{icon}</span><small>{label}</small>
  </button>;
}
