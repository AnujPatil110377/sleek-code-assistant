import { SimulatorState } from '../types/simulator';

export const readAsmFile = (content: string): string[] => {
  return content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
};

export const parseLabelsAndInstructions = (lines: string[]): [string[], { [key: string]: number }, { [key: string]: number }] => {
  const instructions: string[] = [];
  const labels: { [key: string]: number } = {};
  const memory: { [key: string]: number } = {};
  
  let currentAddress = 0;
  let inDataSection = false;
  let pc = 0;

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

  return [instructions, labels, memory];
};

export const parseProgram = (code: string) => {
  const instructions: string[] = [];
  const labels: { [key: string]: number } = {};
  const memory: { [address: number]: number } = {};
  
  let currentAddress = 0x10010000; // Data segment start address
  let inDataSection = false;
  let pc = 0x00400000; // Text segment start address

  const lines = code.split('\n');
  
  for (let line of lines) {
    // Remove comments and trim whitespace
    line = line.replace(/#.*$/, '').trim();
    if (!line) continue;

    // Handle sections
    if (line.toLowerCase() === '.data') {
      inDataSection = true;
      continue;
    } else if (line.toLowerCase() === '.text') {
      inDataSection = false;
      continue;
    }

    if (inDataSection) {
      if (line.includes(':')) {
        const [label, directive] = line.split(':').map(part => part.trim());
        labels[label] = currentAddress;

        if (directive) {
          const [directiveType, ...args] = directive.trim().split(/\s+/);
          
          switch (directiveType.toLowerCase()) {
            case '.asciiz':
              const match = directive.match(/"([^"]*)"/) || ['', ''];
              const str = match[1];
              for (let i = 0; i < str.length; i++) {
                memory[currentAddress] = str.charCodeAt(i);
                currentAddress++;
              }
              memory[currentAddress] = 0; // Null terminator
              currentAddress++;
              break;
              
            case '.word':
              args.forEach(arg => {
                memory[currentAddress] = parseInt(arg);
                currentAddress += 4;
              });
              break;
          }
        }
      }
    } else {
      // Handle text section
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

  return { instructions, labels, memory };
};