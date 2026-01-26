"use client";

import { getSoundManager } from "@/components/SoundEffects";

import { useMobile } from "@/utils/useMobile";
import React, { ReactNode, useCallback } from "react";
import { createContext, useState, useContext, useEffect } from "react";

export type GameModeType = "classic" | "retro" | "christmas";
// Radio station types
export type Station = {
  id: string;
  name: string;
  displayName: string;
};

export const STATIONS: Station[] = [
  // {
  //   id: "chillsynth",
  //   name: "CHILLSYNTH",
  //   displayName: "Nightride FM - CHILLSYNTH STATION",
  // },
  {
    id: "darksynth",
    name: "DARKSYNTH",
    displayName: "Nightride FM - DARKSYNTH STATION",
  },
  // {
  //   id: "nightride",
  //   name: "NIGHTRIDE",
  //   displayName: "Nightride FM - NIGHTRIDE STATION",
  // },
  // {
  //   id: "datawave",
  //   name: "DATAWAVE",
  //   displayName: "Nightride FM - DATAWAVE STATION",
  // },
  // {
  //   id: "horrorsynth",
  //   name: "HORRORSYNTH",
  //   displayName: "Nightride FM - HORRORSYNTH STATION",
  // },
];

// Game state type
export type GameStateType =
  | "menu"
  | "modeSelection"
  | "shipSelection"
  | "intro"
  | "playing";

// Device Pixel Ratio type
export type DPRMode = "high" | "low";

// Define the context type
interface GameContextType {
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  gameOver: boolean;
  setGameOver: (over: boolean) => void;
  life: number;
  setLife: (life: number) => void;
  lifeStation: number;
  setLifeStation: (life: number) => void;
  score: number;
  setScore: (score: number) => void;
  togglePause: () => void;
  tutorial: boolean;
  setTutorial: (tutorial: boolean) => void;
  isBlurActive: boolean;
  setIsBlurActive: (blur: boolean) => void;
  isMusicEnabled: boolean;
  toggleMusic: () => void;
  soundEffectsEnabled: boolean;
  toggleSoundEffects: () => void;
  combo: number;
  setCombo: (combo: number) => void;
  comboMultiplier: number;
  setComboMultiplier: (multiplier: number) => void;
  comboLevel: string;
  setComboLevel: (level: string) => void;
  resetCombo: () => void;
  retroMode: boolean;
  setRetroMode: (retroMode: boolean) => void;
  isEffectsActive: boolean;
  toggleEffects: () => void;
  gameMode: GameModeType;
  specialPowerUses: number;
  useSpecialPower: () => boolean;
  addSpecialPowerUse: () => void;
  currentStation: Station;
  switchStation: () => void;
  gameState: GameStateType;
  setGameState: (state: GameStateType) => void;
  userInteracted: boolean;
  setUserInteracted: (interacted: boolean) => void;
  // New settings
  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;
  showFPS: boolean;
  setShowFPS: (show: boolean) => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  devicePixelRatio: DPRMode;
  setDevicePixelRatio: (dpr: DPRMode) => void;
  // Selected ship
  selectedShipId: string;
  setSelectedShipId: (shipId: string) => void;
}

// Create the context with a default value
const GameContext = createContext<GameContextType>({
  score: 0,
  setScore: () => {},
  gameOver: false,
  setGameOver: () => {},
  combo: 0,
  setCombo: () => {},
  comboMultiplier: 1,
  setComboMultiplier: () => {},
  comboLevel: "",
  setComboLevel: () => {},
  isPaused: false,
  setIsPaused: () => {},
  life: 100,
  setLife: () => {},
  lifeStation: 100,
  setLifeStation: () => {},
  togglePause: () => {},
  tutorial: false,
  setTutorial: () => {},
  isBlurActive: false,
  setIsBlurActive: () => {},
  isMusicEnabled: false,
  toggleMusic: () => {},
  soundEffectsEnabled: true,
  toggleSoundEffects: () => {},
  resetCombo: () => {},
  retroMode: true,
  setRetroMode: () => {},
  isEffectsActive: true,
  toggleEffects: () => {},
  gameMode: "classic",
  specialPowerUses: 3,
  useSpecialPower: () => false,
  addSpecialPowerUse: () => {},
  currentStation: STATIONS[0],
  switchStation: () => {},
  gameState: "menu",
  setGameState: () => {},
  userInteracted: false,
  setUserInteracted: () => {},
  // New settings defaults
  reducedMotion: false,
  setReducedMotion: () => {},
  showFPS: false,
  setShowFPS: () => {},
  musicVolume: 70,
  setMusicVolume: () => {},
  devicePixelRatio: "high",
  setDevicePixelRatio: () => {},
  // Selected ship default
  selectedShipId: "ranch01",
  setSelectedShipId: () => {},
});
interface GameProviderProps {
  children: ReactNode;
  gameMode: GameModeType;
  gameState?: GameStateType;
  setGameState?: (state: GameStateType) => void;
}

