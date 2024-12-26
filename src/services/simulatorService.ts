import { MIPSSimulator } from '../utils/simulator';
import { parseLabelsAndInstructions, readAsmFile } from '../utils/parser';

interface SimulationResult {
  registers: { [key: string]: number };
  memory: { [address: number]: number };
  output: string[];
}

class SimulatorService {
  private simulator: MIPSSimulator | null = null;
  private consoleOutput: string[] = [];

  // Intercept console.log for output capture
  private setupConsoleCapture() {
    const originalLog = console.log;
    console.log = (...args) => {
      this.consoleOutput.push(args.join(' '));
      originalLog.apply(console, args);
    };
  }

  public assembleAndRun(code: string): SimulationResult {
    console.log('SimulatorService: Starting assembly and run');
    this.consoleOutput = [];
    this.setupConsoleCapture();

    // Parse the code
    const cleanInstructions = readAsmFile(code);
    console.log('Cleaned instructions:', cleanInstructions);

    const [instructions, labels, memory] = parseLabelsAndInstructions(cleanInstructions);
    console.log('Parsed result:', { instructions, labels, memory });

    // Create and run simulator
    this.simulator = new MIPSSimulator(instructions, labels, memory, false);
    this.simulator.run();

    // Get final state
    return {
      registers: this.simulator.getRegisters(),
      memory: this.simulator.getMemory(),
      output: this.consoleOutput
    };
  }

  public reset(): void {
    this.simulator = null;
    this.consoleOutput = [];
  }

  public assemble(code: string): AssembledCode {
    console.log('=== SIMULATOR SERVICE: ASSEMBLY ===');
    console.log('Received code:', code?.substring(0, 100) + '...');
    
    if (!code || code.trim() === '') {
      throw new Error('No code provided to assemble');
    }

    try {
      console.log('Starting assembly process...');
      const cleanInstructions = readAsmFile(code);
      console.log('Clean instructions:', cleanInstructions);

      const [instructions, labels, memory] = parseLabelsAndInstructions(cleanInstructions);
      console.log('Assembly completed:', { 
        instructionCount: instructions.length,
        labelCount: Object.keys(labels).length,
        memoryEntries: Object.keys(memory).length 
      });

      return { instructions, labels, memory };
    } catch (error) {
      console.error('Assembly failed in simulator service:', error);
      throw error;
    }
  }
}

export const simulatorService = new SimulatorService(); 