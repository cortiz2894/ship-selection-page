"use client";

import { useRef, useEffect, createContext, useContext, useState } from "react";
import { useGameContext } from "../../context/game-context";

const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      const isMobileDevice = mobileRegex.test(userAgent.toLowerCase());
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

const SoundContext = createContext<SoundFunctions | null>(null);

interface SoundFunctions {
  playShoot: (options?: Record<string, unknown>) => HTMLAudioElement | null;
  playCollect: (options?: Record<string, unknown>) => HTMLAudioElement | null;
  playExplosion: (options?: Record<string, unknown>) => HTMLAudioElement | null;
  playDamage: (options?: Record<string, unknown>) => HTMLAudioElement | null;
  playGameOver: (options?: Record<string, unknown>) => HTMLAudioElement | null;
  playClickButton: (options?: Record<string, unknown>) => HTMLAudioElement | null;
  playAlert: (options?: Record<string, unknown>) => HTMLAudioElement | null;
  play: (name: string, options?: Record<string, unknown>) => HTMLAudioElement | null;
  isMobile: boolean;
}

export const useSoundEffects = (): SoundFunctions => {
  const context = useContext(SoundContext);
  if (context === null) {
    throw new Error("useSoundEffects must be used within a SoundProvider");
  }
  return context;
};

class SoundManager {
  private sounds: Record<string, HTMLAudioElement>;
  private enabled: boolean;
  private volume: number;
  private isMobile: boolean;
  private loops: Map<string, HTMLAudioElement>; // Store active loop instances

  constructor(isMobile: boolean = false) {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.7;
    this.isMobile = isMobile;
    this.loops = new Map();
  }

  load(name: string, path: string) {
    if (this.isMobile) {
      this.sounds[name] = null as any;
      return null;
    }

    try {
      const audio = new Audio(path);
      audio.preload = "none";
      this.sounds[name] = audio;
      return audio;
    } catch (error) {
      console.warn(`Error loading sound ${name}:`, error);
      this.sounds[name] = null as any;
      return null;
    }
  }

