import { AccessoryPlugin, PlatformConfig } from 'homebridge';

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

export class UserSettings {

  private static DEFAULT_POLLING_SECONDS = 30;

  public readonly Host: string;
  public readonly PollingMilliSeconds: number;

  constructor(private config: PlatformConfig) {

    this.Host = this.config.host as string;

    // If the user has not specified a polling interval, default to 30s (in milliseconds)
    this.PollingMilliSeconds = (this.config.pollingSeconds as number|| UserSettings.DEFAULT_POLLING_SECONDS) * 1000;
  }
}
