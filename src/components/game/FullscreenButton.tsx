import { useEffect, useState } from 'react';

export function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  useEffect(() => {
    const updateFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', updateFullscreenState);
    return () => document.removeEventListener('fullscreenchange', updateFullscreenState);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Некоторые мобильные браузеры не разрешают полноэкранный режим.
    }
  };

  return (
    <button
      className="fullscreen-button"
      type="button"
      onClick={toggleFullscreen}
      aria-label={isFullscreen ? 'Выйти из полноэкранного режима' : 'Открыть на весь экран'}
      title={isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {isFullscreen ? (
          <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
        ) : (
          <path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" />
        )}
      </svg>
    </button>
  );
}
