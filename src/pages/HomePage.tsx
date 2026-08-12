import { Link } from 'wouter';

export function HomePage() {
  return <main className="container"><section className="hello night-home">
    <small>НОЧНАЯ СМЕНА / 00:00–06:00</small>
    <h1>Последний охранник</h1>
    <p>Следите за камерами, экономьте энергию и не подпускайте их к офису.</p>
    <Link href="/game" className="start-button">НАЧАТЬ НОЧЬ</Link>
    <p className="hello__hint">Наушники рекомендуются. Управление показано в игре.</p>
  </section></main>;
}
