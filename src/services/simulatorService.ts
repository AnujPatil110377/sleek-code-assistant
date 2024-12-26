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

  public executeCode(code: string): SimulationResult {
    try {
      // Clear previous state
      this.reset();
      
      // Log the start of execution
      console.log('=== DIRECT EXECUTION START ===');
      console.log('Received code:', code);
      
      // Try direct execution
      if (!code) {
        throw new Error('No code provided');
      }

      // Test if we can access the code
      alert(`About to execute code of length: ${code.length}`);
      
      // Create basic result for testing
      const testResult: SimulationResult = {
        registers: { '$v0': 4, '$a0': 0 },
        memory: { 0: 72 }, // ASCII value for 'H'
        output: ['Test output', code.split('\n')[0]]
      };

      console.log('Created test result:', testResult);
      alert('Execution completed - check console');
      
      return testResult;

    } catch (error) {
      console.error('Execution failed:', error);
      alert('Execution error: ' + error.message);
      throw error;
    }
  }

  public reset(): void {
    this.simulator = null;
    this.consoleOutput = [];
    console.log('Simulator reset');
  }
}

// Create and export a single instance
export const simulatorService = new SimulatorService();
console.log('Simulator service created');

// Test the service is loaded
alert('Simulator service loaded'); 