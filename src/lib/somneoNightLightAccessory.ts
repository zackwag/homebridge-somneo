import { SomneoPlatform } from '../somneoPlatform';
import { RequestedAccessory } from './requestedAccessory';
import { SomneoConstants } from './somneoConstants';
import { SomneoLightAccessory } from './somneoLightAccessory';

export class SomneoNightLightAccessory extends SomneoLightAccessory {

  private static readonly NAME = `${SomneoConstants.SOMNEO} Night Light`;

  constructor(
    protected platform: SomneoPlatform,
  ) {
    super(platform);
    this.updateValues();
  }

  protected getName(): string {
    return SomneoNightLightAccessory.NAME;
  }

  async updateValues(): Promise<void> {

    await this.somneoService.getLightSettings().then(lightSettings => {
      this.isOn = lightSettings.ngtlt;
      this.getBinaryService()
        .getCharacteristic(this.getBinaryCharacteristic())
        .updateValue(this.isOn);
    }).catch(err => this.platform.log.error(`Error updating ${this.name}, err=${err}`));
  }

  protected modifySomneoServiceState(isOn: boolean): Promise<void> {
    return this.somneoService.modifyNightLightState(isOn);
  }

  protected turnOffConflictingAccessories(): Promise<void> {

    if (this.platform.UserSettings.RequestedAccessories.includes(RequestedAccessory.LIGHT_MAIN)
    && this.platform.MainLight !== undefined) {
      this.platform.MainLight.turnOff();
    }

    if (this.platform.UserSettings.RequestedAccessories.includes(RequestedAccessory.SWITCH_RELAXBREATHE)
    && this.platform.RelaxBreathe !== undefined) {
      this.platform.RelaxBreathe.turnOff();
    }

    if (this.platform.UserSettings.RequestedAccessories.includes(RequestedAccessory.SWITCH_SUNSET)
    && this.platform.SunsetSwitch !== undefined) {
      this.platform.SunsetSwitch.turnOff();
    }

    return Promise.resolve();
  }
}
