import { RequestedAccessory } from './requestedAccessory';
import { createMockPlatform, createMockSomneoClock } from './testMocks';
import { SomneoSensorAccessory } from './somneoSensorAccessory';

describe('SomneoSensorAccessory', () => {
  describe('updateValues', () => {
    it('adopts polled temperature, humidity, and lux readings', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.getSensorReadings as jest.Mock).mockResolvedValue({ mstmp: 21.5, msrhu: 45, mslux: 120 });
      const accessory = new SomneoSensorAccessory(createMockPlatform(), clock);

      await accessory.updateValues();

      await expect(accessory.getTemperature()).resolves.toBe(21.5);
      await expect(accessory.getRelativeHumidity()).resolves.toBe(45);
      await expect(accessory.getCurrentAmbientLightLevel()).resolves.toBe(120);
    });

    it('clamps a lux reading of 0 up to the Homebridge-allowed minimum', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.getSensorReadings as jest.Mock).mockResolvedValue({ mslux: 0 });
      const accessory = new SomneoSensorAccessory(createMockPlatform(), clock);

      await accessory.updateValues();

      await expect(accessory.getCurrentAmbientLightLevel()).resolves.toBe(0.0001);
    });

    it('sets hasGetError and makes every get reject when polling fails', async () => {
      const clock = createMockSomneoClock();
      (clock.SomneoService.getSensorReadings as jest.Mock).mockRejectedValue(new Error('network down'));
      const accessory = new SomneoSensorAccessory(createMockPlatform(), clock);

      await accessory.updateValues();

      await expect(accessory.getTemperature()).rejects.toThrow('HapStatusError');
      await expect(accessory.getRelativeHumidity()).rejects.toThrow('HapStatusError');
      await expect(accessory.getCurrentAmbientLightLevel()).rejects.toThrow('HapStatusError');
    });
  });

  describe('getServices', () => {
    it('only includes services for the sensors that were actually requested', () => {
      const clock = createMockSomneoClock({ RequestedAccessories: [RequestedAccessory.SENSOR_TEMPERATURE] });
      const accessory = new SomneoSensorAccessory(createMockPlatform(), clock);

      const services = accessory.getServices();

      // informationService + temperatureService only
      expect(services).toHaveLength(2);
    });

    it('includes all three sensor services when all are requested', () => {
      const clock = createMockSomneoClock({
        RequestedAccessories: [
          RequestedAccessory.SENSOR_TEMPERATURE,
          RequestedAccessory.SENSOR_HUMIDITY,
          RequestedAccessory.SENSOR_LUX,
        ],
      });
      const accessory = new SomneoSensorAccessory(createMockPlatform(), clock);

      expect(accessory.getServices()).toHaveLength(4);
    });
  });
});