  play(name: string, options: any = {}) {
    if (!this.enabled || this.isMobile) return null;

    const sound = this.sounds[name];
    if (!sound) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Sound "${name}" not found`);
      }
      return null;
    }

    try {
      const soundInstance = sound.cloneNode() as HTMLAudioElement;
      const volume =
        options.volume !== undefined
          ? (options.volume as number) * this.volume
          : this.volume;

      soundInstance.volume = Math.min(1, Math.max(0, volume));

      soundInstance.play().catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.error(`Error playing sound ${name}:`, error);
        }
      });

      soundInstance.addEventListener("ended", () => {
        soundInstance.remove();
      });

      return soundInstance;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Error processing sound ${name}:`, error);
      }
      return null;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.min(1, Math.max(0, volume));
  }

  updateMobileStatus(isMobile: boolean) {
    this.isMobile = isMobile;
  }

  playLoop(name: string, options: any = {}) {
    if (!this.enabled || this.isMobile) return null;

    this.stopLoop(name);

    const sound = this.sounds[name];
    if (!sound) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Sound "${name}" not found`);
      }
      return null;
    }

    try {
      const soundInstance = sound.cloneNode() as HTMLAudioElement;
      const volume =
        options.volume !== undefined
          ? (options.volume as number) * this.volume
          : this.volume;

      soundInstance.volume = Math.min(1, Math.max(0, volume));
      soundInstance.loop = true;

      soundInstance.play().catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.error(`Error playing loop ${name}:`, error);
        }
      });

      this.loops.set(name, soundInstance);

      return soundInstance;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error(`Error processing loop ${name}:`, error);
      }
      return null;
    }
  }

  stopLoop(name: string) {
    const loopInstance = this.loops.get(name);
    if (loopInstance) {
      loopInstance.pause();
      loopInstance.currentTime = 0;
      loopInstance.remove();
      this.loops.delete(name);
    }
  }
}

let soundManagerInstance: SoundManager | null = null;

export const getSoundManager = (isMobile: boolean = false): SoundManager => {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager(isMobile);
  } else {
    soundManagerInstance.updateMobileStatus(isMobile);
  }
  return soundManagerInstance;
};

const SoundEffects = ({ children }: { children: React.ReactNode }) => {
  const { soundEffectsEnabled } = useGameContext();
  const isMobile = useMobile();
  const soundManagerRef = useRef<SoundManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    soundManagerRef.current = getSoundManager(isMobile);
    setIsInitialized(true);
  }, [isMobile]);

  useEffect(() => {
    if (!isInitialized || !soundManagerRef.current) return;

    const sm = soundManagerRef.current;

    if (isMobile) {
      return;
    }

    const criticalSounds = [
      ["shoot", "/audio/sounds/shoot.mp3"],
      ["collect", "/audio/sounds/collect.mp3"],
      ["explosion", "/audio/sounds/asteroid-destroyed.mp3"],
      ["clickButton", "/audio/sounds/click-button.mp3"],
      ["buttonSelect", "/audio/sounds/button_select.mp3"],
      ["buttonConfirm", "/audio/sounds/button_confirm.mp3"],
      ["buttonHover", "/audio/sounds/button-hover.wav"],
      ["shieldActivated", "/audio/sounds/shield-activated.mp3"],
      ["wavePassed", "/audio/sounds/wave-passed-speed.wav"],
      ["openCameraFrame", "/audio/sounds/open_camera_frame.wav"],
      ["closeCameraFrame", "/audio/sounds/close_camera_frame.wav"],
      ["forceFieldLoop", "/audio/sounds/force_field_loop.mp3"],
      ["baseRotation02", "/audio/sounds/base_rotation_02.wav"],
      ["baseRotation03", "/audio/sounds/base_rotation_03.wav"],
    ];

    criticalSounds.forEach(([name, path]) => {
      console.log(`Loading sound: ${name} from ${path}`);
      sm.load(name as string, path as string);
    });

    console.log("Critical sounds loaded:", sm);

    const additionalSounds = [
      ["alert", "/audio/sounds/critical-life.mp3"],
      ["decreaseStationLife", "/audio/sounds/decrease-energy.mp3"],
      ["DamageShip", "/audio/sounds/damage-ship.mp3"],
      // Voice Effects (más pesados, cargar al final)
      ["mouseControl", "/audio/voices/mouse-control.mp3"],
      ["HandControl", "/audio/voices/hand-control.mp3"],
      ["startMission-1", "/audio/voices/startMission-1.mp3"],
      ["startMission-2", "/audio/voices/startMission-2.mp3"],
      ["startMission-3", "/audio/voices/startMission-3.mp3"],
      ["MouseControl", "/audio/voices/mouse-control.mp3"],
      ["HandControl", "/audio/voices/hand-control.mp3"],
      ["criticalDamage", "/audio/voices/critical-damage1.mp3"],
      ["shipLife", "/audio/voices/ship-life.mp3"],
      ["stationLife", "/audio/voices/station-life.mp3"],
      ["shield", "/audio/voices/shield.mp3"],
      ["failMission", "/audio/voices/failed.mp3"],
      ["failMission2", "/audio/voices/failed3.mp3"],
      ["failMission3", "/audio/voices/failed2.mp3"],
      ["precise", "/audio/voices/precise.mp3"],
      ["skilled", "/audio/voices/skilled.mp3"],
      ["laserMaster", "/audio/voices/laser-master.mp3"],
      ["driftLegend", "/audio/voices/drift-legend.mp3"],
    ];

    setTimeout(() => {
      additionalSounds.forEach(([name, path], index) => {
        setTimeout(() => {
          sm.load(name as string, path as string);
        }, index * 100);
      });
    }, 1000);
  }, [isMobile, isInitialized]);

  useEffect(() => {
    if (!soundManagerRef.current) return;
    soundManagerRef.current.setEnabled(soundEffectsEnabled);
  }, [soundEffectsEnabled]);

  const createSoundFunction = (soundName: string) => {
    return (options = {}) => {
      if (!soundManagerRef.current) return null;
      return soundManagerRef.current.play(soundName, options);
    };
  };

  const playSound = (name: string, options: any = {}) => {
    if (!soundManagerRef.current) return null;
    return soundManagerRef.current.play(name, options);
  };

  const soundFunctions: SoundFunctions = {
    playShoot: createSoundFunction("shoot"),
    playCollect: createSoundFunction("collect"),
    playExplosion: createSoundFunction("explosion"),
    playDamage: createSoundFunction("DamageShip"),
    playGameOver: createSoundFunction("failMission"),
    playClickButton: createSoundFunction("clickButton"),
    playAlert: createSoundFunction("alert"),
    play: playSound, // Función genérica para cualquier sonido
    isMobile, // Exponer el estado mobile para componentes que lo necesiten
  };

  return (
    <SoundContext.Provider value={soundFunctions}>
      {children}
    </SoundContext.Provider>
  );
};

export { useMobile };
export default SoundEffects;
