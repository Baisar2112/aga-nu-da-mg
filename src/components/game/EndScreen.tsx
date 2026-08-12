export function EndScreen({ won, reason, restart }: { won: boolean; reason: string | null; restart: () => void }) {
  return <div className={`end-screen ${won ? 'end-screen--win' : ''}`}><small>{won ? 'СМЕНА ОКОНЧЕНА' : 'НОЧЬ ПРОИГРАНА'}</small><h1>{won ? '06:00' : 'ВАС ПОЙМАЛИ'}</h1><p>{won ? 'Вы пережили эту ночь.' : reason}</p><button onClick={restart}>НАЧАТЬ ЗАНОВО</button></div>;
}
