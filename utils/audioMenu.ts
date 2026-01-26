"use client";
import { useEffect } from "react";

export class MenuAudioManager {
  private static instance: MenuAudioManager;
  private audioElements: Record<string, HTMLAudioElement> = {};
  private loaded: boolean = false;

  private constructor() {
    if (typeof window !== "undefined") {
      const soundsToLoad = [
        { id: "logoName", path: "/audio/voices/laser-drift.mp3" },
        { id: "laserDrift", path: "/audio/voices/laser-drift-new.mp3" },
        { id: "neonBlast", path: "/audio/voices/neon-blast.mp3" },
        { id: "startGame1", path: "/audio/voices/start-game1.mp3" },
        { id: "startGame2", path: "/audio/voices/start-game2.mp3" },
        { id: "startGame3", path: "/audio/voices/start-game3.mp3" },
        { id: "clickStart", path: "/audio/sounds/click-button.mp3" },
        { id: "buttonSelect", path: "/audio/sounds/button_select.mp3" },
        { id: "buttonConfirm", path: "/audio/sounds/button_confirm.mp3" },
        { id: "buttonHover", path: "/audio/sounds/button-hover.wav" },
        { id: "openHologram", path: "/audio/sounds/open-hologram.wav" },
        { id: "closeHologram", path: "/audio/sounds/close_hologram.wav" },
        { id: "titleTheme", path: "/audio/title-theme.mp3" },
        // { id: 'defendBase', path: '/voices/defend_our_ship.mp3' }
      ];

      // Precargar todos los sonidos
      soundsToLoad.forEach((sound) => {
        const audio = new window.Audio(sound.path);
        audio.preload = "auto";
        this.audioElements[sound.id] = audio;
      });

      Promise.all(
        Object.values(this.audioElements).map(
          (audio) =>
            new Promise((resolve) => {
              audio.addEventListener("canplaythrough", resolve, { once: true });
              audio.load();
            })
        )
      ).then(() => {
        this.loaded = true;
      });
    }
  }

  public static getInstance(): MenuAudioManager {
    if (!MenuAudioManager.instance) {
      MenuAudioManager.instance = new MenuAudioManager();
    }
    return MenuAudioManager.instance;
  }

  public play(
    id: string,
    options: { volume?: number; playbackRate?: number } = {}
  ): void {
    // Verificar que estamos en el cliente
    if (typeof window === "undefined") return;

    const audio = this.audioElements[id];
    if (!audio) {
      console.warn(`Audio '${id}' no encontrado`);
      return;
    }

    if (options.volume !== undefined) {
      audio.volume = Math.min(1, Math.max(0, options.volume));
    } else {
      audio.volume = 0.7;
    }

    // Set playback rate (speed) if provided
    if (options.playbackRate !== undefined) {
      audio.playbackRate = Math.min(2, Math.max(0.5, options.playbackRate));
    } else {
      audio.playbackRate = 1.0; // Normal speed
    }

    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error(`Error al reproducir el audio ${id}:`, error);
    });
  }

  public isLoaded(): boolean {
    return this.loaded;
  }
}

export const AudioInitializer = () => {
  useEffect(() => {
    MenuAudioManager.getInstance();
  }, []);

  return null;
};

// Hook personalizado para usar el sistema de audio
export const useAudio = () => {
  const [audioReady, setAudioReady] = useState(false);
  const audioManager = useRef<MenuAudioManager | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioManager.current = MenuAudioManager.getInstance();

      const checkAudioLoaded = () => {
        if (audioManager.current?.isLoaded()) {
          setAudioReady(true);
        } else {
          setTimeout(checkAudioLoaded, 100);
        }
      };

      checkAudioLoaded();
    }
  }, []);

  return {
    audioReady,
    audioManager: audioManager.current,
  };
};

// Importación faltante para useAudio
import { useState, useRef } from "react";
