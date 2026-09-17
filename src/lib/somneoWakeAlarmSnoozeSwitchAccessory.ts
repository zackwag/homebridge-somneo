import { SomneoConstants } from './somneoConstants';
import { SomneoMomentarySwitchAccessory } from './somneoMomentarySwitchAccessory';

export class SomneoWakeAlarmSnoozeSwitchAccessory extends SomneoMomentarySwitchAccessory {

  protected getName(): string {
    return `${this.somneoClock.Name} ${SomneoConstants.SWITCH_WAKE_ALARM_SNOOZE}`;
  }

  protected triggerMomentaryAction(): Promise<void> {
    return this.somneoClock.SomneoService.snoozeWakeAlarm();
  }
}
