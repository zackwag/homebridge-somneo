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
    if (numValue === (this.brightness === undefined ? SomneoConstants.DEFAULT_BRIGHTNESS : this.brightness)) {
      return;
    }

    this.modifySomneoServiceBrightness(numValue).then(() => {
      this.brightness = numValue;
      this.platform.log.info(`Set ${this.name} brightness ->`, numValue);
    }).catch(err => this.platform.log.error(`Error setting ${this.name} brightness to ${numValue}, err=${err}`));
  }

  async getLightBrightness() : Promise<CharacteristicValue> {

    if (this.brightness !== undefined) {
      this.platform.log.debug(`Get ${this.name} brightness ->`, this.brightness);
      return this.brightness;
    }

    return SomneoConstants.DEFAULT_BRIGHTNESS;
  }

  protected abstract modifySomneoServiceBrightness(brightness: number): Promise<void>;
}
