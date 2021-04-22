import axios from 'axios';
import https from 'https';
import { AudioPreferences, RelaxeBreatheProgramPreferences, SunsetProgramPreferences } from './somneoClock';

export class SomneoConstants {

  // Constant Numbers
  static readonly BRIGHTNESS_STEP_INTERVAL = 4;
  static readonly INPUT_AUX_NUM = 6;
  static readonly NUM_FM_RADIO_CHANNELS = 5;
  static readonly PERCENTAGE_MAX = 100;
  static readonly PERCENTAGE_MIN = 4;
  static readonly PHILIPS_PERCENTAGE_MAX = 25; // 100%
  static readonly PHILIPS_PERCENTAGE_MIN = 1;  // 4 %

  // Defaults
  static readonly DEFAULT_ACTIVE_INPUT = 1;
  static readonly DEFAULT_AUDIO_CHANNEL = '1';
  static readonly DEFAULT_BINARY_STATE = false;
  static readonly DEFAULT_BOOLEAN_CONFIG_VALUE = true;
  static readonly DEFAULT_BRIGHTNESS = 0;
  static readonly DEFAULT_HUMIDITY = 0;
  static readonly DEFAULT_LUX_LEVEL = 0.0001;
  static readonly DEFAULT_POLLING_SECONDS = 30;
  static readonly DEFAULT_PLATFORM_NAME = 'Homebridge Somneo';
  static readonly DEFAULT_RELAX_BREATHE_BPM = 1; // 4 Breaths Per Min
  static readonly DEFAULT_RELAX_BREATHE_DURATION = 10;
  static readonly DEFAULT_RELAX_BREATHE_GUIDANCE_TYPE = 1; // Light
  static readonly DEFAULT_RELAX_BREATHE_INTENSITY = 20; // 80%
  static readonly DEFAULT_RELAX_BREATHE_VOLUME = 12; // 48%
  static readonly DEFAULT_RETRY_OPTIONS = { delay: 100, maxTry: 5 };
  static readonly DEFAULT_SUNSET_PROGRAM_AMBIENT_SOUNDS = '1'; // Soft Rain
  static readonly DEFAULT_SUNSET_PROGRAM_COLOR_SCHEME = '0'; // Sunny day
  static readonly DEFAULT_SUNSET_PROGRAM_DURATION = 30;
  static readonly DEFAULT_SUNSET_PROGRAM_LIGHT_INTENSITY = 20; // 80%
  static readonly DEFAULT_SUNSET_PROGRAM_VOLUME = 12; // 48%
  static readonly DEFAULT_TEMPERATURE = 0;

  // Strings
  static readonly DEVICE_AUDIO = 'Audio';
  static readonly INPUT_NAME_AUXILIARY = 'Auxiliary';
  static readonly INPUT_NAME_FM_PRESET = 'FM Preset';
  static readonly IP_V_4_REG_EX = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  static readonly LIGHT_MAIN_LIGHT = 'Main Light';
  static readonly LIGHT_NIGHT_LIGHT = 'Night Light';
  static readonly MANUFACTURER = 'Philips';
  static readonly MODEL = 'Somneo HF3670/60';
  static readonly RELAX_BREATHE_GUIDANCE_TYPE_LIGHT = 0;
  static readonly SENSORS = 'Sensors';
  static readonly SENSOR_HUMIDITY = 'Humidity';
  static readonly SENSOR_LUX = 'Lux';
  static readonly SENSOR_TEMPERATURE = 'Temperature';
  static readonly SOMNEO = 'Somneo';
  static readonly SOUND_SOURCE_AUX = 'aux';
  static readonly SOUND_SOURCE_FM_RADIO = 'fmr';
  static readonly SOUND_SOURCE_OFF = 'off';
  static readonly SOUND_SOURCE_SUNSET_PROGRAM = 'dus';
  static readonly SUNSET_PROGRAM_SOUND_NONE = '0';
  static readonly SWITCH_RELAX_BREATHE_PROGRAM = 'RelaxBreathe Program';
  static readonly SWITCH_SUNSET_PROGRAM = 'Sunset Program';
  static readonly TYPE_AUDIO_DEVICE_SETTINGS = 'AudioDeviceSettings';
  static readonly TYPE_LIGHT_SETTINGS = 'LightSettings';
  static readonly TYPE_RELAX_BREATHE_PROGRAM_SETTINGS = 'RelaxBreatheProgramSettings';
  static readonly TYPE_SENSOR_READINGS = 'SensorReadings';
  static readonly TYPE_SUNSET_PROGRAM_SETTINGS = 'SunsetProgramSettings';
  static readonly URI_AUDIO_ENDPOINT = '/wuply';
  static readonly URI_LIGHTS_ENDPOINT = '/wulgt';
  static readonly URI_RELAX_BREATHE = '/wurlx';
  static readonly URI_SENSORS_ENDPOINT = '/wusrd';
  static readonly URI_SUNSET_ENDPOINT = '/wudsk';

  static readonly DEFAULT_AUDIO_PREFS: AudioPreferences = {
    FavoriteChannel: SomneoConstants.DEFAULT_AUDIO_CHANNEL,
    FavoriteSource: SomneoConstants.SOUND_SOURCE_FM_RADIO,
  };

  static readonly DEFAULT_RELAX_BREATHE_PROGRAM_PREFS: RelaxeBreatheProgramPreferences = {
    BreathsPerMin: SomneoConstants.DEFAULT_RELAX_BREATHE_BPM,
    Duration: SomneoConstants.DEFAULT_RELAX_BREATHE_DURATION,
    GuidanceType: SomneoConstants.DEFAULT_RELAX_BREATHE_GUIDANCE_TYPE,
    LightIntensity: SomneoConstants.DEFAULT_SUNSET_PROGRAM_LIGHT_INTENSITY,
    Volume: SomneoConstants.DEFAULT_RELAX_BREATHE_VOLUME,
  };

  static readonly DEFAULT_SUNSET_PROGRAM_PREFS: SunsetProgramPreferences = {
    Duration: SomneoConstants.DEFAULT_SUNSET_PROGRAM_DURATION,
    LightIntensity: SomneoConstants.DEFAULT_SUNSET_PROGRAM_LIGHT_INTENSITY,
    ColorScheme: SomneoConstants.DEFAULT_SUNSET_PROGRAM_COLOR_SCHEME,
    AmbientSounds: SomneoConstants.DEFAULT_SUNSET_PROGRAM_AMBIENT_SOUNDS,
    Volume: SomneoConstants.DEFAULT_SUNSET_PROGRAM_VOLUME,
  };

  static createHttpsClient(host: string) {

    return axios.create({
      baseURL: `https://${host}/di/v1/products/1`,
      httpsAgent: new https.Agent({
        keepAlive: true, //keepAlive pools and reuses TCP connections, so it's faster
        rejectUnauthorized: false, // Somneo uses self-signed HTTPS, so this is required
      }),
    });
  }

  static convertPercentageToPhilipsPercentage(percentage: number) : number {
    // function always rounds a number up to the next largest integer.
    return Math.ceil(percentage / SomneoConstants.BRIGHTNESS_STEP_INTERVAL);
  }

  static convertPhilipsPercentageToPercentage(philipsPercentage: number) : number {
    // Philips stores up to 25 so multiply to get percentage
    return philipsPercentage * SomneoConstants.BRIGHTNESS_STEP_INTERVAL;
  }
}
