export interface SimulatorState {
  registers: { [key: string]: number };
  memory: { [address: number]: number };
  pc: number;
  running: boolean;
  labels: { [key: string]: number };
  terminated: boolean;
  instructions: string[];
}

export interface RegisterMap {
  [key: string]: number;
}