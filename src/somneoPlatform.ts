import { AccessoryPlugin, API, Categories, Characteristic, Logger, PlatformConfig, Service, StaticPlatformPlugin } from 'homebridge';
import { RequestedAccessory } from './lib/requestedAccessory';
import { SomneoAccessory } from './lib/somneoAccessory';
import { SomneoAudioAccessory } from './lib/somneoAudioAccessory';
import { SomneoConstants } from './lib/somneoConstants';
import { SomneoMainLightAccessory } from './lib/somneoMainLightAccessory';
import { SomneoNightLightAccessory } from './lib/somneoNightLightAccessory';
import { SomneoRelaxBreatheSwitchAccessory } from './lib/somneoRelaxBreatheSwitchAccessory';
import { SomneoSensorAccessory } from './lib/somneoSensorAccessory';
import { SomneoSunsetSwitchAccessory } from './lib/somneoSunsetSwitchAccessory';
import { UserSettings } from './lib/userSettings';
import { PLUGIN_NAME } from './settings';

export class SomneoPlatform implements StaticPlatformPlugin {

  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly HostSensorMap = new Map();
  public readonly HostMainLightMap = new Map();
  public readonly HostNightLightMap = new Map();
  public readonly HostRelaxBreatheSwitchMap = new Map();
  public readonly HostSunsetSwitchMap = new Map();
  public readonly HostAudioMap = new Map();

  private SomneoAccessories : SomneoAccessory[] = [];
  private readonly UserSettings: UserSettings;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.UserSettings = UserSettings.create(this);

    if (this.UserSettings.SomneoClocks.length === 0) {
      this.log.error('Error -> No Somneo clocks specified. Platform is not loading.');
      return;
    }

    this.buildAccessories();

    this.log.debug(`Initialized -> platform=${this.UserSettings.PlatformName}`);
  }

  async accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): Promise<void> {
    callback(this.SomneoAccessories);
  }

  private buildAccessories() {

    for (const somneoClock of this.UserSettings.SomneoClocks) {
      if (somneoClock.RequestedAccessories.includes(RequestedAccessory.SENSOR_HUMIDITY) ||
        somneoClock.RequestedAccessories.includes(RequestedAccessory.SENSOR_LUX) ||
        somneoClock.RequestedAccessories.includes(RequestedAccessory.SENSOR_TEMPERATURE)) {
        const sensorAccessory = new SomneoSensorAccessory(this, somneoClock);

        this.log.debug(`Included -> accessory=${sensorAccessory.name}`);

        this.SomneoAccessories.push(sensorAccessory);
        this.HostSensorMap.set(somneoClock.SomneoService.Host, sensorAccessory);
      }

      if (somneoClock.RequestedAccessories.includes(RequestedAccessory.LIGHT_MAIN)) {
        const mainLight = new SomneoMainLightAccessory(this, somneoClock);

        this.log.debug(`Included -> accessory=${mainLight.name}`);

        this.SomneoAccessories.push(mainLight);
        this.HostMainLightMap.set(somneoClock.SomneoService.Host, mainLight);
      }

      if (somneoClock.RequestedAccessories.includes(RequestedAccessory.LIGHT_NIGHT_LIGHT)) {
        const nightLight = new SomneoNightLightAccessory(this, somneoClock);

        this.log.debug(`Included -> accessory=${nightLight.name}`);

        this.HostNightLightMap.set(somneoClock.SomneoService.Host, nightLight);
        this.SomneoAccessories.push(nightLight);
      }

      if (somneoClock.RequestedAccessories.includes(RequestedAccessory.SWITCH_RELAXBREATHE)) {
        const relaxBreatheSwitch = new SomneoRelaxBreatheSwitchAccessory(this, somneoClock);

        this.log.debug(`Included -> accessory=${relaxBreatheSwitch.name}`);

        this.HostRelaxBreatheSwitchMap.set(somneoClock.SomneoService.Host, relaxBreatheSwitch);
        this.SomneoAccessories.push(relaxBreatheSwitch);
      }

      if (somneoClock.RequestedAccessories.includes(RequestedAccessory.SWITCH_SUNSET)) {
        const sunsetSwitch = new SomneoSunsetSwitchAccessory(this, somneoClock);

        this.log.debug(`Included -> accessory=${sunsetSwitch.name}`);

        this.HostSunsetSwitchMap.set(somneoClock.SomneoService.Host, sunsetSwitch);
        this.SomneoAccessories.push(sunsetSwitch);
      }

      if (somneoClock.RequestedAccessories.includes(RequestedAccessory.AUDIO)) {
        const displayName = `${somneoClock.Name} ${SomneoConstants.DEVICE_AUDIO}`;
        const uuid = this.api.hap.uuid.generate(`homebridge:${PLUGIN_NAME}${displayName}${somneoClock.SomneoService.Host}`);
        const accessory = new this.api.platformAccessory(displayName, uuid, Categories.AUDIO_RECEIVER);
        const audioDevice = new SomneoAudioAccessory(accessory, this, somneoClock);

        this.log.debug(`Included -> accessory=${displayName}`);

        this.HostAudioMap.set(somneoClock.SomneoService.Host, audioDevice);
      }
    }

    // Publish all audio devices as external accessories
    if (this.HostAudioMap.size > 0) {
      this.api.publishExternalAccessories(PLUGIN_NAME, Array.from(this.HostAudioMap.values()).map(audioDevice => audioDevice.Accessory));
    }

    this.log.debug(`Polling -> pollingInterval=${this.UserSettings.PollingMilliSeconds}ms`);

    // Poll for status changes outside of HomeKit
    this.pollAccessories()
      .then(() => {
        setInterval(() => this.pollAccessories(), this.UserSettings.PollingMilliSeconds);
      });
  }

  private async pollAccessories(): Promise<void> {

    await this.SomneoAccessories.reduce(async (previousPromise, nextAccessory) => {
      await previousPromise;
      return nextAccessory.updateValues()
        .then(() => this.log.debug(`Polled -> accessory=${nextAccessory.name}`));
    }, Promise.resolve());
    return [...this.HostAudioMap.values()].reduce(async (previousPromise_1, nextAccessory_1) => {
      await previousPromise_1;
      return nextAccessory_1.updateValues()
        .then(() => this.log.debug(`Polled -> accessory=${nextAccessory_1.Accessory.displayName}`));
    }, Promise.resolve());

  }
}
