export function GuardNote({ onBack }: { onBack: () => void }) {
  return <div className="guard-note-wrap">
    <article className="guard-note">
      <div className="guard-note__holes" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <button onClick={onBack}>← К КАМЕРАМ</button>
      <small>ОСТАВЛЕНО ПРЕДЫДУЩЕЙ СМЕНОЙ</small>
      <h2>СЛЕДУЮЩЕМУ<br />ОХРАННИКУ</h2>
      <p>Не доверяй тишине. Кроко остановит левая дверь. Скреппи боится света у проёма в комнату 8.</p>
      <p>Услышишь быстрый бег справа — сразу закрывай дверь. Фредди слева сначала ослепи, затем закрывай.</p>
      <p className="guard-note__warning">Береги заряд. До 06:00 доживают не все.</p>
      <footer>— ночной охранник, смена №12</footer>
    </article>
  </div>;
}
