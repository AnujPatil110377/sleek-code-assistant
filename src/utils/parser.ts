import { Labels, Memory } from '../types/mips';

export function readAsmFile(content: string): string[] {
  const lines = content.split('\n');
  const instructions: string[] = [];
  
  for (const line of lines) {
    // Remove comments and trim whitespace
    const cleanLine = line.replace(/#.*/, '').trim();
    if (cleanLine) {
      instructions.push(cleanLine);
    }
  }
  
  return instructions;
}

export function parseLabelsAndInstructions(
  instructions: string[]
): [string[], Labels, Memory] {
  const labels: Labels = {};
  const parsedInstructions: string[] = [];
  const memory: Memory = {};
  let pc = 0;
  let dataMode = false;
  
  // Separate memory regions for different data types
  let stringAddress = 0;           // Strings start from 0
  let integerAddress = 1000;       // Integers start from 1000
  let currentAddress = stringAddress;

  for (const line of instructions) {
    if (line.startsWith('.data')) {
      dataMode = true;
      continue;
    } else if (line.startsWith('.text')) {
      dataMode = false;
      pc = 0;
      continue;
    }

    if (dataMode) {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const label = line.substring(0, colonIndex).trim();
        const processedLine = line.substring(colonIndex + 1).trim();
        
        if (processedLine.startsWith('.asciiz')) {
          // String data - use string memory region
          currentAddress = stringAddress;
          labels[label] = currentAddress;
          
          const str = processedLine.replace('.asciiz', '')
            .trim()
            .replace(/^"/, '')
            .replace(/"$/, '')
            .replace(/\\n/g, '\n');
            
          // Store string characters
          for (const char of str) {
            memory[currentAddress] = char.charCodeAt(0);
            currentAddress++;
          }
          memory[currentAddress] = 0; // Null terminate
          currentAddress++;
          
          // Update string region pointer
          stringAddress = currentAddress;
          
        } else if (processedLine.startsWith('.word')) {
          // Integer data - use integer memory region
          currentAddress = integerAddress;
          labels[label] = currentAddress;
          
          const values = processedLine.replace('.word', '')
            .trim()
            .split(',')
            .map(v => {
              const trimmed = v.trim();
              return trimmed.startsWith('0x') ? parseInt(trimmed, 16) : parseInt(trimmed);
            });
            
          for (const value of values) {
            // Store integers in little-endian format
            memory[currentAddress] = value & 0xFF;
            memory[currentAddress + 1] = (value >> 8) & 0xFF;
            memory[currentAddress + 2] = (value >> 16) & 0xFF;
            memory[currentAddress + 3] = (value >> 24) & 0xFF;
            currentAddress += 4;
          }
          
          // Update integer region pointer
          integerAddress = currentAddress;
        } else if (processedLine.startsWith('.space')) {
          // Handle .space directive
          const size = parseInt(processedLine.replace('.space', '').trim());
          labels[label] = currentAddress;  // Store the buffer's starting address
          
          // Initialize buffer space with zeros
          for (let i = 0; i < size; i++) {
            memory[currentAddress] = 0;
            currentAddress++;
          }
          
          // Update the appropriate region pointer based on current section
          if (currentAddress < 1000) {
            stringAddress = currentAddress;
          } else {
            integerAddress = currentAddress;
          }
        } else if (processedLine.startsWith('.byte')) {
          // Handle .byte directive
          const value = processedLine.replace('.byte', '')
            .trim()
            .split(',')
            .map(v => {
              const trimmed = v.trim();
              const val = trimmed.startsWith('0x') ? 
                parseInt(trimmed, 16) : 
                parseInt(trimmed);
              return val & 0xFF; // Ensure byte value
            })[0];

          // Store byte value
          memory[currentAddress] = value;
          currentAddress++;
          
          // Update the appropriate region pointer
          if (currentAddress < 1000) {
            stringAddress = currentAddress;
          } else {
            integerAddress = currentAddress;
          }
        }
      }
    } else {
      // Handle text section
      if (line.includes(':')) {
        const [label, instruction] = line.split(':').map(part => part.trim());
        labels[label] = pc;
        if (instruction) {
          parsedInstructions.push(instruction);
          pc += 4;
        }
      } else if (line) {
        parsedInstructions.push(line);
        pc += 4;
      }
    }
  }

  return [parsedInstructions, labels, memory];
} 