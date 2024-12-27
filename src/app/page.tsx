'use client'

import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import Toolbar from '@/components/Toolbar';
import ConsoleOutput from '@/components/ConsoleOutput';
import MemoryViewer from '@/components/MemoryViewer';
import RegisterViewer from '@/components/RegisterViewer';
import { simulatorService } from '@/services/simulatorService';
import { parseProgram } from '@/utils/mipsSimulator';
import { SimulatorState } from '@/types/simulator';

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

  // New test function
  const testSimpleExecution = () => {
    console.log('=== TEST EXECUTION START ===');
    alert('Starting test execution');
    
    try {
      // Log current state
      console.log('Current code:', code);
      
      // Try to execute
      const { instructions, labels, memory } = parseProgram(code);
      const initialState: SimulatorState = {
        registers: { 'zero': 0 },
        memory: memory,  // Use the memory from parser
        labels: labels,
        pc: 0,
        terminated: false,
        running: false,
        instructions: instructions
      };
      const result = simulatorService.executeCode(code);
      
      // Update UI with results
      console.log('Execution result:', result);
      setRegisters(result.registers);
      setMemory(result.memory);
      setOutput(result.output.join('\n'));
      
      alert('Test execution completed!');
    } catch (error) {
      console.error('Test execution failed:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Add test button at the top */}
      <button 
        onClick={testSimpleExecution}
        className="m-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded"
      >
        Test Direct Execution
      </button>

      <Toolbar 
        onExecute={testSimpleExecution}  // Use the test function here
        onReset={() => {
          console.log('Reset clicked');
          simulatorService.reset();
          setOutput('');
          setMemory({});
          setRegisters({});
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
            <RegisterViewer registers={registers} />
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
