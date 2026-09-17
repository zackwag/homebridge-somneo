import { SomneoPlatform } from '../somneoPlatform';
import { UserSettings } from './userSettings';

function createMockPlatform(config: Record<string, unknown>): SomneoPlatform {
  return {
    config,
    log: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  } as unknown as SomneoPlatform;
}

describe('UserSettings.create', () => {
  it('defaults the platform name when unset', () => {
    const settings = UserSettings.create(createMockPlatform({}));
    expect(settings.PlatformName).toBe('Homebridge Somneo');
  });

  it('uses a configured platform name', () => {
    const settings = UserSettings.create(createMockPlatform({ name: 'My Somneo Platform' }));
    expect(settings.PlatformName).toBe('My Somneo Platform');
  });

  it('defaults polling to 30s when unset', () => {
    const settings = UserSettings.create(createMockPlatform({}));
    expect(settings.PollingMilliSeconds).toBe(30_000);
  });

  it('uses a configured polling interval', () => {
    const settings = UserSettings.create(createMockPlatform({ pollingSeconds: 10 }));
    expect(settings.PollingMilliSeconds).toBe(10_000);
  });

  it('falls back to 30s when pollingSeconds is explicitly 0 (regression: would otherwise hammer the device)', () => {
    const settings = UserSettings.create(createMockPlatform({ pollingSeconds: 0 }));
    expect(settings.PollingMilliSeconds).toBe(30_000);
  });

  it('falls back to 30s when pollingSeconds is negative', () => {
    const settings = UserSettings.create(createMockPlatform({ pollingSeconds: -5 }));
    expect(settings.PollingMilliSeconds).toBe(30_000);
  });

  it('returns an empty clock list when somneos is unset', () => {
    const settings = UserSettings.create(createMockPlatform({}));
    expect(settings.SomneoClocks).toEqual([]);
  });

  it('builds a clock for each valid entry and silently drops invalid ones', () => {
    const settings = UserSettings.create(createMockPlatform({
      somneos: [
        { name: 'Bedroom', host: '192.168.1.50' },
        { name: 'Missing Host' }, // invalid: no host
        { name: 'Guest Room', host: '192.168.1.51' },
      ],
    }));

    expect(settings.SomneoClocks).toHaveLength(2);
    expect(settings.SomneoClocks.map(clock => clock.Name)).toEqual(['Bedroom', 'Guest Room']);
  });
});
