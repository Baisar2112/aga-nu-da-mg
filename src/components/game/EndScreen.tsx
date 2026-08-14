interface Props {
  won: boolean;
  reason: string | null;
  restart: () => void;
  openMenu: () => void;
}

export function EndScreen({ won, reason, restart, openMenu }: Props) {
  return <div className={`end-screen ${won ? 'end-screen--win' : ''}`}>
    <small>{won ? 'СМЕНА ОКОНЧЕНА' : 'НОЧЬ ПРОИГРАНА'}</small>
    <h1>{won ? '06:00' : 'ВАС ПОЙМАЛИ'}</h1>
    <p>{won ? 'Вы пережили эту ночь.' : reason}</p>
    <div className="end-screen__actions">
      <button onClick={restart}>НАЧАТЬ ЗАНОВО</button>
      {!won && <button className="end-screen__menu" onClick={openMenu}>ГЛАВНОЕ МЕНЮ</button>}
    </div>
  </div>;
}
