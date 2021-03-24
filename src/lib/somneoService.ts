import axios, { AxiosInstance } from 'axios';
import { Logger } from 'homebridge';
import https from 'https';
import { retryAsync } from 'ts-retry';
import { SomneoAudioInput } from './somneoAudioInput';
import { SomneoConstants } from './somneoConstants';
import { Light, LightSettings, NightLight, PlaySettings, RelaxBreathe, SensorReadings, Sunset } from './somneoServiceDataTypes';
import { UserSettings } from './userSettings';

export class SomneoService {

  private static readonly DEFAULT_RETRY_OPTIONS = { delay: 100, maxTry: 5 };

  private readonly baseUri = `https://${this.userSettings.Host}/di/v1/products/1`;
  private readonly http: AxiosInstance;
  private readonly lightsUri = `${this.baseUri}/wulgt`;
  private readonly playingUri = `${this.baseUri}/wuply`;
  private readonly relaxBreatheUri = `${this.baseUri}/wurlx`;
  private readonly sensorsUri = `${this.baseUri}/wusrd`;
  private readonly sunsetUri = `${this.baseUri}/wudsk`;

  constructor(
    private log: Logger,
    private userSettings: UserSettings,
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

    this.log.debug(
      `Sensor Readings: temperature=${sensorReadings.mstmp} humidity=${sensorReadings.msrhu} light=${sensorReadings.mslux}`);

    return sensorReadings;
  }

  async getSunset(): Promise<Sunset> {

    const sunset: Sunset = await retryAsync(() => this.http
      .get(this.sunsetUri)
      .then(res => res.data), SomneoService.DEFAULT_RETRY_OPTIONS);

    this.log.debug(`Sunset: on=${sunset.onoff}`);

    return sunset;
  }

  async modifySunsetState(isOn: boolean): Promise<void> {

    const body: Sunset = { onoff: isOn };

    await retryAsync(() => this.http
      .put(this.sunsetUri, body)
      .then(res => res.data));
  }

  async getRelaxBreathe(): Promise<RelaxBreathe> {

    const relaxBreathe: RelaxBreathe = await retryAsync(() => this.http
      .get(this.relaxBreatheUri)
      .then(res => res.data), SomneoService.DEFAULT_RETRY_OPTIONS);

    this.log.debug(`RelaxBreathe: on=${relaxBreathe.onoff}`);

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

    this.log.debug(
      `Light Settings: lightLevel=${lightSettings.ltlvl} lightOn=${lightSettings.onoff} nightLightOn=${lightSettings.ngtlt}`);

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

    const body: Light = { ltlvl: Math.floor((brightness / 4) + 0.5) };

    await retryAsync(() => this.http
      .put(this.lightsUri, body)
      .then(res => res.data));
  }

  async getPlaySettings(): Promise<PlaySettings> {

    const playSettings: PlaySettings = await retryAsync(() => this.http
      .get(this.playingUri)
      .then(res => res.data), SomneoService.DEFAULT_RETRY_OPTIONS);

    this.log.debug(
      `Play Settings: on=${playSettings.onoff} volume=${playSettings.sdvol} source=${playSettings.snddv} channel=${playSettings.sndch}`);

    return playSettings;
  }

  async modifyPlaySettingsState(isOn: boolean ) {

    // TODO read favorite input from UserSettings
    const body: PlaySettings = isOn ?
      { onoff: true, snddv: SomneoConstants.SOURCE_FM_RADIO, sndch: String(SomneoConstants.DEFAULT_ACTIVE_INPUT) }
      : { onoff: false };

    await retryAsync(() => this.http
      .put(this.playingUri, body)
      .then(res => res.data));
  }

  async modifyPlaySettingsInput(input: number) {

    let body: PlaySettings;

    if (input === SomneoAudioInput[SomneoAudioInput[SomneoAudioInput.AUX]]) {
      body = { snddv: SomneoConstants.SOURCE_AUX };
    } else {
      body = { snddv: SomneoConstants.SOURCE_FM_RADIO, sndch: String(input) };
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
