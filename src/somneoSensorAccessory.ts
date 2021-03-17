import { CharacteristicGetCallback, CharacteristicSetCallback, Service } from 'homebridge';
import { SomneoPlatform } from './platform';
import { SomneoConstants } from './somneoConstants';
import { SomneoService } from './somneoService';
import { SomneoAccessory } from './types';

export class SomneoSensorAccessory implements SomneoAccessory {

  private static readonly HUMIDITY_SENSOR_NAME = `${SomneoConstants.SOMNEO} Humidity Sensor`;
  private static readonly LUX_SENSOR_NAME = `${SomneoConstants.SOMNEO} Lux Sensor`;
  private static readonly NAME = `${SomneoConstants.SOMNEO} Sensors`;
  private static readonly TEMPERATURE_SENSOR_NAME = `${SomneoConstants.SOMNEO} Temperature Sensor`;

  private informationService: Service;
  private humidity = 0;
  private humidityService: Service;
  private luxLevel = SomneoConstants.HOMEBRIDGE_MIN_LUX_LEVEL;
  private luxService: Service;
  private somneoService: SomneoService;
  private temperatureService: Service;
  private temperature = 0;

  public name : string;

  constructor(
    private platform: SomneoPlatform,
  ) {
    this.somneoService = this.platform.SomneoService;
    this.name = SomneoSensorAccessory.NAME;

    // set accessory information
    this.informationService = new this.platform.Service.AccessoryInformation()
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SomneoConstants.SOMNEO_MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SomneoConstants.SOMNEO_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.platform.UserSettings.Host);

    // set the service names, this is what is displayed as the default name on the Home app
    this.temperatureService = new platform.Service.TemperatureSensor(SomneoSensorAccessory.TEMPERATURE_SENSOR_NAME);
    this.humidityService = new platform.Service.HumiditySensor(SomneoSensorAccessory.HUMIDITY_SENSOR_NAME);
    this.luxService = new platform.Service.LightSensor(SomneoSensorAccessory.LUX_SENSOR_NAME);

    // register handlers for the characteristics
    this.temperatureService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .on('get', this.getTemperature.bind(this));

    this.humidityService.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .on('get', this.getRelativeHumidity.bind(this));

    this.luxService.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
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

      // There is a minimum lux value allowedin Homebridge.
      // Philips uses 0 as the min which will cause errors;
      this.luxLevel = sensorReadings.mslux > SomneoConstants.HOMEBRIDGE_MIN_LUX_LEVEL ?
        sensorReadings.mslux : SomneoConstants.HOMEBRIDGE_MIN_LUX_LEVEL;
      this.luxService.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel).updateValue(this.luxLevel);
    } catch (err) {
      this.platform.log.error(`Error updating ${this.name}, err=${err}`);
    }
  }

  setTemperature(value: number, callback: CharacteristicSetCallback) {

    if (value === this.temperature) {
      return;
    }

    this.platform.log.info(`Set ${SomneoSensorAccessory.TEMPERATURE_SENSOR_NAME} ->`, value);

    this.temperature = value;
    callback(null);
  }

  getTemperature(callback: CharacteristicGetCallback) {

    this.platform.log.debug(`Get ${SomneoSensorAccessory.TEMPERATURE_SENSOR_NAME} ->`, this.temperature);
    callback(null, this.temperature);
  }

  setRelativeHumidity(value: number, callback: CharacteristicSetCallback) {

    if (value === this.humidity) {
      return;
    }

    this.platform.log.info(`Set ${SomneoSensorAccessory.HUMIDITY_SENSOR_NAME} ->`, value);

    this.humidity = value;
    callback(null);
  }

  getRelativeHumidity(callback: CharacteristicGetCallback) {

    this.platform.log.debug(`Get ${SomneoSensorAccessory.HUMIDITY_SENSOR_NAME} ->`, this.humidity);
    callback(null, this.humidity);
  }

  setCurrentAmbientLightLevel(value: number, callback: CharacteristicSetCallback) {

    if (value === this.luxLevel) {
      return;
    }

    this.platform.log.info(`Set ${SomneoSensorAccessory.LUX_SENSOR_NAME} ->`, value);

    this.luxLevel = value;
    callback(null);
  }

  getCurrentAmbientLightLevel(callback: CharacteristicGetCallback) {

    this.platform.log.debug(`Get ${SomneoSensorAccessory.LUX_SENSOR_NAME} ->`, this.luxLevel);
    callback(null, this.luxLevel);
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
      this.luxService,
    ];
  }
}

