import { createMockPlatform, createMockSomneoClock } from './testMocks';
import { SomneoWakeAlarmDismissSwitchAccessory } from './somneoWakeAlarmDismissSwitchAccessory';
import { SomneoWakeAlarmSnoozeSwitchAccessory } from './somneoWakeAlarmSnoozeSwitchAccessory';

describe('Momentary wake alarm switches', () => {
  describe('SomneoWakeAlarmSnoozeSwitchAccessory', () => {
    it('always reports off', async () => {
      const accessory = new SomneoWakeAlarmSnoozeSwitchAccessory(createMockPlatform(), createMockSomneoClock());
      await expect(accessory.getOn()).resolves.toBe(false);
    });

    it('triggers the snooze action and resets back to off when turned on', async () => {
      const clock = createMockSomneoClock();
      const accessory = new SomneoWakeAlarmSnoozeSwitchAccessory(createMockPlatform(), clock);

      await accessory.setOn(true);

      expect(clock.SomneoService.snoozeWakeAlarm).toHaveBeenCalled();
      await expect(accessory.getOn()).resolves.toBe(false);
    });

    it('does nothing when set to false (it never reads as on to begin with)', async () => {
      const clock = createMockSomneoClock();
      const accessory = new SomneoWakeAlarmSnoozeSwitchAccessory(createMockPlatform(), clock);

      await accessory.setOn(false);

      expect(clock.SomneoService.snoozeWakeAlarm).not.toHaveBeenCalled();
    });

    it('still resets to off and propagates a HapStatusError if the action fails', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.snoozeWakeAlarm as jest.Mock).mockRejectedValue(new Error('device unreachable'));
      const accessory = new SomneoWakeAlarmSnoozeSwitchAccessory(createMockPlatform(), clock);

      await expect(accessory.setOn(true)).rejects.toThrow('HapStatusError');
      await expect(accessory.getOn()).resolves.toBe(false);
    });
  });

  describe('SomneoWakeAlarmDismissSwitchAccessory', () => {
    it('triggers the dismiss action when turned on', async () => {
      const clock = createMockSomneoClock();
      const accessory = new SomneoWakeAlarmDismissSwitchAccessory(createMockPlatform(), clock);

      await accessory.setOn(true);

      expect(clock.SomneoService.dismissWakeAlarm).toHaveBeenCalled();
    });
  });
});
