import { CharacteristicGetCallback, CharacteristicSetCallback, Service } from 'homebridge';
import { SomneoPlatform } from './platform';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';
import { SomneoAccessory } from './types';

export class SomneoSensorAccessory implements SomneoAccessory {

  private informationService: Service;
  private humidity = 0;
  private humidityService: Service;
  private lightLevel = 0;
  private lightService: Service;
  private somneoService: SomneoService;
  private temperatureService: Service;
  private temperature = 0;

  public name : string;

  constructor(
    private platform: SomneoPlatform,
  ) {
    this.somneoService = this.platform.SomneoService;
    this.name = 'Somneo Sensors';

    // set accessory information
    this.informationService = new this.platform.Service.AccessoryInformation()
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SomneoConstants.SOMNEO_MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SomneoConstants.SOMNEO_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, String(this.platform.config.host));

    // set the service names, this is what is displayed as the default name on the Home app
    this.temperatureService = new platform.Service.TemperatureSensor('Somneo Temperature Sensor');
    this.humidityService = new platform.Service.HumiditySensor('Somneo Humidity Sensor');
    this.lightService = new platform.Service.LightSensor('Somneo Light Snesor');

    // register handlers for the characteristics
    this.temperatureService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .on('get', this.getTemperature.bind(this));

    this.humidityService.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .on('get', this.getRelativeHumidity.bind(this));

    this.lightService.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
      .on('get', this.getCurrentAmbientLightLevel.bind(this));

    this.updateValues();
  }

  async updateValues() {

    try {
      const sensorReadings = await this.somneoService.getSensorReadings();
      this.temperature = sensorReadings.mstmp;
      this.temperatureService.getCharacteristic(this.platform.Characteristic.CurrentTemperature).updateValue(this.temperature);

      this.humidity = sensorReadings.msrhu;
      this.humidityService.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity).updateValue(this.humidity);

      this.lightLevel = sensorReadings.mslux;
      this.lightService.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel).updateValue(this.lightLevel);
    } catch (err) {
      this.platform.log.error(`Error updating Sensors: err=${err}`);
    }
  }

  setTemperature(value: number, callback: CharacteristicSetCallback) {

    if (value === this.temperature) {
      return;
    }

    this.platform.log.info('Set CurrentTemperature ->', value);

    this.temperature = value;
    callback(null);
  }

  getTemperature(callback: CharacteristicGetCallback) {

    this.platform.log.debug('Get CurrentTemperature ->', this.temperature);
    callback(null, this.temperature);
  }

  setRelativeHumidity(value: number, callback: CharacteristicSetCallback) {

    if (value === this.humidity) {
      return;
    }

    this.platform.log.info('Set CurrentRelativeHumidity ->', value);

    this.humidity = value;
    callback(null);
  }

  getRelativeHumidity(callback: CharacteristicGetCallback) {

    this.platform.log.debug('Get CurrentRelativeHumidity ->', this.humidity);
    callback(null, this.humidity);
  }

  setCurrentAmbientLightLevel(value: number, callback: CharacteristicSetCallback) {

    if (value === this.lightLevel) {
      return;
    }

    this.platform.log.info('Set CurrentAmbientLightLevel ->', value);

    this.lightLevel = value;
    callback(null);
  }

  getCurrentAmbientLightLevel(callback: CharacteristicGetCallback) {

    this.platform.log.debug('Get CurrentAmbientLightLevel ->', this.lightLevel);
    callback(null, this.lightLevel);
  }

  /*
   * This method is called directly after creation of this instance.
   * It should return all services which should be added to the accessory.
   */
  getServices(): Service[] {
    return [
      this.informationService,
      this.temperatureService,
      this.humidityService,
      this.lightService,
    ];
  }
}

