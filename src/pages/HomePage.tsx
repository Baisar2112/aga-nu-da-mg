import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { MenuButtons } from '../components/menu/MenuButtons';
import { DeveloperConsole } from '../components/menu/DeveloperConsole';
import { NewGameConfirm } from '../components/menu/NewGameConfirm';
import { playThunder } from '../lib/menuSound';
import { clearGameSave, getSaveStatus } from '../lib/gameSave';
import '../styles/main-menu.css';
import '../styles/developer-console.css';

type MenuStage = 'title' | 'reveal' | 'flash' | 'menu' | 'confirm';

export function HomePage() {
  const [, navigate] = useLocation();
  const [stage, setStage] = useState<MenuStage>('title');
  const [selected, setSelected] = useState(0);
  const [developerOpen, setDeveloperOpen] = useState(false);
  const saveStatus = getSaveStatus();
  const secondLabel = saveStatus === 'completed' ? 'RETRY?' : 'CONTINUE';
  const secondEnabled = saveStatus !== 'empty';

  const openMenu = useCallback(() => {
    if (stage !== 'title') return;
    playThunder();
    setStage('reveal');
    window.setTimeout(() => setStage('flash'), 100);
    window.setTimeout(() => setStage('menu'), 400);
  }, [stage]);

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
    if (developerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (stage === 'title') {
        if (event.code !== 'Space') return;
        event.preventDefault();
        openMenu();
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
  }, [developerOpen, openMenu, secondEnabled, selected, stage]);

  return <main className={`main-menu${stage === 'reveal' ? ' main-menu--reveal' : ''}${stage === 'flash' ? ' main-menu--flash' : ''}`}>
    <section className="main-menu__panel">
      <div className="main-menu__noise" aria-hidden="true" />
      <h1>LAST NIGHT<br />AT...<br /><span>FREDDY?</span></h1>
      {stage === 'title' || stage === 'reveal' || stage === 'flash' ?
        <button className="main-menu__prompt" type="button" onClick={openMenu}
          disabled={stage !== 'title'}>PRESS SPACE</button>
        : <MenuButtons selected={selected} secondLabel={secondLabel}
        secondEnabled={secondEnabled} onHover={setSelected} onChoose={choose} />}
      {stage === 'confirm' && <NewGameConfirm onConfirm={startNewGame} onCancel={() => setStage('menu')} />}
    </section>
    <section className="main-menu__art" aria-label="Five worn restaurant animatronics">
      <img src="/images/animatronics-menu-pixel.png" alt="Chick, Croco, Scrappy and Foxy beneath Freddy" />
      <img className="main-menu__art-flash" src="/images/animatronics-menu-flash.png" alt="" aria-hidden="true" />
      <button className="freddy-nose-hotspot" aria-label="Нос Фредди" onClick={() => setDeveloperOpen(true)} />
      <div className="main-menu__scanlines" aria-hidden="true" />
    </section>
    {developerOpen && <DeveloperConsole close={() => setDeveloperOpen(false)} />}
  </main>;
}
