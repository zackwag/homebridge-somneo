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
  }

  async updateValues(): Promise<void> {

    return this.somneoClock.SomneoService.getLightSettings()
      .then(lightSettings => {
        if (lightSettings === undefined) {
          return;
        }

        if (lightSettings.onoff !== undefined) {
          this.isOn = lightSettings.onoff;
          this.getBinaryService()
            .getCharacteristic(this.getBinaryCharacteristic())
            .updateValue(this.isOn);
        }

        if (lightSettings.ltlvl !== undefined) {
          this.brightness = SomneoConstants.convertPhilipsPercentageToPercentage(lightSettings.ltlvl);
          this.getBinaryService()
            .getCharacteristic(this.platform.Characteristic.Brightness)
            .updateValue(this.brightness);
        }

        this.hasGetError = false;
      }).catch(err => {
        this.platform.log.error(`Error -> Updating accessory=${this.name} err=${err}`);
        this.hasGetError = true;
      });
  }

  protected getName(): string {
    return `${this.somneoClock.Name} ${SomneoConstants.LIGHT_MAIN_LIGHT}`;
  }

  protected modifySomneoServiceState(isOn: boolean): Promise<void> {

    if (isOn) {
      return this.somneoClock.SomneoService.turnOnMainLight();
    }

    return this.somneoClock.SomneoService.turnOffMainLight();
  }

  protected modifySomneoServiceBrightness(brightness: number): Promise<void> {
    return this.somneoClock.SomneoService.updateMainLightBrightness(brightness);
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
