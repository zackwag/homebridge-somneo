import { createMockPlatform, createMockSomneoClock } from './testMocks';
import { SomneoMainLightAccessory } from './somneoMainLightAccessory';

describe('SomneoMainLightAccessory', () => {
  describe('updateValues', () => {
    it('adopts the polled on/off state and converts the Philips brightness to a percentage', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.getLightSettings as jest.Mock).mockResolvedValue({ onoff: true, ltlvl: 20 });
      const accessory = new SomneoMainLightAccessory(createMockPlatform(), clock);

      await accessory.updateValues();

      await expect(accessory.getOn()).resolves.toBe(true);
      await expect(accessory.getLightBrightness()).resolves.toBe(80);
    });
  });

  describe('setLightBrightness', () => {
    it('sends the raw percentage to the service (Philips conversion happens in SomneoService)', async () => {
      const clock = createMockSomneoClock();
      const accessory = new SomneoMainLightAccessory(createMockPlatform(), clock);

      await accessory.setLightBrightness(80);

      expect(clock.SomneoService.updateMainLightBrightness).toHaveBeenCalledWith(80);
      await expect(accessory.getLightBrightness()).resolves.toBe(80);
    });

    it('is a no-op when already at the requested brightness', async () => {
      const clock = createMockSomneoClock();
      const accessory = new SomneoMainLightAccessory(createMockPlatform(), clock);

      await accessory.setLightBrightness(0); // brightness starts undefined, which defaults to 0

      expect(clock.SomneoService.updateMainLightBrightness).not.toHaveBeenCalled();
    });

    it('propagates a HapStatusError when the brightness write fails', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.updateMainLightBrightness as jest.Mock).mockRejectedValue(new Error('device unreachable'));
      const accessory = new SomneoMainLightAccessory(createMockPlatform(), clock);

      await expect(accessory.setLightBrightness(50)).rejects.toThrow('HapStatusError');
    });
  });

  describe('setOn', () => {
    it('turns off the night light, RelaxBreathe, and sunset switches when turned on', async () => {
      const platform = createMockPlatform();
      const clock = createMockSomneoClock();
      const host = clock.SomneoService.Host;

      const nightLight = { turnOff: jest.fn() };
      const relaxBreatheSwitch = { turnOff: jest.fn() };
      const sunsetSwitch = { turnOff: jest.fn() };
      platform.HostNightLightMap.set(host, nightLight);
      platform.HostRelaxBreatheSwitchMap.set(host, relaxBreatheSwitch);
      platform.HostSunsetSwitchMap.set(host, sunsetSwitch);

      const accessory = new SomneoMainLightAccessory(platform, clock);
      await accessory.setOn(true);

      expect(nightLight.turnOff).toHaveBeenCalled();
      expect(relaxBreatheSwitch.turnOff).toHaveBeenCalled();
      expect(sunsetSwitch.turnOff).toHaveBeenCalled();
    });
  });
});
