import { useEffect, useState } from 'react';

export function NewGameConfirm({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [choice, setChoice] = useState<'yes' | 'no'>('no');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyW' || event.code === 'KeyS') setChoice((value) => value === 'yes' ? 'no' : 'yes');
      if (event.code === 'Escape') onCancel();
      if (event.code === 'Space') {
        event.preventDefault();
        choice === 'yes' ? onConfirm() : onCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [choice, onCancel, onConfirm]);

  return <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
    <h2 id="confirm-title">DELETE OLD PROGRESS?</h2>
    <p>YOUR CURRENT PHASE SAVE WILL BE LOST.</p>
    <div><button className={choice === 'yes' ? 'is-selected' : ''} onMouseEnter={() => setChoice('yes')} onClick={onConfirm}>YES</button>
      <button className={choice === 'no' ? 'is-selected' : ''} onMouseEnter={() => setChoice('no')} onClick={onCancel}>NO</button></div>
  </div>;
}
