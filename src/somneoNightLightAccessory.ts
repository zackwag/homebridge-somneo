import { CharacteristicGetCallback, CharacteristicSetCallback, CharacteristicValue, Service } from 'homebridge';
import { SomneoPlatform } from './platform';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';
import { SomneoAccessory } from './types';

export class SomneoNightLightAccessory implements SomneoAccessory {

  private informationService: Service;
  private isNightLightOn = false;
  private nightLightService : Service;
  private somneoService: SomneoService;

  public name : string;

  constructor(
    private platform: SomneoPlatform,
  ) {
    this.somneoService = platform.SomneoService;
    this.name = 'Somneo Night Light';

    // set accessory information
    this.informationService = new this.platform.Service.AccessoryInformation()
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SomneoConstants.SOMNEO_MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SomneoConstants.SOMNEO_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, String(this.platform.config.host));

    this.nightLightService = new platform.Service.Lightbulb(this.name);

    // register handlers for the characteristics
    this.nightLightService.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setNightLightOn.bind(this))
      .on('get', this.getNightLightOn.bind(this));

    this.updateValues();
  }

  async updateValues() {

    try {
      const lightSettings = await this.somneoService.getLightSettings();
      this.isNightLightOn = lightSettings.ngtlt;
    } catch(err) {
      this.platform.log.error(`Error updating Night Light: err=${err}`);
    }
  }

  setNightLightOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    if (value as boolean === this.isNightLightOn) {
      return;
    }

    if (value as boolean) {
      this.platform.Lights?.turnOff();
      this.platform.SunsetProgramSwitch?.turnOff();
    }

    this.somneoService.modifyNightLight(value as boolean);

    this.platform.log.info('Set Night Light ->', value);

    this.isNightLightOn = value as boolean;
    callback(null);
  }

  getNightLightOn(callback: CharacteristicGetCallback) {

    this.platform.log.debug('Get Night Light ->', this.isNightLightOn);
    callback(null, this.isNightLightOn);
  }

  turnOff() {
    this.nightLightService.setCharacteristic(this.platform.Characteristic.On, false);
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
