import { CharacteristicGetCallback, CharacteristicSetCallback, CharacteristicValue, Service } from 'homebridge';
import { SomneoPlatform } from './platform';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';
import { SomneoAccessory, SomneoBinaryAccessory } from './types';

export class SomneoSunsetProgramSwitchAccessory implements SomneoAccessory {

  private static readonly NAME = `${SomneoConstants.SOMNEO} Sunset Program`;

  private informationService: Service;
  private isProgramOn = false;
  private somneoService: SomneoService;
  private switchService: Service;

  public name : string;

  constructor(
    private platform: SomneoPlatform,
  ) {
    this.somneoService = this.platform.SomneoService;
    this.name = SomneoSunsetProgramSwitchAccessory.NAME;

    // set accessory information
    this.informationService = new this.platform.Service.AccessoryInformation()
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SomneoConstants.SOMNEO_MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SomneoConstants.SOMNEO_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.UserSettings.Host);

    this.switchService = new platform.Service.Switch(this.name);

    // register handlers for the characteristics
    this.switchService.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setProgramOn.bind(this))
      .on('get', this.getProgramOn.bind(this));

    this.updateValues();
  }

  async updateValues() {

    try {
      const sunsetProgram = await this.somneoService.getSunsetProgram();

      this.isProgramOn = sunsetProgram.onoff;
      this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(this.isProgramOn);
    } catch(err) {
      this.platform.log.error(`Error updating ${this.name}, err=${err}`);
    }
  }

  setProgramOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    if (value as boolean === this.isProgramOn) {
      return;
    }

    if (value as boolean) {
      this.getAffectedAccessories().forEach(affectedAccessory => affectedAccessory.turnOff());
    }

    this.somneoService.modifySunsetProgram(value as boolean);

    this.platform.log.info(`Set ${this.name} ->`, value);

    this.isProgramOn = value as boolean;
    callback(null);
  }

  getProgramOn(callback: CharacteristicGetCallback) {

    this.platform.log.debug(`Get ${this.name} ->`, this.isProgramOn);
    callback(null, this.isProgramOn);
  }

  getAffectedAccessories() {

    const affectedAccessories: SomneoBinaryAccessory[] = [];

    if (this.platform.Lights !== undefined) {
      affectedAccessories.push(this.platform.Lights);
    } else {
      this.platform.log.debug('Lights undefined');
    }

    if (this.platform.NightLight !== undefined) {
      affectedAccessories.push(this.platform.NightLight);
    } else {
      this.platform.log.debug('Night Light undefined');
    }

    return affectedAccessories;
  }

  turnOff() {

    if (this.isProgramOn) {
      this.somneoService.modifySunsetProgram(false);
      this.isProgramOn = false;
      this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(false);
    }
  }

  /*
  * This method is called directly after creation of this instance.
  * It should return all services which should be added to the accessory.
  */
  getServices(): Service[] {
    return [
      this.informationService,
      this.switchService,
    ];
  }
}
