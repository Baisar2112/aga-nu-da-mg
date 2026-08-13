import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { MenuButtons } from '../components/menu/MenuButtons';
import { NewGameConfirm } from '../components/menu/NewGameConfirm';
import { playThunder } from '../lib/menuSound';
import { clearGameSave, getSaveStatus } from '../lib/gameSave';
import '../styles/main-menu.css';

type MenuStage = 'title' | 'flash' | 'menu' | 'confirm';

export function HomePage() {
  const [, navigate] = useLocation();
  const [stage, setStage] = useState<MenuStage>('title');
  const [selected, setSelected] = useState(0);
  const saveStatus = getSaveStatus();
  const secondLabel = saveStatus === 'completed' ? 'RETRY?' : 'CONTINUE';
  const secondEnabled = saveStatus !== 'empty';

  const startNewGame = () => {
    clearGameSave();
    navigate('/game');
  };

  const choose = (index: number) => {
    if (index === 0) {
      if (saveStatus === 'checkpoint') setStage('confirm');
      else startNewGame();
      return;
    }
    if (!secondEnabled) return;
    if (saveStatus === 'completed') startNewGame();
    else navigate('/game');
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (stage === 'title') {
        if (event.code !== 'Space') return;
        event.preventDefault();
        playThunder();
        setStage('flash');
        window.setTimeout(() => setStage('menu'), 300);
        return;
      }
      if (stage === 'confirm') return;
      if (stage !== 'menu') return;
      if (event.code === 'KeyW') setSelected(0);
      if (event.code === 'KeyS' && secondEnabled) setSelected(1);
      if (event.code === 'Space') {
        event.preventDefault();
        choose(selected);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return <main className={`main-menu ${stage === 'flash' ? 'main-menu--flash' : ''}`}>
    <section className="main-menu__panel">
      <div className="main-menu__noise" aria-hidden="true" />
      {stage === 'title' || stage === 'flash' ? <>
        <p className="main-menu__year">EST. 2000</p>
        <h1>LAST NIGHT<br />AT...<br /><span>FREDDY?</span></h1>
        <p className="main-menu__prompt">PRESS SPACE</p>
      </> : <MenuButtons selected={selected} secondLabel={secondLabel}
        secondEnabled={secondEnabled} onHover={setSelected} onChoose={choose} />}
      {stage === 'confirm' && <NewGameConfirm onConfirm={startNewGame} onCancel={() => setStage('menu')} />}
    </section>
    <section className="main-menu__art" aria-label="Five worn restaurant animatronics">
      <img src="/images/animatronics-menu-pixel.png" alt="Chick, Croco, Scrappy and Foxy beneath Freddy" />
      <div className="main-menu__scanlines" aria-hidden="true" />
    </section>
  </main>;
}
