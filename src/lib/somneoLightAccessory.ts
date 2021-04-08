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

    if (this.isOn !== undefined) {
      this.platform.log.debug(`Get ${this.name} state ->`, this.isOn);
      return this.isOn;
    }

    return SomneoConstants.DEFAULT_BINARY_STATE;
  }

  async setOn(value: CharacteristicValue): Promise<void> {

    const boolValue = Boolean(value);
    if (boolValue === (this.isOn === undefined ? SomneoConstants.DEFAULT_BINARY_STATE : this.isOn)) {
      return;
    }

    if (boolValue) {
      this.turnOffConflictingAccessories();
    }

    this.modifySomneoServiceState(boolValue).then(() => {
      this.isOn = boolValue;
      this.platform.log.info(`Set ${this.name} state ->`, this.isOn);
    }).catch(err => this.platform.log.error(`Error setting ${this.name} to ${boolValue}, err=${err}`));
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
