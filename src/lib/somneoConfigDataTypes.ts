export interface SomneoConfig {
  name?: string;
  host?: string;
  sensors?: SensorsConfig;
  lights?: LightsConfig;
  switches?: SwitchesConfig;
  audio?: AudioConfig;
}

export interface SensorsConfig {
  humidity?: HumidityOrLuxOrTemperatureOrMainLightOrNightLight;
  lux?: HumidityOrLuxOrTemperatureOrMainLightOrNightLight;
  temperature?: HumidityOrLuxOrTemperatureOrMainLightOrNightLight;
}

export interface LightsConfig {
  mainLight?: HumidityOrLuxOrTemperatureOrMainLightOrNightLight;
  nightLight?: HumidityOrLuxOrTemperatureOrMainLightOrNightLight;
}

export interface SwitchesConfig {
  relaxBreathe?: RelaxBreatheConfig;
  sunset?: SunsetConfig;
}

export interface HumidityOrLuxOrTemperatureOrMainLightOrNightLight {
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

export interface RelaxBreatheConfig {
  isEnabled?: boolean;
  breathsPerMin?: number;
  duration?: number;
  guidanceType?: number;
  lightIntensity?: number;
  volume?: number;
}

export interface AudioConfig {
  isEnabled?: boolean;
  favoriteInput?: number;
}
