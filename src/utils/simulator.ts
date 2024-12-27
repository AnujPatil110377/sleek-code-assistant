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
        
      case 4: {  // Print string
        const startAddress = this.state.registers['a0'];
        let currentAddress = startAddress;
        let outputString = '';
        
        const MAX_STRING_LENGTH = 1024;
        let charCount = 0;
        
        while (charCount < MAX_STRING_LENGTH) {
          const byte = this.state.memory[currentAddress];
          if (byte === undefined || byte === 0) {
            break;
          }
          
          outputString += String.fromCharCode(byte);
          currentAddress++;
          charCount++;
        }
        
        if (outputString) {
          console.log(`Output (string): ${outputString}`);
        } else {
          console.log(`No valid string found in memory at address: 0x${startAddress.toString(16)}`);
        }
        break;
      }
        
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
            console.log(`Loaded address ${this.labels[label]} for label ${label} into ${rt}`);
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
            this.state.registers[rt] = this.loadWord(address);
          } else {
            const label = parts[2];
            const address = this.labels[label];
            this.state.registers[rt] = this.loadWord(address);
          }
          break;
        }

        case 'sw': {
          const rt = getRegisterName(getRegisterNumber(parts[1]));
          if (parts.length === 4) {
            const offset = parseInt(parts[2]);
            const base = getRegisterName(getRegisterNumber(parts[3]));
            const address = this.state.registers[base] + offset;
            this.storeWord(address, this.state.registers[rt]);
          } else {
            const label = parts[2];
            const address = this.labels[label];
            this.storeWord(address, this.state.registers[rt]);
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
          const syscallNum = this.state.registers['v0'];
          
          switch(syscallNum) {
            case 1:  // Print integer
              console.log(`Output (int): ${this.state.registers['a0']}`);
              break;
              
            case 4: {  // Print string
              const startAddress = this.state.registers['a0'];
              let currentAddress = startAddress;
              let outputString = '';
              
              const MAX_STRING_LENGTH = 1024;
              let charCount = 0;
              
              while (charCount < MAX_STRING_LENGTH) {
                const byte = this.state.memory[currentAddress];
                if (byte === undefined || byte === 0) {
                  break;
                }
                
                outputString += String.fromCharCode(byte);
                currentAddress++;
                charCount++;
              }
              
              if (outputString) {
                console.log(`Output (string): ${outputString}`);
              } else {
                console.log(`No valid string found in memory at address: 0x${startAddress.toString(16)}`);
              }
              break;
            }
            
            case 10:  // Exit program
              console.log('Program exit requested');
              return false;
              
            default:
              console.log(`Unknown syscall: ${syscallNum}`);
          }
          break;
        }

        case 'lb': {
          const rt = getRegisterName(getRegisterNumber(parts[1]));
          if (parts.length === 4) {
            const offset = parseInt(parts[2]);
            const base = getRegisterName(getRegisterNumber(parts[3]));
            const address = this.state.registers[base] + offset;
            this.state.registers[rt] = this.loadByte(address);
          } else {
            const label = parts[2];
            const address = this.labels[label];
            this.state.registers[rt] = this.loadByte(address);
          }
          break;
        }

        case 'slti': {
          const rt = getRegisterName(getRegisterNumber(parts[1]));
          const rs = getRegisterName(getRegisterNumber(parts[2]));
          const imm = parseInt(parts[3]);
          this.state.registers[rt] = this.state.registers[rs] < imm ? 1 : 0;
          break;
        }

        case 'mul': {
          const rd = getRegisterName(getRegisterNumber(parts[1]));
          const rs = getRegisterName(getRegisterNumber(parts[2]));
          const rt = getRegisterName(getRegisterNumber(parts[3]));
          this.state.registers[rd] = this.state.registers[rs] * this.state.registers[rt];
          break;
        }

        case 'ble': {
          const rs = getRegisterName(getRegisterNumber(parts[1]));
          const rt = getRegisterName(getRegisterNumber(parts[2]));
          const label = parts[3];
          if (this.state.registers[rs] <= this.state.registers[rt]) {
            this.state.pc = this.labels[label] - 4;
          }
          break;
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
  }

  public displayMemory(): void {
    console.log('\nMemory:');
    const addresses = Object.keys(this.state.memory)
      .map(Number)
      .sort((a, b) => a - b);

    if (addresses.length === 0) {
      console.log('No memory contents to display');
      return;
    }

    for (const addr of addresses) {
      const value = this.state.memory[addr];
      if (value === undefined) continue;
      
      // Format address as hex
      const hexAddr = addr.toString(16).toUpperCase().padStart(3, '0');
      // Format value as hex
      const hexValue = value.toString(16).toUpperCase().padStart(2, '0');
      
      // Add ASCII representation for printable characters
      const display = value >= 32 && value <= 126 
        ? `${hexValue} ('${String.fromCharCode(value)}')`
        : hexValue;
        
      console.log(`Address 0x${hexAddr}: ${display}`);
    }
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

  private getNextMemoryAddress(currentAddress: string): string {
    const decimal = parseInt(currentAddress.replace('0x', ''), 16);
    return '0x' + (decimal + 1).toString(16).toUpperCase().padStart(8, '0');
  }

  private loadWord(address: number): number {
    // Load all 4 bytes
    const byte0 = this.state.memory[address] || 0;
    const byte1 = this.state.memory[address + 1] || 0;
    const byte2 = this.state.memory[address + 2] || 0;
    const byte3 = this.state.memory[address + 3] || 0;

    console.log(`Loading word from ${address}:`, { byte0, byte1, byte2, byte3 });
    
    // Combine bytes into word (little-endian)
    const value = ((byte3 & 0xFF) << 24) | 
                  ((byte2 & 0xFF) << 16) | 
                  ((byte1 & 0xFF) << 8) | 
                  (byte0 & 0xFF);
                  
    console.log(`Loaded word value: ${value} (0x${value.toString(16)})`);
    return value;
  }

  private storeWord(address: number, value: number): void {
    console.log(`Storing word at ${address}: ${value} (0x${value.toString(16)})`);
    
    // Store in little-endian format
    this.state.memory[address] = value & 0xFF;
    this.state.memory[address + 1] = (value >> 8) & 0xFF;
    this.state.memory[address + 2] = (value >> 16) & 0xFF;
    this.state.memory[address + 3] = (value >> 24) & 0xFF;
    
    console.log(`Stored bytes:`, {
      byte0: this.state.memory[address],
      byte1: this.state.memory[address + 1],
      byte2: this.state.memory[address + 2],
      byte3: this.state.memory[address + 3]
    });
  }

  private loadByte(address: number): number {
    const byte = this.state.memory[address] || 0;
    // Sign extend from 8 bits to 32 bits using arithmetic right shift
    return ((byte << 24) >> 24);
  }

  private storeByte(address: number, value: number): void {
    this.state.memory[address] = value & 0xFF;
  }

  private dumpMemoryAtAddress(address: number): void {
    const hexAddress = '0x' + address.toString(16).toUpperCase().padStart(8, '0');
    console.log(`Memory dump at ${hexAddress}:`);
    for (let i = 0; i < 4; i++) {
      const addr = `0x${(address + i).toString(16).toUpperCase().padStart(8, '0')}`;
      const value = this.state.memory[addr];
      console.log(`  ${addr}: ${value} (0x${value?.toString(16) || 'undefined'})`);
    }
  }
} 