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
    // Capture console.log output
    const originalLog = console.log;
    console.log = (...args) => {
      this.consoleOutput.push(args.join(' '));
      originalLog.apply(console, args);
    };
  }

  public assemble(code: string): void {
    console.log('Assembling code:', code);
    this.consoleOutput = [];
    
    try {
      // Convert the code string into an array of lines
      const lines = code.split('\n');
      const [instructions, labels, memory] = parseLabelsAndInstructions(lines);
      
      this.simulator = new MIPSSimulator(instructions, labels, memory);
      console.log('Code assembled successfully');
    } catch (error) {
      console.error('Assembly error:', error);
      throw error;
    }
  }

  public execute(): SimulationResult {
    if (!this.simulator) {
      throw new Error('No code assembled. Please assemble code first.');
    }

    try {
      this.setupConsoleCapture();
      this.simulator.run();

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

  public step(): SimulationResult {
    if (!this.simulator) {
      throw new Error('No code assembled. Please assemble code first.');
    }

    try {
      this.setupConsoleCapture();
      this.simulator.step();

      return {
        registers: this.simulator.getRegisters(),
        memory: this.simulator.getMemory(),
        output: this.consoleOutput
      };
    } catch (error) {
      console.error('Step execution error:', error);
      throw error;
    }
  }

  public reset(): void {
    this.simulator = null;
    this.consoleOutput = [];
  }

  public isAssembled(): boolean {
    return this.simulator !== null;
  }
}

export const simulatorService = new SimulatorService();