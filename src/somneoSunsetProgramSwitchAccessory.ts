import { CharacteristicGetCallback, CharacteristicSetCallback, CharacteristicValue, Service } from 'homebridge';
import { SomneoPlatform } from './platform';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';
import { SomneoAccessory } from './types';

export class SomneoSunsetProgramSwitchAccessory implements SomneoAccessory {

  private informationService: Service;
  private isProgramOn = false;
  private somneoService: SomneoService;
  private switchService: Service;

  public name : string;

  constructor(
    private platform: SomneoPlatform,
  ) {
    this.somneoService = this.platform.SomneoService;
    this.name = 'Somneo Sunset Program';

    // set accessory information
    this.informationService = new this.platform.Service.AccessoryInformation()
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SomneoConstants.SOMNEO_MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SomneoConstants.SOMNEO_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, String(this.platform.config.host));

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

      // Setters make HTTP calls
      // To avoid that during polling refresh, call getters to refresh UI
      this.switchService.getCharacteristic(this.platform.Characteristic.On);
    } catch(err) {
      this.platform.log.error(`Error updating Sunset Program Switch: err=${err}`);
    }
  }

  setProgramOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    if (value as boolean === this.isProgramOn) {
      return;
    }

    if (value as boolean) {
      this.platform.Lights?.turnOff();
      this.platform.NightLight?.turnOff();
    }

    this.somneoService.modifySunsetProgram(value as boolean);

    this.platform.log.info('Set Sunset Program ->', value);

    this.isProgramOn = value as boolean;
    callback(null);
  }

  getProgramOn(callback: CharacteristicGetCallback) {

    this.platform.log.debug('Get Sunset Program ->', this.isProgramOn);
    callback(null, this.isProgramOn);
  }

  turnOff() {
    this.switchService.setCharacteristic(this.platform.Characteristic.On, false);
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
