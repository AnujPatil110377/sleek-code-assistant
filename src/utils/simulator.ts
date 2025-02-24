import { RegisterMap, Labels, Memory } from '../types/mips';
import { registerMap, getRegisterName, getRegisterNumber } from './registers';

interface SimulatorState {
  registers: RegisterMap;
  memory: Memory;
  pc: number;
}

export class MIPSSimulator {
  private state: SimulatorState;
  private labels: Labels;
  private instructions: string[];
  private singleStep: boolean;

  constructor(instructions: string[], labels: Labels, memory: Memory, singleStep: boolean = false) {
    this.instructions = instructions;
    this.labels = labels;
    this.singleStep = singleStep;
    
    // Initialize simulator state
    this.state = {
      registers: Object.fromEntries(
        Object.keys(registerMap).map(reg => [reg, 0])
      ) as RegisterMap,
      memory: { ...memory },
      pc: 0
    };

    // Initialize special registers
    this.state.registers['sp'] = 0x7FFFFFFC;  // Stack pointer
  }

  private syscall(): boolean {
    const syscallNum = this.state.registers['v0'];
    
    switch(syscallNum) {
      case 1:  // Print integer
        console.log(`Output (int): ${this.state.registers['a0']}`);
        break;
        
      case 4:  // Print string
        let output = '';
        let address = this.state.registers['a0'];
        while (this.state.memory[address] !== 0) {
          output += String.fromCharCode(this.state.memory[address]);
          address++;
        }
        console.log(`Output (string): ${output}`);
        break;
        
      case 10:  // Exit program
        console.log('Program exit requested');
        return false;
        
      default:
        console.log(`Unknown syscall: ${syscallNum}`);
    }
    
    return true;
  }

  private executeInstruction(instruction: string): boolean {
    const parts = instruction.split(/[,\s()]+/).filter(Boolean);
    const op = parts[0];

    try {
      switch(op) {
        case 'li': {  // Load immediate pseudo-instruction
          const rt = getRegisterName(getRegisterNumber(parts[1]));
          const imm = parseInt(parts[2]);
          this.state.registers[rt] = imm;
          break;
        }

        case 'la': {  // Load address pseudo-instruction
          const rt = getRegisterName(getRegisterNumber(parts[1]));
          const label = parts[2];
          if (label in this.labels) {
            this.state.registers[rt] = this.labels[label];
          } else {
            throw new Error(`Unknown label: ${label}`);
          }
          break;
        }

        case 'move': {  // Move pseudo-instruction
          const rd = getRegisterName(getRegisterNumber(parts[1]));
          const rs = getRegisterName(getRegisterNumber(parts[2]));
          this.state.registers[rd] = this.state.registers[rs];
          break;
        }

        case 'add':
        case 'sub':
        case 'and':
        case 'or':
        case 'xor':
        case 'nor':
        case 'slt':
        case 'mul': {
          const [rd, rs, rt] = parts.slice(1).map(r => getRegisterName(getRegisterNumber(r)));
          const val1 = this.state.registers[rs];
          const val2 = this.state.registers[rt];
          
          switch(op) {
            case 'add': this.state.registers[rd] = val1 + val2; break;
            case 'sub': this.state.registers[rd] = val1 - val2; break;
            case 'and': this.state.registers[rd] = val1 & val2; break;
            case 'or':  this.state.registers[rd] = val1 | val2; break;
            case 'xor': this.state.registers[rd] = val1 ^ val2; break;
            case 'nor': this.state.registers[rd] = ~(val1 | val2); break;
            case 'slt': this.state.registers[rd] = val1 < val2 ? 1 : 0; break;
            case 'mul': this.state.registers[rd] = val1 * val2; break;
          }
          break;
        }

        case 'addi': {
          const rt = getRegisterName(getRegisterNumber(parts[1]));
          const rs = getRegisterName(getRegisterNumber(parts[2]));
          const imm = parseInt(parts[3]);
          this.state.registers[rt] = this.state.registers[rs] + imm;
          break;
        }

        case 'lw': {
          const rt = getRegisterName(getRegisterNumber(parts[1]));
          if (parts.length === 4) {
            const offset = parseInt(parts[2]);
            const base = getRegisterName(getRegisterNumber(parts[3]));
            const address = this.state.registers[base] + offset;
            this.state.registers[rt] = this.state.memory[address] || 0;
          } else {
            const label = parts[2];
            const address = this.labels[label];
            this.state.registers[rt] = this.state.memory[address] || 0;
          }
          break;
        }

        case 'sw': {
          const rt = getRegisterName(getRegisterNumber(parts[1]));
          if (parts.length === 4) {
            const offset = parseInt(parts[2]);
            const base = getRegisterName(getRegisterNumber(parts[3]));
            const address = this.state.registers[base] + offset;
            this.state.memory[address] = this.state.registers[rt];
          } else {
            const label = parts[2];
            const address = this.labels[label];
            this.state.memory[address] = this.state.registers[rt];
          }
          break;
        }

        case 'beq':
        case 'bne': {
          const rs = getRegisterName(getRegisterNumber(parts[1]));
          const rt = getRegisterName(getRegisterNumber(parts[2]));
          const label = parts[3];
          const condition = op === 'beq' 
            ? this.state.registers[rs] === this.state.registers[rt]
            : this.state.registers[rs] !== this.state.registers[rt];
          
          if (condition) {
            this.state.pc = this.labels[label] - 4; // -4 because pc will be incremented
          }
          break;
        }

        case 'j':
        case 'jal': {
          const label = parts[1];
          if (op === 'jal') {
            this.state.registers['ra'] = this.state.pc + 4;
          }
          this.state.pc = this.labels[label] - 4;
          break;
        }

        case 'jr': {
          const rs = getRegisterName(getRegisterNumber(parts[1]));
          this.state.pc = this.state.registers[rs] - 4;
          break;
        }

        case 'syscall': {
          return this.syscall();
        }

        default:
          console.error(`Unknown operation: ${op}`);
          return false;
      }

      this.state.registers['zero'] = 0; // Ensure $zero is always 0
      return true;
    } catch (error) {
      console.error(`Error executing instruction "${instruction}":`, error);
      return false;
    }
  }

