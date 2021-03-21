import { AccessoryPlugin, API, Characteristic, Logger, PlatformConfig, Service, StaticPlatformPlugin } from 'homebridge';
import { SomneoLightAccessory } from './somneoLightAccessory';
import { SomneoNightLightAccessory } from './somneoNightLightAccessory';
import { SomneoSensorAccessory } from './somneoSensorAccessory';
import { SomneoService } from './somneoService';
import { SomneoSunsetProgramSwitchAccessory } from './somneoSunsetProgramSwitchAccessory';
import { SomneoAccessory } from './types';
import { RequestedAccessory, UserSettings } from './userSettings';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class SomneoPlatform implements StaticPlatformPlugin {

  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public Sensors: SomneoSensorAccessory | undefined;
  public Lights: SomneoLightAccessory | undefined;
  public NightLight: SomneoNightLightAccessory | undefined;
  public readonly SomneoService : SomneoService;
  public SunsetProgramSwitch: SomneoSunsetProgramSwitchAccessory | undefined;
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

    this.log.debug('Finished initializing platform:', this.config.name);
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
      this.Lights = new SomneoLightAccessory(this);
      this.log.debug(`Including accessory=${this.Lights.name}`);
      this.SomneoAccessories.push(this.Lights);
    }

    if (this.UserSettings.RequestedAccessories.includes(RequestedAccessory.LIGHT_NIGHT_LIGHT)) {
      this.NightLight = new SomneoNightLightAccessory(this);
      this.log.debug(`Including accessory=${this.NightLight.name}`);
      this.SomneoAccessories.push(this.NightLight);
    }

    if (this.UserSettings.RequestedAccessories.includes(RequestedAccessory.SWITCH_SUNSET_PROGRAM)) {
      this.SunsetProgramSwitch = new SomneoSunsetProgramSwitchAccessory(this);
      this.log.debug(`Including accessory=${this.SunsetProgramSwitch.name}`);
      this.SomneoAccessories.push(this.SunsetProgramSwitch);
    }

    this.log.debug(`Starting poll, pollingInterval=${this.UserSettings.PollingMilliSeconds}ms`);

    setInterval(() => {
      this.SomneoAccessories.forEach(somneoAccessory => {
        this.log.debug(`Updating accessory=${somneoAccessory.name} values.`);
        somneoAccessory.updateValues();
      });
    }, this.UserSettings.PollingMilliSeconds);
  }
}
