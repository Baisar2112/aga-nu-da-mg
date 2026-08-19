import { UiAnchor } from '../layout/UiAnchor';

interface Props {
  onTablet: () => void;
  onPause: () => void;
}

export function TouchControls(props: Props) {
  return <nav className="touch-controls" aria-label="Сенсорное управление" data-touch-ignore>
    <UiAnchor anchor="top-center" offsetY={14} className="touch-controls__pause">
      <button className="touch-pause-button" type="button" onClick={props.onPause} aria-label="Пауза">Ⅱ</button>
    </UiAnchor>
    <UiAnchor anchor="bottom-center" offsetY={10} className="touch-tablet-control">
      <button className="touch-tablet-button" type="button" onClick={props.onTablet} aria-label="Открыть планшет">
        <svg viewBox="0 0 100 46" aria-hidden="true">
          <path d="M12 35 L50 11 L88 35 L12 35" />
        </svg>
      </button>
    </UiAnchor>
  </nav>;
}
