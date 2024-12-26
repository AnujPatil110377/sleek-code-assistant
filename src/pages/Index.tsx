import { useState, useEffect } from 'react';
import CodeEditor from '@/components/CodeEditor';
import ConsoleOutput from '@/components/ConsoleOutput';
import MemoryViewer from '@/components/MemoryViewer';
import RegistersViewer from '@/components/RegistersViewer';
import Toolbar from '@/components/Toolbar';
import { createInitialState, parseProgram, executeInstruction, SimulatorState, saveState, loadState } from '@/utils/mipsSimulator';
import { useToast } from '@/components/ui/use-toast';

const initialCode = `.data
    hello: .asciiz "Hello, world! This string is from MIPS!\\n"
    space: .asciiz " "

.text
    # Print the string
    addi $v0, $zero, 4
    la $a0, hello
    syscall`;

const Index = () => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [simulatorState, setSimulatorState] = useState<SimulatorState>(createInitialState());
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('=== Code Changed ===');
    console.log(code);
  }, [code]);

  const handleExecute = () => {
    try {
      console.log('Assembling code:', code);
      // First parse the code
      const { instructions, labels } = parseProgram(code);
      
      // Initialize simulator state
      const initialState = {
        ...createInitialState(),
        labels,
        instructions  // Store parsed instructions
      };
      setSimulatorState(initialState);

      console.log('Executing program...');
      // Execute all instructions
      let currentState = initialState;
      while (currentState.pc < instructions.length * 4) {  // Each instruction is 4 bytes
        const currentInstruction = instructions[currentState.pc / 4];
        console.log('Executing instruction:', currentInstruction);
        
        // Execute the instruction and get new state
        currentState = executeInstruction(currentState, currentInstruction);
        
        // Update simulator state
        setSimulatorState(currentState);
        
        // Check for program termination (e.g., syscall exit)
        if (currentState.terminated) {
          break;
        }
      }

      setOutput('Program executed successfully');
      toast({
        title: "Success",
        description: "Program executed successfully",
      });

    } catch (error) {
      console.error('Execution error:', error);
      setOutput(`Execution error: ${error}`);
      toast({
        title: "Error",
        description: `Execution error: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleStep = () => {
    try {
      const { instructions } = parseProgram(code);
      const currentInstruction = instructions[simulatorState.pc / 4];
      console.log('Current instruction:', currentInstruction);
      if (currentInstruction) {
        const newState = executeInstruction(simulatorState, currentInstruction);
        setSimulatorState(newState);
        setOutput(prev => `${prev}\nExecuted: ${currentInstruction}`);
      } else {
        setIsRunning(false);
        setOutput(prev => `${prev}\nProgram completed`);
      }
    } catch (error) {
      console.error('Execution error:', error);
      setIsRunning(false);
      setOutput(`Execution error: ${error}`);
    }
  };

  const handleReset = () => {
    console.log('Resetting simulator');
    setSimulatorState(createInitialState());
    setOutput('');
    setIsRunning(false);
  };

  const handleSaveState = () => {
    try {
      const saved = saveState(simulatorState);
      localStorage.setItem('mips_state', saved);
      toast({
        title: "Success",
        description: "State saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save state",
        variant: "destructive",
      });
    }
  };

  const handleLoadState = () => {
    try {
      const saved = localStorage.getItem('mips_state');
      if (saved) {
        const loadedState = loadState(saved);
        setSimulatorState(loadedState);
        toast({
          title: "Success",
          description: "State loaded successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load state",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(handleStep, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, simulatorState]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="h-16 border-b flex items-center justify-between px-4">
        <h1 className="text-xl font-semibold">MIPS Simulator</h1>
        <div className="flex gap-2">
          <button onClick={handleSaveState} className="px-3 py-1 bg-blue-500 text-white rounded">
            Save State
          </button>
          <button onClick={handleLoadState} className="px-3 py-1 bg-green-500 text-white rounded">
            Load State
          </button>
        </div>
      </nav>

      <Toolbar 
        onExecute={handleExecute}
        onReset={handleReset}
        onCodeChange={setCode}
        isAssembled={true}
      />

      <div className="grid grid-cols-[2fr,1fr] gap-4 h-[calc(100vh-8rem)]">
        <div className="flex flex-col">
          <CodeEditor code={code} onChange={setCode} />
          <ConsoleOutput output={output} />
        </div>
        <div className="flex flex-col">
          <div className="flex-1 overflow-auto">
            <RegistersViewer registers={simulatorState.registers} />
          </div>
          <MemoryViewer memory={simulatorState.memory} />
        </div>
      </div>
    </div>
  );
};

export default Index;