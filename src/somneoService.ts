import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { retryAsync } from 'ts-retry';
import { SomneoPlatform } from './platform';
import { Light, LightSettings, NightLight, SensorReadings, SunsetProgram } from './types';

export class SomneoService {

  private static readonly DEFAULT_RETRY_OPTIONS = { delay: 100, maxTry: 5 };

  private readonly baseUri = `https://${this.platform.UserSettings.Host}/di/v1/products/1`;
  private readonly http: AxiosInstance;
  private readonly lightsUri = `${this.baseUri}/wulgt`;
  private readonly sensorsUri = `${this.baseUri}/wusrd`;
  private readonly sunsetProgramUri = `${this.baseUri}/wudsk`;

  constructor(
    private platform: SomneoPlatform,
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

    this.platform.log.debug(
      `Sensor Readings: temperature=${sensorReadings.mstmp} humidity=${sensorReadings.msrhu} light=${sensorReadings.mslux}`);

    return sensorReadings;
  }

  async getSunsetProgram(): Promise<SunsetProgram> {

    const sunsetProgram: SunsetProgram = await retryAsync(() => this.http
      .get(this.sunsetProgramUri)
      .then(res => res.data), SomneoService.DEFAULT_RETRY_OPTIONS);

    this.platform.log.debug(`Sunset Program: on=${sunsetProgram.onoff}`);

    return sunsetProgram;
  }

  async modifySunsetProgram(isOn: boolean): Promise<void> {

    const body: SunsetProgram = { onoff: isOn };

    await retryAsync(() => this.http
      .put(this.sunsetProgramUri, body)
      .then(res => res.data));
  }

  async getLightSettings(): Promise<LightSettings> {

    const lightSettings: LightSettings = await retryAsync(() => this.http
      .get(this.lightsUri)
      .then(res => res.data), SomneoService.DEFAULT_RETRY_OPTIONS);

    this.platform.log.debug(
      `Light Settings: lightLevel=${lightSettings.ltlvl} lightOn=${lightSettings.onoff} nightLightOn=${lightSettings.ngtlt}`);

    return lightSettings;
  }

  async modifyNightLight(isOn: boolean): Promise<void> {

    const body: NightLight = { ngtlt: isOn };

    await retryAsync(() => this.http
      .put(this.lightsUri, body)
      .then(res => res.data));
  }

  async modifyLightState(isOn: boolean): Promise<void> {

    const body: Light = isOn ? { onoff: true, tempy: false } : { onoff: false };

    await retryAsync(() => this.http
      .put(this.lightsUri, body)
      .then(res => res.data));
  }

  async modifyLightBrightness(brightness: number): Promise<void> {

    // Scale to Somneo range 0 to 25
    const body: Light = { ltlvl: Math.floor((brightness / 4) + 0.5) };

    await retryAsync(() =>this.http
      .put(this.lightsUri, body)
      .then(res => res.data));
  }
}
