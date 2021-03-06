import { Service } from 'homebridge';
import { SomneoPlatform } from '../somneoPlatform';
import { SomneoBinaryAccessory } from './somneoBinaryAccessory';
import { SomneoClock } from './somneoClock';

export abstract class SomneoSwitchAccessory extends SomneoBinaryAccessory {

  protected switchService: Service;

  constructor(
    protected platform: SomneoPlatform,
    protected somneoClock: SomneoClock,
  ) {
    super(platform, somneoClock);

    this.switchService = new platform.Service.Switch(this.name);

    // register handlers for the characteristics
    this.getBinaryService()
      .getCharacteristic(this.getBinaryCharacteristic())
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));
  }

  protected getBinaryService(): Service {
    return this.switchService;
  }

  /*
  * This method is called directly after creation of this instance.
  * It should return all services which should be added to the accessory.
  */
  public getServices(): Service[] {
    return [
      this.informationService,
      this.switchService,
    ];
  }
}
