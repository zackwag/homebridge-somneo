export interface SomneoConfig {
  name?: string;
  host?: string;
  sensors?: Sensors;
  lights?: Lights;
  switches?: Switches;
  audio?: Audio;
}

export interface Sensors {
  humidity?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe;
  lux?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe;
  temperature?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe;
}

export interface HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe {
  isEnabled?: boolean;
}

export interface Lights {
  mainLight?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe;
  nightLight?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe;
}

export interface Switches {
  relaxBreathe?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe;
  sunset?: Sunset;
}

export interface Sunset {
  isEnabled?: boolean;
  duration?: number;
  lightIntensity?: number;
  colorScheme?: string;
  ambientSounds?: string;
  volume?: number;
}

export interface Audio {
  isEnabled?: boolean;
  favoriteInput?: number;
}
