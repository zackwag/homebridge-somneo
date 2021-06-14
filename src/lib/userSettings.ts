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

    // If the user has not specified a polling interval, default to 30s
    const pollingSeconds = config.pollingSeconds ?? SomneoConstants.DEFAULT_POLLING_SECONDS;
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
<<<<<<< Updated upstream
    return config.name ?? SomneoConstants.DEFAULT_PLATFORM_NAME;
=======
    return config.name ?? SomneoConstants.DEFAULT_PLAFORM_NAME;
>>>>>>> Stashed changes
  }
}
