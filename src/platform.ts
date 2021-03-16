import { AccessoryPlugin, API, Characteristic, Logger, PlatformConfig, Service, StaticPlatformPlugin } from 'homebridge';
import { SomneoLightAccessory } from './somneoLightAccessory';
import { SomneoNightLightAccessory } from './somneoNightLightAccessory';
import { SomneoSensorAccessory } from './somneoSensorAccessory';
import { SomneoService } from './somneoService';
import { SomneoSunsetProgramSwitchAccessory } from './somneoSunsetProgramSwitchAccessory';
import { SomneoAccessory, UserSettings } from './types';

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
    this.UserSettings = new UserSettings(this.config);
    this.SomneoService = new SomneoService(this.log, this.UserSettings);

    this.buildAccessories();

    this.log.debug('Finished initializing platform:', this.config.name);
  }

  async accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): Promise<void> {
    callback(this.SomneoAccessories);
  }

  private buildAccessories() {
    this.Sensors = new SomneoSensorAccessory(this);
    this.Lights = new SomneoLightAccessory(this);
    this.NightLight = new SomneoNightLightAccessory(this);
    this.SunsetProgramSwitch = new SomneoSunsetProgramSwitchAccessory(this);

    this.SomneoAccessories = [this.Sensors, this.Lights, this.NightLight, this.SunsetProgramSwitch] as SomneoAccessory[];

    this.log.debug(`Will poll every ${this.UserSettings.PollingMilliSeconds}ms`);

    this.SomneoAccessories.forEach(somneoAccessory => {
      setInterval(() => {
        this.log.debug(`Updating accessory=${somneoAccessory.name} values.`);
        somneoAccessory.updateValues();
      }, this.UserSettings.PollingMilliSeconds);
    });
  }
}
