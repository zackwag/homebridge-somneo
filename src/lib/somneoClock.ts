import { Logger } from 'homebridge';
import { RequestedAccessory } from './requestedAccessory';
import { Lights, Sensors, SomneoConfig, Switches } from './SomneoConfig';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';

export class SomneoClock {

  private static readonly ALL_LIGHT_ACCESSORIES = [RequestedAccessory.LIGHT_MAIN,
    RequestedAccessory.LIGHT_NIGHT_LIGHT];

  private static readonly ALL_SENSOR_ACCESSORIES = [RequestedAccessory.SENSOR_HUMIDITY,
    RequestedAccessory.SENSOR_LUX,
    RequestedAccessory.SENSOR_TEMPERATURE];

  private static readonly ALL_SWITCH_ACCESSORIES = [RequestedAccessory.SWITCH_RELAXBREATHE,
    RequestedAccessory.SWITCH_SUNSET];

  private static readonly DEFAULT_AUDIO_PREFS: AudioPreferences = {
    FavoriteChannel: SomneoConstants.DEFAULT_AUDIO_CHANNEL,
    FavoriteSource: SomneoConstants.SOUND_SOURCE_FM_RADIO,
  };

  private static readonly DEFAULT_BOOLEAN_CONFIG_VALUE = true;

  private static readonly DEFAULT_SUNSET_PROGRAM_PREFS: SunsetProgramPreferences = {
    Duration: SomneoConstants.DEFAULT_SUNSET_PROGRAM_DURATION,
    LightIntensity: SomneoConstants.DEFAULT_SUNSET_PROGRAM_LIGHT_INTENSITY,
    ColorScheme: SomneoConstants.DEFAULT_SUNSET_PROGRAM_COLOR_SCHEME,
    AmbientSounds: SomneoConstants.DEFAULT_SUNSET_PROGRAM_AMBIENT_SOUNDS,
    Volume: SomneoConstants.DEFAULT_SUNSET_PROGRAM_VOLUME,
  };

  private static readonly IP_V_4_REG_EX = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  public SomneoService: SomneoService;

  constructor(
    public Name: string,
    private host: string,
    public RequestedAccessories: RequestedAccessory[],
    public SunsetProgramPreferences: SunsetProgramPreferences,
    public AudioPreferences: AudioPreferences,
    private log: Logger,
  ) {
    this.SomneoService = new SomneoService(this.host, this.log);
  }

  static create(log: Logger, config: SomneoConfig): SomneoClock | undefined {

    // If not defined or not an IP 4 address, reject it
    if (config.host === undefined || !config.host.match(this.IP_V_4_REG_EX)) {
      return undefined;
    }

    const name = this.buildName(config);
    const host = config.host;
    const requestedAccessories = this.buildRequestedAccessories(config);
    const sunsetProgramPreferences = this.buildSunsetProgramPreferences(config, requestedAccessories);
    const audioPreferences = this.buildAudioPreferences(config, requestedAccessories);

    return new SomneoClock(name, host, requestedAccessories, sunsetProgramPreferences, audioPreferences, log);
  }

  private static buildName(config: SomneoConfig) {

    // If Name not specified, default to 'Somneo'
    return config.name || SomneoConstants.SOMNEO;
  }

  private static buildRequestedAccessories(config: SomneoConfig): RequestedAccessory[] {

    return [...this.buildRequestedSensorAccessories(config),
      ...this.buildRequestedLightAccessories(config),
      ...this.buildRequestedSwitchAccessories(config),
      ...this.buildRequestedAudioAccessories(config)];
  }

  private static buildRequestedAudioAccessories(config: SomneoConfig): RequestedAccessory[] {

    // If not configured add audio
    if (config.audio === undefined) {
      return [RequestedAccessory.AUDIO];
    }

    if (this.getBooleanValue(config.audio.isEnabled)) {
      return [RequestedAccessory.AUDIO];
    }

    return [];
  }

  private static buildRequestedSwitchAccessories(config: SomneoConfig): RequestedAccessory[] {

    // If not configured, add all switches
    if (config.switches === undefined) {
      return SomneoClock.ALL_SWITCH_ACCESSORIES;
    }

    const requestedAccessories: RequestedAccessory[] = [];

    const sunsetSwitch = this.buildRequestedSunsetSwitchAccessory(config.switches);
    if (sunsetSwitch !== undefined) {
      requestedAccessories.push(sunsetSwitch);
    }

    const relaxBreatheSwitch = this.buildRequestedRelaxBreatheSwitchAccessory(config.switches);
    if (relaxBreatheSwitch !== undefined) {
      requestedAccessories.push(relaxBreatheSwitch);
    }

    return requestedAccessories;
  }

