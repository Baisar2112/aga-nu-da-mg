import { useEffect, useState } from 'react';

type JumpscareName = 'crocodile' | 'dog' | 'freddy' | 'watcher';

const characterByReason: Array<[string, JumpscareName]> = [
  ['Крокодил', 'crocodile'],
  ['Собака', 'dog'],
  ['Фредди', 'freddy'],
  ['Смотритель', 'watcher'],
];

export const jumpscareImages = characterByReason.flatMap(([, name]) => [
  jumpscareImage(name, 1),
  jumpscareImage(name, 2),
]);

function jumpscareImage(name: JumpscareName, frame: 1 | 2) {
  const extension = name === 'watcher' ? 'png' : 'jpg';
  return `/images/jumpscare-${name}-${frame}.${extension}`;
}

interface Props {
  reason: string;
}

export function Jumpscare({ reason }: Props) {
  const [visible, setVisible] = useState(true);
  const name = characterByReason.find(([label]) => reason.includes(label))?.[1];

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1250);
    return () => window.clearTimeout(timer);
  }, []);

  if (!name || !visible) return null;

  return <div className={`jumpscare jumpscare--${name}`} aria-hidden="true">
    <img className="jumpscare__frame jumpscare__frame--one"
      src={jumpscareImage(name, 1)} alt="" />
    <img className="jumpscare__frame jumpscare__frame--two"
      src={jumpscareImage(name, 2)} alt="" />
  </div>;
}
