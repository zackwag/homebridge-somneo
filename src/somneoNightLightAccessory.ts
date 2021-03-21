import { CharacteristicValue, Service } from 'homebridge';
import { SomneoPlatform } from './platform';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';
import { SomneoBinaryAccessory } from './types';

export class SomneoNightLightAccessory implements SomneoBinaryAccessory {

  private static readonly NAME = `${SomneoConstants.SOMNEO} Night Light`;

  private informationService: Service;
  private isNightLightOn: boolean | undefined;
  private nightLightService: Service;
  private somneoService: SomneoService;

  public name : string;

  constructor(
    private platform: SomneoPlatform,
  ) {
    this.somneoService = platform.SomneoService;
    this.name = SomneoNightLightAccessory.NAME;

    // set accessory information
    this.informationService = new this.platform.Service.AccessoryInformation()
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SomneoConstants.SOMNEO_MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SomneoConstants.SOMNEO_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.UserSettings.Host);

    this.nightLightService = new platform.Service.Lightbulb(this.name);

    // register handlers for the characteristics
    this.nightLightService.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setNightLightOn.bind(this))
      .onGet(this.getNightLightOn.bind(this));

    this.updateValues();
  }

  async updateValues() {

    try {
      const lightSettings = await this.somneoService.getLightSettings();

      this.isNightLightOn = lightSettings.ngtlt;
      this.nightLightService.getCharacteristic(this.platform.Characteristic.On)
        .updateValue(this.isNightLightOn);
    } catch(err) {
      this.platform.log.error(`Error updating ${this.name}, err=${err}`);
    }
  }

  async setNightLightOn(value: CharacteristicValue) {

    if (value as boolean === (this.isNightLightOn || SomneoConstants.DEFAULT_BINARY_STATE)) {
      return;
    }

    // If turning this accessory on, turn off the conflicting accessories
    if (value as boolean) {
      this.getAffectedAccessories().forEach(affectedAccessory => affectedAccessory.turnOff());
    }

    this.somneoService.modifyNightLight(value as boolean);
    this.platform.log.info(`Set ${this.name} state ->`, value);
    this.isNightLightOn = value as boolean;
  }

  async getNightLightOn(): Promise<CharacteristicValue> {

    if (this.isNightLightOn !== undefined) {
      this.platform.log.debug(`Get ${this.name} state ->`, this.isNightLightOn);
    }

    return (this.isNightLightOn || SomneoConstants.DEFAULT_BINARY_STATE);
  }

  getAffectedAccessories() {

    const affectedAccessories: SomneoBinaryAccessory[] = [];

    if (this.platform.Lights !== undefined) {
      affectedAccessories.push(this.platform.Lights);
    } else {
      this.platform.log.debug('Lights undefined');
    }

    if (this.platform.SunsetProgramSwitch !== undefined) {
      affectedAccessories.push(this.platform.SunsetProgramSwitch);
    } else {
      this.platform.log.debug('Sunset Program undefined');
    }

    return affectedAccessories;
  }

  turnOff() {

    if (this.isNightLightOn) {
      this.somneoService.modifyNightLight(false);
      this.isNightLightOn = false;
      this.platform.log.info(`Set ${this.name} state ->`, this.isNightLightOn);
      this.nightLightService.getCharacteristic(this.platform.Characteristic.On)
        .updateValue(this.isNightLightOn);
    }
  }

  /*
  * This method is called directly after creation of this instance.
  * It should return all services which should be added to the accessory.
  */
  getServices(): Service[] {
    return [
      this.informationService,
      this.nightLightService,
    ];
  }
}
