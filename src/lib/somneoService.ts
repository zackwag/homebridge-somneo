import axios, { AxiosInstance } from 'axios';
import { Logger } from 'homebridge';
import https from 'https';
import { retryAsync } from 'ts-retry';
import { SunsetProgramPreferences } from './somneoClock';
import { SomneoConstants } from './somneoConstants';
import { Light, LightSettings, NightLight, PlaySettings, RelaxBreathe, SensorReadings, Sunset } from './somneoServiceDataTypes';

export class SomneoService {

  private static readonly DEFAULT_RETRY_OPTIONS = { delay: 100, maxTry: 5 };

  private readonly baseUri = `https://${this.Host}/di/v1/products/1`;
  private readonly http: AxiosInstance;
  private readonly lightsUri = `${this.baseUri}/wulgt`;
  private readonly playingUri = `${this.baseUri}/wuply`;
  private readonly relaxBreatheUri = `${this.baseUri}/wurlx`;
  private readonly sensorsUri = `${this.baseUri}/wusrd`;
  private readonly sunsetUri = `${this.baseUri}/wudsk`;

  constructor(
    public Host: string,
    private log: Logger,
  ) {
    this.http = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  async getSensorReadings(): Promise<SensorReadings> {

    const sensorReadings: SensorReadings = await retryAsync(() => this.http
      .get(this.sensorsUri)
      .then(res => res.data), SomneoService.DEFAULT_RETRY_OPTIONS);

    // eslint-disable-next-line max-len
    this.log.debug(`Sensor Readings: host=${this.Host} temperature=${sensorReadings.mstmp} humidity=${sensorReadings.msrhu} light=${sensorReadings.mslux}`);

    return sensorReadings;
  }

  async getSunset(): Promise<Sunset> {

    const sunset: Sunset = await retryAsync(() => this.http
      .get(this.sunsetUri)
      .then(res => res.data), SomneoService.DEFAULT_RETRY_OPTIONS);

    this.log.debug(`Sunset: host=${this.Host} on=${sunset.onoff}`);

    return sunset;
  }

  async turnOnSunsetProgram(sunsetPrefs: SunsetProgramPreferences): Promise<void> {

    const silent = sunsetPrefs.AmbientSounds === SomneoConstants.SUNSET_PROGRAM_SOUND_NONE;

    const body: Sunset = {
      onoff: true,
      durat: sunsetPrefs.Duration,
      curve: sunsetPrefs.LightIntensity,
      ctype: sunsetPrefs.ColorScheme,
      sndch: silent ? undefined : sunsetPrefs.AmbientSounds,
      snddv: silent ? SomneoConstants.SOUND_SOURCE_OFF : SomneoConstants.SOUND_SOURCE_SUNSET_PROGRAM,
      sndlv: silent ? undefined : sunsetPrefs.Volume,
    };

    // eslint-disable-next-line max-len
    this.log.debug(`Sunset: host=${this.Host} on=true durat=${body.durat} curve=${body.curve} ctype=${body.ctype} sndch=${body.sndch} snddv=${body.snddv} sndlv=${body.sndlv}`);

    await retryAsync(() => this.http
      .put(this.sunsetUri, body)
      .then(res => res.data));
  }

  async turnOffSunsetProgram(): Promise<void> {
    const body: Sunset = { onoff: false };

    await retryAsync(() => this.http
      .put(this.sunsetUri, body)
      .then(res => res.data));
  }

  async getRelaxBreathe(): Promise<RelaxBreathe> {

    const relaxBreathe: RelaxBreathe = await retryAsync(() => this.http
      .get(this.relaxBreatheUri)
      .then(res => res.data), SomneoService.DEFAULT_RETRY_OPTIONS);

    this.log.debug(`RelaxBreathe: host=${this.Host} on=${relaxBreathe.onoff}`);

    return relaxBreathe;
  }

  async modifyRelaxBreatheState(isOn: boolean): Promise<void> {

    const body: RelaxBreathe = { onoff: isOn };

    await retryAsync(() => this.http
      .put(this.relaxBreatheUri, body)
      .then(res => res.data));
  }

  async getLightSettings(): Promise<LightSettings> {

    const lightSettings: LightSettings = await retryAsync(() => this.http
      .get(this.lightsUri)
      .then(res => res.data), SomneoService.DEFAULT_RETRY_OPTIONS);

    // eslint-disable-next-line max-len
    this.log.debug(`Light Settings: host=${this.Host} lightLevel=${lightSettings.ltlvl} lightOn=${lightSettings.onoff} nightLightOn=${lightSettings.ngtlt}`);

    return lightSettings;
  }

  async modifyNightLightState(isOn: boolean): Promise<void> {

    const body: NightLight = { ngtlt: isOn };

    await retryAsync(() => this.http
      .put(this.lightsUri, body)
      .then(res => res.data));
  }

  async modifyMainLightState(isOn: boolean): Promise<void> {

    const body: Light = isOn ? { onoff: isOn, tempy: false } : { onoff: false };

    await retryAsync(() => this.http
      .put(this.lightsUri, body)
      .then(res => res.data));
  }

  async modifyMainLightBrightness(brightness: number): Promise<void> {

    const body: Light = { ltlvl: SomneoConstants.convertPercentageToPhilipsPercentage(brightness) };

    await retryAsync(() => this.http
      .put(this.lightsUri, body)
      .then(res => res.data));
  }

  async getPlaySettings(): Promise<PlaySettings> {

    const playSettings: PlaySettings = await retryAsync(() => this.http
      .get(this.playingUri)
      .then(res => res.data), SomneoService.DEFAULT_RETRY_OPTIONS);

    // eslint-disable-next-line max-len
    this.log.debug(`Play Settings: host=${this.Host} on=${playSettings.onoff} volume=${playSettings.sdvol} source=${playSettings.snddv} channel=${playSettings.sndch}`);

    return playSettings;
  }

  async modifyPlaySettingsState(isOn: boolean, source?: string, channel?: string) {

    let body: PlaySettings;

    if (isOn) {
      if (source === SomneoConstants.SOUND_SOURCE_AUX) {
        body = { onoff: true, snddv: SomneoConstants.SOUND_SOURCE_AUX };
      } else {
        body = { onoff: true, snddv: SomneoConstants.SOUND_SOURCE_FM_RADIO, sndch: channel };
      }
    } else {
      body = { onoff: false };
    }

    await retryAsync(() => this.http
      .put(this.playingUri, body)
      .then(res => res.data));
  }

  async modifyPlaySettingsInput(input: number) {

    let body: PlaySettings;

    if (input === SomneoConstants.INPUT_AUX_NUM) {
      body = { snddv: SomneoConstants.SOUND_SOURCE_AUX };
    } else {
      body = { snddv: SomneoConstants.SOUND_SOURCE_FM_RADIO, sndch: String(input) };
    }

    await retryAsync(() => this.http
      .put(this.playingUri, body)
      .then(res => res.data));
  }

  async modifyPlaySettingsVolume(volume: number) {

    const body: PlaySettings = { sdvol: volume };

    await retryAsync(() => this.http
      .put(this.playingUri, body)
      .then(res => res.data));
  }
}
