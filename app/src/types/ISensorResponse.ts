export interface ISensorValue {
  temperature: number;
  humidity: number;
}

export interface ILiveSensorResponse extends ISensorValue {
  success: boolean;
}

export interface ISensorResponse extends ISensorValue {
  ts: string;
}
