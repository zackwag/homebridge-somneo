import { Categories, Service } from 'hap-nodejs';
import { CharacteristicValue } from 'homebridge';
import { PlatformAccessory } from 'homebridge/lib/platformAccessory';
import { SomneoPlatform } from '../somneoPlatform';
import { RequestedAccessory } from './requestedAccessory';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';

export class SomneoAudioAccessory extends PlatformAccessory {

  public static readonly NAME = 'Somneo Audio';

  private activeInput: number | undefined;
  private channel: string | undefined;
  private isActive: boolean | undefined;
  private televisionService: Service;
  private source: string | undefined;
  private somneoService: SomneoService;
  private speakerService: Service;
  private volume: number | undefined;

  constructor(
    private platform: SomneoPlatform,
    public uuid:string,
  ) {
    super(SomneoAudioAccessory.NAME, uuid, Categories.AUDIO_RECEIVER);

    this.somneoService = this.platform.SomneoService;

    // set accessory information
    this.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SomneoConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SomneoConstants.MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.UserSettings.Host);

    this.televisionService = this.addService(this.platform.Service.Television);

    this.televisionService
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, this.displayName)
      .setCharacteristic(this.platform.Characteristic.SleepDiscoveryMode,
        this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

    this.televisionService
      .getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.setActive.bind(this))
      .onGet(this.getActive.bind(this));

    this.televisionService
      .getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
      .onSet(this.setActiveIdentifier.bind(this))
      .onGet(this.getActiveIdentifier.bind(this));

    this.televisionService.getCharacteristic(this.platform.Characteristic.RemoteKey)
      .onSet(this.setRemoteKey.bind(this));

    this.speakerService = this.addService(this.platform.Service.TelevisionSpeaker);

    this.speakerService.getCharacteristic(this.platform.Characteristic.VolumeSelector)
      .onSet(this.setVolumeSelector.bind(this));

    this.speakerService
      .setCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.ACTIVE)
      .setCharacteristic(this.platform.Characteristic.VolumeControlType,
        this.platform.Characteristic.VolumeControlType.ABSOLUTE);


    this.buildInputServices();
    this.updateValues();
  }

  public async updateValues(): Promise<void> {

    await this.somneoService.getPlaySettings().then(playSettings => {
      this.isActive = playSettings.onoff!;
      this.televisionService
        .getCharacteristic(this.platform.Characteristic.Active)
        .updateValue(this.isActive);

      this.volume = playSettings.sdvol!;

      this.updateActiveInput(playSettings.snddv, playSettings.sndch);
    }).catch(err => this.platform.log.error(`Error updating ${this.displayName}, err=${err}`));
  }

  async setVolumeSelector(value: CharacteristicValue): Promise<void> {

    // If source value is not set or its off, just don't set anything
    if (this.source === undefined || this.source === SomneoConstants.SOURCE_OFF) {
      return;
    }

    // If value is 0 it's a raise, if it's 1 it's a lower
    const newVolume = this.getNewVolume(value === 0);

    this.somneoService.modifyPlaySettingsVolume(newVolume).then(() => {
      this.volume = newVolume;
      this.platform.log.info(`Set ${this.displayName} volume ->`, this.volume);
    }).catch(err => this.platform.log.error(`Error setting ${this.displayName} volume to ${newVolume} value=${value}, err=${err}`));
  }

  async getActive(): Promise<CharacteristicValue> {

    if (this.isActive !== undefined) {
      this.platform.log.debug(`Get ${this.displayName} state ->`, this.isActive);
    }

    return (this.isActive || SomneoConstants.DEFAULT_BINARY_STATE);
  }

  async setRemoteKey(value: CharacteristicValue): Promise<void> {
    this.platform.log.debug(`Remote Key Pressed: ${value}`);
  }

  async setActive(value: CharacteristicValue): Promise<void> {

    const boolValue = Boolean(value);
    if (boolValue === (this.isActive || SomneoConstants.DEFAULT_BINARY_STATE)) {
      return;
    }

    if (boolValue) {
      this.turnOffConflictingAccessories();
    }

    (boolValue ? this.platform.SomneoService.modifyPlaySettingsState(true, this.source, this.channel) :
      this.somneoService.modifyPlaySettingsState(false)).then(() => {
      this.isActive = boolValue;
      this.platform.log.info(`Set ${this.displayName} state ->`, this.isActive);

      if (boolValue) {
        this.updateActiveInput();
        this.platform.log.info(`Set ${this.displayName} input ->`, this.activeInput);
      }
    }).catch(err => this.platform.log.error(`Error setting ${this.displayName} state to ${boolValue}, err=${err}`));
  }

  async getActiveIdentifier(): Promise<CharacteristicValue> {

    if (this.activeInput !== undefined) {
      this.platform.log.debug(`Get ${this.displayName} input ->`, this.activeInput);
    }

    return (this.activeInput || SomneoConstants.DEFAULT_ACTIVE_INPUT);
  }

  async setActiveIdentifier(value: CharacteristicValue): Promise<void> {

    const numValue = Number(value);
    if (numValue === (this.activeInput || SomneoConstants.DEFAULT_ACTIVE_INPUT)) {
      return;
    }

    this.platform.SomneoService.modifyPlaySettingsInput(numValue).then(() => {
      this.activeInput = numValue;
      this.platform.log.info(`Set ${this.displayName} input ->`, this.activeInput);

      this.updateChannelAndSource();
    }).catch(err => this.platform.log.error(`Error setting ${this.displayName} input to ${numValue}, err=${err}`));
  }

  public turnOff() {

    if (this.isActive) {
      this.somneoService.modifyPlaySettingsState(false).then(() => {
        this.isActive = false;
        this.source = SomneoConstants.SOURCE_OFF;
        this.platform.log.info(`Set ${this.displayName} state ->`, this.isActive);
        this.televisionService.getCharacteristic(this.platform.Characteristic.Active)
          .updateValue(this.isActive);
      }).catch(err => this.platform.log.error(`Error turning off ${this.displayName}, err=${err}`));
    }
  }

  private turnOffConflictingAccessories(): Promise<void> {

    if (this.platform.UserSettings.RequestedAccessories.includes(RequestedAccessory.SWITCH_RELAXBREATHE)
      && this.platform.RelaxBreathe !== undefined) {
      this.platform.RelaxBreathe.turnOff();
    }

    if (this.platform.UserSettings.RequestedAccessories.includes(RequestedAccessory.SWITCH_SUNSET)
      && this.platform.SunsetSwitch !== undefined) {
      this.platform.SunsetSwitch.turnOff();
    }

    return Promise.resolve();
  }

  private buildInputServices() {

    for (let i = 1; i <= SomneoConstants.NUM_FM_RADIO_CHANNELS; i++) {
      const displayName = `FM Preset ${i}`;

      const fmInputService = this.addService(this.platform.Service.InputSource, `fm${i}`, displayName)
        .setCharacteristic(this.platform.Characteristic.Identifier, i)
        .setCharacteristic(this.platform.Characteristic.ConfiguredName, displayName)
        .setCharacteristic(this.platform.Characteristic.IsConfigured, this.platform.Characteristic.IsConfigured.CONFIGURED)
        .setCharacteristic(this.platform.Characteristic.InputSourceType, this.platform.Characteristic.InputSourceType.TUNER);

      this.televisionService.addLinkedService(fmInputService); // link to tv service
    }

    const auxInputService = this.addService(this.platform.Service.InputSource, 'aux', SomneoConstants.AUXILARY)
      .setCharacteristic(this.platform.Characteristic.Identifier, SomneoConstants.INPUT_AUX_NUM)
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, SomneoConstants.AUXILARY)
      .setCharacteristic(this.platform.Characteristic.IsConfigured, this.platform.Characteristic.IsConfigured.CONFIGURED)
      .setCharacteristic(this.platform.Characteristic.InputSourceType, this.platform.Characteristic.InputSourceType.OTHER);

    this.televisionService.addLinkedService(auxInputService); // link to tv service
  }

  private getNewVolume(raiseVolume: boolean): number {

    const newVolume = (this.volume || 0) + (raiseVolume ? 1 : -1);

    if (newVolume > SomneoConstants.VOLUME_MAX) {
      return SomneoConstants.VOLUME_MAX;
    } else if (newVolume < SomneoConstants.VOLUME_MIN) {
      return SomneoConstants.VOLUME_MIN;
    } else {
      return newVolume;
    }
  }

  private updateChannelAndSource() {

    if (this.activeInput === undefined) {
      this.channel = this.platform.UserSettings.FavoriteChannel;
      this.source = this.platform.UserSettings.FavoriteSource;
      return;
    }

    if (this.activeInput === SomneoConstants.INPUT_AUX_NUM) {
      this.source = SomneoConstants.SOURCE_AUX;
      return;
    }

    this.source = SomneoConstants.SOURCE_FM_RADIO;
    this.channel = String(this.activeInput);
  }

  private updateActiveInput(newSource?: string, newChannel? : string) {

    // If turned off don't change any local vars because 'OFF' is also a source value
    if (!this.isActive && (this.source !== undefined && this.channel !== undefined)) {
      return;
    }

    // Source and channel should only be undefined the first time the plugin is run
    // So that is when we'll use the favorite values
    if (this.source === undefined || this.channel === undefined) {
      this.source = this.platform.UserSettings.FavoriteSource;
      this.channel = this.platform.UserSettings.FavoriteChannel;
    } else if (newSource !== undefined && newChannel !== undefined) {
      this.source = newSource;
      this.channel = newChannel;
    }

    if (this.source === SomneoConstants.SOURCE_FM_RADIO) {
      this.activeInput = Number(this.channel);
    } else {
      this.activeInput = SomneoConstants.INPUT_AUX_NUM;
    }

    this.televisionService
      .getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
      .updateValue(this.activeInput!);
  }
}
