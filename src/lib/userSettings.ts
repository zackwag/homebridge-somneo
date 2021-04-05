import { PlatformConfig } from 'homebridge';
import { PLUGIN_NAME } from '../settings';
import { SomneoPlatform } from '../somneoPlatform';
import { SomneoClock } from './somneoClock';
export class UserSettings {

  private static readonly DEFAULT_POLLING_SECONDS = 30;

  public PluginName = PLUGIN_NAME;
  public PollingMilliSeconds = (UserSettings.DEFAULT_POLLING_SECONDS * 1000);
  public SomneoClocks: SomneoClock[] = [];

  private config : PlatformConfig;

  constructor(
    private platform: SomneoPlatform,
  ) {
    this.config = this.platform.config;

    this.buildName();
    this.buildSomneoClocks();
    this.buildPollingMilliSeconds();
  }

  private buildName() {

    if (this.config.name === undefined) {
      return;
    }

    this.PluginName = this.config.name;
  }

  private buildSomneoClocks() {

    if (this.config.somneos === undefined || this.config.somneos.length === 0) {
      return;
    }

    for (const somneoConfig of this.config.somneos) {
      const somneoClock = SomneoClock.create(this.platform.log, somneoConfig);

      // If SomneoClock is undefined, it was misconfigured. Just skip it
      if (somneoClock !== undefined) {
        this.SomneoClocks.push(somneoClock);
      }
    }
  }

  private buildPollingMilliSeconds() {

    if (this.config.pollingSeconds === undefined) {
      return;
    }
    // If the user has not specified a polling interval, default to 30s (in milliseconds)
    this.PollingMilliSeconds = (this.config.pollingSeconds * 1000);
  }
}
