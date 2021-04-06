export interface SensorReadings {
  mslux: number;
  mstmp: number;
  msrhu: number;
}

export interface Sunset {
  onoff: boolean;
  durat?: number;
  curve?: number;
  ctype?: string;
  sndch?: string;
  snddv?: string;
  sndlv?: number;
}

export interface RelaxBreathe {
  onoff: boolean;
}

export interface LightSettings {
  ltlvl: number;
  onoff: boolean;
  ngtlt: boolean;
}

export interface Light {
  onoff?: boolean;
  tempy?: boolean;
  ltlvl?: number;
}

export interface NightLight {
  ngtlt: boolean;
}

export interface PlaySettings {

  onoff?: boolean;
  tempy?: boolean;
  sdvol?: number;
  snddv?: string;
  sndch?: string;
}
