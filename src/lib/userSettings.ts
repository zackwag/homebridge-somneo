import { PlatformConfig } from 'homebridge';
import { PLUGIN_NAME } from '../settings';
import { SomneoPlatform } from '../somneoPlatform';
import { SomneoClock } from './somneoClock';
import { SomneoConstants } from './somneoConstants';
export class UserSettings {

  public PluginName = PLUGIN_NAME;
  public PollingMilliSeconds: number | undefined;
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

    let pollingSeconds = SomneoConstants.DEFAULT_POLLING_SECONDS;

    // If the user has not specified a polling interval, default to 30s
    if (this.config.pollingSeconds !== undefined) {
      pollingSeconds = this.config.pollingSeconds;
    }

    this.PollingMilliSeconds = (pollingSeconds * 1000);
  }
}
