import { AccessoryPlugin } from 'homebridge';

export interface SomneoAccessory extends AccessoryPlugin {
  name: string;
  updateValues(): Promise<void>;
}

export interface SomneoBinaryAccessory extends SomneoAccessory {
  getAffectedAccessories(): SomneoBinaryAccessory[];
  turnOff(): void;
}

export interface SensorReadings {
  mslux: number;
  mstmp: number;
  msrhu: number;
}

export interface SunsetProgram {
  onoff: boolean;
}

export interface LightSettings {
  ltlvl: number;
  onoff: boolean;
  ngtlt: boolean;
}

export interface Light {
  onoff?: boolean;
  tempy?: boolean;
  ltlvl?: number;
}

export interface NightLight {
  ngtlt: boolean;
}
