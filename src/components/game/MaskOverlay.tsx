const PIXEL = 1;
const VIEWBOX_WIDTH = 128;

const LEFT_EYE_ROWS = [
  [21, 36, 46],
  [22, 33, 49],
  [23, 31, 51],
  [24, 29, 53],
  [25, 28, 54],
  [26, 28, 55],
  [27, 28, 55],
  [28, 28, 56],
  [29, 28, 56],
  [30, 28, 56],
  [31, 28, 55],
  [32, 29, 55],
  [33, 30, 54],
  [34, 31, 53],
  [35, 32, 52],
  [36, 34, 50],
  [37, 36, 48],
] as const;

const BOTTOM_OPEN_ROWS = [
  [48, 36, 91],
  [49, 30, 97],
  [50, 24, 103],
  [51, 20, 107],
  [52, 18, 109],
] as const;

const leftEye = LEFT_EYE_ROWS.flatMap(([y, start, end]) =>
  Array.from({ length: (end - start) / PIXEL + 1 }, (_, index) => ({ x: start + index * PIXEL, y })),
);
const eyePixels = [...leftEye, ...leftEye.map(({ x, y }) => ({ x: VIEWBOX_WIDTH - PIXEL - x, y }))];
const bottomOpenPixels = BOTTOM_OPEN_ROWS.flatMap(([y, start, end]) =>
  Array.from({ length: end - start + 1 }, (_, index) => ({ x: start + index, y })),
).flatMap((row) => [row, ...Array.from({ length: 63 - row.y }, (_, index) => ({ x: row.x, y: row.y + index + 1 }))])
  .filter(({ x, y }, index, pixels) => pixels.findIndex((pixel) => pixel.x === x && pixel.y === y) === index);
const cutoutPixels = [...eyePixels, ...bottomOpenPixels];
const eyePixelKeys = new Set(eyePixels.map(({ x, y }) => `${x}:${y}`));
const rimPixels = eyePixels.flatMap(({ x, y }) => [
  { x: x - PIXEL, y }, { x: x + PIXEL, y }, { x, y: y - PIXEL }, { x, y: y + PIXEL },
]).filter(({ x, y }, index, pixels) => {
  const key = `${x}:${y}`;
  return !eyePixelKeys.has(key) && pixels.findIndex((pixel) => `${pixel.x}:${pixel.y}` === key) === index;
});
const bottomPixelKeys = new Set(bottomOpenPixels.map(({ x, y }) => `${x}:${y}`));
const bottomEdgePixels = bottomOpenPixels.map(({ x, y }) => ({ x, y: y - PIXEL }))
  .filter(({ x, y }, index, pixels) => !bottomPixelKeys.has(`${x}:${y}`)
    && pixels.findIndex((pixel) => pixel.x === x && pixel.y === y) === index);

export function MaskOverlay() {
  return <div className="security-mask" aria-label="Маска надета">
    <svg className="security-mask__shell" viewBox="0 0 128 64" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="mask-pixels" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#020202" />
          <rect width="1" height="1" fill="#0b0b0b" />
          <rect x="6" y="2" width="1" height="1" fill="#070707" />
          <rect x="2" y="6" width="1" height="1" fill="#101010" />
        </pattern>
        <mask id="pixel-eye-holes">
          <rect width="128" height="64" fill="white" />
          {cutoutPixels.map(({ x, y }) => <rect key={`${x}-${y}`} x={x} y={y} width={PIXEL} height={PIXEL} fill="black" />)}
        </mask>
      </defs>
      <rect width="128" height="64" fill="url(#mask-pixels)" mask="url(#pixel-eye-holes)" />
      {rimPixels.map(({ x, y }, index) => <rect key={`${x}-${y}`} x={x} y={y} width={PIXEL} height={PIXEL}
        fill={index % 5 === 0 ? '#555' : index % 2 === 0 ? '#333' : '#1b1b1b'} />)}
      {eyePixels.filter(({ y }) => y === 37).map(({ x, y }) =>
        <rect key={`edge-${x}`} x={x} y={y} width={PIXEL} height={PIXEL} fill="#626262" opacity=".7" />)}
      {bottomEdgePixels.map(({ x, y }, index) => <rect key={`bottom-${x}-${y}`} x={x} y={y}
        width={PIXEL} height={PIXEL} fill={index % 4 === 0 ? '#555' : '#242424'} />)}
    </svg>
  </div>;
}
