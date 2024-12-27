'use client'

import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import Toolbar from '@/components/Toolbar';
import ConsoleOutput from '@/components/ConsoleOutput';
import MemoryViewer from '@/components/MemoryViewer';
import RegisterViewer from '@/components/RegisterViewer';
import { simulatorService } from '@/services/simulatorService';
import { parseProgram } from '@/utils/mipsSimulator';
import { useToast } from "@/components/ui/use-toast";

export default function Home() {
  const [code, setCode] = useState(`# Test MIPS program
.data
    hello: .asciiz "Hello, world!\\n"

.text
    li $v0, 4
    la $a0, hello
    syscall`);
  
  const [output, setOutput] = useState('');
  const [memory, setMemory] = useState<{[address: number]: number}>({});
  const [registers, setRegisters] = useState<{[key: string]: number}>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [updatedRegisters, setUpdatedRegisters] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const testSimpleExecution = async () => {
    console.log('=== TEST EXECUTION START ===');
    setIsExecuting(true);
    setUpdatedRegisters(new Set());
    
    try {
      console.log('Current code:', code);
      
      const { instructions, labels, memory } = parseProgram(code);
      const initialState = {
        registers: { 'zero': 0 },
        memory: memory,
        labels: labels,
        pc: 0,
        terminated: false
      };

      const result = simulatorService.executeCode(code);
      
      // Track which registers were updated
      const updatedRegs = new Set<string>();
      Object.keys(result.registers).forEach(reg => {
        if (result.registers[reg] !== initialState.registers[reg]) {
          updatedRegs.add(reg);
        }
      });
      
      setRegisters(result.registers);
      setMemory(result.memory);
      setOutput(result.output.join('\n'));
      setUpdatedRegisters(updatedRegs);
      
      toast({
        title: "Success",
        description: "Program executed successfully",
      });
    } catch (error) {
      console.error('Test execution failed:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <button 
        onClick={testSimpleExecution}
        className="m-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isExecuting}
      >
        {isExecuting ? 'Executing...' : 'Test Direct Execution'}
      </button>

      <Toolbar 
        onExecute={testSimpleExecution}
        onReset={() => {
          console.log('Reset clicked');
          simulatorService.reset();
          setOutput('');
          setMemory({});
          setRegisters({});
          setUpdatedRegisters(new Set());
        }}
        onCodeChange={setCode}
      />
      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          <CodeEditor code={code} onChange={setCode} />
        </div>
        <div className="space-y-4">
          <ConsoleOutput output={output} />
          <div className="flex flex-col gap-4">
            <RegisterViewer 
              registers={registers} 
              updatedRegisters={updatedRegisters}
              isExecuting={isExecuting}
            />
            <MemoryViewer 
              memory={memory}
              onMemoryChange={(address, value) => {
                setMemory(prev => ({
                  ...prev,
                  [address]: value
                }));
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}