import { CharacteristicValue } from 'homebridge';
import { SomneoSwitchAccessory } from './somneoSwitchAccessory';

export abstract class SomneoMomentarySwitchAccessory extends SomneoSwitchAccessory {

  async updateValues(): Promise<void> {

    this.isOn = false;
    this.getBinaryService()
      .getCharacteristic(this.getBinaryCharacteristic())
      .updateValue(false);
    this.hasGetError = false;
  }

  async getOn(): Promise<CharacteristicValue> {
    return false;
  }

  async setOn(value: CharacteristicValue): Promise<void> {

    if (!Boolean(value)) {
      return;
    }

    try {
      await this.triggerMomentaryAction();
      this.platform.log.info(`UI Set -> accessory=${this.name} action=triggered`);
    } catch (err) {
      this.platform.log.error(`Error -> Triggering accessory=${this.name} err=${err}`);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    } finally {
      this.isOn = false;
      this.getBinaryService()
        .getCharacteristic(this.getBinaryCharacteristic())
        .updateValue(false);
    }
  }

  protected modifySomneoServiceState(): Promise<void> {
    return Promise.resolve();
  }

  protected turnOffConflictingAccessories(): Promise<void> {
    return Promise.resolve();
  }

  protected abstract triggerMomentaryAction(): Promise<void>;
}
