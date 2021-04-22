export interface AudioDeviceSettings {
  onoff?: boolean;
  tempy?: boolean;
  sdvol?: number;
  snddv?: string;
  sndch?: string;
}

export interface LightSettings {
  onoff?: boolean;
  tempy?: boolean;
  ltlvl?: number;
  ngtlt?: boolean;
}

export interface RelaxBreatheProgramSettings {
  onoff?: boolean;
  progr?: number;
  durat?: number;
  rtype?: number;
  intny?: number;
  sndlv?: number;
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
