import { Service } from 'hap-nodejs';
import { CharacteristicValue } from 'homebridge';
import { SomneoAccessory } from './somneoAccessory';
import { SomneoConstants } from './somneoConstants';

export abstract class SomneoBinaryAccessory extends SomneoAccessory {

  protected isOn: boolean | undefined;

  async getOn(): Promise<CharacteristicValue> {

    if (this.isOn === undefined) {
      return SomneoConstants.DEFAULT_BINARY_STATE;
    }

    this.platform.log.debug(`Get ${this.name} state ->`, this.isOn);
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
      this.platform.log.info(`Set ${this.name} state ->`, this.isOn);
    }).catch(err =>
      this.platform.log.error(`Error setting ${this.name} state to ${boolValue}, err=${err}`));
  }

  turnOff(): Promise<void> {

    if (this.isOn) {
      this.modifySomneoServiceState(false).then(() => {
        this.isOn = false;
        this.platform.log.info(`Set ${this.name} state ->`, this.isOn);
        this.getBinaryService()
          .getCharacteristic(this.getBinaryCharacteristic())
          .updateValue(this.isOn);
      }).catch(err => this.platform.log.error(`Error turning off ${this.name}, err=${err}`));
    }

    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected getBinaryCharacteristic(): any {
    return this.platform.Characteristic.On;
  }

  protected abstract getBinaryService(): Service;
  protected abstract modifySomneoServiceState(isOn: boolean): Promise<void>;
  protected abstract turnOffConflictingAccessories(): Promise<void>;
}
