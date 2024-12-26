'use client'

import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import Toolbar from '@/components/Toolbar';
import ConsoleOutput from '@/components/ConsoleOutput';
import MemoryViewer from '@/components/MemoryViewer';
import RegisterViewer from '@/components/RegisterViewer';
import { simulatorService } from '@/services/simulatorService';

export default function Home() {
  const [code, setCode] = useState(`# Test MIPS program
.data
    hello: .asciiz "Hello, world! This string is from MIPS!\\n"
    space: .asciiz " "

.text
    # Print the string
    addi $v0, $zero, 4
    la $a0, hello
    syscall`);
  
  const [output, setOutput] = useState('');
  const [memory, setMemory] = useState<{[address: number]: number}>({});
  const [registers, setRegisters] = useState<{[key: string]: number}>({});
  const [isAssembled, setIsAssembled] = useState(false);

  const handleAssemble = () => {
    console.log('Assembling code:', code);
    try {
      simulatorService.assemble(code);
      setIsAssembled(true);
      setOutput('Code assembled successfully.');
    } catch (error) {
      console.error('Assembly error:', error);
      setOutput(`Assembly Error: ${error.message}`);
      setIsAssembled(false);
    }
  };

  const handleExecute = () => {
    console.log('Executing code');
    try {
      const result = simulatorService.execute();
      setRegisters(result.registers);
      setMemory(result.memory);
      setOutput(result.output.join('\n'));
    } catch (error) {
      console.error('Execution error:', error);
      setOutput(`Execution Error: ${error.message}`);
    }
  };

  const handleReset = () => {
    simulatorService.reset();
    setOutput('');
    setMemory({});
    setRegisters({});
    setIsAssembled(false);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Toolbar 
        onAssemble={handleAssemble}
        onExecute={handleExecute}
        onReset={handleReset}
        onStep={() => {}}
        onCodeChange={setCode}
        isAssembled={isAssembled}
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