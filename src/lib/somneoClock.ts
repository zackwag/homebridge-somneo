import { Logger } from 'homebridge';
import { RequestedAccessory } from './requestedAccessory';
import { SomneoConfig } from './somneoConfigDataTypes';
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
      log.warn(`Skipping Somneo clock -> name=${config.name} is missing a required 'host'.`);
      return undefined;
    }

    if (!config.host.match(SomneoConstants.IP_V_4_REG_EX)) {
      log.warn(`Skipping Somneo clock -> host=${config.host} is not a valid IPv4 address.`);
      return undefined;
    }

    if (config.name === undefined) {
      log.warn(`Skipping Somneo clock -> host=${config.host} is missing a required 'name'.`);
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

    return [
      this.buildRequestedAccessory(config.switches.sunset, RequestedAccessory.SWITCH_SUNSET),
      this.buildRequestedAccessory(config.switches.relaxBreathe, RequestedAccessory.SWITCH_RELAXBREATHE),
    ].filter((accessory): accessory is RequestedAccessory => accessory !== undefined);
  }

  private static buildRequestedLightAccessories(config: SomneoConfig): RequestedAccessory[] {

    // If not configured add all lights
    if (config.lights === undefined) {
      return SomneoClock.ALL_LIGHT_ACCESSORIES;
    }

    return [
      this.buildRequestedAccessory(config.lights.mainLight, RequestedAccessory.LIGHT_MAIN),
      this.buildRequestedAccessory(config.lights.nightLight, RequestedAccessory.LIGHT_NIGHT_LIGHT),
    ].filter((accessory): accessory is RequestedAccessory => accessory !== undefined);
  }

  private static buildRequestedSensorAccessories(config: SomneoConfig): RequestedAccessory[] {

    // If not configured, add all the sensors
    if (config.sensors === undefined) {
      return SomneoClock.ALL_SENSOR_ACCESSORIES;
    }

    return [
      this.buildRequestedAccessory(config.sensors.humidity, RequestedAccessory.SENSOR_HUMIDITY),
      this.buildRequestedAccessory(config.sensors.lux, RequestedAccessory.SENSOR_LUX),
      this.buildRequestedAccessory(config.sensors.temperature, RequestedAccessory.SENSOR_TEMPERATURE),
    ].filter((accessory): accessory is RequestedAccessory => accessory !== undefined);
  }

  // Every sensor/light/switch config section shares the same "isEnabled?" shape and
  // the same enable/disable rule, so this one helper replaces what used to be seven
  // near-identical buildRequestedXAccessory methods.
  private static buildRequestedAccessory(
    accessoryConfig: { isEnabled?: boolean } | undefined,
    accessory: RequestedAccessory,
  ): RequestedAccessory | undefined {

    // If not configured, include it by default
    if (accessoryConfig === undefined) {
      return accessory;
    }

    return this.getBooleanValue(accessoryConfig.isEnabled) ? accessory : undefined;
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
