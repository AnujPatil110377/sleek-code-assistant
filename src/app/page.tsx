'use client'

import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import Toolbar from '@/components/Toolbar';
import ConsoleOutput from '@/components/ConsoleOutput';
import MemoryViewer from '@/components/MemoryViewer';
import RegisterViewer from '@/components/RegisterViewer';
import { simulatorService } from '@/services/simulatorService';
console.log('Simulator service imported:', !!simulatorService);

export default function Home() {
  const [code, setCode] = useState(`# Test MIPS program
.data
    hello: .asciiz "Hello, world!\\n"

.text
main:
    li $v0, 4
    la $a0, hello
    syscall`);
  
  const [output, setOutput] = useState('');
  const [memory, setMemory] = useState<{[address: number]: number}>({});
  const [registers, setRegisters] = useState<{[key: string]: number}>({});

  const handleExecute = () => {
    // Add alert to verify function is called
    alert('Execute function called!');
    
    console.log('=== Execute Function Started ===');
    console.log('Current code in editor:', code);
    
    if (!code) {
      console.error('No code to execute!');
      setOutput('Error: No code to execute!');
      return;
    }

    try {
      console.log('Calling simulator service...');
      const result = simulatorService.executeCode(code);
      
      console.log('Execution successful!');
      console.log('Results:', result);
      
      // Update UI
      setRegisters(result.registers);
      setMemory(result.memory);
      setOutput(result.output.join('\n'));
      
      alert('Execution completed!');
    } catch (error) {
      console.error('Execution failed:', error);
      setOutput(`Error: ${error.message}`);
      alert('Execution failed: ' + error.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Toolbar 
        onExecute={() => {
          console.log('Toolbar triggered execute');
          handleExecute();
        }}
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