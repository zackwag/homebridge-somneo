import { CharacteristicValue, Service } from 'homebridge';
import { SomneoPlatform } from './platform';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';
import { SomneoBinaryAccessory } from './types';
import { RequestedAccessory } from './userSettings';

export class SomneoLightAccessory implements SomneoBinaryAccessory {

  private static readonly NAME = 'Somneo Lights';

  private informationService: Service;
  private isLightOn: boolean | undefined;
  private lightBrightness: number | undefined;
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
      .onSet(this.setLightOn.bind(this))
      .onGet(this.getLightOn.bind(this));

    this.lightService.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setLightBrightness.bind(this))
      .onGet(this.getLightBrightness.bind(this))
      .setProps({ minStep: SomneoConstants.SOMNEO_BRIGHTNESS_STEP_INTERVAL });

    this.updateValues();
  }

  async updateValues() {

    try {
      const lightSettings = await this.somneoService.getLightSettings();

      this.isLightOn = lightSettings.onoff;
      this.lightService.getCharacteristic(this.platform.Characteristic.On)
        .updateValue(lightSettings.onoff);

      // Philips stores up to 100 so multiply to get percentage
      this.lightBrightness = (lightSettings.ltlvl * 4);
      this.lightService.getCharacteristic(this.platform.Characteristic.Brightness)
        .updateValue(this.lightBrightness);
    } catch(err) {
      this.platform.log.error(`Error updating ${this.name}, err=${err}`);
    }
  }

  async setLightOn(value: CharacteristicValue) {

    if (value as boolean === (this.isLightOn || SomneoConstants.DEFAULT_BINARY_STATE)) {
      return;
    }

    // If turning this accessory on, turn off the conflicting accessories
    if (value as boolean) {
      this.getAffectedAccessories().forEach(affectedAccessory => affectedAccessory.turnOff());
    }

    this.somneoService.modifyLightState(value as boolean);
    this.platform.log.info(`Set ${this.name} state ->`, value);
    this.isLightOn = value as boolean;
  }

  async getLightOn(): Promise<CharacteristicValue> {

    if (this.isLightOn !== undefined) {
      this.platform.log.debug(`Get ${this.name} state ->`, this.isLightOn);
    }

    return (this.isLightOn || SomneoConstants.DEFAULT_BINARY_STATE);
  }

  async setLightBrightness(value: CharacteristicValue) {

    if (value as number === (this.lightBrightness || SomneoConstants.DEFAULT_BRIGHTNESS)) {
      return;
    }

    this.somneoService.modifyLightBrightness(value as number);
    this.platform.log.info(`Set ${this.name} brightness ->`, value);
    this.lightBrightness = value as number;
  }

  async getLightBrightness() : Promise<CharacteristicValue> {

    if (this.lightBrightness !== undefined) {
      this.platform.log.debug(`Get ${this.name} brightness ->`, this.lightBrightness);
    }

    return (this.lightBrightness || SomneoConstants.DEFAULT_BRIGHTNESS);
  }

  getAffectedAccessories() {

    const affectedAccessories: SomneoBinaryAccessory[] = [];

    if (this.platform.UserSettings.RequestedAccessories.includes(RequestedAccessory.LIGHT_NIGHT_LIGHT)) {
      affectedAccessories.push(this.platform.NightLight!);
    }

    if (this.platform.UserSettings.RequestedAccessories.includes(RequestedAccessory.SWITCH_SUNSET_PROGRAM)) {
      affectedAccessories.push(this.platform.SunsetProgramSwitch!);
    }

    return affectedAccessories;
  }

  turnOff() {

    if (this.isLightOn) {
      this.somneoService.modifyLightState(false);
      this.isLightOn = false;
      this.platform.log.info(`Set ${this.name} state ->`, this.isLightOn);
      this.lightService.getCharacteristic(this.platform.Characteristic.On)
        .updateValue(this.isLightOn);
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
