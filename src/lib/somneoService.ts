import { AxiosInstance } from 'axios';
import type { Logger } from 'homebridge' with { 'resolution-mode': 'import' };
import { retryAsync } from 'ts-retry';
import { RelaxeBreatheProgramPreferences, SunsetProgramPreferences } from './somneoClock';
import { SomneoConstants } from './somneoConstants';
// eslint-disable-next-line max-len
import { AudioDeviceSettings, LightSettings, RelaxBreatheProgramSettings, SensorReadings, SunsetProgramSettings, WakeAlarmControl, WakeAlarmSettings } from './somneoServiceDataTypes';

export class SomneoService {

  private readonly httpsClient: AxiosInstance;

  constructor(
    public Host: string,
    private log: Logger,
  ) {
    this.httpsClient = SomneoConstants.createHttpsClient(this.Host);
  }

  async getPlaySettings(): Promise<AudioDeviceSettings> {
    return this.getData<AudioDeviceSettings>(SomneoConstants.URI_AUDIO_ENDPOINT, SomneoConstants.TYPE_AUDIO_DEVICE_SETTINGS);
  }

  async getLightSettings(): Promise<LightSettings> {
    return this.getData<LightSettings>(SomneoConstants.URI_LIGHTS_ENDPOINT, SomneoConstants.TYPE_LIGHT_SETTINGS);
  }

  async getRelaxBreatheProgramSettings(): Promise<RelaxBreatheProgramSettings> {

    return this.getData<RelaxBreatheProgramSettings>(SomneoConstants.URI_RELAX_BREATHE,
      SomneoConstants.TYPE_RELAX_BREATHE_PROGRAM_SETTINGS);
  }

  async getSensorReadings(): Promise<SensorReadings> {
    return this.getData<SensorReadings>(SomneoConstants.URI_SENSORS_ENDPOINT, SomneoConstants.TYPE_SENSOR_READINGS);
  }

  async getSunsetProgram(): Promise<SunsetProgramSettings> {
    return this.getData<SunsetProgramSettings>(SomneoConstants.URI_SUNSET_ENDPOINT, SomneoConstants.TYPE_SUNSET_PROGRAM_SETTINGS);
  }

  async getWakeAlarmSettings(): Promise<WakeAlarmSettings> {
    return this.getData<WakeAlarmSettings>(SomneoConstants.URI_WAKE_ALARM_ENDPOINT, SomneoConstants.TYPE_WAKE_ALARM_SETTINGS);
  }

  async turnOffAudioDevice(): Promise<void> {

    const data: AudioDeviceSettings = { onoff: false };
    return this.putData<AudioDeviceSettings>(SomneoConstants.URI_AUDIO_ENDPOINT, data, SomneoConstants.TYPE_AUDIO_DEVICE_SETTINGS);
  }

  async turnOnAudioDevice(source: string, channel: string): Promise<void> {

    const data: AudioDeviceSettings = (source === SomneoConstants.SOUND_SOURCE_AUX) ? {
      onoff: true,
      snddv: SomneoConstants.SOUND_SOURCE_AUX,
    } : {
      onoff: true,
      snddv: SomneoConstants.SOUND_SOURCE_FM_RADIO, sndch: channel,
    };

    return this.putData<AudioDeviceSettings>(SomneoConstants.URI_AUDIO_ENDPOINT, data, SomneoConstants.TYPE_AUDIO_DEVICE_SETTINGS);
  }

  async updateAudioDeviceInput(input: number): Promise<void> {

    const data: AudioDeviceSettings = (input === SomneoConstants.INPUT_AUX_NUM) ? {
      snddv: SomneoConstants.SOUND_SOURCE_AUX,
    } : {
      snddv: SomneoConstants.SOUND_SOURCE_FM_RADIO,
      sndch: String(input),
    };

    return this.putData<AudioDeviceSettings>(SomneoConstants.URI_AUDIO_ENDPOINT, data, SomneoConstants.TYPE_AUDIO_DEVICE_SETTINGS);
  }

  async updateAudioDeviceVolume (volume: number): Promise<void> {

    const data: AudioDeviceSettings = { sdvol: volume };
    return this.putData<AudioDeviceSettings>(SomneoConstants.URI_AUDIO_ENDPOINT, data, SomneoConstants.TYPE_AUDIO_DEVICE_SETTINGS);
  }

  async turnOffMainLight(): Promise<void> {

    const data: LightSettings = { onoff: false, tempy: false };
    return this.putData<LightSettings>(SomneoConstants.URI_LIGHTS_ENDPOINT, data, SomneoConstants.TYPE_LIGHT_SETTINGS);
  }

  async turnOnMainLight(): Promise<void> {

    const data: LightSettings = { onoff: true, tempy: false };
    return this.putData<LightSettings>(SomneoConstants.URI_LIGHTS_ENDPOINT, data, SomneoConstants.TYPE_LIGHT_SETTINGS);
  }

  async updateMainLightBrightness(brightness: number): Promise<void> {

    const data: LightSettings = { ltlvl: SomneoConstants.convertPercentageToPhilipsPercentage(brightness) };
    return this.putData<LightSettings>(SomneoConstants.URI_LIGHTS_ENDPOINT, data, SomneoConstants.TYPE_LIGHT_SETTINGS);
  }

