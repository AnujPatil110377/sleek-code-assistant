export interface SimulatorState {
  registers: { [key: string]: number };
  memory: { [address: number]: number };
  labels: { [key: string]: number };
  instructions: string[];
  pc: number;
  running: boolean;
  terminated: boolean;
}