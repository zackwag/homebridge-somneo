import { AccessoryPlugin, API, Characteristic, Logger, PlatformConfig, Service, StaticPlatformPlugin } from 'homebridge';
import { RequestedAccessory } from './lib/requestedAccessory';
import { SomneoAccessory } from './lib/somneoAccessory';
import { SomneoAudioAccessory } from './lib/somneoAudioAccessory';
import { SomneoMainLightAccessory } from './lib/somneoMainLightAccessory';
import { SomneoNightLightAccessory } from './lib/somneoNightLightAccessory';
import { SomneoRelaxBreatheSwitchAccessory } from './lib/somneoRelaxBreatheSwitchAccessory';
import { SomneoSensorAccessory } from './lib/somneoSensorAccessory';
import { SomneoService } from './lib/somneoService';
import { SomneoSunsetSwitchAccessory } from './lib/somneoSunsetSwitchAccessory';
import { UserSettings } from './lib/userSettings';
import { PLUGIN_NAME } from './settings';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class SomneoPlatform implements StaticPlatformPlugin {

  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public Audio: SomneoAudioAccessory | undefined;
  public Sensors: SomneoSensorAccessory | undefined;
  public MainLight: SomneoMainLightAccessory | undefined;
  public NightLight: SomneoNightLightAccessory | undefined;
  public RelaxBreathe: SomneoRelaxBreatheSwitchAccessory | undefined;
  public readonly SomneoService : SomneoService;
  public SunsetSwitch: SomneoSunsetSwitchAccessory | undefined;
  public readonly UserSettings: UserSettings;

  private SomneoAccessories : SomneoAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.UserSettings = new UserSettings(this);
    this.SomneoService = new SomneoService(this);

    this.buildAccessories();

    this.log.debug(`Platform ${this.config.name} -> Initialized`);
  }

  async accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): Promise<void> {
    callback(this.SomneoAccessories);
  }

  private buildAccessories() {

    if (this.UserSettings.RequestedAccessories.includes(RequestedAccessory.SENSOR_HUMIDITY) ||
        this.UserSettings.RequestedAccessories.includes(RequestedAccessory.SENSOR_LUX) ||
        this.UserSettings.RequestedAccessories.includes(RequestedAccessory.SENSOR_TEMPERATURE)) {
      this.Sensors = new SomneoSensorAccessory(this);
      this.log.debug(`Including accessory=${this.Sensors.name}`);
      this.SomneoAccessories.push(this.Sensors);
    }

    if (this.UserSettings.RequestedAccessories.includes(RequestedAccessory.LIGHT_MAIN)) {
      this.MainLight = new SomneoMainLightAccessory(this);
      this.log.debug(`Including accessory=${this.MainLight.name}`);
      this.SomneoAccessories.push(this.MainLight);
    }

    if (this.UserSettings.RequestedAccessories.includes(RequestedAccessory.LIGHT_NIGHT_LIGHT)) {
      this.NightLight = new SomneoNightLightAccessory(this);
      this.log.debug(`Including accessory=${this.NightLight.name}`);
      this.SomneoAccessories.push(this.NightLight);
    }

    if (this.UserSettings.RequestedAccessories.includes(RequestedAccessory.SWITCH_RELAXBREATHE)) {
      this.RelaxBreathe = new SomneoRelaxBreatheSwitchAccessory(this);
      this.log.debug(`Including accessory=${this.RelaxBreathe.name}`);
      this.SomneoAccessories.push(this.RelaxBreathe);
    }

    if (this.UserSettings.RequestedAccessories.includes(RequestedAccessory.SWITCH_SUNSET)) {
      this.SunsetSwitch = new SomneoSunsetSwitchAccessory(this);
      this.log.debug(`Including accessory=${this.SunsetSwitch.name}`);
      this.SomneoAccessories.push(this.SunsetSwitch);
    }

    if (this.UserSettings.RequestedAccessories.includes(RequestedAccessory.AUDIO)) {
      const uuid = this.api.hap.uuid.generate(`homebridge:${PLUGIN_NAME}${SomneoAudioAccessory.NAME}`);
      this.Audio = new SomneoAudioAccessory(this, uuid);
      this.api.publishExternalAccessories(PLUGIN_NAME, [this.Audio]);
    }

    this.log.debug(`Starting poll, pollingInterval=${this.UserSettings.PollingMilliSeconds}ms`);

    setInterval(() => {
      this.SomneoAccessories.forEach(somneoAccessory => {
        this.log.debug(`Updating accessory=${somneoAccessory.name} values.`);
        somneoAccessory.updateValues();
      });

      if (this.Audio !== undefined) {
        this.Audio.updateValues();
      }
    }, this.UserSettings.PollingMilliSeconds);
  }
}
