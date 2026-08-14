interface PauseMenuProps {
  selected: number;
  onSelect: (index: number) => void;
  onContinue: () => void;
  onExit: () => void;
}

export function PauseMenu({ selected, onSelect, onContinue, onExit }: PauseMenuProps) {
  const actions = [onContinue, onExit];
  const labels = ['CONTINUE', 'EXIT'];

  return <div className="pause-menu" role="dialog" aria-modal="true" aria-label="Игра на паузе">
    <section className="pause-menu__panel">
      <small>GAME PAUSED</small>
      <h2>PAUSE</h2>
      <p>SELECT / W S / SPACE</p>
      <div className="pause-menu__buttons">
        {labels.map((label, index) => <button key={label}
          className={selected === index ? 'is-selected' : ''}
          onMouseEnter={() => onSelect(index)} onClick={actions[index]}>
          <span aria-hidden="true">{selected === index ? '▶' : ''}</span> {label}
        </button>)}
      </div>
    </section>
  </div>;
}
