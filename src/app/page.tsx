'use client'

import { useState, useCallback } from 'react';
import CodeEditor from '@/components/CodeEditor';
import ConsoleOutput from '@/components/ConsoleOutput';
import Toolbar from '@/components/Toolbar';
import RegisterViewer from '@/components/RegisterViewer';
import MemoryViewer from '@/components/MemoryViewer';
import { simulateCode } from '@/utils/api';

export default function Home() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [registers, setRegisters] = useState<{[key: string]: number}>({});
  const [memory, setMemory] = useState<{[address: string]: number}>({});
  const [previousRegisters, setPreviousRegisters] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleExecute = useCallback(async () => {
    try {
      console.log('=== Execution Started ===');
      setIsLoading(true);
      setPreviousRegisters(registers);
  
      const result = await simulateCode(code);
      console.log('Execution result:', result);
  
      if (result.success && result.data) {
        setOutput(result.data.console_output);
        setRegisters(result.data.registers);
  
        const memoryValues = Object.entries(result.data.memory).reduce((acc, [addr, val]) => {
          acc[addr] = parseInt(val);
          return acc;
        }, {} as {[key: string]: number});
  
        setMemory(memoryValues);
      } else {
        console.warn('Simulation failed:', result.error);
        setOutput(result.error || 'Simulation failed');
      }
    } catch (error) {
      console.error('Execution error:', error);
      setOutput('Error executing code');
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  const handleReset = useCallback(() => {
    setOutput('');
    setRegisters({});
    setMemory({});
    setPreviousRegisters({});
  }, []);

  console.log('Home render - handleExecute:', handleExecute);
  console.log('isLoading in Home:', isLoading);

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <Toolbar 
        onExecute={handleExecute}
        onReset={handleReset}
        onCodeChange={setCode}
        isLoading={isLoading}
      />
      <div className="flex">
        <div className="flex-1">
          <CodeEditor code={code} onChange={setCode} />
          <ConsoleOutput output={output} />
        </div>
        <div className="w-[500px] border-l border-gray-700">
          <RegisterViewer 
            registers={registers}
            previousRegisters={previousRegisters}
          />
          <MemoryViewer memory={memory} />
        </div>
      </div>
    </main>
  );
}