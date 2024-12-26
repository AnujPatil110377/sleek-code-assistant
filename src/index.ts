import { readAsmFile, parseLabelsAndInstructions } from './utils/parser';
import { MIPSSimulator } from './utils/simulator';

export function runMIPSProgram(programContent: string, singleStep: boolean = false): void {
  try {
    // Parse the program
    const instructions = readAsmFile(programContent);
    const [parsedInstructions, labels, memory] = parseLabelsAndInstructions(instructions);

    // Create and run simulator
    const simulator = new MIPSSimulator(parsedInstructions, labels, memory, singleStep);
    simulator.run();
  } catch (error) {
    console.error('Error running MIPS program:', error);
  }
}

// Example usage:
const program = `
.data
message: .asciiz "Hello, World!\n"

.text
main:
    li $v0, 4           # syscall 4 (print_str)
    la $a0, message     # argument: string
    syscall
    
    li $v0, 10          # syscall 10 (exit)
    syscall
`;

runMIPSProgram(program, true); 