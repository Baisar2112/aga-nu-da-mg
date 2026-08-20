export type DoorSide = 'left' | 'right';
export type ComputerState = 'OFF' | 'ON' | 'WORKING' | 'CAMERA_VIEW' | 'REBOOTING';
export type AnimatronicName = 'crocodile' | 'dog' | 'fox' | 'chick' | 'freddy';
export type AnimatronicMode = 'hidden' | 'waiting' | 'moving' | 'door' | 'window' | 'running' | 'office' | 'retreating';
export type WatcherPosition = 'start' | 'middle' | 'end';

export interface AnimatronicState {
  name: AnimatronicName;
  mode: AnimatronicMode;
  route: string[];
  routeIndex: number;
  timer: number;
  arrival: number;
  heldByDirector: boolean;
  heldByRepair: boolean;
  lastRoutes: string[];
  litTime: number;
}

export interface DoorState {
  closed: boolean;
  moving: boolean;
  blocked: boolean;
}

export interface ProblemState {
  outageAt: number;
  outageActive: boolean;
  outageDone: boolean;
  staticAt: number;
  staticActive: boolean;
  staticCount: number;
  rageAt: number;
  rageActive: boolean;
}

export interface WatcherState {
  active: boolean;
  position: WatcherPosition;
  moveTimer: number;
  turnTimer: number;
  attackTimer: number;
  maskTime: number;
  headTurned: boolean;
}

export interface AnimatronicRule {
  enabled: boolean;
  spawnTime: number;
  speed: number;
}

export interface ProblemRule {
  enabled: boolean;
  at: number;
}

export interface GameRules {
  officeBrightness: number;
  animatronics: Record<AnimatronicName, AnimatronicRule>;
  watcher: AnimatronicRule;
  problems: Record<'outage' | 'static' | 'rage', ProblemRule>;
}

export interface GameState {
  elapsed: number;
  timeLayoutVersion: number;
  energy: number;
  flashlightBattery: number;
  hasFlashlight: boolean;
  hasMask: boolean;
  maskOn: boolean;
  flashlightOn: boolean;
  flashlightAtWindow: boolean;
  flashlightPulse: number;
  computer: ComputerState;
  computerUseTime: number;
  rebootTime: number;
  selectedCamera: number;
  cameraLayoutVersion: number;
  leftDoor: DoorState;
  rightDoor: DoorState;
  drawerOpen: boolean;
  hasTape: boolean;
  repairOpen: boolean;
  wiresFixed: number[];
  selectedWire: number | null;
  rules: GameRules;
  problems: ProblemState;
  animatronics: Record<AnimatronicName, AnimatronicState>;
  watcher: WatcherState;
  message: string;
  messageTime: number;
  gameOver: string | null;
  won: boolean;
}