  private static buildRequestedSunsetSwitchAccessory(switchesConfig: Switches): RequestedAccessory | undefined {

    // If not configured, add sunset
    if (switchesConfig.sunset === undefined) {
      return RequestedAccessory.SWITCH_SUNSET;
    }

    if (this.getBooleanValue(switchesConfig.sunset.isEnabled)) {
      return RequestedAccessory.SWITCH_SUNSET;
    }

    return undefined;
  }

  private static buildRequestedRelaxBreatheSwitchAccessory(switchesConfig: Switches): RequestedAccessory | undefined {

    // If not configured, add relaxBreathe
    if (switchesConfig.relaxBreathe === undefined) {
      return RequestedAccessory.SWITCH_RELAXBREATHE;
    }

    if (this.getBooleanValue(switchesConfig.relaxBreathe.isEnabled)) {
      return RequestedAccessory.SWITCH_RELAXBREATHE;
    }

    return undefined;
  }

  private static buildRequestedLightAccessories(config: SomneoConfig): RequestedAccessory[] {

    // If not configured add all lights
    if (config.lights === undefined) {
      return SomneoClock.ALL_LIGHT_ACCESSORIES;
    }

    const requestedAccessories: RequestedAccessory[] = [];

    const mainLight = this.buildRequestedMainLightAccessory(config.lights);
    if (mainLight !== undefined) {
      requestedAccessories.push(mainLight);
    }

    const nightLight = this.buildRequestedNightLightAccessory(config.lights);
    if (nightLight !== undefined) {
      requestedAccessories.push(nightLight);
    }

    return requestedAccessories;
  }

  private static buildRequestedMainLightAccessory(lightsConfig: Lights): RequestedAccessory | undefined {

    // If not configured, add main light
    if (lightsConfig.mainLight === undefined) {
      return RequestedAccessory.LIGHT_MAIN;
    }

    if (this.getBooleanValue(lightsConfig.mainLight.isEnabled)) {
      return RequestedAccessory.LIGHT_MAIN;
    }

    return undefined;
  }

  private static buildRequestedNightLightAccessory(lightsConfig: Lights): RequestedAccessory | undefined {

    // If not configured, add night light
    if (lightsConfig.nightLight === undefined) {
      return RequestedAccessory.LIGHT_NIGHT_LIGHT;
    }

    if (this.getBooleanValue(lightsConfig.nightLight.isEnabled)) {
      return RequestedAccessory.LIGHT_NIGHT_LIGHT;
    }

    return undefined;
  }

  private static buildRequestedSensorAccessories(config: SomneoConfig): RequestedAccessory[] {

    // If not configured, add all the sensors
    if (config.sensors === undefined) {
      return SomneoClock.ALL_SENSOR_ACCESSORIES;
    }

    const requestedAccessories: RequestedAccessory[] = [];

    const humiditySensor = this.buildRequestedHumitySensorAccessory(config.sensors);
    if (humiditySensor !== undefined) {
      requestedAccessories.push(humiditySensor);
    }

    const luxSensor = this.buildRequestedLuxSensorAccessory(config.sensors);
    if (luxSensor !== undefined) {
      requestedAccessories.push(luxSensor);
    }

    const temperatureSensor = this.buildRequestedTemperatureSensorAccessory(config.sensors);
    if (temperatureSensor !== undefined) {
      requestedAccessories.push(temperatureSensor);
    }

    return requestedAccessories;
  }

  private static buildRequestedHumitySensorAccessory(sensorsConfig: Sensors): RequestedAccessory | undefined {

    // If not configured, add humidity
    if (sensorsConfig.humidity === undefined) {
      return RequestedAccessory.SENSOR_HUMIDITY;
    }

    if (this.getBooleanValue(sensorsConfig.humidity.isEnabled)) {
      return RequestedAccessory.SENSOR_HUMIDITY;
    }

    return undefined;
  }

  private static buildRequestedLuxSensorAccessory(sensorsConfig: Sensors): RequestedAccessory | undefined {

    // If not configured, add lux
    if (sensorsConfig.lux === undefined) {
      return RequestedAccessory.SENSOR_LUX;
    }

    if (this.getBooleanValue(sensorsConfig.lux.isEnabled)) {
      return RequestedAccessory.SENSOR_LUX;
    }

    return undefined;
  }

