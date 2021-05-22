import { SomneoConstants } from './somneoConstants';
import { SomneoSwitchAccessory } from './somneoSwitchAccessory';

export class SomneoRelaxBreatheSwitchAccessory extends SomneoSwitchAccessory {

  protected getName(): string {
    return `${this.somneoClock.Name} ${SomneoConstants.SWITCH_RELAX_BREATHE_PROGRAM}`;
  }

  async updateValues(): Promise<void> {

    await this.somneoClock.SomneoService.getRelaxBreatheProgramSettings()
      .then(relaxeBreathe => {
        if (relaxeBreathe === undefined) {
          return;
        }

        if (relaxeBreathe.onoff !== undefined) {
          this.isOn = relaxeBreathe.onoff;
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
      return this.somneoClock.SomneoService.turnOnRelaxBreatheProgram(this.somneoClock.RelaxBreatheProgramPreferences);
    }

    return this.somneoClock.SomneoService.turnOffRelaxBreatheProgram();
  }

  protected turnOffConflictingAccessories(): Promise<void> {

    if (this.platform.HostMainLightMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostMainLightMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    if (this.platform.HostNightLightMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostNightLightMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    if (this.platform.HostSunsetSwitchMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostSunsetSwitchMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    if (this.platform.HostAudioMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostAudioMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    return Promise.resolve();
  }
}
