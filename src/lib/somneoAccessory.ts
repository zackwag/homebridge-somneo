import { AccessoryPlugin, Service } from 'homebridge';
import { SomneoPlatform } from '../somneoPlatform';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';

export abstract class SomneoAccessory implements AccessoryPlugin {

  protected somneoService: SomneoService;
  protected informationService: Service;

  public name : string;

  constructor(
    protected platform: SomneoPlatform,
  ) {
    this.somneoService = platform.SomneoService;
    this.name = this.getName();

    // set accessory information
    this.informationService = new this.platform.Service.AccessoryInformation()
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SomneoConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SomneoConstants.MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.UserSettings.Host);
  }

  protected abstract getName(): string;

  abstract updateValues(): Promise<void>;

  abstract getServices(): Service[];
}
