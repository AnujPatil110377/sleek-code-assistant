import { useState, useEffect, useCallback } from 'react';
import CodeEditor from '@/components/CodeEditor';
import ConsoleOutput from '@/components/ConsoleOutput';
import MemoryViewer from '@/components/MemoryViewer';
import RegistersViewer from '@/components/RegistersViewer';
import Toolbar from '@/components/Toolbar';
import AIChatWindow from '@/components/AIChatWindow';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/components/ui/use-toast';
import { simulateCode } from '@/utils/api';
import { createInitialState, parseProgram, executeInstruction, SimulatorState } from '@/utils/mipsSimulator';

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAssemble = () => {
    try {
      console.log('Assembling code:', code);
      const { instructions, labels } = parseProgram(code);
      setSimulatorState(prev => ({
        ...createInitialState(),
        labels
      }));
      setOutput('Program assembled successfully');
      toast({
        title: "Success",
        description: "Program assembled successfully",
      });
    } catch (error) {
      console.error('Assembly error:', error);
      setOutput(`Assembly error: ${error}`);
      toast({
        title: "Error",
        description: `Assembly error: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleStep = () => {
    try {
      const { instructions } = parseProgram(code);
      const currentInstruction = instructions[simulatorState.pc / 4];
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

  const handleExecute = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Starting execution...');
      setOutput(prev => `${prev}\nInitializing execution...`);
      
      // Store current registers state before execution
      const prevRegs = { ...simulatorState.registers };
      
      // Add artificial delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Sending code to simulator...');
      setOutput(prev => `${prev}\nSending code to simulator...`);
      
      const result = await simulateCode(code);

      if (result.success && result.data) {
        console.log('Execution successful, processing results...');
        setOutput(result.data.console_output || '');
        
        // Create new state object with the response data
        const newRegisters = result.data.registers || {};
        const newMemory = result.data.memory || {};
        
        // Update simulator state with new values while preserving structure
        const newState = {
          ...simulatorState,
          registers: newRegisters,
          memory: newMemory,
          pc: simulatorState.pc + 4,
          running: true,
          previousRegisters: prevRegs
        };
        
        setSimulatorState(newState);
        
        toast({
          title: "Success",
          description: "Code executed successfully",
        });
      } else {
        throw new Error(result.error || 'Simulation failed');
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutput(error.message || 'Error executing code');
      toast({
        title: "Error",
        description: error.message || 'Error executing code',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [code, simulatorState]);

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
        <AIChatWindow />
      </nav>

      <Toolbar 
        onAssemble={handleAssemble}
        onReset={handleReset}
        onStep={handleStep}
        onCodeChange={setCode}
        onExecute={handleExecute}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-[2fr,1fr] gap-4 h-[calc(100vh-8rem)]">
        <div className="flex flex-col">
          {isLoading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[100px] w-full" />
            </div>
          ) : (
            <>
              <CodeEditor code={code} onChange={setCode} />
              <ConsoleOutput output={output} />
            </>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex-1 overflow-auto">
            <RegistersViewer 
              registers={simulatorState.registers} 
              previousRegisters={simulatorState.previousRegisters}
            />
          </div>
          <MemoryViewer memory={simulatorState.memory} />
        </div>
      </div>
    </div>
  );
};

export default Index;