import { SomneoConstants } from './somneoConstants';
import { SomneoMomentarySwitchAccessory } from './somneoMomentarySwitchAccessory';

export class SomneoWakeAlarmDismissSwitchAccessory extends SomneoMomentarySwitchAccessory {

  protected getName(): string {
    return `${this.somneoClock.Name} ${SomneoConstants.SWITCH_WAKE_ALARM_DISMISS}`;
  }

  protected triggerMomentaryAction(): Promise<void> {
    return this.somneoClock.SomneoService.dismissWakeAlarm();
  }
}
