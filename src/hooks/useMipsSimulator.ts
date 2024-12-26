import { useState, useCallback } from 'react';
import { RegisterMap, Labels, Memory } from '../types/mips';
import { MIPSSimulator } from '../utils/simulator';
import { readAsmFile, parseLabelsAndInstructions } from '../utils/parser';

interface SimulatorOutput {
  type: 'int' | 'string';
  value: string | number;
}

interface SimulatorState {
  registers: RegisterMap;
  memory: Memory;
  outputs: SimulatorOutput[];
  isRunning: boolean;
  error?: string;
}

export function useMipsSimulator() {
  const [state, setState] = useState<SimulatorState>({
    registers: {},
    memory: {},
    outputs: [],
    isRunning: false
  });

  const runProgram = useCallback((programContent: string, singleStep: boolean = false) => {
    try {
      setState(prev => ({ ...prev, isRunning: true, error: undefined }));
      
      const instructions = readAsmFile(programContent);
      const [parsedInstructions, labels, memory] = parseLabelsAndInstructions(instructions);

      // Override console.log to capture outputs
      const outputs: SimulatorOutput[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => {
        if (msg.startsWith('Output (int): ')) {
          outputs.push({
            type: 'int',
            value: parseInt(msg.replace('Output (int): ', ''))
          });
        } else if (msg.startsWith('Output (string): ')) {
          outputs.push({
            type: 'string',
            value: msg.replace('Output (string): ', '')
          });
        }
      };

      // Create simulator instance
      const simulator = new MIPSSimulator(
        parsedInstructions, 
        labels, 
        memory,
        singleStep
      );

      // Override simulator's display methods to update state
      simulator.onRegistersUpdate = (registers: RegisterMap) => {
        setState(prev => ({ ...prev, registers }));
      };

      simulator.onMemoryUpdate = (memory: Memory) => {
        setState(prev => ({ ...prev, memory }));
      };

      simulator.onOutput = (output: SimulatorOutput) => {
        setState(prev => ({
          ...prev,
          outputs: [...prev.outputs, output]
        }));
      };

      // Run the program
      simulator.run();

      // Restore console.log
      console.log = originalLog;

      setState(prev => ({
        ...prev,
        isRunning: false,
        outputs
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  return {
    ...state,
    runProgram
  };
} 