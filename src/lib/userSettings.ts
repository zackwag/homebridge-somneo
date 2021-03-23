import { PlatformConfig } from 'homebridge';
import { RequestedAccessory } from './requestedAccessory';
export class UserSettings {

  private static DEFAULT_POLLING_SECONDS = 30;
  private static DEFAULT_BOOLEAN_JSON_VALUE = true;

  public readonly Host: string;
  public readonly PollingMilliSeconds: number;
  public readonly RequestedAccessories: RequestedAccessory[] = [];

  constructor(
    private config: PlatformConfig,
  ) {
    this.Host = this.config.host;

    // If the user has not specified a polling interval, default to 30s (in milliseconds)
    this.PollingMilliSeconds = (this.config.pollingSeconds || UserSettings.DEFAULT_POLLING_SECONDS) * 1000;

    if (this.getBooleanValue(this.config.enableHumiditySensor)) {
      this.RequestedAccessories.push(RequestedAccessory.SENSOR_HUMIDITY);
    }

    if (this.getBooleanValue(this.config.enableLuxSensor)) {
      this.RequestedAccessories.push(RequestedAccessory.SENSOR_LUX);
    }

    if (this.getBooleanValue(this.config.enableTemperatureSensor)) {
      this.RequestedAccessories.push(RequestedAccessory.SENSOR_TEMPERATURE);
    }

    if(this.getBooleanValue(this.config.enableMainLight)) {
      this.RequestedAccessories.push(RequestedAccessory.LIGHT_MAIN);
    }

    if (this.getBooleanValue(this.config.enableNightLight)) {
      this.RequestedAccessories.push(RequestedAccessory.LIGHT_NIGHT_LIGHT);
    }

    if (this.getBooleanValue(this.config.enableRelaxBreatheProgram)) {
      this.RequestedAccessories.push(RequestedAccessory.SWITCH_RELAXBREATHE);
    }

    if (this.getBooleanValue(this.config.enableSunsetProgram)) {
      this.RequestedAccessories.push(RequestedAccessory.SWITCH_SUNSET);
    }

    if (this.getBooleanValue(this.config.enableAudio)) {
      this.RequestedAccessories.push(RequestedAccessory.AUDIO);
    }
  }

  private getBooleanValue(configValue: string) {

    if (configValue === undefined) {
      return UserSettings.DEFAULT_BOOLEAN_JSON_VALUE;
    }

    return JSON.parse(configValue);
  }
}
