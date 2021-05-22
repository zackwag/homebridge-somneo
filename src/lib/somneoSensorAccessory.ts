import { CharacteristicValue, Service } from 'homebridge';
import { SomneoPlatform } from '../somneoPlatform';
import { RequestedAccessory } from './requestedAccessory';
import { SomneoAccessory } from './somneoAccessory';
import { SomneoClock } from './somneoClock';
import { SomneoConstants } from './somneoConstants';

export class SomneoSensorAccessory extends SomneoAccessory {

  private humidity: number | undefined;
  private humidityService: Service;
  private luxLevel: number | undefined;
  private luxService: Service;
  private temperatureService: Service;
  private temperature: number | undefined;

  constructor(
    protected platform: SomneoPlatform,
    protected somneoClock: SomneoClock,
  ) {
    super(platform, somneoClock);

    // set the service names, this is what is displayed as the default name on the Home app
    this.temperatureService = new platform.Service.TemperatureSensor(`${this.somneoClock.Name} ${SomneoConstants.SENSOR_TEMPERATURE}`);
    this.humidityService = new platform.Service.HumiditySensor(`${this.somneoClock.Name} ${SomneoConstants.SENSOR_HUMIDITY}`);
    this.luxService = new platform.Service.LightSensor(`${this.somneoClock.Name} ${SomneoConstants.SENSOR_LUX}`);

    // register handlers for the characteristics
    this.temperatureService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onSet(this.setTemperature.bind(this))
      .onGet(this.getTemperature.bind(this));

    this.humidityService.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .onSet(this.setRelativeHumidity.bind(this))
      .onGet(this.getRelativeHumidity.bind(this));

    this.luxService.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
      .onSet(this.setCurrentAmbientLightLevel.bind(this))
      .onGet(this.getCurrentAmbientLightLevel.bind(this));
  }

  protected getName(): string {
    return `${this.somneoClock.Name} ${SomneoConstants.SENSORS}`;
  }

  async updateValues(): Promise<void> {

    return this.somneoClock.SomneoService.getSensorReadings()
      .then(sensorReadings => {
        if (sensorReadings === undefined) {
          return;
        }

        if (sensorReadings.mstmp !== undefined) {
          this.temperature = sensorReadings.mstmp;
          this.temperatureService
            .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
            .updateValue(this.temperature);
        }

        if (sensorReadings.msrhu !== undefined) {
          this.humidity = sensorReadings.msrhu;
          this.humidityService
            .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
            .updateValue(this.humidity);
        }

        if (sensorReadings.mslux !== undefined) {
        // There is a minimum lux value allowed in Homebridge.
        // Philips uses 0 as the min which will cause errors;
          this.luxLevel = sensorReadings.mslux > SomneoConstants.DEFAULT_LUX_LEVEL ?
            sensorReadings.mslux : SomneoConstants.DEFAULT_LUX_LEVEL;
          this.luxService
            .getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
            .updateValue(this.luxLevel);
        }

        this.hasGetError = false;
      }).catch(err => {
        this.platform.log.error(`Error -> Updating accessory=${this.name} err=${err}`);
        this.hasGetError = true;
      });
  }

  async setTemperature(value: CharacteristicValue): Promise<void> {

    const numValue = value as number;
    if (numValue === (this.temperature ?? SomneoConstants.DEFAULT_TEMPERATURE)) {
      return;
    }

    this.temperature = numValue;
    this.platform.log.info(`UI Set -> accessory=${this.temperatureService.displayName} temperature=${this.temperature}`);
  }

  async getTemperature(): Promise<CharacteristicValue> {

    if (this.hasGetError) {
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }

    if (this.temperature === undefined) {
      return SomneoConstants.DEFAULT_TEMPERATURE;
    }

    this.platform.log.debug(`UI Get -> accessory=${this.temperatureService.displayName} temperature=${this.temperature}`);
    return this.temperature;
  }

  async setRelativeHumidity(value: CharacteristicValue) {

    const numValue = Number(value);
    if (numValue === (this.humidity ?? SomneoConstants.DEFAULT_HUMIDITY)) {
      return;
    }

    this.humidity = numValue;
    this.platform.log.info(`UI Set -> accessory=${this.humidityService.displayName} humidity=${this.humidity}`);
  }

  async getRelativeHumidity(): Promise<CharacteristicValue> {

    if (this.hasGetError) {
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }

    if (this.humidity === undefined) {
      return SomneoConstants.DEFAULT_HUMIDITY;
    }

    this.platform.log.debug(`UI Get -> accessory=${this.humidityService.displayName} humidity=${this.humidity}`);
    return this.humidity;
  }

  async setCurrentAmbientLightLevel(value: CharacteristicValue) {

    const numValue = Number(value);
    if (numValue === (this.luxLevel ?? SomneoConstants.DEFAULT_LUX_LEVEL)) {
      return;
    }

    this.luxLevel = numValue;
    this.platform.log.info(`UI Set -> accessory=${this.luxService.displayName} lux=${this.luxLevel}`);
  }

  async getCurrentAmbientLightLevel(): Promise<CharacteristicValue> {

    if (this.hasGetError) {
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }

    if (this.luxLevel === undefined) {
      return SomneoConstants.DEFAULT_LUX_LEVEL;
    }

    this.platform.log.debug(`UI Get -> accessory=${this.luxService.displayName} lux=${this.luxLevel}`);
    return this.luxLevel;
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {

    const services: Service[] = [this.informationService];

    if (this.somneoClock.RequestedAccessories.includes(RequestedAccessory.SENSOR_TEMPERATURE)) {
      this.platform.log.debug(`Included -> accessory=${this.temperatureService.displayName}`);
      services.push(this.temperatureService);
    }

    if (this.somneoClock.RequestedAccessories.includes(RequestedAccessory.SENSOR_HUMIDITY)) {
      this.platform.log.debug(`Included -> accessory=${this.humidityService.displayName}`);
      services.push(this.humidityService);
    }

    if (this.somneoClock.RequestedAccessories.includes(RequestedAccessory.SENSOR_LUX)) {
      this.platform.log.debug(`Included -> accessory=${this.luxService.displayName}`);
      services.push(this.luxService);
    }

    return services;
  }
}

