import { SomneoConstants } from './somneoConstants';
import { somneoSwitchAccessory } from './somneoSwitchAccessory';

export class SomneoSunsetSwitchAccessory extends somneoSwitchAccessory {

  protected getName(): string {
    return `${this.somneoClock.Name} ${SomneoConstants.SWITCH_SUNSET_PROGRAM}`;
  }

  public async updateValues(): Promise<void> {

    await this.somneoClock.SomneoService.getSunset().then(sunset => {
      this.isOn = sunset.onoff;
      this.getBinaryService()
        .getCharacteristic(this.getBinaryCharacteristic())
        .updateValue(this.isOn);
    }).catch(err => this.platform.log.error(`Error updating ${this.name}, err=${err}`));
  }

  protected modifySomneoServiceState(isOn: boolean): Promise<void> {
    return this.somneoClock.SomneoService.modifySunsetState(isOn);
  }

  protected turnOffConflictingAccessories(): Promise<void> {

    if (this.platform.HostMainLightMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostMainLightMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    if (this.platform.HostNightLightMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostNightLightMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    if (this.platform.HostRelaxBreatheSwitchMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostRelaxBreatheSwitchMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    if (this.platform.HostAudioMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostAudioMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    return Promise.resolve();
  }
}
