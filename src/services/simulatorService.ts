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
    console.log('Executing code:', code);
    this.consoleOutput = [];
    this.setupConsoleCapture();

    try {
      // Parse and execute in one step
      const cleanInstructions = readAsmFile(code);
      const [instructions, labels, memory] = parseLabelsAndInstructions(cleanInstructions);
      
      // Create and run simulator
      this.simulator = new MIPSSimulator(instructions, labels, memory, false);
      this.simulator.run();

      // Get results
      const result = {
        registers: this.simulator.getRegisters(),
        memory: this.simulator.getMemory(),
        output: this.consoleOutput
      };

      console.log('Execution completed:', result);
      return result;
    } catch (error) {
      console.error('Execution error:', error);
      throw error;
    }
  }

  public reset(): void {
    this.simulator = null;
    this.consoleOutput = [];
  }
}

export const simulatorService = new SimulatorService(); 