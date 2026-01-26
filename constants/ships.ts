export interface ShipStats {
  energy: number;
  shield: number;
  velocity: number;
  attack: number;
}

export interface SpecialPower {
  name: string;
  iconPath: string;
  description: string;
  preview: string | null;
}

export interface Buddy {
  component: string | null;
  name: string;
  hability: string;
}

export interface Ship {
  id: string;
  name: string;
  displayName: string;
  isUnlocked: boolean;
  iconPath: string;
  stats: ShipStats;
  component: string; // Name of the 3D component for ship selection
  gameComponent: string; // Name of the 3D component for the game (lighter model)
  buddy: Buddy; // Name of the buddy 3D component, or null if no buddy
  description: string;
  specialPower: SpecialPower;
}

export const SHIPS: Ship[] = [
  {
    id: "ranch01",
    name: "Ranch01",
    displayName: "Rnch - 01",
    isUnlocked: true,
    iconPath: "/assets/images/icon-ranch.png",
    stats: {
      energy: 4,
      shield: 1,
      velocity: 3,
      attack: 2,
    },
    component: "Ranch01",
    gameComponent: "ModelUpgrade",
    buddy: {
      component: "BuddyRanch01",
      name: "Rnch-E",
      hability: "A powerful radial blast that destroy back all nearby enemies.",
    },
    description:
      "Rnch-01 is a balanced fighter built for extended missions, featuring efficient energy management, steady velocity, and reliable shielding for sustained combat. Its Shockwave ability unleashes a radial blast to clear nearby threats, making it a dependable choice for pilots who value endurance and control.",
    specialPower: {
      name: "Shockwave",
      iconPath: "/assets/images/shockwave-icon-ship-page.png",
      description:
        "A powerful radial blast that destroy back all nearby enemies.",
      preview: null,
    },
  },
  {
    id: "eta-2-actis",
    name: "ETA-2 Actis Interceptor",
    displayName: "ETA-2 Actis",
    isUnlocked: true,
    iconPath: "/assets/images/icon-eta-2-actis.png",
    stats: {
      energy: 3,
      shield: 1,
      velocity: 4,
      attack: 3,
    },
    component: "Eta2Actis",
    gameComponent: "EctaShip",
    buddy: {
      component: null,
      name: "Ar2-De2", // This is just for copyrights issues(?)
      hability: "A powerful radial blast that destroy back all nearby enemies.",
    },
    description:
      "An agile interceptor designed for speed and precision. Dominates in fast-paced combat scenarios.",
    specialPower: {
      name: "Electroshock",
      iconPath: "/assets/images/electroshock.png", // Placeholder icon for now
      description:
        "Activates a temporary speed boost, allowing the ship to rapidly reposition.",
      preview: null,
    },
  },
  {
    id: "ship03",
    name: "Ship03",
    displayName: "Ship 03",
    isUnlocked: false,
    iconPath: "/assets/images/icon-ranch.png", // Same icon for now
    stats: {
      energy: 4,
      shield: 1,
      velocity: 3,
      attack: 2,
    },
    component: "Ranch01", // Same component for now
    gameComponent: "ModelUpgrade", // Same game component for now
    buddy: {
      component: "BuddyRanch01",
      name: "Rnch-E",
      hability: "A powerful radial blast that destroy back all nearby enemies.",
    },
    description:
      "A heavily armored destroyer with devastating firepower. Built to withstand and deliver maximum damage.",
    specialPower: {
      name: "Shield Overload",
      iconPath: "/assets/images/shockwave-png-path.png", // Placeholder icon for now
      description:
        "Temporarily overcharges the shield generator, creating an impenetrable barrier that absorbs all incoming damage.",
      preview: null,
    },
  },
];

export const MAX_STAT_VALUE = 5;
