import { SomneoPlatform } from '../somneoPlatform';
import { SomneoClock } from './somneoClock';
import { SomneoConstants } from './somneoConstants';
import { SomneoLightAccessory } from './somneoLightAccessory';

export class SomneoNightLightAccessory extends SomneoLightAccessory {

  constructor(
    protected platform: SomneoPlatform,
    protected somneoClock: SomneoClock,
  ) {
    super(platform, somneoClock);
  }

  protected getName(): string {
    return `${this.somneoClock.Name} ${SomneoConstants.LIGHT_NIGHT_LIGHT}`;
  }

  async updateValues(): Promise<void> {

<<<<<<< Updated upstream
    return this.somneoClock.SomneoService.getLightSettings()
      .then(lightSettings => {
        if (lightSettings === undefined) {
          return;
        }

        if (lightSettings.ngtlt !== undefined) {
          this.isOn = lightSettings.ngtlt;
          this.getBinaryService()
            .getCharacteristic(this.getBinaryCharacteristic())
            .updateValue(this.isOn);
        }

        this.hasGetError = false;
      }).catch(err => {
        this.platform.log.error(`Error -> Updating accessory=${this.name} err=${err}`);
        this.hasGetError = true;
      });
=======
    await this.somneoClock.SomneoService.getLightSettings().then(lightSettings => {
      if (lightSettings === undefined) {
        return;
      }

      if (lightSettings.ngtlt !== undefined) {
        this.isOn = lightSettings.ngtlt;
        this.getBinaryService()
          .getCharacteristic(this.getBinaryCharacteristic())
          .updateValue(this.isOn);
      }
    }).catch(err => this.platform.log.error(`Error updating ${this.name}, err=${err}`));
>>>>>>> Stashed changes
  }

  protected modifySomneoServiceState(isOn: boolean): Promise<void> {

    if (isOn) {
      return this.somneoClock.SomneoService.turnOnNightLight();
    }

    return this.somneoClock.SomneoService.turnOffNightLight();
  }

  protected turnOffConflictingAccessories(): Promise<void> {

    if (this.platform.HostMainLightMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostMainLightMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    if (this.platform.HostRelaxBreatheSwitchMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostRelaxBreatheSwitchMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    if (this.platform.HostSunsetSwitchMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostSunsetSwitchMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    return Promise.resolve();
  }
}
