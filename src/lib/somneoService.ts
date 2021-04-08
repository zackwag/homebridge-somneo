import { AxiosInstance } from 'axios';
import { Logger } from 'homebridge';
import { retryAsync } from 'ts-retry';
import { SunsetProgramPreferences } from './somneoClock';
import { SomneoConstants } from './somneoConstants';
import { Light, LightSettings, NightLight, PlaySettings, RelaxBreathe, SensorReadings, Sunset } from './somneoServiceDataTypes';

export class SomneoService {

  private readonly httpsClient: AxiosInstance;

  constructor(
    public Host: string,
    private log: Logger,
  ) {
    this.httpsClient = SomneoConstants.createHttpsClient(this.Host);
  }

  async getSensorReadings(): Promise<SensorReadings> {

    const sensorReadings: SensorReadings = await retryAsync(() => this.httpsClient
      .get(SomneoConstants.URI_SENSORS_ENDPOINT)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);

    // eslint-disable-next-line max-len
    this.log.debug(`Sensor Readings: host=${this.Host} temperature=${sensorReadings.mstmp} humidity=${sensorReadings.msrhu} light=${sensorReadings.mslux}`);

    return sensorReadings;
  }

  async getSunset(): Promise<Sunset> {

    const sunset: Sunset = await retryAsync(() => this.httpsClient
      .get(SomneoConstants.URI_SUNSET_ENDPOINT)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);

    this.log.debug(`Sunset: host=${this.Host} on=${sunset.onoff}`);

    return sunset;
  }

  async turnOnSunsetProgram(sunsetPrefs: SunsetProgramPreferences): Promise<void> {

    const silent = sunsetPrefs.AmbientSounds === SomneoConstants.SUNSET_PROGRAM_SOUND_NONE;

    let body: Sunset = {
      onoff: true,
      durat: sunsetPrefs.Duration,
      curve: sunsetPrefs.LightIntensity,
      ctype: sunsetPrefs.ColorScheme,
      sndch: sunsetPrefs.AmbientSounds,
      snddv: SomneoConstants.SOUND_SOURCE_SUNSET_PROGRAM,
      sndlv: sunsetPrefs.Volume,
    };

    if (silent) {
      body = {
        onoff: true,
        durat: sunsetPrefs.Duration,
        curve: sunsetPrefs.LightIntensity,
        ctype: sunsetPrefs.ColorScheme,
        snddv: SomneoConstants.SOUND_SOURCE_OFF,
      };
    }

    // eslint-disable-next-line max-len
    this.log.debug(`Sunset: host=${this.Host} on=true durat=${body.durat} curve=${body.curve} ctype=${body.ctype} sndch=${body.sndch} snddv=${body.snddv} sndlv=${body.sndlv}`);

    await retryAsync(() => this.httpsClient
      .put(SomneoConstants.URI_SUNSET_ENDPOINT, body)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);
  }

  async turnOffSunsetProgram(): Promise<void> {
    const body: Sunset = { onoff: false };

    await retryAsync(() => this.httpsClient
      .put(SomneoConstants.URI_SUNSET_ENDPOINT, body)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);
  }

  async getRelaxBreathe(): Promise<RelaxBreathe> {

    const relaxBreathe: RelaxBreathe = await retryAsync(() => this.httpsClient
      .get(SomneoConstants.URI_RELAX_BREATHE)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);

    this.log.debug(`RelaxBreathe: host=${this.Host} on=${relaxBreathe.onoff}`);

    return relaxBreathe;
  }

  async modifyRelaxBreatheState(isOn: boolean): Promise<void> {

    const body: RelaxBreathe = { onoff: isOn };

    await retryAsync(() => this.httpsClient
      .put(SomneoConstants.URI_RELAX_BREATHE, body)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);
  }

  async getLightSettings(): Promise<LightSettings> {

    const lightSettings: LightSettings = await retryAsync(() => this.httpsClient
      .get(SomneoConstants.URI_LIGHTS_ENDPOINT)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);

    // eslint-disable-next-line max-len
    this.log.debug(`Light Settings: host=${this.Host} lightLevel=${lightSettings.ltlvl} lightOn=${lightSettings.onoff} nightLightOn=${lightSettings.ngtlt}`);

    return lightSettings;
  }

  async modifyNightLightState(isOn: boolean): Promise<void> {

    const body: NightLight = { ngtlt: isOn };

    await retryAsync(() => this.httpsClient
      .put(SomneoConstants.URI_LIGHTS_ENDPOINT, body)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);
  }

  async modifyMainLightState(isOn: boolean): Promise<void> {

    const body: Light = isOn ? { onoff: isOn, tempy: false } : { onoff: false };

    await retryAsync(() => this.httpsClient
      .put(SomneoConstants.URI_LIGHTS_ENDPOINT, body)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);
  }

  async modifyMainLightBrightness(brightness: number): Promise<void> {

    const body: Light = { ltlvl: SomneoConstants.convertPercentageToPhilipsPercentage(brightness) };

    await retryAsync(() => this.httpsClient
      .put(SomneoConstants.URI_LIGHTS_ENDPOINT, body)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);
  }

  async getPlaySettings(): Promise<PlaySettings> {

    const playSettings: PlaySettings = await retryAsync(() => this.httpsClient
      .get(SomneoConstants.URI_PLAYING_ENDPOINT)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);

    // eslint-disable-next-line max-len
    this.log.debug(`Play Settings: host=${this.Host} on=${playSettings.onoff} volume=${playSettings.sdvol} source=${playSettings.snddv} channel=${playSettings.sndch}`);

    return playSettings;
  }

  async modifyPlaySettingsState(isOn: boolean, source?: string, channel?: string) {

    let body: PlaySettings = { onoff: false };

    if (isOn) {
      if (source === SomneoConstants.SOUND_SOURCE_AUX) {
        body = { onoff: true, snddv: SomneoConstants.SOUND_SOURCE_AUX };
      } else {
        body = { onoff: true, snddv: SomneoConstants.SOUND_SOURCE_FM_RADIO, sndch: channel };
      }
    }

    await retryAsync(() => this.httpsClient
      .put(SomneoConstants.URI_PLAYING_ENDPOINT, body)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);
  }

  async modifyPlaySettingsInput(input: number) {

    let body: PlaySettings;

    if (input === SomneoConstants.INPUT_AUX_NUM) {
      body = { snddv: SomneoConstants.SOUND_SOURCE_AUX };
    } else {
      body = { snddv: SomneoConstants.SOUND_SOURCE_FM_RADIO, sndch: String(input) };
    }

    await retryAsync(() => this.httpsClient
      .put(SomneoConstants.URI_PLAYING_ENDPOINT, body)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);
  }

  async modifyPlaySettingsVolume(volume: number) {

    const body: PlaySettings = { sdvol: volume };

    await retryAsync(() => this.httpsClient
      .put(SomneoConstants.URI_PLAYING_ENDPOINT, body)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);
  }
}
