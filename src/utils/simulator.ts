import { SimulatorState } from '../types/simulator';
import { getRegisterNumber } from './registers';

export class MIPSSimulator {
  private state: SimulatorState;
  private singleStep: boolean;

  constructor(
    instructions: string[],
    labels: { [key: string]: number },
    memory: { [address: number]: number },
    singleStep: boolean = false
  ) {
    this.state = {
      registers: {},
      memory,
      pc: 0,
      running: true,
      labels,
      terminated: false,
      instructions
    };
    this.singleStep = singleStep;
  }

  run(): void {
    while (this.state.running && this.state.pc < this.state.instructions.length * 4) {
      this.executeNextInstruction();
      if (this.singleStep) {
        break;
      }
    }
  }

  private executeNextInstruction(): void {
    const instruction = this.state.instructions[this.state.pc / 4];
    if (!instruction) {
      this.state.running = false;
      return;
    }

    this.executeInstruction(instruction);
  }

  private executeInstruction(instruction: string): void {
    const newState = executeInstruction(this.state, instruction);
    this.state = newState;
  }
}

export const executeInstruction = (state: SimulatorState, instruction: string): SimulatorState => {
  const newState = {
    ...state,
    registers: { ...state.registers },
    memory: { ...state.memory }
  };
  
  const parts = instruction.split(/[\s,]+/).filter(Boolean);
  const op = parts[0];

  console.log('=== Executing Instruction ===');
  console.log('Instruction:', instruction);
  console.log('Current PC:', state.pc);
  console.log('Before - registers:', JSON.stringify(newState.registers));

  try {
    switch (op) {
      case 'add':
      case 'addu': {
        const rd = parts[1].replace('$', '');
        const rs = parts[2].replace('$', '');
        const rt = parts[3].replace('$', '');
        newState.registers[rd] = (newState.registers[rs] || 0) + (newState.registers[rt] || 0);
        break;
      }

      case 'addi':
      case 'addiu': {
        const rt = parts[1].replace('$', '');
        const rs = parts[2].replace('$', '');
        const imm = parseInt(parts[3]);
        newState.registers[rt] = (newState.registers[rs] || 0) + imm;
        break;
      }

      case 'sub':
      case 'subu': {
        const rd = parts[1].replace('$', '');
        const rs = parts[2].replace('$', '');
        const rt = parts[3].replace('$', '');
        newState.registers[rd] = (newState.registers[rs] || 0) - (newState.registers[rt] || 0);
        break;
      }

      case 'and': {
        const rd = parts[1].replace('$', '');
        const rs = parts[2].replace('$', '');
        const rt = parts[3].replace('$', '');
        newState.registers[rd] = (newState.registers[rs] || 0) & (newState.registers[rt] || 0);
        break;
      }

      case 'or': {
        const rd = parts[1].replace('$', '');
        const rs = parts[2].replace('$', '');
        const rt = parts[3].replace('$', '');
        newState.registers[rd] = (newState.registers[rs] || 0) | (newState.registers[rt] || 0);
        break;
      }

      case 'slt': {
        const rd = parts[1].replace('$', '');
        const rs = parts[2].replace('$', '');
        const rt = parts[3].replace('$', '');
        newState.registers[rd] = (newState.registers[rs] || 0) < (newState.registers[rt] || 0) ? 1 : 0;
        break;
      }

      case 'beq': {
        const rs = parts[1].replace('$', '');
        const rt = parts[2].replace('$', '');
        const label = parts[3];
        if (newState.registers[rs] === newState.registers[rt]) {
          newState.pc = newState.labels[label];
          return newState;
        }
        break;
      }

      case 'bne': {
        const rs = parts[1].replace('$', '');
        const rt = parts[2].replace('$', '');
        const label = parts[3];
        if (newState.registers[rs] !== newState.registers[rt]) {
          newState.pc = newState.labels[label];
          return newState;
        }
        break;
      }

      case 'j': {
        const label = parts[1];
        newState.pc = newState.labels[label];
        return newState;
      }

      case 'jal': {
        const label = parts[1];
        newState.registers['ra'] = newState.pc + 4;
        newState.pc = newState.labels[label];
        return newState;
      }

      case 'jr': {
        const rs = parts[1].replace('$', '');
        newState.pc = newState.registers[rs];
        return newState;
      }

      case 'lw': {
        const rt = parts[1].replace('$', '');
        if (parts.length === 4) {
          const offset = parseInt(parts[2]);
          const base = parts[3].replace('$', '');
          const address = newState.registers[base] + offset;
          newState.registers[rt] = newState.memory[address] || 0;
        } else {
          const label = parts[2];
          const address = newState.labels[label];
          newState.registers[rt] = newState.memory[address] || 0;
        }
        break;
      }

      case 'sw': {
        const rt = parts[1].replace('$', '');
        if (parts.length === 4) {
          const offset = parseInt(parts[2]);
          const base = parts[3].replace('$', '');
          const address = newState.registers[base] + offset;
          newState.memory[address] = newState.registers[rt];
        } else {
          const label = parts[2];
          const address = newState.labels[label];
          newState.memory[address] = newState.registers[rt];
        }
        break;
      }

      case 'li': {
        const rt = parts[1].replace('$', '');
        const value = parseInt(parts[2]);
        newState.registers[rt] = value;
        break;
      }

      case 'la': {
        const rt = parts[1].replace('$', '');
        const label = parts[2];
        if (label in newState.labels) {
          newState.registers[rt] = newState.labels[label];
        } else {
          console.error(`Label '${label}' not found in:`, newState.labels);
        }
        break;
      }

      case 'syscall': {
        const syscallNum = newState.registers['v0'];
        switch (syscallNum) {
          case 1:
            console.log(`Print Integer: ${newState.registers['a0']}`);
            break;
          case 4: {
            const stringAddr = newState.registers['a0'];
            let output = '';
            let currentAddr = stringAddr;
            let maxChars = 1000;
            
            while (maxChars > 0 && currentAddr < 0x7FFFFFFF) {
              const charCode = newState.memory[currentAddr];
              if (charCode === 0 || charCode === undefined) break;
              output += String.fromCharCode(charCode);
              currentAddr++;
              maxChars--;
            }
            
            if (output) {
              console.log(`Complete string: "${output}"`);
            } else {
              console.warn('No valid string found in memory at address:', stringAddr);
            }
            break;
          }
          case 10:
            console.log('Exit syscall - terminating program');
            newState.terminated = true;
            break;
          default:
            console.error('Unknown syscall:', syscallNum);
        }
        break;
      }

      default:
        console.warn('Unimplemented instruction:', op);
    }
    
    newState.pc += 4;
    newState.registers['zero'] = 0;
    
    console.log('After - registers:', JSON.stringify(newState.registers));
    console.log('New PC:', newState.pc);
    console.log('=== Instruction Complete ===\n');
    
  } catch (error) {
    console.error('Execution error:', error);
    console.error('Failed instruction:', instruction);
    console.error('State at failure:', JSON.stringify(newState));
  }

  return newState;
};