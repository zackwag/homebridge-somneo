import { Service } from 'hap-nodejs';
import { CharacteristicValue } from 'homebridge';
import { SomneoPlatform } from '../somneoPlatform';
import { SomneoBinaryAccessory } from './somneoBinaryAccessory';
import { SomneoClock } from './somneoClock';
import { SomneoConstants } from './somneoConstants';

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

  async getOn(): Promise<CharacteristicValue> {

    if (this.isOn === undefined) {
      return SomneoConstants.DEFAULT_BINARY_STATE;
    }

    this.platform.log.debug(`UI Get -> accessory=${this.name} on=${this.isOn}`);
    return this.isOn;
  }

  async setOn(value: CharacteristicValue): Promise<void> {

    const boolValue = Boolean(value);
    if (boolValue === (this.isOn ?? SomneoConstants.DEFAULT_BINARY_STATE)) {
      return;
    }

    if (boolValue) {
      this.turnOffConflictingAccessories();
    }

    this.modifySomneoServiceState(boolValue).then(() => {
      this.isOn = boolValue;
      this.platform.log.info(`UI Set -> accessory=${this.name} on=${this.isOn}`);
    }).catch(err => this.platform.log.error(`Error -> Setting accessory=${this.name} on=${boolValue} err=${err}`));
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
