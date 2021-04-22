import { Logger } from 'homebridge';
import { RequestedAccessory } from './requestedAccessory';
import { LightsConfig, SensorsConfig, SomneoConfig, SwitchesConfig } from './somneoConfigDataTypes';
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

  public SomneoService: SomneoService;

  private constructor(
    public Name: string,
    private host: string,
    public RequestedAccessories: RequestedAccessory[],
    public RelaxBreatheProgramPreferences: RelaxeBreatheProgramPreferences,
    public SunsetProgramPreferences: SunsetProgramPreferences,
    public AudioPreferences: AudioPreferences,
    private log: Logger,
  ) {
    this.SomneoService = new SomneoService(this.host, this.log);
  }

  static create(log: Logger, config: SomneoConfig): SomneoClock | undefined {

    // If not defined or not an IP 4 address, reject it
    if (config.host === undefined) {
      return undefined;
    }

    if (!config.host.match(SomneoConstants.IP_V_4_REG_EX)) {
      return undefined;
    }

    if (config.name === undefined) {
      return undefined;
    }

    const host = config.host;
    const name = config.name;
    const requestedAccessories = this.buildRequestedAccessories(config);
    const relaxBreatheProgramPrefernces = this.buildRelaxBreatheProgramPreferences(config, requestedAccessories);
    const sunsetProgramPreferences = this.buildSunsetProgramPreferences(config, requestedAccessories);
    const audioPreferences = this.buildAudioPreferences(config, requestedAccessories);

    return new SomneoClock(name, host, requestedAccessories, relaxBreatheProgramPrefernces, sunsetProgramPreferences,
      audioPreferences, log);
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

    const requestedAccessories: RequestedAccessory[] = [];

    if (this.getBooleanValue(config.audio.isEnabled)) {
      requestedAccessories.push(RequestedAccessory.AUDIO);
    }

    return requestedAccessories;
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

  private static buildRequestedSunsetSwitchAccessory(switchesConfig: SwitchesConfig): RequestedAccessory | undefined {

    // If not configured, add sunset
    if (switchesConfig.sunset === undefined) {
      return RequestedAccessory.SWITCH_SUNSET;
    }

    if (this.getBooleanValue(switchesConfig.sunset.isEnabled)) {
      return RequestedAccessory.SWITCH_SUNSET;
    }

    return undefined;
  }

  private static buildRequestedRelaxBreatheSwitchAccessory(switchesConfig: SwitchesConfig): RequestedAccessory | undefined {

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

  private static buildRequestedMainLightAccessory(lightsConfig: LightsConfig): RequestedAccessory | undefined {

    // If not configured, add main light
    if (lightsConfig.mainLight === undefined) {
      return RequestedAccessory.LIGHT_MAIN;
    }

    if (this.getBooleanValue(lightsConfig.mainLight.isEnabled)) {
      return RequestedAccessory.LIGHT_MAIN;
    }

    return undefined;
  }

  private static buildRequestedNightLightAccessory(lightsConfig: LightsConfig): RequestedAccessory | undefined {

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

  private static buildRequestedHumitySensorAccessory(sensorsConfig: SensorsConfig): RequestedAccessory | undefined {

    // If not configured, add humidity
    if (sensorsConfig.humidity === undefined) {
      return RequestedAccessory.SENSOR_HUMIDITY;
    }

    if (this.getBooleanValue(sensorsConfig.humidity.isEnabled)) {
      return RequestedAccessory.SENSOR_HUMIDITY;
    }

    return undefined;
  }

  private static buildRequestedLuxSensorAccessory(sensorsConfig: SensorsConfig): RequestedAccessory | undefined {

    // If not configured, add lux
    if (sensorsConfig.lux === undefined) {
      return RequestedAccessory.SENSOR_LUX;
    }

    if (this.getBooleanValue(sensorsConfig.lux.isEnabled)) {
      return RequestedAccessory.SENSOR_LUX;
    }

    return undefined;
  }

  private static buildRequestedTemperatureSensorAccessory(sensorsConfig: SensorsConfig): RequestedAccessory | undefined {

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
      return SomneoConstants.DEFAULT_AUDIO_PREFS;
    }

    // Likewise, if the user did not specify, leave it as the default
    if (config.audio === undefined || config.audio.favoriteInput === undefined) {
      return SomneoConstants.DEFAULT_AUDIO_PREFS;
    }

    // If AUX set the source and channel
    // Channel is not actually used for AUX in the API, but it's good to have a value
    if (config.audio.favoriteInput === SomneoConstants.INPUT_AUX_NUM) {
      return { FavoriteChannel: SomneoConstants.DEFAULT_AUDIO_CHANNEL, FavoriteSource: SomneoConstants.SOUND_SOURCE_AUX };
    }

    // Otherwise set to FM Radio in Source and Channel
    return { FavoriteChannel: String(config.audio.favoriteInput), FavoriteSource: SomneoConstants.SOUND_SOURCE_FM_RADIO };
  }

  private static buildRelaxBreatheProgramPreferences(config: SomneoConfig, requestedAccessories: RequestedAccessory[]):
    RelaxeBreatheProgramPreferences {

    // If RelaxBreathe Program disabled, just leave values as defaults to save time
    if (!requestedAccessories.includes(RequestedAccessory.SWITCH_RELAXBREATHE)) {
      return SomneoConstants.DEFAULT_RELAX_BREATHE_PROGRAM_PREFS;
    }

    // Likewise, if the user did not specify, leave it as the default
    if (config.switches === undefined || config.switches.relaxBreathe === undefined) {
      return SomneoConstants.DEFAULT_RELAX_BREATHE_PROGRAM_PREFS;
    }

    const relaxBreathe = config.switches.relaxBreathe;

    return {
      // eslint-disable-next-line max-len
      BreathsPerMin: SomneoClock.getPhilipsBpmValue(relaxBreathe.breathsPerMin, SomneoConstants.DEFAULT_RELAX_BREATHE_PROGRAM_PREFS.BreathsPerMin),
      Duration: relaxBreathe.duration ?? SomneoConstants.DEFAULT_RELAX_BREATHE_PROGRAM_PREFS.Duration,
      GuidanceType: relaxBreathe.guidanceType ?? SomneoConstants.DEFAULT_RELAX_BREATHE_PROGRAM_PREFS.GuidanceType,
      // eslint-disable-next-line max-len
      LightIntensity: SomneoClock.getPhilipsPercentageValue(relaxBreathe.lightIntensity, SomneoConstants.DEFAULT_RELAX_BREATHE_PROGRAM_PREFS.LightIntensity),
      Volume: SomneoClock.getPhilipsPercentageValue(relaxBreathe.volume, SomneoConstants.DEFAULT_RELAX_BREATHE_PROGRAM_PREFS.Volume),
    };
  }

  private static buildSunsetProgramPreferences(config: SomneoConfig, requestedAccessories: RequestedAccessory[]): SunsetProgramPreferences {

    // If Sunset Program disabled, just leave values as defaults to save time
    if (!requestedAccessories.includes(RequestedAccessory.SWITCH_SUNSET)) {
      return SomneoConstants.DEFAULT_SUNSET_PROGRAM_PREFS;
    }

    // Likewise, if the user did not specify, leave it as the default
    if (config.switches === undefined || config.switches.sunset === undefined) {
      return SomneoConstants.DEFAULT_SUNSET_PROGRAM_PREFS;
    }

    const sunset = config.switches.sunset;

    return {
      Duration: sunset.duration ?? SomneoConstants.DEFAULT_SUNSET_PROGRAM_PREFS.Duration,
      // eslint-disable-next-line max-len
      LightIntensity: SomneoClock.getPhilipsPercentageValue(sunset.lightIntensity, SomneoConstants.DEFAULT_SUNSET_PROGRAM_PREFS.LightIntensity),
      ColorScheme: sunset.colorScheme ?? SomneoConstants.DEFAULT_SUNSET_PROGRAM_PREFS.ColorScheme,
      AmbientSounds: sunset.ambientSounds ?? SomneoConstants.DEFAULT_SUNSET_PROGRAM_PREFS.AmbientSounds,
      Volume: SomneoClock.getPhilipsPercentageValue(sunset.volume, SomneoConstants.DEFAULT_SUNSET_PROGRAM_PREFS.Volume),
    };
  }

  private static getPhilipsBpmValue(configValue: number | undefined, defaultValue: number) {

    if (configValue === undefined) {
      return defaultValue;
    }

    // BPM stored as enum in Philips API. But subtracting 3 gets the value easily
    return configValue - 3;
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
      return SomneoConstants.DEFAULT_BOOLEAN_CONFIG_VALUE;
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

export interface RelaxeBreatheProgramPreferences {
  BreathsPerMin: number;
  Duration: number;
  GuidanceType: number;
  LightIntensity: number;
  Volume: number;
}
