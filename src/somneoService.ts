import axios, { AxiosInstance } from 'axios';
import { Logger } from 'homebridge';
import https from 'https';
import { retryAsync } from 'ts-retry';
import { SomneoConstants } from './somneoConstants';
import { Light, LightSettings, NightLight, SensorReadings, SunsetProgram, UserSettings } from './types';

export class SomneoService {

  private readonly http: AxiosInstance;
  private readonly host: string;
  private readonly lightsUri: string;
  private readonly sensorsUri: string;
  private readonly sunsetProgramUri: string;

  constructor(
    private readonly log: Logger,
    private readonly userSettings: UserSettings,
  ) {
    this.host = this.userSettings.Host;
    this.lightsUri = `https://${this.host}/di/v1/products/1/wulgt`;
    this.sensorsUri = `https://${this.host}/di/v1/products/1/wusrd`;
    this.sunsetProgramUri = `https://${this.host}/di/v1/products/1/wudsk`;

    this.http = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  async getSensorReadings(): Promise<SensorReadings> {

    const sensorReadings: SensorReadings = await retryAsync(() => this.http
      .get(this.sensorsUri)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);

    this.log.debug(`Sensor Readings: temperature=${sensorReadings.mstmp} humidity=${sensorReadings.msrhu} light=${sensorReadings.mslux}`);

    return sensorReadings;
  }

  async getSunsetProgram(): Promise<SunsetProgram> {

    const sunsetProgram: SunsetProgram = await retryAsync(() => this.http
      .get(this.sunsetProgramUri)
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);

    this.log.debug(`Sunset Program: on=${sunsetProgram.onoff}`);

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
      .then(res => res.data), SomneoConstants.DEFAULT_RETRY_OPTIONS);

    this.log.debug(`Light Settings: lightLevel=${lightSettings.ltlvl} lightOn=${lightSettings.onoff} nightLightOn=${lightSettings.ngtlt}`);

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