export const GameProvider: React.FC<GameProviderProps> = ({
  children,
  gameMode,
  gameState: externalGameState,
  setGameState: externalSetGameState,
}) => {
  // Use external gameState if provided, otherwise use internal state
  const [internalGameState, setInternalGameState] =
    useState<GameStateType>("menu");
  const gameState = externalGameState || internalGameState;
  const setGameState = externalSetGameState || setInternalGameState;
  // Existing state variables
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [life, setLife] = useState(100);
  const [lifeStation, setLifeStation] = useState(100);
  const [tutorial, setTutorial] = useState(true);
  const [isBlurActive, setIsBlurActive] = useState(true);
  const [isEffectsActive, setIsEffectsActive] = useState(true);

  const [score, setScore] = useState(0);
  const isMobile = useMobile();

  // Add new state variables for combo system
  const [combo, setCombo] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [comboLevel, setComboLevel] = useState("");
  const [retroMode, setRetroMode] = useState(
    gameMode === "retro" ? true : false
  );
  const soundManager = getSoundManager();
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  // Update retroMode when gameMode changes
  useEffect(() => {
    setRetroMode(gameMode === "retro");
  }, [gameMode]);

  // Radio station state
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const currentStation = STATIONS[currentStationIndex];

  // Special power state (3 uses max)
  const [specialPowerUses, setSpecialPowerUses] = useState(3);

  // User interaction state
  const [userInteracted, setUserInteracted] = useState(false);

  // New settings states
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showFPS, setShowFPS] = useState(false);
  const [musicVolume, setMusicVolume] = useState(70);
  const [devicePixelRatio, setDevicePixelRatio] = useState<DPRMode>("high");

  // Selected ship state (default is ranch01)
  const [selectedShipId, setSelectedShipId] = useState<string>("ranch01");

  // Toggle pause function
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
    !isMobile && soundManager.play("clickButton", { volume: 1 });
  }, [gameOver]);

  const toggleMusic = useCallback(() => {
    setIsMusicEnabled((prevState) => !prevState);
  }, []);

  const toggleSoundEffects = useCallback(() => {
    setSoundEffectsEnabled((prevState) => !prevState);
  }, []);

  const toggleEffects = useCallback(() => {
    setIsEffectsActive((prevState) => !prevState);
  }, []);

  const switchStation = useCallback(() => {
    setCurrentStationIndex((prev) => (prev + 1) % STATIONS.length);
  }, []);

  const resetCombo = useCallback(() => {
    setCombo(0);
    setComboMultiplier(1);
    setComboLevel("");
    soundManager.play("decreaseStationLife", { volume: 0.7 });
  }, [setCombo, setComboMultiplier, setComboLevel]);

  // Use special power function
  const useSpecialPower = useCallback(() => {
    if (specialPowerUses > 0 && !gameOver && !isPaused) {
      setSpecialPowerUses((prev) => prev - 1);
      // Play sound effect for special power
      soundManager.play("clickButton", { volume: 1 });
      return true; // Power was used successfully
    }
    return false; // Power not available or game is paused/over
  }, [specialPowerUses, gameOver, isPaused, soundManager]);

  // Add special power use (max 3)
  const addSpecialPowerUse = useCallback(() => {
    setSpecialPowerUses((prev) => Math.min(prev + 1, 3));
  }, []);

  const value: GameContextType = {
    isPaused,
    setIsPaused,
    gameOver,
    setGameOver,
    life,
    setLife,
    score,
    setScore,
    togglePause,
    setLifeStation,
    lifeStation,
    tutorial,
    setTutorial,
    isBlurActive,
    setIsBlurActive,
    isMusicEnabled,
    toggleMusic,
    soundEffectsEnabled,
    toggleSoundEffects,
    combo,
    setCombo,
    comboMultiplier,
    setComboMultiplier,
    comboLevel,
    setComboLevel,
    resetCombo,
    retroMode,
    setRetroMode,
    isEffectsActive,
    toggleEffects,
    gameMode,
    specialPowerUses,
    useSpecialPower,
    addSpecialPowerUse,
    currentStation,
    switchStation,
    gameState,
    setGameState,
    userInteracted,
    setUserInteracted,
    // New settings
    reducedMotion,
    setReducedMotion,
    showFPS,
    setShowFPS,
    musicVolume,
    setMusicVolume,
    devicePixelRatio,
    setDevicePixelRatio,
    // Selected ship
    selectedShipId,
    setSelectedShipId,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Create a custom hook to use the context
export const useGameContext = () => {
  return useContext(GameContext);
};
