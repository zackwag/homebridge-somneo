import { CharacteristicGetCallback, CharacteristicSetCallback, CharacteristicValue, Service } from 'homebridge';
import { SomneoPlatform } from './platform';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';
import { SomneoBinaryAccessory } from './types';

export class SomneoLightAccessory implements SomneoBinaryAccessory {

  private static readonly NAME = 'Somneo Lights';

  private informationService: Service;
  private isLightOn = false;
  private lightBrightness = 0;
  private lightService: Service;
  private somneoService: SomneoService;

  public name : string;

  constructor(
    private platform: SomneoPlatform,
  ) {
    this.somneoService = platform.SomneoService;
    this.name = SomneoLightAccessory.NAME;

    // set accessory information
    this.informationService = new this.platform.Service.AccessoryInformation()
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SomneoConstants.SOMNEO_MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SomneoConstants.SOMNEO_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.UserSettings.Host);

    this.lightService = new platform.Service.Lightbulb(this.name);

    // register handlers for the characteristics
    this.lightService.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setLightOn.bind(this))
      .on('get', this.getLightOn.bind(this));

    this.lightService.getCharacteristic(this.platform.Characteristic.Brightness)
      .on('set', this.setLightBrightness.bind(this))
      .on('get', this.getLightBrightness.bind(this));

    this.updateValues();
  }

  async updateValues() {

    try {
      const lightSettings = await this.somneoService.getLightSettings();

      this.isLightOn = lightSettings.onoff;
      this.lightService.getCharacteristic(this.platform.Characteristic.On).updateValue(lightSettings.onoff);

      // Philips stores up to 100 so multiply to get percentage
      this.lightBrightness = (lightSettings.ltlvl * 4);
      this.lightService.getCharacteristic(this.platform.Characteristic.Brightness).updateValue(this.lightBrightness);
    } catch(err) {
      this.platform.log.error(`Error updating ${this.name}, err=${err}`);
    }
  }

  setLightOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    if (value as boolean === this.isLightOn) {
      return;
    }

    if (value as boolean) {
      this.getAffectedAccessories().forEach(affectedAccessory => affectedAccessory.turnOff());
    }

    this.somneoService.modifyLightState(value as boolean);

    this.platform.log.info(`Set ${this.name} state ->`, value);

    this.isLightOn = value as boolean;
    callback(null);
  }

  getLightOn(callback: CharacteristicGetCallback) {

    this.platform.log.debug(`Get ${this.name} state ->`, this.isLightOn);
    callback(null, this.isLightOn);
  }

  setLightBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    if (value as number === this.lightBrightness) {
      return;
    }

    this.somneoService.modifyLightBrightness(value as number);

    this.platform.log.info(`Set ${this.name} brightness ->`, value);

    this.lightBrightness = value as number;
    callback(null);
  }

  getLightBrightness(callback: CharacteristicGetCallback) {

    this.platform.log.debug(`Get ${this.name} brightness ->`, this.lightBrightness);
    callback(null, this.lightBrightness);
  }

  getAffectedAccessories() {

    const affectedAccessories: SomneoBinaryAccessory[] = [];

    if (this.platform.NightLight !== undefined) {
      affectedAccessories.push(this.platform.NightLight);
    } else {
      this.platform.log.debug('Night light undefined');
    }

    if (this.platform.SunsetProgramSwitch !== undefined) {
      affectedAccessories.push(this.platform.SunsetProgramSwitch);
    } else {
      this.platform.log.debug('Sunset Program undefined');
    }

    return affectedAccessories;
  }

  turnOff() {

    if (this.isLightOn) {
      this.somneoService.modifyLightState(false);
      this.isLightOn = false;
      this.lightService.getCharacteristic(this.platform.Characteristic.On).updateValue(false);
    }
  }

  /*
  * This method is called directly after creation of this instance.
  * It should return all services which should be added to the accessory.
  */
  getServices(): Service[] {
    return [
      this.informationService,
      this.lightService,
    ];
  }
}
