export type DoorSide = 'left' | 'right';
export type ComputerState = 'OFF' | 'ON' | 'WORKING' | 'CAMERA_VIEW' | 'REBOOTING';
export type AnimatronicName = 'crocodile' | 'dog' | 'fox' | 'chick' | 'freddy';
export type AnimatronicMode = 'hidden' | 'waiting' | 'moving' | 'door' | 'window' | 'running' | 'office' | 'retreating';

export interface AnimatronicState {
  name: AnimatronicName;
  mode: AnimatronicMode;
  route: string[];
  routeIndex: number;
  timer: number;
  arrival: number;
  lastRoutes: string[];
  litTime: number;
}

export interface DoorState {
  closed: boolean;
  moving: boolean;
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

export interface GameState {
  elapsed: number;
  energy: number;
  flashlightBattery: number;
  hasFlashlight: boolean;
  flashlightOn: boolean;
  flashlightAtWindow: boolean;
  flashlightPulse: number;
  computer: ComputerState;
  computerUseTime: number;
  rebootTime: number;
  selectedCamera: number;
  leftDoor: DoorState;
  rightDoor: DoorState;
  drawerOpen: boolean;
  hasTape: boolean;
  repairOpen: boolean;
  wiresFixed: number[];
  selectedWire: number | null;
  problems: ProblemState;
  animatronics: Record<AnimatronicName, AnimatronicState>;
  message: string;
  messageTime: number;
  gameOver: string | null;
  won: boolean;
}
