import { MIPSSimulator } from '../utils/simulator';
import { parseLabelsAndInstructions, readAsmFile } from '../utils/parser';

interface SimulationResult {
  registers: { [key: string]: number };
  memory: { [address: number]: number };
  output: string[];
}

class SimulatorService {
  constructor() {
    console.log('SimulatorService instance created');
  }

  private simulator: MIPSSimulator | null = null;
  private consoleOutput: string[] = [];

  private setupConsoleCapture() {
    const originalLog = console.log;
    console.log = (...args) => {
      this.consoleOutput.push(args.join(' '));
      originalLog.apply(console, args);
    };
  }

  public executeCode(code: string): SimulationResult {
    console.log('=== SIMULATOR EXECUTION START ===');
    
    // 1. Validate input
    if (!code) {
      console.error('No code provided');
      throw new Error('No code provided');
    }
    console.log('Code received, length:', code.length);

    this.consoleOutput = [];
    this.setupConsoleCapture();

    try {
      // 2. Parse code
      console.log('Parsing code...');
      const cleanInstructions = readAsmFile(code);
      console.log('Clean instructions:', cleanInstructions);

      // 3. Parse labels and instructions
      console.log('Parsing labels and instructions...');
      const [instructions, labels, memory] = parseLabelsAndInstructions(cleanInstructions);
      console.log('Parsed result:', {
        instructionsCount: instructions.length,
        labelsCount: Object.keys(labels).length,
        memoryEntriesCount: Object.keys(memory).length
      });

      // 4. Create simulator
      console.log('Creating simulator...');
      this.simulator = new MIPSSimulator(instructions, labels, memory, false);
      
      // 5. Run simulation
      console.log('Running simulation...');
      this.simulator.run();
      console.log('Simulation completed');

      // 6. Get results
      const result = {
        registers: this.simulator.getRegisters(),
        memory: this.simulator.getMemory(),
        output: this.consoleOutput
      };

      console.log('=== EXECUTION RESULTS ===');
      console.log('Registers:', Object.keys(result.registers).length);
      console.log('Memory entries:', Object.keys(result.memory).length);
      console.log('Output lines:', result.output.length);
      console.log('Output:', result.output);

      return result;

    } catch (error) {
      console.error('=== EXECUTION ERROR ===');
      console.error('Error details:', error);
      console.error('Error occurred at step:', error.stack);
      throw new Error(`Execution failed: ${error.message}`);
    }
  }

  public reset(): void {
    console.log('Resetting simulator');
    this.simulator = null;
    this.consoleOutput = [];
  }
}

export const simulatorService = new SimulatorService();
console.log('Simulator service initialized'); 