import { CharacteristicGetCallback, CharacteristicSetCallback, CharacteristicValue, Service } from 'homebridge';
import { SomneoPlatform } from './platform';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';
import { SomneoAccessory } from './types';

export class SomneoLightAccessory implements SomneoAccessory {

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
    this.name = 'Somneo Lights';

    // set accessory information
    this.informationService = new this.platform.Service.AccessoryInformation()
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SomneoConstants.SOMNEO_MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SomneoConstants.SOMNEO_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, String(this.platform.config.host));

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
      this.lightBrightness = lightSettings.ltlvl * 4; // Philips stores up to 100 so multiply to get percentage
    } catch(err) {
      this.platform.log.error(`Error updating Lights: err=${err}`);
    }
  }

  setLightOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    if (value as boolean === this.isLightOn) {
      return;
    }

    if (value as boolean) {
      this.platform.NightLight?.turnOff();
      this.platform.SunsetProgramSwitch?.turnOff();
    }

    this.somneoService.modifyLightState(value as boolean);

    this.platform.log.info('Set Light ->', value);

    this.isLightOn = value as boolean;
    callback(null);
  }

  getLightOn(callback: CharacteristicGetCallback) {

    this.platform.log.debug('Get Light ->', this.isLightOn);
    callback(null, this.isLightOn);
  }

  setLightBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {

    if (value as number === this.lightBrightness) {
      return;
    }

    this.somneoService.modifyLightBrightness(value as number);

    this.platform.log.info('Set Light Brightness -> ', value);

    this.lightBrightness = value as number;
    callback(null);
  }

  getLightBrightness(callback: CharacteristicGetCallback) {

    this.platform.log.debug('Get Light Brightness -> ', this.lightBrightness);
    callback(null, this.lightBrightness);
  }

  turnOff() {
    this.lightService.setCharacteristic(this.platform.Characteristic.On, false);
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
