import { createMockPlatform, createMockSomneoClock } from './testMocks';
import { SomneoWakeAlarmSwitchAccessory } from './somneoWakeAlarmSwitchAccessory';

describe('SomneoWakeAlarmSwitchAccessory', () => {
  it('adopts the polled enabled state and caches the profile number', async () => {
    const clock = createMockSomneoClock();
    (clock.SomneoService.getWakeAlarmSettings as jest.Mock).mockResolvedValue({ prfnr: 2, prfen: true });
    const accessory = new SomneoWakeAlarmSwitchAccessory(createMockPlatform(), clock);

    await accessory.updateValues();
    await expect(accessory.getOn()).resolves.toBe(true);

    // Toggling now should reuse the cached profile number rather than re-fetching.
    await accessory.setOn(false);
    expect(clock.SomneoService.getWakeAlarmSettings).toHaveBeenCalledTimes(1);
    expect(clock.SomneoService.updateWakeAlarmEnabled).toHaveBeenCalledWith(2, false);
  });

  it('fetches the profile number on demand if toggled before the first poll completes', async () => {
    const clock = createMockSomneoClock();
    (clock.SomneoService.getWakeAlarmSettings as jest.Mock).mockResolvedValue({ prfnr: 3, prfen: false });
    const accessory = new SomneoWakeAlarmSwitchAccessory(createMockPlatform(), clock);

    await accessory.setOn(true);

    expect(clock.SomneoService.getWakeAlarmSettings).toHaveBeenCalledTimes(1);
    expect(clock.SomneoService.updateWakeAlarmEnabled).toHaveBeenCalledWith(3, true);
  });

  it('throws if the profile number is still unavailable after fetching', async () => {
    const clock = createMockSomneoClock();
    (clock.SomneoService.getWakeAlarmSettings as jest.Mock).mockResolvedValue({});
    const accessory = new SomneoWakeAlarmSwitchAccessory(createMockPlatform(), clock);

    await expect(accessory.setOn(true)).rejects.toThrow('HapStatusError');
    expect(clock.SomneoService.updateWakeAlarmEnabled).not.toHaveBeenCalled();
  });
});
