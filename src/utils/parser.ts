import { SimulatorState } from '../types/simulator';

export const parseProgram = (code: string) => {
  console.log('=== Parsing Program ===');
  const instructions: string[] = [];
  const labels: { [key: string]: number } = {};
  const memory: { [address: number]: number } = {};
  
  let currentAddress = 0;
  let inDataSection = false;
  let pc = 0;

  const lines = code.split('\n');
  
  for (let line of lines) {
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
          const match = directive.match(/"([^"]*)"/) || ['', ''];
          const str = match[1];
          console.log(`Storing string "${str}" at address ${currentAddress.toString(16)}`);
          
          for (let i = 0; i < str.length; i++) {
            memory[currentAddress] = str.charCodeAt(i);
            currentAddress++;
          }
          memory[currentAddress] = 0;
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