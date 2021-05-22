import { CharacteristicValue } from 'homebridge';
import { SomneoPlatform } from '../somneoPlatform';
import { SomneoClock } from './somneoClock';
import { SomneoConstants } from './somneoConstants';
import { SomneoLightAccessory } from './somneoLightAccessory';

export abstract class SomneoDimmableLightAccessory extends SomneoLightAccessory {

  protected brightness: number | undefined;

  constructor(
    protected platform: SomneoPlatform,
    protected somneoClock: SomneoClock,
  ) {
    super(platform, somneoClock);

    this.getBinaryService()
      .getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setLightBrightness.bind(this))
      .onGet(this.getLightBrightness.bind(this));
  }

  async setLightBrightness(value: CharacteristicValue) {

    const numValue = Number(value);
    if (numValue === (this.brightness ?? SomneoConstants.DEFAULT_BRIGHTNESS)) {
      return;
    }

    this.modifySomneoServiceBrightness(numValue).then(() => {
      this.brightness = numValue;
      this.platform.log.info(`UI Set -> accessory=${this.name} brightness=${numValue}`);
    }).catch(err => {
      this.platform.log.error(`Error -> Setting accessory=${this.name} brightness=${numValue} err=${err}`);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    });
  }

  async getLightBrightness(): Promise<CharacteristicValue> {

    if (this.hasGetError) {
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }

    if (this.brightness === undefined) {
      return SomneoConstants.DEFAULT_BRIGHTNESS;
    }

    this.platform.log.debug(`UI Get -> accessory=${this.name} brightness=${this.brightness}`);
    return this.brightness;
  }

  protected abstract modifySomneoServiceBrightness(brightness: number): Promise<void>;
}
