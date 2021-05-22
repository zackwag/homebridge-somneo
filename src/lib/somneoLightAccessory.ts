import { Service } from 'hap-nodejs';
import { SomneoPlatform } from '../somneoPlatform';
import { SomneoBinaryAccessory } from './somneoBinaryAccessory';
import { SomneoClock } from './somneoClock';

export abstract class SomneoLightAccessory extends SomneoBinaryAccessory {

  protected lightBulbService: Service;

  constructor(
    protected platform: SomneoPlatform,
    protected somneoClock: SomneoClock,
  ) {
    super(platform, somneoClock);

    this.lightBulbService = new platform.Service.Lightbulb(this.name);

    // register handlers for the characteristics
    this.getBinaryService()
      .getCharacteristic(this.getBinaryCharacteristic())
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this));
  }

  protected getBinaryService(): Service {
    return this.lightBulbService;
  }

  /*
  * This method is called directly after creation of this instance.
  * It should return all services which should be added to the accessory.
  */
  getServices(): Service[] {
    return [
      this.informationService,
      this.lightBulbService,
    ];
  }
}
