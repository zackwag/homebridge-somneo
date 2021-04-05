export interface SomneoConfig {
  name?: string;
  host?: string;
  sensors?: Sensors;
  lights?: Lights;
  switches?: Switches;
  audio?: Audio;
}

export interface Sensors {
  humidity?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreatheOrSunset;
  lux?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreatheOrSunset;
  temperature?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreatheOrSunset;
}

export interface HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreatheOrSunset {
  isEnabled?: boolean;
}

export interface Lights {
  mainLight?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreatheOrSunset;
  nightLight?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreatheOrSunset;
}

export interface Switches {
  relaxBreathe?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreatheOrSunset;
  sunset?: HumidityOrLuxOrTemperatureOrMainLightOrNightLightOrRelaxBreatheOrSunset;
}

export interface Audio {
  isEnabled?: boolean;
  favoriteInput?: number;
}
