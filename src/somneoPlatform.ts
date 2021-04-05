import { AccessoryPlugin, API, Characteristic, Logger, PlatformConfig, Service, StaticPlatformPlugin } from 'homebridge';
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
    this.UserSettings = new UserSettings(this);

    if (this.UserSettings.SomneoClocks.length === 0) {
      this.log.error('No Somneo clocks specified. Platform is not loading.');
      return;
    }

    this.buildAccessories();

    this.log.debug(`Platform ${this.UserSettings.PluginName} -> Initialized`);
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

        this.log.debug(`Including accessory=${sensorAccessory.name}`);

        this.SomneoAccessories.push(sensorAccessory);
        this.HostSensorMap.set(somneoClock.SomneoService.Host, sensorAccessory);
      }

      if (somneoClock.RequestedAccessories.includes(RequestedAccessory.LIGHT_MAIN)) {
        const mainLight = new SomneoMainLightAccessory(this, somneoClock);

        this.log.debug(`Including accessory=${mainLight.name}`);

        this.SomneoAccessories.push(mainLight);
        this.HostMainLightMap.set(somneoClock.SomneoService.Host, mainLight);
      }

      if (somneoClock.RequestedAccessories.includes(RequestedAccessory.LIGHT_NIGHT_LIGHT)) {
        const nightLight = new SomneoNightLightAccessory(this, somneoClock);

        this.log.debug(`Including accessory=${nightLight.name}`);

        this.HostNightLightMap.set(somneoClock.SomneoService.Host, nightLight);
        this.SomneoAccessories.push(nightLight);
      }

      if (somneoClock.RequestedAccessories.includes(RequestedAccessory.SWITCH_RELAXBREATHE)) {
        const relaxBreatheSwitch = new SomneoRelaxBreatheSwitchAccessory(this, somneoClock);

        this.log.debug(`Including accessory=${relaxBreatheSwitch.name}`);

        this.HostRelaxBreatheSwitchMap.set(somneoClock.SomneoService.Host, relaxBreatheSwitch);
        this.SomneoAccessories.push(relaxBreatheSwitch);
      }

      if (somneoClock.RequestedAccessories.includes(RequestedAccessory.SWITCH_SUNSET)) {
        const sunsetSwitch = new SomneoSunsetSwitchAccessory(this, somneoClock);

        this.log.debug(`Including accessory=${sunsetSwitch.name}`);

        this.HostSunsetSwitchMap.set(somneoClock.SomneoService.Host, sunsetSwitch);
        this.SomneoAccessories.push(sunsetSwitch);
      }

      if (somneoClock.RequestedAccessories.includes(RequestedAccessory.AUDIO)) {
        const name = `${somneoClock.Name} ${SomneoConstants.DEVICE_AUDIO}`;
        const uuid = this.api.hap.uuid.generate(`homebridge:${PLUGIN_NAME}${name}${somneoClock.SomneoService.Host}`);
        const audioDevice = new SomneoAudioAccessory(name, uuid, this, somneoClock);

        this.log.debug(`Including accessory=${audioDevice.displayName}`);

        this.HostAudioMap.set(somneoClock.SomneoService.Host, audioDevice);
      }
    }

    // Publish all audio devices as external accessories
    if (this.HostAudioMap.size > 0) {
      this.api.publishExternalAccessories(PLUGIN_NAME, [...this.HostAudioMap.values()]);
    }

    this.log.debug(`Starting poll, pollingInterval=${this.UserSettings.PollingMilliSeconds}ms`);

    setInterval(() => {
      this.SomneoAccessories.forEach(somneoAccessory => {
        somneoAccessory.updateValues()
          .then(() => this.log.debug(`Updated accessory=${somneoAccessory.name} values.`));
      });

      for (const audioDevice of this.HostAudioMap.values()) {
        audioDevice.updateValues()
          .then(() => this.log.debug(`Updated accessory=${audioDevice.displayName} values.`));
      }
    }, this.UserSettings.PollingMilliSeconds);
  }
}