  private static buildRequestedTemperatureSensorAccessory(sensorsConfig: Sensors): RequestedAccessory | undefined {

    // If not configured, add temperature
    if (sensorsConfig.temperature === undefined) {
      return RequestedAccessory.SENSOR_TEMPERATURE;
    }

    if (this.getBooleanValue(sensorsConfig.temperature.isEnabled)) {
      return RequestedAccessory.SENSOR_TEMPERATURE;
    }

    return undefined;
  }

  private static buildAudioPreferences(config: SomneoConfig, requestedAccessories: RequestedAccessory[]): AudioPreferences {

    // If Audio disabled, just leave values as defaults to save time
    if (!requestedAccessories.includes(RequestedAccessory.AUDIO)) {
      return SomneoClock.DEFAULT_AUDIO_PREFS;
    }

    // Likewise, if the user did not specify, leave it as the default
    if (config.audio === undefined || config.audio.favoriteInput === undefined) {
      return SomneoClock.DEFAULT_AUDIO_PREFS;
    }

    // If AUX set the source and channel
    // Channel is not actually used for AUX in the API, but it's good to have a value
    if (Number(config.audio.favoriteInput) === SomneoConstants.INPUT_AUX_NUM) {
      return { FavoriteChannel: SomneoConstants.DEFAULT_AUDIO_CHANNEL, FavoriteSource: SomneoConstants.SOUND_SOURCE_AUX };
    }

    // Otherwise set to FM Radio in Source and Channel
    return { FavoriteChannel: String(config.audio.favoriteInput), FavoriteSource: SomneoConstants.SOUND_SOURCE_FM_RADIO };
  }

  private static buildSunsetProgramPreferences(config: SomneoConfig, requestedAccessories: RequestedAccessory[]): SunsetProgramPreferences {

    // If Sunset Program disabled, just leave values as defaults to save time
    if (!requestedAccessories.includes(RequestedAccessory.SWITCH_SUNSET)) {
      return SomneoClock.DEFAULT_SUNSET_PROGRAM_PREFS;
    }

    // Likewise, if the user did not specify, leave it as the default
    if (config.switches === undefined || config.switches.sunset === undefined) {
      return SomneoClock.DEFAULT_SUNSET_PROGRAM_PREFS;
    }

    const sunset = config.switches.sunset;

    return {
      Duration: sunset.duration === undefined ? SomneoClock.DEFAULT_SUNSET_PROGRAM_PREFS.Duration : sunset.duration,
      LightIntensity: SomneoClock.getPhilipsPercentageValue(sunset.lightIntensity, SomneoClock.DEFAULT_SUNSET_PROGRAM_PREFS.LightIntensity),
      ColorScheme: sunset.colorScheme === undefined ? SomneoClock.DEFAULT_SUNSET_PROGRAM_PREFS.ColorScheme : sunset.colorScheme,
      AmbientSounds: sunset.ambientSounds === undefined ? SomneoClock.DEFAULT_SUNSET_PROGRAM_PREFS.AmbientSounds : sunset.ambientSounds,
      Volume: SomneoClock.getPhilipsPercentageValue(sunset.volume, SomneoClock.DEFAULT_SUNSET_PROGRAM_PREFS.Volume),
    };
  }

  private static getPhilipsPercentageValue(configPercentageValue: number | undefined, defaultValue: number) {

    if (configPercentageValue === undefined) {
      return defaultValue;
    }

    if (configPercentageValue > SomneoConstants.PERCENTAGE_MAX) {
      return SomneoConstants.PHILIPS_PERCENTAGE_MAX;
    }

    if (configPercentageValue < SomneoConstants.PERCENTAGE_MIN) {
      return SomneoConstants.PHILIPS_PERCENTAGE_MIN;
    }

    return SomneoConstants.convertPercentageToPhilipsPercentage(configPercentageValue);
  }

  private static getBooleanValue(configBooleanValue?: boolean) {

    if (configBooleanValue === undefined) {
      return SomneoClock.DEFAULT_BOOLEAN_CONFIG_VALUE;
    }

    return configBooleanValue;
  }
}

export interface AudioPreferences {
  FavoriteChannel: string;
  FavoriteSource: string;
}

export interface SunsetProgramPreferences {
  Duration: number;
  LightIntensity: number;
  ColorScheme: string;
  AmbientSounds: string;
  Volume: number;
}
