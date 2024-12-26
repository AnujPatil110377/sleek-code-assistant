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

  private setupConsoleCapture() {
    const originalLog = console.log;
    console.log = (...args) => {
      this.consoleOutput.push(args.join(' '));
      originalLog.apply(console, args);
    };
  }

  public executeCode(code: string): SimulationResult {
    console.log('=== SimulatorService: executeCode ===');
    console.log('Received code:');
    console.log(code);
    
    this.consoleOutput = [];
    this.setupConsoleCapture();

    try {
      console.log('Parsing code...');
      const cleanInstructions = readAsmFile(code);
      console.log('Clean instructions:', cleanInstructions);

      console.log('Parsing labels and instructions...');
      const [instructions, labels, memory] = parseLabelsAndInstructions(cleanInstructions);
      console.log('Parsed result:');
      console.log('Instructions:', instructions);
      console.log('Labels:', labels);
      console.log('Memory:', memory);

      console.log('Creating simulator...');
      this.simulator = new MIPSSimulator(instructions, labels, memory, false);
      
      console.log('Running simulator...');
      this.simulator.run();

      const result = {
        registers: this.simulator.getRegisters(),
        memory: this.simulator.getMemory(),
        output: this.consoleOutput
      };

      console.log('=== Execution Complete ===');
      console.log('Final state:', result);
      return result;
    } catch (error) {
      console.error('=== Execution Failed ===');
      console.error('Error details:', error);
      throw error;
    }
  }

  public reset(): void {
    this.simulator = null;
    this.consoleOutput = [];
  }
}

export const simulatorService = new SimulatorService(); 