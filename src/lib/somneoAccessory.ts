import { AccessoryPlugin, Service } from 'homebridge';
import { SomneoPlatform } from '../somneoPlatform';
import { SomneoClock } from './somneoClock';
import { SomneoConstants } from './somneoConstants';

export abstract class SomneoAccessory implements AccessoryPlugin {

  protected informationService: Service;
  protected hasGetError = false;

  public name : string;

  constructor(
    protected platform: SomneoPlatform,
    protected somneoClock: SomneoClock,
  ) {
    this.name = this.getName();

    // set accessory information
    this.informationService = new this.platform.Service.AccessoryInformation()
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SomneoConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SomneoConstants.MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.somneoClock.SomneoService.Host);
  }

  protected abstract getName(): string;

  abstract updateValues(): Promise<void>;

  abstract getServices(): Service[];
}
