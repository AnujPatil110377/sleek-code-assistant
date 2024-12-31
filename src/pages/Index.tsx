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
import axios from 'axios';

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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [nextInstruction, setNextInstruction] = useState<string | null>(null);
  const [previousRegisters, setPreviousRegisters] = useState<{[key: string]: number}>({});

  const initializeStepExecution = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('https://anujpatil.pythonanywhere.com/api/init-step', {
        code
      });

      if (response.data.success) {
        setSessionId(response.data.session_id);
        
        // Initialize with default register values, maintaining stack pointer
        const defaultRegisters = {
          'zero': 0, 'at': 0,
          'v0': 0, 'v1': 0,
          'a0': 0, 'a1': 0, 'a2': 0, 'a3': 0,
          't0': 0, 't1': 0, 't2': 0, 't3': 0,
          't4': 0, 't5': 0, 't6': 0, 't7': 0,
          's0': 0, 's1': 0, 's2': 0, 's3': 0,
          's4': 0, 's5': 0, 's6': 0, 's7': 0,
          't8': 0, 't9': 0, 'k0': 0, 'k1': 0,
          'gp': 0, 'sp': simulatorState.registers.sp || 0x7FFFFFFC, 'fp': 0, 'ra': 0
        };

        setSimulatorState(prev => ({
          ...prev,
          registers: defaultRegisters,
          memory: {},
          pc: 0
        }));
        setOutput('');
        setPreviousRegisters(defaultRegisters);
        setNextInstruction(null);
        
        toast({
          title: "Ready",
          description: "Step execution initialized successfully",
        });
      }
    } catch (error) {
      console.error('Error initializing step execution:', error);
      toast({
        title: "Error",
        description: "Failed to initialize step execution",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [code, toast, simulatorState.registers.sp]);

  const handleStep = useCallback(async () => {
    if (!sessionId) {
      await initializeStepExecution();
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await axios.post('https://anujpatil.pythonanywhere.com/api/step', {
        session_id: sessionId
      });

      if (response.data.success) {
        if (response.data.completed) {
          toast({
            title: "Complete",
            description: "Program execution completed",
          });
          setSessionId(null);
          return;
        }

        const { data } = response.data;
        
        // Store current registers as previous before updating
        setPreviousRegisters(simulatorState.registers);
        
        setSimulatorState(prev => ({
          ...prev,
          registers: data.registers,
          memory: data.memory,
          pc: data.pc
        }));
        
        if (data.console_output) {
          setOutput(prev => prev + data.console_output);
        }

        setNextInstruction(data.current_instruction);
      }
    } catch (error) {
      console.error('Step execution error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || 'Error executing step',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, simulatorState, code, toast, initializeStepExecution]);

  const handleAssemble = useCallback(() => {
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
  }, [code, toast]);

  const handleReset = useCallback(() => {
    setSessionId(null);
    setNextInstruction(null);
    setSimulatorState(createInitialState());
    setOutput('');
    setPreviousRegisters({});
  }, []);

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
        
        setPreviousRegisters(prevRegs);
        
        const newState: SimulatorState = {
          ...simulatorState,
          registers: result.data.registers || {},
          memory: newMemory,
          pc: result.data.pc || simulatorState.pc + 4,
          running: true
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
        nextInstruction={nextInstruction}
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
              previousRegisters={previousRegisters}
            />
          </div>
          <MemoryViewer memory={simulatorState.memory} />
        </div>
      </div>
    </div>
  );
};

export default Index;