  async turnOffNightLight(): Promise<void> {

    const body: LightSettings = { ngtlt: false };
    return this.putData<LightSettings>(SomneoConstants.URI_LIGHTS_ENDPOINT, body, SomneoConstants.TYPE_LIGHT_SETTINGS);
  }

  async turnOnNightLight(): Promise<void> {

    const body: LightSettings = { ngtlt: true };
    return this.putData<LightSettings>(SomneoConstants.URI_LIGHTS_ENDPOINT, body, SomneoConstants.TYPE_LIGHT_SETTINGS);
  }

  async turnOffRelaxBreatheProgram(): Promise<void> {

    const data: RelaxBreatheProgramSettings = { onoff: false };
    return this.putData<RelaxBreatheProgramSettings>(SomneoConstants.URI_RELAX_BREATHE, data, SomneoConstants.TYPE_RELAX_BREATHE_PROGRAM_SETTINGS);
  }

  async turnOnRelaxBreatheProgram(relaxBreathePrefs: RelaxeBreatheProgramPreferences): Promise<void> {

    const data: RelaxBreatheProgramSettings = (relaxBreathePrefs.GuidanceType === SomneoConstants.RELAX_BREATHE_GUIDANCE_TYPE_LIGHT) ? {
      onoff: true,
      progr: relaxBreathePrefs.BreathsPerMin,
      durat: relaxBreathePrefs.Duration,
      rtype: relaxBreathePrefs.GuidanceType,
      intny: relaxBreathePrefs.LightIntensity,
    } : {
      onoff: true,
      progr: relaxBreathePrefs.BreathsPerMin,
      durat: relaxBreathePrefs.Duration,
      rtype: relaxBreathePrefs.GuidanceType,
      sndlv: relaxBreathePrefs.Volume,
    };

    return this.putData(SomneoConstants.URI_RELAX_BREATHE, data, SomneoConstants.TYPE_RELAX_BREATHE_PROGRAM_SETTINGS);
  }

  async turnOffSunsetProgram(): Promise<void> {

    const data: SunsetProgramSettings = { onoff: false };
    return this.putData(SomneoConstants.URI_SUNSET_ENDPOINT, data, SomneoConstants.TYPE_SUNSET_PROGRAM_SETTINGS);
  }

  async turnOnSunsetProgram(sunsetPrefs: SunsetProgramPreferences): Promise<void> {

    const data: SunsetProgramSettings = (sunsetPrefs.AmbientSounds === SomneoConstants.SUNSET_PROGRAM_SOUND_NONE) ? {
      onoff: true,
      durat: sunsetPrefs.Duration,
      curve: sunsetPrefs.LightIntensity,
      ctype: sunsetPrefs.ColorScheme,
      snddv: SomneoConstants.SOUND_SOURCE_OFF,
    } : {
      onoff: true,
      durat: sunsetPrefs.Duration,
      curve: sunsetPrefs.LightIntensity,
      ctype: sunsetPrefs.ColorScheme,
      sndch: sunsetPrefs.AmbientSounds,
      snddv: SomneoConstants.SOUND_SOURCE_SUNSET_PROGRAM,
      sndlv: sunsetPrefs.Volume,
    };

    return this.putData(SomneoConstants.URI_SUNSET_ENDPOINT, data, SomneoConstants.TYPE_SUNSET_PROGRAM_SETTINGS);
  }

  async updateWakeAlarmEnabled(profileNumber: number, isEnabled: boolean): Promise<void> {

    const data: WakeAlarmSettings = { prfnr: profileNumber, prfen: isEnabled, prfvs: true };
    return this.putData<WakeAlarmSettings>(SomneoConstants.URI_WAKE_ALARM_ENDPOINT, data, SomneoConstants.TYPE_WAKE_ALARM_SETTINGS);
  }

  async snoozeWakeAlarm(): Promise<void> {

    const data: WakeAlarmControl = { tapsz: true };
    return this.putData<WakeAlarmControl>(SomneoConstants.URI_WAKE_ALARM_CONTROL_ENDPOINT, data, SomneoConstants.TYPE_WAKE_ALARM_CONTROL);
  }

  async dismissWakeAlarm(): Promise<void> {

    const data: WakeAlarmControl = { disms: true };
    return this.putData<WakeAlarmControl>(SomneoConstants.URI_WAKE_ALARM_CONTROL_ENDPOINT, data, SomneoConstants.TYPE_WAKE_ALARM_CONTROL);
  }

  private async getData<T>(uri: string, type: string): Promise<T> {

    return retryAsync(() => this.httpsClient
      .get(uri)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS)
      .then(data => {
        if (data !== undefined) {
          this.log.debug(`HTTP Get -> type=${type} host=${this.Host} data=${JSON.stringify(data)}`);
        }
        return data;
      });
  }

  private async putData<T>(uri: string, data: T, type: string) {

    if (data === undefined) {
      // This should never happen, but including to stop the app from breaking
      return;
    }

    this.log.debug(`HTTP Put -> type=${type} host=${this.Host} data=${JSON.stringify(data)}`);

    await retryAsync(() => this.httpsClient
      .put(uri, data)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);
  }
}

