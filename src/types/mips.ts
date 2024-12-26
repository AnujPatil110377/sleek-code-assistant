export interface RegisterMap {
  [key: string]: number;
}

export interface Labels {
  [key: string]: number;
}

export interface Memory {
  [address: number]: number;
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