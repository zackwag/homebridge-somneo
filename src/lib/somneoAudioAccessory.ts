import { Categories, Service } from 'hap-nodejs';
import { CharacteristicValue } from 'homebridge';
import { PlatformAccessory } from 'homebridge/lib/platformAccessory';
import { SomneoPlatform } from '../somneoPlatform';
import { RequestedAccessory } from './requestedAccessory';
import { SomneoAudioInput } from './somneoAudioInput';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';

export class SomneoAudioAccessory extends PlatformAccessory {

  public static readonly NAME = 'Somneo Audio';

  private activeInput = SomneoConstants.DEFAULT_ACTIVE_INPUT; // TODO Maybe read from UserSettings instead
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
    this.updateChannelAndSource();
    this.updateValues();
  }

  public async updateValues(): Promise<void> {

    await this.somneoService.getPlaySettings().then(playSettings => {
      this.isActive = playSettings.onoff || SomneoConstants.DEFAULT_BINARY_STATE;
      this.televisionService
        .getCharacteristic(this.platform.Characteristic.Active)
        .updateValue(this.isActive);

      this.volume = playSettings.sdvol || SomneoConstants.VOLUME_MIN;

      this.source = playSettings.snddv;
      this.channel = playSettings.sndch;
      this.updateActiveInput();
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

    this.platform.SomneoService.modifyPlaySettingsState(boolValue).then(() => {
      this.isActive = boolValue;
      this.platform.log.info(`Set ${this.displayName} state ->`, this.isActive);

      // TODO use UserSettings values
      this.channel = String(SomneoConstants.DEFAULT_ACTIVE_INPUT);
      this.source = SomneoConstants.SOURCE_FM_RADIO;
      this.updateActiveInput();
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
      .setCharacteristic(this.platform.Characteristic.Identifier, SomneoAudioInput[SomneoAudioInput[SomneoAudioInput.AUX]])
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
      // TODO Read defaults from UserSettings
      this.channel = String(SomneoConstants.DEFAULT_ACTIVE_INPUT);
      this.source = SomneoConstants.SOURCE_FM_RADIO;
      return;
    }

    if (this.activeInput === SomneoAudioInput[SomneoConstants.SOURCE_AUX]) {
      this.source = SomneoConstants.SOURCE_AUX;
      return;
    }

    this.source = SomneoConstants.SOURCE_FM_RADIO;
    this.channel = String(this.activeInput);
  }

  private updateActiveInput() {

    let newActiveInputVal: number;

    if (this.source === undefined || this.channel === undefined || this.source === SomneoConstants.SOURCE_OFF) {
      newActiveInputVal = SomneoConstants.DEFAULT_ACTIVE_INPUT;
    } else if (this.source === SomneoConstants.SOURCE_FM_RADIO) {
      newActiveInputVal = Number(this.channel);
    } else {
      newActiveInputVal = SomneoAudioInput[SomneoConstants.SOURCE_AUX];
    }

    this.activeInput = newActiveInputVal;
    this.televisionService
      .getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
      .updateValue(this.activeInput);
  }
}
