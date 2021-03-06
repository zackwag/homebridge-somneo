import { SomneoConstants } from './somneoConstants';
import { SomneoSwitchAccessory } from './somneoSwitchAccessory';

export class SomneoSunsetSwitchAccessory extends SomneoSwitchAccessory {

  protected getName(): string {
    return `${this.somneoClock.Name} ${SomneoConstants.SWITCH_SUNSET_PROGRAM}`;
  }

  async updateValues(): Promise<void> {

    return this.somneoClock.SomneoService.getSunsetProgram()
      .then(sunset => {
        if (sunset === undefined) {
          return;
        }

        if (sunset.onoff !== undefined) {
          this.isOn = sunset.onoff;
          this.getBinaryService()
            .getCharacteristic(this.getBinaryCharacteristic())
            .updateValue(this.isOn);
        }

        this.hasGetError = false;
      }).catch(err => {
        this.platform.log.error(`Error -> Updating accessory=${this.name} err=${err}`);
        this.hasGetError = true;
      });
  }

  protected modifySomneoServiceState(isOn: boolean): Promise<void> {

    if (isOn) {
      return this.somneoClock.SomneoService.turnOnSunsetProgram(this.somneoClock.SunsetProgramPreferences);
    }

    return this.somneoClock.SomneoService.turnOffSunsetProgram();
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
