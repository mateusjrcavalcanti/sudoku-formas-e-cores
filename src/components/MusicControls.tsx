import { Pause, Play, Sparkles, Volume1, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";

export type SoundEffectEvent = {
  id: number;
  type: "error" | "success";
};

const SETTINGS_KEY = "sudoku-formas-e-cores:audio-settings:v1";
const musicSrc = `${import.meta.env.BASE_URL}audio/cozy-puzzle-in-game-3.ogg`;
const effectSources: Record<SoundEffectEvent["type"], string> = {
  error: `${import.meta.env.BASE_URL}audio/sfx/error.ogg`,
  success: `${import.meta.env.BASE_URL}audio/sfx/win.wav`,
};

type AudioSettings = {
  effectsMuted: boolean;
  effectsVolume: number;
  musicMuted: boolean;
  musicVolume: number;
};

type MusicControlsProps = {
  effectEvent: SoundEffectEvent | null;
  isOpen: boolean;
  isStarted: boolean;
  onClose: () => void;
};

function loadSettings(): AudioSettings {
  try {
    const settings = JSON.parse(
      window.localStorage.getItem(SETTINGS_KEY) ?? "{}",
    ) as Partial<AudioSettings>;

    return {
      effectsMuted: settings.effectsMuted ?? false,
      effectsVolume: normalizeVolume(settings.effectsVolume ?? 1),
      musicMuted: settings.musicMuted ?? false,
      musicVolume: normalizeVolume(settings.musicVolume ?? 0.35),
    };
  } catch {
    return {
      effectsMuted: false,
      effectsVolume: 1,
      musicMuted: false,
      musicVolume: 0.35,
    };
  }
}

export function MusicControls({
  effectEvent,
  isOpen,
  isStarted,
  onClose,
}: MusicControlsProps) {
  const duckTimeoutRef = useRef<number>();
  const effectRefs = useRef<Record<SoundEffectEvent["type"], HTMLAudioElement | null>>({
    error: null,
    success: null,
  });
  const musicRef = useRef<HTMLAudioElement>(null);
  const [settings, setSettings] = useState(loadSettings);
  const [isPlaying, setIsPlaying] = useState(false);
  const musicIcon = getVolumeIcon(settings.musicMuted, settings.musicVolume);
  const effectsIcon = getVolumeIcon(settings.effectsMuted, settings.effectsVolume);

  useEffect(() => {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const audio = musicRef.current;

    if (!audio) {
      return;
    }

    if (!isStarted) {
      audio.pause();
      return;
    }

    if (settings.musicMuted) {
      return;
    }

    void audio.play().catch(() => {
      setIsPlaying(false);
    });
  }, [isStarted, settings.musicMuted]);

  useEffect(() => {
    const audio = musicRef.current;

    if (!audio) {
      return;
    }

    audio.volume = settings.musicVolume;
    audio.muted = settings.musicMuted;
  }, [settings]);

  useEffect(() => {
    Object.values(effectRefs.current).forEach((audio) => {
      if (!audio) {
        return;
      }

      audio.volume = settings.effectsVolume;
      audio.muted = settings.effectsMuted;
    });
  }, [settings.effectsMuted, settings.effectsVolume]);

  useEffect(() => {
    if (!effectEvent || settings.effectsMuted) {
      return;
    }

    const effect = effectRefs.current[effectEvent.type];

    if (!effect) {
      return;
    }

    duckMusic();
    effect.currentTime = 0;
    void effect.play();
  }, [effectEvent, settings.effectsMuted]);

  async function togglePlayback() {
    const audio = musicRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
      return;
    }

    audio.pause();
    setIsPlaying(false);
  }

  function toggleMusicMuted() {
    setSettings((current) => ({
      ...current,
      musicMuted: !current.musicMuted,
    }));
  }

  function toggleEffectsMuted() {
    setSettings((current) => ({
      ...current,
      effectsMuted: !current.effectsMuted,
    }));
  }

  function changeMusicVolume(value: string) {
    const volume = normalizeVolume(Number(value));

    setSettings((current) => ({
      ...current,
      musicMuted: volume === 0,
      musicVolume: volume,
    }));
  }

  function changeEffectsVolume(value: string) {
    const volume = normalizeVolume(Number(value));

    setSettings((current) => ({
      ...current,
      effectsMuted: volume === 0,
      effectsVolume: volume,
    }));
  }

  function duckMusic() {
    const music = musicRef.current;

    if (!music || music.paused || settings.musicMuted) {
      return;
    }

    window.clearTimeout(duckTimeoutRef.current);
    music.volume = Math.max(settings.musicVolume * 0.28, 0.04);

    duckTimeoutRef.current = window.setTimeout(() => {
      music.volume = settings.musicVolume;
    }, 900);
  }

  return (
    <>
      <audio
        autoPlay
        loop
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        preload="metadata"
        ref={musicRef}
        src={musicSrc}
      />
      <audio
        preload="auto"
        ref={(node) => {
          effectRefs.current.error = node;
        }}
        src={effectSources.error}
      />
      <audio
        preload="auto"
        ref={(node) => {
          effectRefs.current.success = node;
        }}
        src={effectSources.success}
      />

      {isOpen && (
        <div
          aria-labelledby="sound-settings-title"
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/55 px-4 py-6"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <h2 id="sound-settings-title" className="text-2xl font-semibold">
                Som
              </h2>
              <Button onClick={onClose} type="button" variant="ghost">
                Fechar
              </Button>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">Música de fundo</p>
                  <Button
                    aria-label={isPlaying ? "Pausar música" : "Tocar música"}
                    onClick={togglePlayback}
                    size="icon"
                    title={isPlaying ? "Pausar música" : "Tocar música"}
                    type="button"
                    variant="secondary"
                  >
                    {isPlaying ? (
                      <Pause className="size-4" />
                    ) : (
                      <Play className="size-4" />
                    )}
                  </Button>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <Button
                    aria-label={
                      settings.musicMuted ? "Ligar música" : "Desligar música"
                    }
                    onClick={toggleMusicMuted}
                    size="icon"
                    title={settings.musicMuted ? "Ligar música" : "Desligar música"}
                    type="button"
                    variant="ghost"
                  >
                    {musicIcon}
                  </Button>

                  <input
                    aria-label="Volume da música"
                    className="h-2 w-full accent-cyan-700"
                    max="1"
                    min="0"
                    onChange={(event) => changeMusicVolume(event.target.value)}
                    step="0.05"
                    type="range"
                    value={settings.musicMuted ? 0 : settings.musicVolume}
                  />
                </div>
              </div>

              <div>
                <p className="font-medium">Sons do jogo</p>
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    aria-label={
                      settings.effectsMuted ? "Ligar efeitos" : "Desligar efeitos"
                    }
                    onClick={toggleEffectsMuted}
                    size="icon"
                    title={
                      settings.effectsMuted ? "Ligar efeitos" : "Desligar efeitos"
                    }
                    type="button"
                    variant="ghost"
                  >
                    {effectsIcon}
                  </Button>

                  <input
                    aria-label="Volume dos efeitos"
                    className="h-2 w-full accent-cyan-700"
                    max="1"
                    min="0"
                    onChange={(event) => changeEffectsVolume(event.target.value)}
                    step="0.05"
                    type="range"
                    value={settings.effectsMuted ? 0 : settings.effectsVolume}
                  />
                </div>
              </div>

              <p className="text-xs leading-5 text-stone-500">
                <Sparkles className="mr-1 inline size-3" />
                Música e efeitos CC0.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getVolumeIcon(muted: boolean, volume: number) {
  if (muted || volume === 0) {
    return <VolumeX className="size-4" />;
  }

  if (volume < 0.5) {
    return <Volume1 className="size-4" />;
  }

  return <Volume2 className="size-4" />;
}

function normalizeVolume(volume: number): number {
  if (!Number.isFinite(volume)) {
    return 0.35;
  }

  return Math.min(Math.max(volume, 0), 1);
}
