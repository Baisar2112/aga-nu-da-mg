interface MenuButtonsProps {
  selected: number;
  secondLabel: string;
  secondEnabled: boolean;
  onHover: (index: number) => void;
  onChoose: (index: number) => void;
}

export function MenuButtons(props: MenuButtonsProps) {
  const { selected, secondLabel, secondEnabled, onHover, onChoose } = props;
  return <div className="menu-buttons">
    <button className={selected === 0 ? 'is-selected' : ''}
      onMouseEnter={() => onHover(0)} onClick={() => onChoose(0)}>
      <span aria-hidden="true">{selected === 0 ? '▶' : ''}</span> NEW GAME
    </button>
    <button disabled={!secondEnabled} className={selected === 1 ? 'is-selected' : ''}
      onMouseEnter={() => secondEnabled && onHover(1)} onClick={() => onChoose(1)}>
      <span aria-hidden="true">{selected === 1 ? '▶' : ''}</span> {secondLabel}
    </button>
    {!secondEnabled && <p className="menu-buttons__empty">NO SAVE DATA</p>}
  </div>;
}
