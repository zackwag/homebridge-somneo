import { SomneoPlatform } from '../somneoPlatform';
import { RequestedAccessory } from './requestedAccessory';
import { AudioPreferences, RelaxeBreatheProgramPreferences, SomneoClock, SunsetProgramPreferences } from './somneoClock';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';

// A self-referential proxy: any property access (including nested ones, e.g.
// Characteristic.Active.ACTIVE, or calling it as a constructor) returns another
// proxy of the same kind. Good enough to satisfy accessory constructors that
// read characteristic/category identifiers without enumerating hap-nodejs's
// actual namespace.
function createDeepProxy(name = 'mock'): any {
  const target: any = function () {};
  target.displayName = name;
  return new Proxy(target, {
    get: (currentTarget, prop) => {
      if (typeof prop === 'symbol' || prop === 'then' || prop in currentTarget) {
        return currentTarget[prop];
      }
      return createDeepProxy(`${name}.${String(prop)}`);
    },
  });
}

function createMockCharacteristic(): any {
  const characteristic: any = {};
  characteristic.onSet = jest.fn().mockReturnValue(characteristic);
  characteristic.onGet = jest.fn().mockReturnValue(characteristic);
  characteristic.updateValue = jest.fn().mockReturnValue(characteristic);
  characteristic.setProps = jest.fn().mockReturnValue(characteristic);
  return characteristic;
}

function createMockService(displayName = 'Mock Service'): any {
  const service: any = { displayName };
  service.getCharacteristic = jest.fn(() => createMockCharacteristic());
  service.setCharacteristic = jest.fn().mockReturnValue(service);
  service.addLinkedService = jest.fn().mockReturnValue(service);
  return service;
}

// platform.Service.Switch, platform.Service.Television, etc. are all
// constructed via `new`, so this needs to be a class whose instances look
// like a mock service.
class MockServiceConstructor {
  constructor(displayName = 'Mock Service') {
    return createMockService(displayName);
  }
}

function createMockPlatformAccessory(displayName = 'Mock Accessory'): any {
  return {
    displayName,
    getService: jest.fn(() => createMockService(displayName)),
    addService: jest.fn(() => createMockService(displayName)),
  };
}

export function createMockPlatform(): SomneoPlatform {
  const platform: any = {
    Service: new Proxy({}, { get: () => MockServiceConstructor }),
    Characteristic: createDeepProxy('Characteristic'),
    log: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
    api: {
      hap: {
        HapStatusError: class MockHapStatusError extends Error {
          hapStatus: number;

          constructor(hapStatus: number) {
            super(`HapStatusError: ${hapStatus}`);
            this.hapStatus = hapStatus;
          }
        },
        HAPStatus: { SERVICE_COMMUNICATION_FAILURE: -70402 },
        uuid: { generate: jest.fn(() => 'mock-uuid') },
        Categories: createDeepProxy('Categories'),
      },
      platformAccessory: jest.fn((displayName: string) => createMockPlatformAccessory(displayName)),
      publishExternalAccessories: jest.fn(),
    },
    HostMainLightMap: new Map(),
    HostNightLightMap: new Map(),
    HostRelaxBreatheSwitchMap: new Map(),
    HostSunsetSwitchMap: new Map(),
    HostAudioMap: new Map(),
  };

  return platform as SomneoPlatform;
}

export function createMockSomneoService(overrides: Record<string, unknown> = {}): SomneoService {
  const service: any = {
    Host: '192.168.1.100',
    getPlaySettings: jest.fn(),
    getLightSettings: jest.fn(),
    getRelaxBreatheProgramSettings: jest.fn(),
    getSensorReadings: jest.fn(),
    getSunsetProgram: jest.fn(),
    getWakeAlarmSettings: jest.fn(),
    turnOffAudioDevice: jest.fn().mockResolvedValue(undefined),
    turnOnAudioDevice: jest.fn().mockResolvedValue(undefined),
    updateAudioDeviceInput: jest.fn().mockResolvedValue(undefined),
    updateAudioDeviceVolume: jest.fn().mockResolvedValue(undefined),
    turnOffMainLight: jest.fn().mockResolvedValue(undefined),
    turnOnMainLight: jest.fn().mockResolvedValue(undefined),
    updateMainLightBrightness: jest.fn().mockResolvedValue(undefined),
    turnOffNightLight: jest.fn().mockResolvedValue(undefined),
    turnOnNightLight: jest.fn().mockResolvedValue(undefined),
    turnOffRelaxBreatheProgram: jest.fn().mockResolvedValue(undefined),
    turnOnRelaxBreatheProgram: jest.fn().mockResolvedValue(undefined),
    turnOffSunsetProgram: jest.fn().mockResolvedValue(undefined),
    turnOnSunsetProgram: jest.fn().mockResolvedValue(undefined),
    updateWakeAlarmEnabled: jest.fn().mockResolvedValue(undefined),
    snoozeWakeAlarm: jest.fn().mockResolvedValue(undefined),
    dismissWakeAlarm: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };

  return service as SomneoService;
}

export function createMockSomneoClock(overrides: Record<string, unknown> = {}): SomneoClock {
  const clock: any = {
    Name: 'Test Somneo',
    SomneoService: createMockSomneoService(),
    RequestedAccessories: [] as RequestedAccessory[],
    RelaxBreatheProgramPreferences: SomneoConstants.DEFAULT_RELAX_BREATHE_PROGRAM_PREFS as RelaxeBreatheProgramPreferences,
    SunsetProgramPreferences: SomneoConstants.DEFAULT_SUNSET_PROGRAM_PREFS as SunsetProgramPreferences,
    AudioPreferences: SomneoConstants.DEFAULT_AUDIO_PREFS as AudioPreferences,
    ...overrides,
  };

  return clock as SomneoClock;
}
