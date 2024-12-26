'use client'

import { useState, useEffect } from 'react';
import CodeEditor from '@/components/CodeEditor';
import Toolbar from '@/components/Toolbar';
import ConsoleOutput from '@/components/ConsoleOutput';
import MemoryViewer from '@/components/MemoryViewer';
import RegisterViewer from '@/components/RegisterViewer';
import { simulatorService } from '@/services/simulatorService';

export default function Home() {
  const [code, setCode] = useState(`# Test MIPS program
.data
    hello: .asciiz "Hello, world!\\n"

.text
main:
    li $v0, 4       # syscall 4 (print_str)
    la $a0, hello   # argument: string
    syscall         # print the string`);

  // Add effect to log code changes
  useEffect(() => {
    console.log('Code state updated:', code?.substring(0, 100) + '...');
  }, [code]);

  const handleCodeChange = (newCode: string) => {
    console.log('handleCodeChange called with:', newCode?.substring(0, 100) + '...');
    setCode(newCode);
  };

  const handleAssemble = () => {
    console.log('=== ASSEMBLY PROCESS STARTING ===');
    console.log('Current code to assemble:', code);
    
    if (!code || code.trim() === '') {
      console.error('No code to assemble!');
      setOutput('Error: No code to assemble!');
      return;
    }

    try {
      const assembled = simulatorService.assemble(code);
      console.log('Assembly successful:', assembled);
      setAssembledInstructions(assembled);
      setIsAssembled(true);
      setOutput('Code assembled successfully.');
    } catch (error) {
      console.error('Assembly failed:', error);
      setOutput(`Assembly Error: ${error.message}`);
      setIsAssembled(false);
    }
  };

  const handleExecute = () => {
    console.log('=== EXECUTION PROCESS STARTING ===');
    console.log('Assembled instructions:', assembledInstructions);
    
    if (!isAssembled || !assembledInstructions) {
      console.error('No assembled code to execute!');
      setOutput('Error: Please assemble the code first!');
      return;
    }

    try {
      const result = simulatorService.execute(assembledInstructions);
      console.log('Execution result:', result);
      setRegisters(result.registers);
      setMemory(result.memory);
      setOutput(result.output.join('\n'));
    } catch (error) {
      console.error('Execution failed:', error);
      setOutput(`Execution Error: ${error.message}`);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Toolbar 
        onAssemble={handleAssemble}
        onExecute={handleExecute}
        onReset={handleReset}
        onStep={() => {}}
        onCodeChange={handleCodeChange}
        isAssembled={isAssembled}
      />
      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          <CodeEditor 
            code={code} 
            onChange={(newCode) => {
              console.log('CodeEditor onChange called with:', newCode?.substring(0, 100) + '...');
              handleCodeChange(newCode);
            }} 
          />
        </div>
        <div className="space-y-4">
          <ConsoleOutput output={output} />
          <div className="flex gap-4">
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