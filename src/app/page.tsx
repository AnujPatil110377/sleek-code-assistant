'use client'

import { useState, useEffect } from 'react';
import CodeEditor from '@/components/CodeEditor';
import Toolbar from '@/components/Toolbar';
import ConsoleOutput from '@/components/ConsoleOutput';
import MemoryViewer from '@/components/MemoryViewer';
import RegisterViewer from '@/components/RegisterViewer';
import { simulatorService } from '@/services/simulatorService';

export default function Home() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [memory, setMemory] = useState<{[address: number]: number}>({});
  const [registers, setRegisters] = useState<{[key: string]: number}>({});

  const handleAssemble = () => {
    console.log('Running code:', code);
    
    try {
      const result = simulatorService.assembleAndRun(code);
      console.log('Simulation result:', result);
      
      setRegisters(result.registers);
      setMemory(result.memory);
      setOutput(result.output.join('\n'));
    } catch (error) {
      console.error('Simulation error:', error);
      setOutput(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    setCode(`# Test MIPS program
.data
message: .asciiz "Hello, World!\\n"

.text
main:
    li $v0, 4           # syscall 4 (print_str)
    la $a0, message     # argument: string
    syscall
    
    li $v0, 10          # syscall 10 (exit)
    syscall`);
  }, []);

  const handleReset = () => {
    simulatorService.reset();
    setOutput('');
    setMemory({});
    setRegisters({});
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Toolbar 
        onAssemble={handleAssemble}
        onReset={handleReset}
        onStep={() => {}}
        onCodeChange={setCode}
      />
      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          <CodeEditor code={code} onChange={setCode} />
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