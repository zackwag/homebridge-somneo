<<<<<<< Updated upstream
export interface AudioDeviceSettings {
  onoff?: boolean;
  tempy?: boolean;
  sdvol?: number;
  snddv?: string;
  sndch?: string;
}

export interface LightSettings {
=======
export interface SensorReadings {
  mslux?: number;
  mstmp?: number;
  msrhu?: number;
}

export interface Sunset {
  onoff?: boolean;
  durat?: number;
  curve?: number;
  ctype?: string;
  sndch?: string;
  snddv?: string;
  sndlv?: number;
}

export interface RelaxBreathe {
  onoff?: boolean;
}

export interface LightSettings {
  ltlvl?: number;
  onoff?: boolean;
  ngtlt?: boolean;
}

export interface Light {
>>>>>>> Stashed changes
  onoff?: boolean;
  tempy?: boolean;
  ltlvl?: number;
  ngtlt?: boolean;
}

<<<<<<< Updated upstream
export interface RelaxBreatheProgramSettings {
  onoff?: boolean;
  progr?: number;
  durat?: number;
  rtype?: number;
  intny?: number;
  sndlv?: number;
=======
export interface NightLight {
  ngtlt?: boolean;
>>>>>>> Stashed changes
}

export interface SensorReadings {
  mslux?: number;
  mstmp?: number;
  msrhu?: number;
}

export interface SunsetProgramSettings {
  onoff?: boolean;
  durat?: number;
  curve?: number;
  ctype?: string;
  sndch?: string;
  snddv?: string;
  sndlv?: number;
}
