interface Props {
  selected: number;
  movementDetected: boolean;
  movementUnavailable: boolean;
  watcherPosition: 'start' | 'middle' | 'end';
  selectCamera: (camera: number) => void;
}

const BROKEN_MOVEMENT_TEXT = 'Д̸̨̱̠̍͂̍̂̽͞в҈̨̩͍͙̤͍͈̟҇͂͋̍̊и̷̧̝̪̂̉͗̈͛͡ж̵̡̱̮̘͇͔̖̎̏̈͋͝е̷̩̖͉̗̟̗̐͑̒̆͒͋̌̄͢͠н̸̧̦̤̘̭̈́̑̃̀̓͗̓͝ͅӥ̷̢̥͖̮́͂̐͂̋͌͆͝е̴̬̥͉̝͈̩̘̦̍̌̿̌̊̋͜͞ -̵̧̞̪͉͖͈̠͙͋͋͒̽̔̿͝ н҉̱̥̤͌͊̒̽͢͝е̸̝͔̳͚͔̝͚̤̐͑͌̑͒͌̽͢͡е̵̡̯͈̘̮̝͓̑̆̉̎͠с̴͉͈͈͖͚̮̐̋̚͜͡т̴̢̝͓̰̙̓̎͑͠ь҈̨̩̣͉͚͍҇̐̽ͅт҈̡̬̣͖͍̫͔́̓͆̾̓͠';

export function CameraMap({ selected, movementDetected, movementUnavailable, watcherPosition, selectCamera }: Props) {
  return <nav className="camera-floorplan" aria-label="Карта камер пиццерии">
    <div className="floorplan-rooms">
      <i className="floor-corridor floor-corridor--a" />
      <i className="floor-corridor floor-corridor--b" />
      <i className="floor-corridor floor-corridor--c" />
      <i className="floor-corridor floor-corridor--d" />
      <i className="floor-corridor floor-corridor--e" />
      {Array.from({ length: 9 }, (_, index) => index + 1).map((camera) =>
        <button key={camera} className={`floor-room floor-room--${camera} ${selected === camera ? 'active' : ''}`}
          disabled={camera === 9} onClick={() => selectCamera(camera)}
          aria-label={camera === 9 ? 'Вы находитесь здесь' : `Камера ${camera}`}>
          <span>{camera === 9 ? 'YOU' : camera}</span>
          {camera === 8 && <i className={`watcher-tracker watcher-tracker--${watcherPosition}`} aria-hidden="true" />}
        </button>)}
      <i className="floor-door floor-door--left" />
      <i className="floor-door floor-door--right" />
      <b className="floor-window">8</b>
    </div>
    <p className={`camera-motion-status ${movementDetected && !movementUnavailable ? 'camera-motion-status--active' : ''} ${movementUnavailable ? 'camera-motion-status--broken' : ''}`}>
      {movementUnavailable ? BROKEN_MOVEMENT_TEXT : `ДВИЖЕНИЕ — ${movementDetected ? 'ЕСТЬ' : 'НЕТ'}`}
    </p>
  </nav>;
}
