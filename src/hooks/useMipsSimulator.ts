import { useState, useCallback } from 'react';
import { RegisterMap, Labels, Memory } from '../types/mips';
import { MIPSSimulator } from '../utils/simulator';
import { readAsmFile, parseLabelsAndInstructions } from '../utils/parser';
import { registerMap } from '../utils/registers';

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

// Initialize registers with default values
const initialRegisters: RegisterMap = Object.fromEntries(
  Object.keys(registerMap).map(reg => [reg, 0])
);
initialRegisters['sp'] = 0x7FFFFFFC;  // Initialize stack pointer

export function useMipsSimulator() {
  const [state, setState] = useState<SimulatorState>({
    registers: initialRegisters,  // Use initialized registers
    memory: {},
    outputs: [],
    isRunning: false
  });

  const runProgram = useCallback((programContent: string, singleStep: boolean = false) => {
    try {
      console.log('Running program:', programContent);  // Debug log

      setState(prev => ({ 
        ...prev, 
        isRunning: true, 
        error: undefined,
        outputs: []
      }));
      
      const instructions = readAsmFile(programContent);
      console.log('Parsed instructions:', instructions);  // Debug log

      const [parsedInstructions, labels, memory] = parseLabelsAndInstructions(instructions);
      console.log('Processed instructions:', parsedInstructions);  // Debug log
      console.log('Labels:', labels);  // Debug log
      console.log('Initial memory:', memory);  // Debug log

      const simulator = new MIPSSimulator(
        parsedInstructions, 
        labels, 
        memory,
        singleStep
      );

      simulator.onRegistersUpdate = (registers: RegisterMap) => {
        console.log('Register update received:', registers);  // Debug log
        setState(prev => ({ 
          ...prev, 
          registers: { ...registers }
        }));
      };

      simulator.onMemoryUpdate = (memory: Memory) => {
        setState(prev => ({ 
          ...prev, 
          memory: { ...memory }  // Make sure to create a new object
        }));
      };

      simulator.onOutput = (output: SimulatorOutput) => {
        setState(prev => ({
          ...prev,
          outputs: [...prev.outputs, output]
        }));
      };

      // Run the program
      simulator.run();

      setState(prev => ({
        ...prev,
        isRunning: false
      }));

    } catch (error) {
      console.error('Error in runProgram:', error);  // Debug log
      setState(prev => ({
        ...prev,
        isRunning: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  const resetSimulator = useCallback(() => {
    setState({
      registers: initialRegisters,
      memory: {},
      outputs: [],
      isRunning: false,
      error: undefined
    });
  }, []);

  return {
    ...state,
    runProgram,
    resetSimulator
  };
} 