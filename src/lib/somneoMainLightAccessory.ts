import { SomneoPlatform } from '../somneoPlatform';
import { SomneoClock } from './somneoClock';
import { SomneoConstants } from './somneoConstants';
import { SomneoDimmableLightAccessory } from './somneoDimmableLightAccessory';

export class SomneoMainLightAccessory extends SomneoDimmableLightAccessory {

  constructor(
    protected platform: SomneoPlatform,
    protected somneoClock: SomneoClock,
  ) {
    super(platform, somneoClock);

    this.getBinaryService()
      .getCharacteristic(this.platform.Characteristic.Brightness)
      .setProps({ minStep: SomneoConstants.BRIGHTNESS_STEP_INTERVAL });

    this.updateValues();
  }

  public async updateValues(): Promise<void> {

    await this.somneoClock.SomneoService.getLightSettings().then(lightSettings => {
      this.isOn = lightSettings.onoff;
      this.getBinaryService()
        .getCharacteristic(this.getBinaryCharacteristic())
        .updateValue(this.isOn);

      // Philips stores up to 100 so multiply to get percentage
      this.brightness = (lightSettings.ltlvl * 4);
      this.getBinaryService()
        .getCharacteristic(this.platform.Characteristic.Brightness)
        .updateValue(this.brightness);
    }).catch(err => this.platform.log.error(`Error updating ${this.name}, err=${err}`));
  }

  protected getName(): string {
    return `${this.somneoClock.Name} ${SomneoConstants.LIGHT_MAIN_LIGHT}`;
  }

  protected modifySomneoServiceState(isOn: boolean): Promise<void> {
    return this.somneoClock.SomneoService.modifyMainLightState(isOn);
  }

  protected modifySomneoServiceBrightness(brightness: number): Promise<void> {
    return this.somneoClock.SomneoService.modifyMainLightBrightness(brightness);
  }

  protected turnOffConflictingAccessories(): Promise<void> {

    if (this.platform.HostNightLightMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostNightLightMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    if (this.platform.HostRelaxBreatheSwitchMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostRelaxBreatheSwitchMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    if (this.platform.HostSunsetSwitchMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostSunsetSwitchMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    return Promise.resolve();
  }
}
