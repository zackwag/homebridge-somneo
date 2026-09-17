import { RequestedAccessory } from './requestedAccessory';
import { SomneoClock } from './somneoClock';
import { SomneoConfig } from './somneoConfigDataTypes';

function createMockLogger() {
  return { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(), success: jest.fn(), log: jest.fn() };
}

describe('SomneoClock.create', () => {
  it('rejects a config missing host', () => {
    const log = createMockLogger();
    const clock = SomneoClock.create(log, { name: 'Bedroom' });

    expect(clock).toBeUndefined();
    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('missing a required \'host\''));
  });

  it('rejects a config with an invalid IPv4 host', () => {
    const log = createMockLogger();
    const clock = SomneoClock.create(log, { name: 'Bedroom', host: 'not-an-ip' });

    expect(clock).toBeUndefined();
    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('not a valid IPv4 address'));
  });

  it('rejects a config missing name (the root cause behind #34)', () => {
    const log = createMockLogger();
    const clock = SomneoClock.create(log, { host: '192.168.1.50' });

    expect(clock).toBeUndefined();
    expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('missing a required \'name\''));
  });

  it('builds a clock for a minimal valid config', () => {
    const clock = SomneoClock.create(createMockLogger(), { name: 'Bedroom', host: '192.168.1.50' });

    expect(clock).toBeDefined();
    expect(clock?.Name).toBe('Bedroom');
    expect(clock?.SomneoService.Host).toBe('192.168.1.50');
  });

  describe('default accessory selection when sections are omitted', () => {
    it('requests all sensors, lights, and the default switches, but not wake alarm', () => {
      const clock = SomneoClock.create(createMockLogger(), { name: 'Bedroom', host: '192.168.1.50' });

      expect(clock?.RequestedAccessories).toEqual(expect.arrayContaining([
        RequestedAccessory.SENSOR_HUMIDITY,
        RequestedAccessory.SENSOR_LUX,
        RequestedAccessory.SENSOR_TEMPERATURE,
        RequestedAccessory.LIGHT_MAIN,
        RequestedAccessory.LIGHT_NIGHT_LIGHT,
        RequestedAccessory.SWITCH_RELAXBREATHE,
        RequestedAccessory.SWITCH_SUNSET,
        RequestedAccessory.AUDIO,
      ]));
      expect(clock?.RequestedAccessories).not.toContain(RequestedAccessory.SWITCH_WAKE_ALARM);
    });
  });

  describe('per-accessory isEnabled toggles', () => {
    const baseConfig: SomneoConfig = { name: 'Bedroom', host: '192.168.1.50' };

    it('excludes a sensor when isEnabled is explicitly false', () => {
      const clock = SomneoClock.create(createMockLogger(), {
        ...baseConfig,
        sensors: { humidity: { isEnabled: false } },
      });

      expect(clock?.RequestedAccessories).not.toContain(RequestedAccessory.SENSOR_HUMIDITY);
    });

    it('includes a sensor whose section is present but isEnabled is unset (defaults true)', () => {
      const clock = SomneoClock.create(createMockLogger(), {
        ...baseConfig,
        sensors: { humidity: {} },
      });

      expect(clock?.RequestedAccessories).toContain(RequestedAccessory.SENSOR_HUMIDITY);
    });

    it('still includes a sibling sensor not mentioned within an otherwise-present sensors section', () => {
      const clock = SomneoClock.create(createMockLogger(), {
        ...baseConfig,
        sensors: { humidity: { isEnabled: true } },
      });

      // Each sub-key defaults independently; only an explicit isEnabled: false excludes it.
      expect(clock?.RequestedAccessories).toContain(RequestedAccessory.SENSOR_LUX);
      expect(clock?.RequestedAccessories).toContain(RequestedAccessory.SENSOR_TEMPERATURE);
    });
  });

  describe('wake alarm opt-in behavior', () => {
    const baseConfig: SomneoConfig = { name: 'Bedroom', host: '192.168.1.50' };

    it('requests nothing when the wakeAlarm section is entirely absent', () => {
      const clock = SomneoClock.create(createMockLogger(), baseConfig);

      expect(clock?.RequestedAccessories).not.toContain(RequestedAccessory.SWITCH_WAKE_ALARM);
      expect(clock?.RequestedAccessories).not.toContain(RequestedAccessory.SWITCH_WAKE_ALARM_SNOOZE);
      expect(clock?.RequestedAccessories).not.toContain(RequestedAccessory.SWITCH_WAKE_ALARM_DISMISS);
    });

    it('requests nothing when the wakeAlarm section is present but every flag is unset', () => {
      const clock = SomneoClock.create(createMockLogger(), { ...baseConfig, switches: { wakeAlarm: {} } });

      expect(clock?.RequestedAccessories).not.toContain(RequestedAccessory.SWITCH_WAKE_ALARM);
    });

    it('requests only the switches explicitly set to true', () => {
      const clock = SomneoClock.create(createMockLogger(), {
        ...baseConfig,
        switches: { wakeAlarm: { isEnabled: true, showSnoozeSwitch: true } },
      });

      expect(clock?.RequestedAccessories).toContain(RequestedAccessory.SWITCH_WAKE_ALARM);
      expect(clock?.RequestedAccessories).toContain(RequestedAccessory.SWITCH_WAKE_ALARM_SNOOZE);
      expect(clock?.RequestedAccessories).not.toContain(RequestedAccessory.SWITCH_WAKE_ALARM_DISMISS);
    });
  });

  describe('RelaxBreathe preference building', () => {
    it('falls back to defaults when the section is absent', () => {
      const clock = SomneoClock.create(createMockLogger(), { name: 'Bedroom', host: '192.168.1.50' });

      expect(clock?.RelaxBreatheProgramPreferences).toEqual({
        BreathsPerMin: 1,
        Duration: 10,
        GuidanceType: 1,
        LightIntensity: 20,
        Volume: 12,
      });
    });

    it('converts breathsPerMin (BPM) to the Philips enum value (BPM - 3)', () => {
      const clock = SomneoClock.create(createMockLogger(), {
        name: 'Bedroom',
        host: '192.168.1.50',
        switches: { relaxBreathe: { breathsPerMin: 7 } },
      });

      expect(clock?.RelaxBreatheProgramPreferences.BreathsPerMin).toBe(4);
    });

    it('converts and clamps lightIntensity percentages to the Philips 1-25 range', () => {
      const clock = SomneoClock.create(createMockLogger(), {
        name: 'Bedroom',
        host: '192.168.1.50',
        switches: { relaxBreathe: { lightIntensity: 200 } },
      });

      expect(clock?.RelaxBreatheProgramPreferences.LightIntensity).toBe(25);
    });
  });

  describe('Sunset preference building', () => {
    it('falls back to defaults when the section is absent', () => {
      const clock = SomneoClock.create(createMockLogger(), { name: 'Bedroom', host: '192.168.1.50' });

      expect(clock?.SunsetProgramPreferences).toEqual({
        Duration: 30,
        LightIntensity: 20,
        ColorScheme: '0',
        AmbientSounds: '1',
        Volume: 12,
      });
    });

    it('uses configured duration/colorScheme/ambientSounds verbatim', () => {
      const clock = SomneoClock.create(createMockLogger(), {
        name: 'Bedroom',
        host: '192.168.1.50',
        switches: { sunset: { duration: 45, colorScheme: '2', ambientSounds: '3' } },
      });

      expect(clock?.SunsetProgramPreferences.Duration).toBe(45);
      expect(clock?.SunsetProgramPreferences.ColorScheme).toBe('2');
      expect(clock?.SunsetProgramPreferences.AmbientSounds).toBe('3');
    });
  });

  describe('Audio preference building', () => {
    it('defaults to FM Preset 1 when audio is enabled but favoriteInput is unset', () => {
      const clock = SomneoClock.create(createMockLogger(), { name: 'Bedroom', host: '192.168.1.50' });

      expect(clock?.AudioPreferences).toEqual({ FavoriteChannel: '1', FavoriteSource: 'fmr' });
    });

    it('sets the aux source when favoriteInput is the AUX input number (6)', () => {
      const clock = SomneoClock.create(createMockLogger(), {
        name: 'Bedroom',
        host: '192.168.1.50',
        audio: { favoriteInput: 6 },
      });

      expect(clock?.AudioPreferences.FavoriteSource).toBe('aux');
    });

    it('sets the FM radio source/channel for a non-AUX favoriteInput', () => {
      const clock = SomneoClock.create(createMockLogger(), {
        name: 'Bedroom',
        host: '192.168.1.50',
        audio: { favoriteInput: 3 },
      });

      expect(clock?.AudioPreferences).toEqual({ FavoriteChannel: '3', FavoriteSource: 'fmr' });
    });
  });
});
