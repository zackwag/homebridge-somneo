import { SomneoConstants } from './somneoConstants';
import { SomneoSwitchAccessory } from './somneoSwitchAccessory';

export class SomneoWakeAlarmSwitchAccessory extends SomneoSwitchAccessory {

  private profileNumber: number | undefined;

  protected getName(): string {
    return `${this.somneoClock.Name} ${SomneoConstants.SWITCH_WAKE_ALARM}`;
  }

  async updateValues(): Promise<void> {

    return this.somneoClock.SomneoService.getWakeAlarmSettings()
      .then(wakeAlarmSettings => {
        if (wakeAlarmSettings === undefined) {
          return;
        }

        this.profileNumber = wakeAlarmSettings.prfnr;

        if (wakeAlarmSettings.prfen !== undefined) {
          this.isOn = wakeAlarmSettings.prfen;
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

  protected async modifySomneoServiceState(isOn: boolean): Promise<void> {

    // profileNumber is only populated after a successful poll; fall back to a
    // direct fetch if the accessory is toggled before that first poll completes.
    if (this.profileNumber === undefined) {
      this.profileNumber = (await this.somneoClock.SomneoService.getWakeAlarmSettings()).prfnr;
    }

    if (this.profileNumber === undefined) {
      throw new Error('Wake alarm profile number is unavailable.');
    }

    return this.somneoClock.SomneoService.updateWakeAlarmEnabled(this.profileNumber, isOn);
  }

  protected turnOffConflictingAccessories(): Promise<void> {
    return Promise.resolve();
  }
}