  public displayRegisters(): void {
    console.log('\nRegisters:');
    for (let i = 0; i < 32; i += 4) {
      const regs = Array.from({ length: 4 }, (_, j) => {
        const regNum = i + j;
        const regName = getRegisterName(regNum);
        return `$${regName}: ${this.state.registers[regName]}`;
      });
      console.log(regs.join(' | '));
    }
    console.log();
  }

  public displayMemory(): void {
    console.log('\nMemory:');
    const addresses = Object.keys(this.state.memory).map(Number).sort((a, b) => a - b);
    for (const addr of addresses) {
      const value = this.state.memory[addr];
      const display = value >= 32 && value <= 126 
        ? `${value} ('${String.fromCharCode(value)}')`
        : value;
      console.log(`Address 0x${addr.toString(16).padStart(8, '0')}: ${display}`);
    }
    console.log();
  }

  public run(): void {
    while (this.state.pc < this.instructions.length * 4) {
      const instructionIndex = this.state.pc / 4;
      const instruction = this.instructions[instructionIndex];

      if (this.singleStep) {
        console.log('\n' + '='.repeat(80));
        console.log('Current instruction:', instruction);
        console.log('PC:', this.state.pc);
      }

      if (!this.executeInstruction(instruction)) {
        break;
      }

      if (this.singleStep) {
        this.displayRegisters();
        this.displayMemory();
        // In a real implementation, you might want to use a more sophisticated
        // way to handle single-stepping
        prompt('Press Enter to continue...');
      }

      this.state.pc += 4;
    }

    if (!this.singleStep) {
      this.displayRegisters();
      this.displayMemory();
    }
  }

  public getRegisters(): { [key: string]: number } {
    return { ...this.state.registers };
  }

  public getMemory(): { [address: number]: number } {
    return { ...this.state.memory };
  }
} 