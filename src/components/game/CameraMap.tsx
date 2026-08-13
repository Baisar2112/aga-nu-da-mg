interface Props {
  selected: number;
  selectCamera: (camera: number) => void;
}

export function CameraMap({ selected, selectCamera }: Props) {
  return <nav className="camera-floorplan" aria-label="Карта камер пиццерии">
    <h3>КАМЕРЫ</h3>
    <div className="floorplan-rooms">
      {Array.from({ length: 9 }, (_, index) => index + 1).map((camera) =>
        <button key={camera} className={`floor-room floor-room--${camera} ${selected === camera ? 'active' : ''}`}
          onClick={() => selectCamera(camera)} aria-label={camera === 9 ? 'Вы находитесь здесь' : `Камера ${camera}`}>
          <span>{camera === 9 ? 'YOU' : camera}</span>
        </button>)}
      <i className="floor-door floor-door--left" />
      <i className="floor-door floor-door--right" />
      <b className="floor-window">8</b>
    </div>
  </nav>;
}
