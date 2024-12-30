export interface RegisterMap {
  [key: string]: number;
}

export interface Labels {
  [key: string]: number;
}

export interface Memory {
  [address: string]: number;
}

export interface InstructionTuple {
  instruction: string;
  machineCode: string | null;
  pc: number;
}

export interface InstructionMap {
  [pc: number]: {
    instruction: string;
    machineCode: string | null;
  };
}

export interface SimulatorState {
  registers: { [key: string]: number };
  previousRegisters: { [key: string]: number };
  memory: { [address: string]: number };
  pc: number;
  running: boolean;
  labels: { [key: string]: number };
}