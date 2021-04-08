export interface SomneoConfig {
  name?: string;
  host?: string;
  sensors?: SensorsConfig;
  lights?: LightsConfig;
  switches?: SwitchesConfig;
  audio?: AudioConfig;
}

export interface SensorsConfig {
  humidity?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe;
  lux?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe;
  temperature?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe;
}

export interface LightsConfig {
  mainLight?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe;
  nightLight?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe;
}

export interface SwitchesConfig {
  relaxBreathe?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe;
  sunset?: SunsetConfig;
}

export interface HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreathe {
  isEnabled?: boolean;
}

export interface SunsetConfig {
  isEnabled?: boolean;
  duration?: number;
  lightIntensity?: number;
  colorScheme?: string;
  ambientSounds?: string;
  volume?: number;
}

export interface AudioConfig {
  isEnabled?: boolean;
  favoriteInput?: number;
}
