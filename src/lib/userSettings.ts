import { SomneoPlatform } from '../somneoPlatform';
import { RequestedAccessory } from './requestedAccessory';
import { SomneoConstants } from './somneoConstants';
export class UserSettings {

  private static DEFAULT_POLLING_SECONDS = 30;
  private static DEFAULT_BOOLEAN_JSON_VALUE = true;

  public readonly Host: string;
  public FavoriteChannel= String(SomneoConstants.DEFAULT_ACTIVE_INPUT);
  public FavoriteSource = SomneoConstants.SOURCE_FM_RADIO;
  public readonly PollingMilliSeconds: number;
  public readonly RequestedAccessories: RequestedAccessory[] = [];

  constructor(
    private platform: SomneoPlatform,
  ) {
    this.Host = this.platform.config.host;

    // If the user has not specified a polling interval, default to 30s (in milliseconds)
    this.PollingMilliSeconds = (this.platform.config.pollingSeconds || UserSettings.DEFAULT_POLLING_SECONDS) * 1000;

    this.buildRequestedAccessories();
    this.buildChannelAndSource();
  }

  private buildChannelAndSource() {

    // If Audio disabled, just leave values as defaults to save time
    if (!this.RequestedAccessories.includes(RequestedAccessory.AUDIO)) {
      return;
    }

    // Likewise, if the user did not specify, leave it as the default
    if (this.platform.config.favoriteInput === undefined) {
      return;
    }

    if (Number(this.platform.config.favoriteInput) === SomneoConstants.INPUT_AUX_NUM) {
      this.FavoriteSource = SomneoConstants.SOURCE_AUX;
      this.FavoriteChannel = String(SomneoConstants.DEFAULT_ACTIVE_INPUT);
      return;
    }

    this.FavoriteSource = SomneoConstants.SOURCE_FM_RADIO;
    this.FavoriteChannel = String(this.platform.config.favoriteInput);
  }

  private buildRequestedAccessories() {

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

    if (this.getBooleanValue(this.platform.config.enableRelaxBreatheProgram)) {
      this.RequestedAccessories.push(RequestedAccessory.SWITCH_RELAXBREATHE);
    }

    if (this.getBooleanValue(this.platform.config.enableSunsetProgram)) {
      this.RequestedAccessories.push(RequestedAccessory.SWITCH_SUNSET);
    }

    if (this.getBooleanValue(this.platform.config.enableAudio)) {
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
