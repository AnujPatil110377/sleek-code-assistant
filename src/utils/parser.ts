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
  let currentAddress = 0x10010000;  // Starting address for data section

  // First pass: collect all labels
  for (const line of instructions) {
    if (line.startsWith('.data')) {
      dataMode = true;
      continue;
    } else if (line.startsWith('.text')) {
      dataMode = false;
      pc = 0;
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const label = line.substring(0, colonIndex).trim();
      if (dataMode) {
        labels[label] = currentAddress;
      } else {
        labels[label] = pc;
      }
    }

    if (!dataMode && !line.endsWith(':')) {
      pc += 4;
    }
  }

  // Reset for second pass
  dataMode = false;
  currentAddress = 0x10010000;

  // Second pass: process instructions and data
  for (const line of instructions) {
    if (line.startsWith('.data')) {
      dataMode = true;
      continue;
    } else if (line.startsWith('.text')) {
      dataMode = false;
      continue;
    }

    if (dataMode) {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const processedLine = line.substring(colonIndex + 1).trim();
        
        if (processedLine.startsWith('.asciiz')) {
          // Extract the string content
          const str = processedLine.replace('.asciiz', '')
            .trim()
            .replace(/^"/, '')
            .replace(/"$/, '')
            .replace(/\\n/g, '\n');  // Handle newlines
            
          // Store each character in memory
          for (const char of str) {
            memory[currentAddress] = char.charCodeAt(0);
            currentAddress++;
          }
          memory[currentAddress] = 0;  // Null-terminate
          currentAddress++;
        } else if (processedLine.startsWith('.word')) {
          const values = processedLine.replace('.word', '')
            .trim()
            .split(',')
            .map(v => parseInt(v.trim()));
            
          for (const value of values) {
            memory[currentAddress] = value;
            currentAddress += 4;  // Word-aligned
          }
        }
      }
    } else {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const label = line.substring(0, colonIndex).trim();
        labels[label] = pc;
        const instruction = line.substring(colonIndex + 1).trim();
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