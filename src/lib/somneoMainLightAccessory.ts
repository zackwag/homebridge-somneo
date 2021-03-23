import { SomneoPlatform } from '../somneoPlatform';
import { RequestedAccessory } from './requestedAccessory';
import { SomneoConstants } from './somneoConstants';
import { SomneoDimmableLightAccessory } from './somneoDimmableLightAccessory';

export class SomneoMainLightAccessory extends SomneoDimmableLightAccessory {

  private static readonly NAME = 'Somneo Lights';

  constructor(
    protected platform: SomneoPlatform,
  ) {
    super(platform);

    this.getBinaryService()
      .getCharacteristic(this.platform.Characteristic.Brightness)
      .setProps({ minStep: SomneoConstants.BRIGHTNESS_STEP_INTERVAL });

    this.updateValues();
  }

  public async updateValues(): Promise<void> {

    await this.somneoService.getLightSettings().then(lightSettings => {
      this.isOn = lightSettings.onoff;
      this.getBinaryService()
        .getCharacteristic(this.getBinaryCharacteristic())
        .updateValue(lightSettings.onoff);

      // Philips stores up to 100 so multiply to get percentage
      this.brightness = (lightSettings.ltlvl * 4);
      this.getBinaryService()
        .getCharacteristic(this.platform.Characteristic.Brightness)
        .updateValue(this.brightness);
    }).catch(err => this.platform.log.error(`Error updating ${this.name}, err=${err}`));
  }

  protected getName(): string {
    return SomneoMainLightAccessory.NAME;
  }

  protected modifySomneoServiceState(isOn: boolean): Promise<void> {
    return this.somneoService.modifyMainLightState(isOn);
  }

  protected modifySomneoServiceBrightness(brightness: number): Promise<void> {
    return this.somneoService.modifyMainLightBrightness(brightness);
  }

  protected turnOffConflictingAccessories(): Promise<void> {

    if (this.platform.UserSettings.RequestedAccessories.includes(RequestedAccessory.LIGHT_NIGHT_LIGHT)
      && this.platform.NightLight !== undefined) {
      this.platform.NightLight.turnOff();
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
