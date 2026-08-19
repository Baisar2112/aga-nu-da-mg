import { useEffect, useState } from 'react';

type JumpscareName = 'crocodile' | 'dog' | 'freddy';

const characterByReason: Array<[string, JumpscareName]> = [
  ['Крокодил', 'crocodile'],
  ['Собака', 'dog'],
  ['Фредди', 'freddy'],
];

export const jumpscareImages = characterByReason.flatMap(([, name]) => [
  `/images/jumpscare-${name}-1.jpg`,
  `/images/jumpscare-${name}-2.jpg`,
]);

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
      src={`/images/jumpscare-${name}-1.jpg`} alt="" />
    <img className="jumpscare__frame jumpscare__frame--two"
      src={`/images/jumpscare-${name}-2.jpg`} alt="" />
  </div>;
}
