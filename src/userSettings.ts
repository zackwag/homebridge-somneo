import { SomneoPlatform } from './platform';

export enum RequestedAccessory {
    SENSOR_HUMIDITY,
    SENSOR_LUX,
    SENSOR_TEMPERATURE,
    LIGHT_MAIN,
    LIGHT_NIGHT_LIGHT,
    SWITCH_SUNSET_PROGRAM
}

export class UserSettings {

  private static DEFAULT_POLLING_SECONDS = 30;
  private static DEFAULT_BOOLEAN_JSON_VALUE = true;

  public readonly Host: string;
  public readonly PollingMilliSeconds: number;
  public readonly RequestedAccessories: RequestedAccessory[] = [];

  constructor(
    private platform: SomneoPlatform,
  ) {

    this.Host = this.platform.config.host as string;

    // If the user has not specified a polling interval, default to 30s (in milliseconds)
    this.PollingMilliSeconds = (this.platform.config.pollingSeconds as number|| UserSettings.DEFAULT_POLLING_SECONDS) * 1000;

    if (this.getBooleanValue(this.platform.config.enableHumiditySensor)) {
      this.RequestedAccessories.push(RequestedAccessory.SENSOR_HUMIDITY);
    }

    if (this.getBooleanValue(this.platform.config.enableLuxSensor)) {
      this.RequestedAccessories.push(RequestedAccessory.SENSOR_LUX);
    }

    if (this.getBooleanValue(this.platform.config.enableTemperatureSensor)) {
      this.RequestedAccessories.push(RequestedAccessory.SENSOR_TEMPERATURE);
    }

    if(this.getBooleanValue(this.platform.config.enableMainLight)) {
      this.RequestedAccessories.push(RequestedAccessory.LIGHT_MAIN);
    }

    if (this.getBooleanValue(this.platform.config.enableNightLight)) {
      this.RequestedAccessories.push(RequestedAccessory.LIGHT_NIGHT_LIGHT);
    }

    if (this.getBooleanValue(this.platform.config.enableSunsetProgram)) {
      this.RequestedAccessories.push(RequestedAccessory.SWITCH_SUNSET_PROGRAM);
    }
  }

  private getBooleanValue(configValue: string) {

    if (configValue === undefined) {
      return UserSettings.DEFAULT_BOOLEAN_JSON_VALUE;
    }

    return JSON.parse(configValue);
  }
}
