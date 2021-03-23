import { RequestedAccessory } from './requestedAccessory';
import { SomneoConstants } from './somneoConstants';
import { somneoSwitchAccessory } from './somneoSwitchAccessory';

export class SomneoSunsetSwitchAccessory extends somneoSwitchAccessory {

  private static readonly NAME = `${SomneoConstants.SOMNEO} Sunset Program`;

  protected getName(): string {
    return SomneoSunsetSwitchAccessory.NAME;
  }

  public async updateValues(): Promise<void> {

    await this.somneoService.getSunset().then((sunset) => {
      this.isOn = sunset.onoff;
      this.getBinaryService()
        .getCharacteristic(this.getBinaryCharacteristic())
        .updateValue(this.isOn);
    }).catch(err => this.platform.log.error(`Error updating ${this.name}, err=${err}`));
  }

  protected modifySomneoServiceState(isOn: boolean): Promise<void> {
    return this.somneoService.modifySunsetState(isOn);
  }

  protected turnOffConflictingAccessories(): Promise<void> {

    if (this.platform.UserSettings.RequestedAccessories.includes(RequestedAccessory.LIGHT_MAIN)
    && this.platform.MainLight !== undefined) {
      this.platform.MainLight.turnOff();
    }

    if (this.platform.UserSettings.RequestedAccessories.includes(RequestedAccessory.LIGHT_NIGHT_LIGHT)
      && this.platform.NightLight !== undefined) {
      this.platform.NightLight.turnOff();
    }

    if (this.platform.UserSettings.RequestedAccessories.includes(RequestedAccessory.SWITCH_RELAXBREATHE)
      && this.platform.RelaxBreathe !== undefined) {
      this.platform.RelaxBreathe.turnOff();
    }

    if (this.platform.UserSettings.RequestedAccessories.includes(RequestedAccessory.AUDIO)
      && this.platform.Audio !== undefined) {
      this.platform.Audio.turnOff();
    }

    return Promise.resolve();
  }
}
