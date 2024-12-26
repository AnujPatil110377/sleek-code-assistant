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
    this.consoleOutput = [];
    this.setupConsoleCapture();

    // Parse the code
    const cleanInstructions = readAsmFile(code);
    const [instructions, labels, memory] = parseLabelsAndInstructions(cleanInstructions);

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
}

export const simulatorService = new SimulatorService(); 