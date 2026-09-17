import { Logger, PlatformConfig } from 'homebridge';
import { SomneoPlatform } from '../somneoPlatform';
import { SomneoClock } from './somneoClock';
import { SomneoConfig } from './somneoConfigDataTypes';
import { SomneoConstants } from './somneoConstants';
export class UserSettings {

  private constructor(
    public PlatformName: string,
    public SomneoClocks: SomneoClock[],
    public PollingMilliSeconds: number,
  ) { }

  static create(platform: SomneoPlatform): UserSettings {

    const config = platform.config;
    const platformName = UserSettings.buildPlatformName(config);
    const somneoClocks = UserSettings.buildSomneoClocks(platform.log, config);
    const pollingMilliseconds = UserSettings.buildPollingMilliSeconds(config);
    return new UserSettings(platformName, somneoClocks, pollingMilliseconds);
  }

  private static buildPollingMilliSeconds(config: PlatformConfig): number {

    // If the user has not specified a polling interval (or specified an invalid
    // one, e.g. 0), default to 30s. A 0s interval would otherwise hammer the
    // Somneo device with back-to-back requests as fast as the event loop allows.
    const configuredPollingSeconds = config.pollingSeconds;
    const pollingSeconds = (configuredPollingSeconds === undefined || configuredPollingSeconds <= 0)
      ? SomneoConstants.DEFAULT_POLLING_SECONDS
      : configuredPollingSeconds;
    return pollingSeconds * 1000;
  }

  private static buildSomneoClocks(log: Logger, config: PlatformConfig): SomneoClock[] {

    // If the user has not specified clock configs, default to empty array
    if (config.somneos === undefined || config.somneos.length === 0) {
      return [];
    }

    return config.somneos
      .map((somneoConfig: SomneoConfig) => SomneoClock.create(log, somneoConfig))
      .filter((somneoClock: SomneoClock) => somneoClock !== undefined);
  }

  private static buildPlatformName(config: PlatformConfig): string {

    // If the user has not specified a platform name, default to Homebridge Somneo
    return config.name ?? SomneoConstants.DEFAULT_PLATFORM_NAME;
  }
}
