import { createMockPlatform, createMockSomneoClock } from './testMocks';
import { SomneoSunsetSwitchAccessory } from './somneoSunsetSwitchAccessory';

describe('SomneoSunsetSwitchAccessory', () => {
  it('names itself after the clock and the sunset program', () => {
    const clock = createMockSomneoClock({ Name: 'Bedroom' });
    const accessory = new SomneoSunsetSwitchAccessory(createMockPlatform(), clock);

    expect(accessory.name).toBe('Bedroom Sunset Program');
  });

  describe('updateValues', () => {
    it('adopts the polled on/off state', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.getSunsetProgram as jest.Mock).mockResolvedValue({ onoff: true });
      const accessory = new SomneoSunsetSwitchAccessory(createMockPlatform(), clock);

      await accessory.updateValues();

      await expect(accessory.getOn()).resolves.toBe(true);
    });

    it('sets hasGetError and makes getOn reject when polling fails', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.getSunsetProgram as jest.Mock).mockRejectedValue(new Error('network down'));
      const accessory = new SomneoSunsetSwitchAccessory(createMockPlatform(), clock);

      await accessory.updateValues();

      await expect(accessory.getOn()).rejects.toThrow();
    });
  });

  describe('setOn', () => {
    it('turns the sunset program on using the clock\'s configured preferences', async () => {
      const clock = createMockSomneoClock();
      const accessory = new SomneoSunsetSwitchAccessory(createMockPlatform(), clock);

      await accessory.setOn(true);

      expect(clock.SomneoService.turnOnSunsetProgram).toHaveBeenCalledWith(clock.SunsetProgramPreferences);
      await expect(accessory.getOn()).resolves.toBe(true);
    });

    it('turns the sunset program off', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.getSunsetProgram as jest.Mock).mockResolvedValue({ onoff: true });
      const accessory = new SomneoSunsetSwitchAccessory(createMockPlatform(), clock);
      await accessory.updateValues();

      await accessory.setOn(false);

      expect(clock.SomneoService.turnOffSunsetProgram).toHaveBeenCalled();
    });

    it('is a no-op when already in the requested state', async () => {
      const clock = createMockSomneoClock();
      const accessory = new SomneoSunsetSwitchAccessory(createMockPlatform(), clock);

      await accessory.setOn(false); // isOn starts undefined, which getOn treats as false (DEFAULT_BINARY_STATE)

      expect(clock.SomneoService.turnOffSunsetProgram).not.toHaveBeenCalled();
      expect(clock.SomneoService.turnOnSunsetProgram).not.toHaveBeenCalled();
    });

    it('propagates a HapStatusError when the device write fails (regression: this must not silently resolve)', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.turnOnSunsetProgram as jest.Mock).mockRejectedValue(new Error('device unreachable'));
      const accessory = new SomneoSunsetSwitchAccessory(createMockPlatform(), clock);

      await expect(accessory.setOn(true)).rejects.toThrow('HapStatusError');
    });

    it('turns off the main light, night light, RelaxBreathe, and audio when turned on', async () => {
      const platform = createMockPlatform();
      const clock = createMockSomneoClock();
      const host = clock.SomneoService.Host;

      const mainLight = { turnOff: jest.fn() };
      const nightLight = { turnOff: jest.fn() };
      const relaxBreatheSwitch = { turnOff: jest.fn() };
      const audioDevice = { turnOff: jest.fn() };
      platform.HostMainLightMap.set(host, mainLight);
      platform.HostNightLightMap.set(host, nightLight);
      platform.HostRelaxBreatheSwitchMap.set(host, relaxBreatheSwitch);
      platform.HostAudioMap.set(host, audioDevice);

      const accessory = new SomneoSunsetSwitchAccessory(platform, clock);
      await accessory.setOn(true);

      expect(mainLight.turnOff).toHaveBeenCalled();
      expect(nightLight.turnOff).toHaveBeenCalled();
      expect(relaxBreatheSwitch.turnOff).toHaveBeenCalled();
      expect(audioDevice.turnOff).toHaveBeenCalled();
    });
  });
});
