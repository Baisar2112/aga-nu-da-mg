import { UiAnchor } from '../layout/UiAnchor';

interface Props {
  onTablet: () => void;
  onMask: () => void;
  onPause: () => void;
  hasMask: boolean;
  maskOn: boolean;
}

export function TouchControls(props: Props) {
  return <nav className="touch-controls" aria-label="Сенсорное управление" data-touch-ignore>
    <UiAnchor anchor="top-left" offsetX={10} offsetY={10} className="touch-controls__pause">
      <button className="touch-pause-button" type="button" onClick={props.onPause} aria-label="Пауза">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
        </svg>
      </button>
    </UiAnchor>
    <UiAnchor anchor="bottom-center" offsetY={10} className="touch-action-control">
      <button className="touch-action-button touch-action-button--mask" type="button"
        onClick={props.onMask} disabled={!props.hasMask} aria-label={props.maskOn ? 'Снять маску' : 'Надеть маску'}>
        <Chevron pointsDown={props.maskOn} />
      </button>
      <button className="touch-action-button touch-action-button--tablet" type="button"
        onClick={props.onTablet} disabled={props.maskOn} aria-label="Открыть планшет">
        <Chevron />
      </button>
    </UiAnchor>
  </nav>;
}

function Chevron({ pointsDown = false }: { pointsDown?: boolean }) {
  return <svg viewBox="0 0 100 46" aria-hidden="true">
    <path d={pointsDown ? 'M12 11 L50 35 L88 11' : 'M12 35 L50 11 L88 35'} />
  </svg>;
}
