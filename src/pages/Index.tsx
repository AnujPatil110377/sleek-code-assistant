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
import { createInitialState, parseProgram, executeInstruction } from '@/utils/mipsSimulator';
import type { SimulatorState } from '@/utils/mipsSimulator';

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

  const handleStep = useCallback(() => {
    try {
      console.log('Executing single step');
      const { instructions } = parseProgram(code);
      const currentInstruction = instructions[simulatorState.pc / 4];
      
      if (currentInstruction) {
        console.log('Current instruction:', currentInstruction);
        const newState = executeInstruction(simulatorState, currentInstruction);
        setSimulatorState(newState);
        setOutput(prev => `${prev}\nExecuted: ${currentInstruction}`);
        
        toast({
          title: "Step Executed",
          description: `Executed instruction: ${currentInstruction}`,
        });
      } else {
        setIsRunning(false);
        setOutput(prev => `${prev}\nProgram completed`);
        toast({
          title: "Program Complete",
          description: "No more instructions to execute",
        });
      }
    } catch (error) {
      console.error('Step execution error:', error);
      setIsRunning(false);
      setOutput(`Step execution error: ${error}`);
      toast({
        title: "Error",
        description: `Step execution error: ${error}`,
        variant: "destructive",
      });
    }
  }, [code, simulatorState, toast]);

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
      
      const prevRegs = { ...simulatorState.registers };
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Sending code to simulator...');
      setOutput(prev => `${prev}\nSending code to simulator...`);
      
      const result = await simulateCode(code);

      if (result.success && result.data) {
        console.log('Execution successful, processing results...');
        setOutput(result.data.console_output || '');
        
        // Convert memory values to numbers
        const newMemory: { [key: string]: number } = {};
        Object.entries(result.data.memory || {}).forEach(([addr, value]) => {
          newMemory[addr] = typeof value === 'string' ? parseInt(value, 10) : value;
        });
        
        const newState: SimulatorState = {
          ...simulatorState,
          registers: result.data.registers || {},
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
  }, [code, simulatorState, toast]);

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
        pc={simulatorState.pc}
      />

      <div className={`grid grid-cols-[2fr,1fr] gap-4 h-[calc(100vh-8rem)] relative ${isLoading ? 'opacity-50' : ''}`}>
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="animate-spin text-4xl">⌛</div>
          </div>
        )}
        <div className="flex flex-col">
          <CodeEditor code={code} onChange={setCode} />
          <ConsoleOutput output={output} />
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
