import { SimulatorState } from '@/types/simulator';

// MIPS Register mapping
export const registerMap: { [key: string]: number } = {
  'zero': 0, 'at': 1,
  'v0': 2, 'v1': 3,
  'a0': 4, 'a1': 5, 'a2': 6, 'a3': 7,
  't0': 8, 't1': 9, 't2': 10, 't3': 11, 't4': 12, 't5': 13, 't6': 14, 't7': 15,
  's0': 16, 's1': 17, 's2': 18, 's3': 19, 's4': 20, 's5': 21, 's6': 22, 's7': 23,
  't8': 24, 't9': 25, 'k0': 26, 'k1': 27,
  'gp': 28, 'sp': 29, 'fp': 30, 'ra': 31
};

export const createInitialState = (): SimulatorState => ({
  registers: Object.keys(registerMap).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as { [key: string]: number }),
  memory: {},
  pc: 0,
  running: false,
  labels: {},
  terminated: false,
  instructions: []
});

export const parseProgram = (code: string) => {
  console.log('=== Parsing Program ===');
  const instructions: string[] = [];
  const labels: { [key: string]: number } = {};
  const memory: { [address: number]: number } = {};
  
  let currentAddress = 0;  // MIPS data segment start address
  let inDataSection = false;
  let pc = 0;

  const lines = code.split('\n');
  
  for (let line of lines) {
    // Remove comments and trim
    line = line.replace(/#.*$/, '').trim();
    if (!line) continue;

    if (line === '.data') {
      inDataSection = true;
      continue;
    } else if (line === '.text') {
      inDataSection = false;
      continue;
    }

    if (inDataSection) {
      if (line.includes(':')) {
        const [label, directive] = line.split(':').map(part => part.trim());
        labels[label] = currentAddress;

        if (directive.includes('.asciiz')) {
          // Extract string between quotes
          const match = directive.match(/"([^"]*)"/) || ['', ''];
          const str = match[1];
          console.log(`Storing string "${str}" at address ${currentAddress.toString(16)}`);
          
          // Store each character plus null terminator
          for (let i = 0; i < str.length; i++) {
            memory[currentAddress] = str.charCodeAt(i);
            currentAddress++;
          }
          memory[currentAddress] = 0;  // Null terminator
          currentAddress++;
        }
      }
    } else {
      if (line.includes(':')) {
        const [label, instruction] = line.split(':').map(part => part.trim());
        labels[label] = pc;
        if (instruction) {
          instructions.push(instruction);
          pc += 4;
        }
      } else {
        instructions.push(line);
        pc += 4;
      }
    }
  }

  console.log('Labels:', labels);
  console.log('Memory:', memory);
  console.log('Instructions:', instructions);

  return { instructions, labels, memory };
};

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
      case 'addu':
        const rd_add = parts[1].replace('$', '');
        const rs_add = parts[2].replace('$', '');
        const rt_add = parts[3].replace('$', '');
        console.log(`ADD: $${rd_add} = $${rs_add}(${newState.registers[rs_add]}) + $${rt_add}(${newState.registers[rt_add]})`);
        newState.registers[rd_add] = (newState.registers[rs_add] || 0) + (newState.registers[rt_add] || 0);
        console.log(`Result: $${rd_add} = ${newState.registers[rd_add]}`);
        break;

      case 'addi':
      case 'addiu':
        const rt_addi = parts[1].replace('$', '');
        const rs_addi = parts[2].replace('$', '');
        const imm_addi = parseInt(parts[3]);
        console.log(`ADDI: $${rt_addi} = $${rs_addi}(${newState.registers[rs_addi]}) + ${imm_addi}`);
        newState.registers[rt_addi] = (newState.registers[rs_addi] || 0) + imm_addi;
        console.log(`Result: $${rt_addi} = ${newState.registers[rt_addi]}`);
        break;

      case 'sub':
      case 'subu':
        const rd_sub = parts[1].replace('$', '');
        const rs_sub = parts[2].replace('$', '');
        const rt_sub = parts[3].replace('$', '');
        console.log(`SUB: $${rd_sub} = $${rs_sub}(${newState.registers[rs_sub]}) - $${rt_sub}(${newState.registers[rt_sub]})`);
        newState.registers[rd_sub] = (newState.registers[rs_sub] || 0) - (newState.registers[rt_sub] || 0);
        console.log(`Result: $${rd_sub} = ${newState.registers[rd_sub]}`);
        break;

      case 'and':
        const rd_and = parts[1].replace('$', '');
        const rs_and = parts[2].replace('$', '');
        const rt_and = parts[3].replace('$', '');
        console.log(`AND: $${rd_and} = $${rs_and}(${newState.registers[rs_and]}) & $${rt_and}(${newState.registers[rt_and]})`);
        newState.registers[rd_and] = (newState.registers[rs_and] || 0) & (newState.registers[rt_and] || 0);
        console.log(`Result: $${rd_and} = ${newState.registers[rd_and]}`);
        break;

      case 'or':
        const rd_or = parts[1].replace('$', '');
        const rs_or = parts[2].replace('$', '');
        const rt_or = parts[3].replace('$', '');
        console.log(`OR: $${rd_or} = $${rs_or}(${newState.registers[rs_or]}) | $${rt_or}(${newState.registers[rt_or]})`);
        newState.registers[rd_or] = (newState.registers[rs_or] || 0) | (newState.registers[rt_or] || 0);
        console.log(`Result: $${rd_or} = ${newState.registers[rd_or]}`);
        break;

      case 'slt':
        const rd_slt = parts[1].replace('$', '');
        const rs_slt = parts[2].replace('$', '');
        const rt_slt = parts[3].replace('$', '');
        console.log(`SLT: $${rd_slt} = ($${rs_slt}(${newState.registers[rs_slt]}) < $${rt_slt}(${newState.registers[rt_slt]}) ? 1 : 0)`);
        newState.registers[rd_slt] = (newState.registers[rs_slt] || 0) < (newState.registers[rt_slt] || 0) ? 1 : 0;
        console.log(`Result: $${rd_slt} = ${newState.registers[rd_slt]}`);
        break;

      case 'beq':
        const rs_beq = parts[1].replace('$', '');
        const rt_beq = parts[2].replace('$', '');
        const label_beq = parts[3];
        console.log(`BEQ: if $${rs_beq}(${newState.registers[rs_beq]}) == $${rt_beq}(${newState.registers[rt_beq]}) goto ${label_beq}`);
        if (newState.registers[rs_beq] === newState.registers[rt_beq]) {
          newState.pc = newState.labels[label_beq];
          console.log(`Branch taken: new PC = ${newState.pc}`);
          return newState;
        }
        break;

      case 'bne':
        const rs_bne = parts[1].replace('$', '');
        const rt_bne = parts[2].replace('$', '');
        const label_bne = parts[3];
        console.log(`BNE: if $${rs_bne}(${newState.registers[rs_bne]}) != $${rt_bne}(${newState.registers[rt_bne]}) goto ${label_bne}`);
        if (newState.registers[rs_bne] !== newState.registers[rt_bne]) {
          newState.pc = newState.labels[label_bne];
          console.log(`Branch taken: new PC = ${newState.pc}`);
          return newState;
        }
        break;

      case 'j':
        const label_j = parts[1];
        console.log(`J: goto ${label_j}`);
        newState.pc = newState.labels[label_j];
        console.log(`Jump taken: new PC = ${newState.pc}`);
        return newState;

      case 'jal':
        const label_jal = parts[1];
        console.log(`JAL: $ra = ${newState.pc + 4}; goto ${label_jal}`);
        newState.registers['ra'] = newState.pc + 4;
        newState.pc = newState.labels[label_jal];
        console.log(`Link: $ra = ${newState.registers['ra']}`);
        console.log(`Jump taken: new PC = ${newState.pc}`);
        return newState;

      case 'jr':
        const rs_jr = parts[1].replace('$', '');
        console.log(`JR: goto address in $${rs_jr}(${newState.registers[rs_jr]})`);
        newState.pc = newState.registers[rs_jr];
        console.log(`Jump taken: new PC = ${newState.pc}`);
        return newState;

      case 'lw':
        const rt_lw = parts[1].replace('$', '');
        if (parts.length === 4) {
          const offset = parseInt(parts[2]);
          const base = parts[3].replace('$', '');
          const address = newState.registers[base] + offset;
          console.log(`LW: $${rt_lw} = memory[${address}] (offset ${offset} from $${base})`);
          newState.registers[rt_lw] = newState.memory[address] || 0;
        } else {
          const label = parts[2];
          const address = newState.labels[label];
          console.log(`LW: $${rt_lw} = memory[${address}] (label ${label})`);
          newState.registers[rt_lw] = newState.memory[address] || 0;
        }
        console.log(`Result: $${rt_lw} = ${newState.registers[rt_lw]}`);
        break;

      case 'sw':
        const rt_sw = parts[1].replace('$', '');
        if (parts.length === 4) {
          const offset = parseInt(parts[2]);
          const base = parts[3].replace('$', '');
          const address = newState.registers[base] + offset;
          console.log(`SW: memory[${address}] = $${rt_sw}(${newState.registers[rt_sw]}) (offset ${offset} from $${base})`);
          newState.memory[address] = newState.registers[rt_sw];
        } else {
          const label = parts[2];
          const address = newState.labels[label];
          console.log(`SW: memory[${address}] = $${rt_sw}(${newState.registers[rt_sw]}) (label ${label})`);
          newState.memory[address] = newState.registers[rt_sw];
        }
        break;

      case 'li':
        const rt_li = parts[1].replace('$', '');
        const value = parseInt(parts[2]);
        console.log(`LI: Loading ${value} into $${rt_li}`);
        newState.registers[rt_li] = value;
        console.log(`Result: $${rt_li} = ${newState.registers[rt_li]}`);
        break;

      case 'la':
        const rt_la = parts[1].replace('$', '');
        const label_la = parts[2];
        console.log(`LA: Loading address of '${label_la}' into $${rt_la}`);
        if (label_la in newState.labels) {
          newState.registers[rt_la] = newState.labels[label_la];
          console.log(`Result: $${rt_la} = ${newState.registers[rt_la]} (address)`);
        } else {
          console.error(`Label '${label_la}' not found in:`, newState.labels);
        }
        break;

      case 'syscall':
        const syscallNum = newState.registers['v0'];
        console.log(`SYSCALL: Service ${syscallNum}`);
        
        switch (syscallNum) {
          case 1: // print integer
            console.log(`Print Integer: ${newState.registers['a0']}`);
            break;
            
          case 4: // print string
            const stringAddr = newState.registers['a0'];
            console.log(`Print String: Starting from address ${stringAddr}`);
            let output = '';
            let currentAddr = stringAddr;
            
            // Add memory bounds check and limit
            let maxChars = 1000; // Prevent infinite loops
            while (maxChars > 0 && currentAddr < 0x7FFFFFFF) {
              const charCode = newState.memory[currentAddr];
              
              // Break if we hit null terminator or undefined memory
              if (charCode === 0 || charCode === undefined) {
                break;
              }
              
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
            
          case 10: // exit
            console.log('Exit syscall - terminating program');
            newState.terminated = true;
            break;
            
          default:
            console.error('Unknown syscall:', syscallNum);
        }
        break;

      default:
        console.warn('Unimplemented instruction:', op);
    }
    
    // Always increment PC unless explicitly changed by branch/jump
    newState.pc += 4;
    
    // Ensure $zero is always 0
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

export const saveState = (state: SimulatorState): string => {
  return JSON.stringify(state);
};

export const loadState = (savedState: string): SimulatorState => {
  return JSON.parse(savedState);
};
