import { Service } from 'hap-nodejs';
import { CharacteristicValue, PlatformAccessory } from 'homebridge';
import { SomneoPlatform } from '../somneoPlatform';
import { SomneoClock } from './somneoClock';
import { SomneoConstants } from './somneoConstants';

export class SomneoAudioAccessory {

  private hasGetError = false;
  private activeInput: number | undefined;
  private channel: string | undefined;
  private isActive: boolean | undefined;
  private televisionService: Service;
  private source: string | undefined;
  private speakerService: Service;
  private volume: number | undefined;

  constructor(
    public Accessory: PlatformAccessory,
    private platform: SomneoPlatform,
    private somneoClock: SomneoClock,
  ) {
    // set accessory information
    this.Accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SomneoConstants.MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SomneoConstants.MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.somneoClock.SomneoService.Host);

    this.televisionService = this.Accessory.addService(this.platform.Service.Television);

    this.televisionService
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, this.Accessory.displayName)
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

    this.speakerService = this.Accessory.addService(this.platform.Service.TelevisionSpeaker);

    this.speakerService.getCharacteristic(this.platform.Characteristic.VolumeSelector)
      .onSet(this.setVolumeSelector.bind(this));

    this.speakerService
      .setCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.ACTIVE)
      .setCharacteristic(this.platform.Characteristic.VolumeControlType,
        this.platform.Characteristic.VolumeControlType.ABSOLUTE);

    this.buildInputServices();
  }

  async updateValues(): Promise<void> {
<<<<<<< Updated upstream

    return this.somneoClock.SomneoService.getPlaySettings()
      .then(playSettings => {
        if (playSettings === undefined) {
          return;
        }

        if (playSettings.onoff !== undefined) {
          this.isActive = playSettings.onoff;
          this.televisionService
            .getCharacteristic(this.platform.Characteristic.Active)
            .updateValue(this.isActive);
        }

        if (playSettings.sdvol !== undefined) {
          this.volume = playSettings.sdvol;
        }

        this.updateActiveInput(playSettings.snddv, playSettings.sndch);
=======

    await this.somneoClock.SomneoService.getPlaySettings().then(playSettings => {
      if (playSettings === undefined) {
        return;
      }

      if (playSettings.onoff !== undefined) {
        this.isActive = playSettings.onoff;
        this.televisionService
          .getCharacteristic(this.platform.Characteristic.Active)
          .updateValue(this.isActive);
      }

      if (playSettings.sdvol !== undefined) {
        this.volume = playSettings.sdvol;
      }
>>>>>>> Stashed changes

        this.hasGetError = false;
      }).catch(err => {
        this.platform.log.error(`Error -> Updating accessory=${this.Accessory.displayName} err=${err}`);
        this.hasGetError = true;
      });
  }

  async setVolumeSelector(value: CharacteristicValue): Promise<void> {

    // If source value is not set or its off, just don't set anything
    if (this.source === undefined || this.source === SomneoConstants.SOUND_SOURCE_OFF) {
      return;
    }

    // If value is 0 it's a raise, if it's 1 it's a lower
    const newVolume = this.getNewVolume(value === 0);

    this.somneoClock.SomneoService.updateAudioDeviceVolume(newVolume).then(() => {
      this.volume = newVolume;
      this.platform.log.info(`UI Set -> accessory=${this.Accessory.displayName} volume=${this.volume}`);
    }).catch(err => {
      this.platform.log.error(`Error -> Setting accessory=${this.Accessory.displayName} volume=${newVolume} err=${err}`);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    });
  }

  async getActive(): Promise<CharacteristicValue> {

<<<<<<< Updated upstream
    if (this.hasGetError) {
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }

=======
>>>>>>> Stashed changes
    if (this.isActive === undefined) {
      return SomneoConstants.DEFAULT_BINARY_STATE;
    }

<<<<<<< Updated upstream
    this.platform.log.debug(`UI Get -> accessory=${this.Accessory.displayName} active=${this.isActive}`);
=======
    this.platform.log.debug(`Get ${this.Accessory.displayName} state ->`, this.isActive);
>>>>>>> Stashed changes
    return this.isActive;
  }

  async setRemoteKey(value: CharacteristicValue): Promise<void> {
    this.platform.log.debug(`Remote Key Pressed: ${value}`);
  }

  async setActive(value: CharacteristicValue): Promise<void> {

    const boolValue = Boolean(value);
    if (boolValue === (this.isActive ?? SomneoConstants.DEFAULT_BINARY_STATE)) {
      return;
    }

    if (boolValue) {
      this.turnOffConflictingAccessories();
    }

    return (boolValue ? this.somneoClock.SomneoService.turnOnAudioDevice(this.source!, this.channel!) :
      this.somneoClock.SomneoService.turnOffAudioDevice()
    ).then(() => {
      this.isActive = boolValue;
      this.platform.log.info(`UI Set -> accessory=${this.Accessory.displayName} active=${this.isActive}`);

      if (boolValue) {
        this.updateActiveInput();
        this.platform.log.info(`UI Set -> accessory=${this.Accessory.displayName} active=${this.activeInput}`);
      }
    }).catch(err => {
      this.platform.log.error(`Error -> Setting accessory=${this.Accessory.displayName} active=${boolValue} err=${err}`);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    });
  }

  async getActiveIdentifier(): Promise<CharacteristicValue> {

    if (this.hasGetError) {
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }

    if (this.activeInput === undefined) {
      return SomneoConstants.DEFAULT_ACTIVE_INPUT;
    }

    this.platform.log.debug(`UI Get -> accessory=${this.Accessory.displayName} activeIndentifier=${this.activeInput}`);
    return this.activeInput;
  }

  async setActiveIdentifier(value: CharacteristicValue): Promise<void> {

    const numValue = Number(value);
    if (numValue === (this.activeInput ?? SomneoConstants.DEFAULT_ACTIVE_INPUT)) {
      return;
    }

    this.somneoClock.SomneoService.updateAudioDeviceInput(numValue).then(() => {
      this.activeInput = numValue;
      this.platform.log.info(`UI Set -> accessory=${this.Accessory.displayName} activeIdentifier=${this.activeInput}`);

      this.updateChannelAndSource();
    }).catch(err => {
      this.platform.log.error(`Error -> Setting accessory=${this.Accessory.displayName} activeIdentifier=${numValue} err=${err}`);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    });
  }

<<<<<<< Updated upstream
  turnOff(): Promise<void> {
=======
  turnOff() {
>>>>>>> Stashed changes

    if (this.isActive) {
      this.somneoClock.SomneoService.turnOffAudioDevice().then(() => {
        this.isActive = false;
        this.source = SomneoConstants.SOUND_SOURCE_OFF;
        this.platform.log.info(`UI Set -> accessory=${this.Accessory.displayName} active=${this.isActive}`);
        this.televisionService.getCharacteristic(this.platform.Characteristic.Active)
          .updateValue(this.isActive);
      }).catch(err => {
        this.platform.log.error(`Error -> Turning off accessory=${this.Accessory.displayName} err=${err}`);
        throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
      });
    }

    return Promise.resolve();
  }

  private turnOffConflictingAccessories(): Promise<void> {

    if (this.platform.HostRelaxBreatheSwitchMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostRelaxBreatheSwitchMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    if (this.platform.HostSunsetSwitchMap.has(this.somneoClock.SomneoService.Host)) {
      this.platform.HostSunsetSwitchMap.get(this.somneoClock.SomneoService.Host).turnOff();
    }

    return Promise.resolve();
  }

  private buildInputServices() {

    for (let i = 1; i <= SomneoConstants.NUM_FM_RADIO_CHANNELS; i++) {
      const displayName = `${SomneoConstants.INPUT_NAME_FM_PRESET} ${i}`;

      const fmInputService = this.Accessory.addService(this.platform.Service.InputSource, displayName, displayName)
        .setCharacteristic(this.platform.Characteristic.Identifier, i)
        .setCharacteristic(this.platform.Characteristic.ConfiguredName, displayName)
        .setCharacteristic(this.platform.Characteristic.IsConfigured, this.platform.Characteristic.IsConfigured.CONFIGURED)
        .setCharacteristic(this.platform.Characteristic.InputSourceType, this.platform.Characteristic.InputSourceType.TUNER);

      this.televisionService.addLinkedService(fmInputService); // link to tv service
    }

    // eslint-disable-next-line max-len
    const auxInputService = this.Accessory.addService(this.platform.Service.InputSource, SomneoConstants.INPUT_NAME_AUXILIARY, SomneoConstants.INPUT_NAME_AUXILIARY)
      .setCharacteristic(this.platform.Characteristic.Identifier, SomneoConstants.INPUT_AUX_NUM)
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, SomneoConstants.INPUT_NAME_AUXILIARY)
      .setCharacteristic(this.platform.Characteristic.IsConfigured, this.platform.Characteristic.IsConfigured.CONFIGURED)
      .setCharacteristic(this.platform.Characteristic.InputSourceType, this.platform.Characteristic.InputSourceType.OTHER);

    this.televisionService.addLinkedService(auxInputService); // link to tv service
  }

  private getNewVolume(raiseVolume: boolean): number {

    const newVolume = (this.volume || 0) + (raiseVolume ? 1 : -1);

    if (newVolume > SomneoConstants.PHILIPS_PERCENTAGE_MAX) {
      return SomneoConstants.PHILIPS_PERCENTAGE_MAX;
    } else if (newVolume < SomneoConstants.PHILIPS_PERCENTAGE_MIN) {
      return SomneoConstants.PHILIPS_PERCENTAGE_MIN;
    } else {
      return newVolume;
    }
  }

  private updateChannelAndSource() {

    if (this.activeInput === undefined) {
      this.channel = this.somneoClock.AudioPreferences.FavoriteChannel;
      this.source = this.somneoClock.AudioPreferences.FavoriteSource;
      return;
    }

    if (this.activeInput === SomneoConstants.INPUT_AUX_NUM) {
      this.source = SomneoConstants.SOUND_SOURCE_AUX;
      return;
    }

    this.source = SomneoConstants.SOUND_SOURCE_FM_RADIO;
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
      this.source = this.somneoClock.AudioPreferences.FavoriteSource;
      this.channel = this.somneoClock.AudioPreferences.FavoriteChannel;
    } else if (newSource !== undefined && newChannel !== undefined) {
      this.source = newSource;
      this.channel = newChannel;
    }

    if (this.source === SomneoConstants.SOUND_SOURCE_FM_RADIO) {
      this.activeInput = Number(this.channel);
    } else {
      this.activeInput = SomneoConstants.INPUT_AUX_NUM;
    }

    this.televisionService
      .getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
      .updateValue(this.activeInput);
  }
}
