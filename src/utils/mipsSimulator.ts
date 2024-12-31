import { RegisterMap, Labels, Memory } from '../types/mips';

interface SimulatorState {
  registers: { [key: string]: number };
  previousRegisters: { [key: string]: number };
  memory: { [address: string]: number };
  pc: number;
  running: boolean;
  labels: { [key: string]: number };
}

export const registerMap: { [key: string]: number } = {
  'zero': 0, 'at': 1,
  'v0': 2, 'v1': 3,
  'a0': 4, 'a1': 5, 'a2': 6, 'a3': 7,
  't0': 8, 't1': 9, 't2': 10, 't3': 11, 't4': 12, 't5': 13, 't6': 14, 't7': 15,
  's0': 16, 's1': 17, 's2': 18, 's3': 19, 's4': 20, 's5': 21, 's6': 22, 's7': 23,
  't8': 24, 't9': 25, 'k0': 26, 'k1': 27,
  'gp': 28, 'sp': 29, 'fp': 30, 'ra': 31
};

export type { SimulatorState };  // Single export of the type

export const createInitialState = (): SimulatorState => ({
  registers: Object.keys(registerMap).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as { [key: string]: number }),
  previousRegisters: {},
  memory: {},
  pc: 0,
  running: false,
  labels: {}
});

export const parseProgram = (code: string) => {
  const lines = code.split('\n');
  const instructions: string[] = [];
  const labels: { [key: string]: number } = {};
  let pc = 0;
  let inDataSection = false;
  let currentAddress = 0x10010000;

  lines.forEach(line => {
    const trimmedLine = line.trim().replace(/#.*$/, '');
    if (!trimmedLine) return;

    if (trimmedLine === '.data') {
      inDataSection = true;
      return;
    }

    if (trimmedLine === '.text') {
      inDataSection = false;
      return;
    }

    if (inDataSection) {
      if (trimmedLine.includes(':')) {
        const [label] = trimmedLine.split(':');
        labels[label.trim()] = currentAddress;
      }
      // Handle data section directives here
    } else {
      if (trimmedLine.includes(':')) {
        const [label, instruction] = trimmedLine.split(':');
        labels[label.trim()] = pc;
        if (instruction.trim()) {
          instructions.push(instruction.trim());
          pc += 4;
        }
      } else {
        instructions.push(trimmedLine);
        pc += 4;
      }
    }
  });

  return { instructions, labels };
};

export const executeInstruction = (state: SimulatorState, instruction: string): SimulatorState => {
  const newState = { ...state };
  const parts = instruction.split(/[\s,]+/).filter(Boolean);
  const op = parts[0];

  console.log('Executing instruction:', instruction);

  try {
    switch (op) {
      case 'add':
        const rd = parts[1].replace('$', '');
        const rs = parts[2].replace('$', '');
        const rt = parts[3].replace('$', '');
        newState.registers[rd] = newState.registers[rs] + newState.registers[rt];
        break;
      // Add more instruction implementations here
      default:
        console.warn('Unimplemented instruction:', op);
    }
    
    newState.pc += 4;
  } catch (error) {
    console.error('Error executing instruction:', error);
  }

  return newState;
};

export const saveState = (state: SimulatorState): string => {
  return JSON.stringify(state);
};

export const loadState = (savedState: string): SimulatorState => {
  return JSON.parse(savedState);
};
