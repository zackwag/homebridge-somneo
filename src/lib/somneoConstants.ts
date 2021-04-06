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
  static readonly DEFAULT_BRIGHTNESS = 0;
  static readonly DEFAULT_HUMIDITY = 0;
  static readonly DEFAULT_LUX_LEVEL = 0.0001;
  static readonly DEFAULT_TEMPERATURE = 0;
  static readonly DEFAULT_SUNSET_PROGRAM_AMBIENT_SOUNDS = '1'; // Soft Rain
  static readonly DEFAULT_SUNSET_PROGRAM_COLOR_SCHEME = '0'; // Sunny day
  static readonly DEFAULT_SUNSET_PROGRAM_DURATION = 30;
  static readonly DEFAULT_SUNSET_PROGRAM_LIGHT_INTENSITY = 20; // 80%
  static readonly DEFAULT_SUNSET_PROGRAM_VOLUME = 12; // 48%

  // Strings
  static readonly DEVICE_AUDIO = 'Audio';
  static readonly INPUT_NAME_AUXILARY = 'Auxilary';
  static readonly INPUT_NAME_FM_PRESET = 'FM Preset';
  static readonly LIGHT_MAIN_LIGHT = 'Main Light';
  static readonly LIGHT_NIGHT_LIGHT = 'Night Light';
  static readonly MANUFACTURER = 'Philips';
  static readonly MODEL = 'Somneo HF3670/60';
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

  static convertPercentageToPhilipsPercentage(percentage: number) : number {
    // function always rounds a number up to the next largest integer.
    return Math.ceil(percentage / SomneoConstants.BRIGHTNESS_STEP_INTERVAL);
  }
}
