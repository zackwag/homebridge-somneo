import { createMockPlatform, createMockSomneoClock } from './testMocks';
import { SomneoAudioAccessory } from './somneoAudioAccessory';

function createMockAccessory(displayName = 'Bedroom Audio') {
  const service: any = {
    displayName,
    setCharacteristic: jest.fn().mockReturnThis(),
    getCharacteristic: jest.fn(() => ({
      onSet: jest.fn().mockReturnThis(),
      onGet: jest.fn().mockReturnThis(),
      updateValue: jest.fn().mockReturnThis(),
    })),
    addLinkedService: jest.fn(),
  };

  return {
    displayName,
    getService: jest.fn(() => service),
    addService: jest.fn(() => service),
  } as any;
}

describe('SomneoAudioAccessory', () => {
  describe('setActive', () => {
    it('falls back to the configured favorite input when turned on before the first poll completes', async () => {
      const clock = createMockSomneoClock({
        AudioPreferences: { FavoriteSource: 'fmr', FavoriteChannel: '2' },
      });
      const accessory = new SomneoAudioAccessory(createMockAccessory(), createMockPlatform(), clock);

      await accessory.setActive(true);

      expect(clock.SomneoService.turnOnAudioDevice).toHaveBeenCalledWith('fmr', '2');
    });

    it('uses the source/channel learned from a poll while active, instead of the favorite', async () => {
      const clock = createMockSomneoClock({
        AudioPreferences: { FavoriteSource: 'fmr', FavoriteChannel: '1' },
      });
      const getPlaySettings = clock.SomneoService.getPlaySettings as jest.Mock;
      const accessory = new SomneoAudioAccessory(createMockAccessory(), createMockPlatform(), clock);

      // The very first poll always seeds source/channel from the favorite,
      // regardless of what the device reports (see updateActiveInput's comment).
      getPlaySettings.mockResolvedValueOnce({ onoff: false });
      await accessory.updateValues();

      // A later poll while active is what actually updates the learned source/channel.
      getPlaySettings.mockResolvedValueOnce({ onoff: true, snddv: 'fmr', sndch: '4' });
      await accessory.updateValues();

      await accessory.setActive(false);
      await accessory.setActive(true);

      expect(clock.SomneoService.turnOnAudioDevice).toHaveBeenCalledWith('fmr', '4');
    });

    it('turns off audio when set to false', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.getPlaySettings as jest.Mock).mockResolvedValue({ onoff: true, snddv: 'fmr', sndch: '1' });
      const accessory = new SomneoAudioAccessory(createMockAccessory(), createMockPlatform(), clock);
      await accessory.updateValues();

      await accessory.setActive(false);

      expect(clock.SomneoService.turnOffAudioDevice).toHaveBeenCalled();
    });

    it('propagates a HapStatusError when the device write fails', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.turnOnAudioDevice as jest.Mock).mockRejectedValue(new Error('device unreachable'));
      const accessory = new SomneoAudioAccessory(createMockAccessory(), createMockPlatform(), clock);

      await expect(accessory.setActive(true)).rejects.toThrow('HapStatusError');
    });

    it('turns off RelaxBreathe and sunset switches when turned on', async () => {
      const platform = createMockPlatform();
      const clock = createMockSomneoClock();
      const host = clock.SomneoService.Host;
      const relaxBreatheSwitch = { turnOff: jest.fn() };
      const sunsetSwitch = { turnOff: jest.fn() };
      platform.HostRelaxBreatheSwitchMap.set(host, relaxBreatheSwitch);
      platform.HostSunsetSwitchMap.set(host, sunsetSwitch);

      const accessory = new SomneoAudioAccessory(createMockAccessory(), platform, clock);
      await accessory.setActive(true);

      expect(relaxBreatheSwitch.turnOff).toHaveBeenCalled();
      expect(sunsetSwitch.turnOff).toHaveBeenCalled();
    });
  });

  describe('setVolumeSelector', () => {
    it('does nothing when no source is active yet', async () => {
      const clock = createMockSomneoClock();
      const accessory = new SomneoAudioAccessory(createMockAccessory(), createMockPlatform(), clock);

      await accessory.setVolumeSelector(0);

      expect(clock.SomneoService.updateAudioDeviceVolume).not.toHaveBeenCalled();
    });

    it('raises the volume by one step when given selector value 0', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.getPlaySettings as jest.Mock).mockResolvedValue({ onoff: true, snddv: 'fmr', sndch: '1', sdvol: 10 });
      const accessory = new SomneoAudioAccessory(createMockAccessory(), createMockPlatform(), clock);
      await accessory.updateValues();

      await accessory.setVolumeSelector(0);

      expect(clock.SomneoService.updateAudioDeviceVolume).toHaveBeenCalledWith(11);
    });

    it('propagates a HapStatusError when the volume write fails (fire-and-forget regression)', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.getPlaySettings as jest.Mock).mockResolvedValue({ onoff: true, snddv: 'fmr', sndch: '1', sdvol: 10 });
      (clock.SomneoService.updateAudioDeviceVolume as jest.Mock).mockRejectedValue(new Error('device unreachable'));
      const accessory = new SomneoAudioAccessory(createMockAccessory(), createMockPlatform(), clock);
      await accessory.updateValues();

      await expect(accessory.setVolumeSelector(0)).rejects.toThrow('HapStatusError');
    });
  });

  describe('setActiveIdentifier', () => {
    it('propagates a HapStatusError when the input write fails (fire-and-forget regression)', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.updateAudioDeviceInput as jest.Mock).mockRejectedValue(new Error('device unreachable'));
      const accessory = new SomneoAudioAccessory(createMockAccessory(), createMockPlatform(), clock);

      await expect(accessory.setActiveIdentifier(3)).rejects.toThrow('HapStatusError');
    });

    it('switches to the AUX input', async () => {
      const clock = createMockSomneoClock();
      const accessory = new SomneoAudioAccessory(createMockAccessory(), createMockPlatform(), clock);

      await accessory.setActiveIdentifier(6);

      expect(clock.SomneoService.updateAudioDeviceInput).toHaveBeenCalledWith(6);
      await expect(accessory.getActiveIdentifier()).resolves.toBe(6);
    });
  });
});
