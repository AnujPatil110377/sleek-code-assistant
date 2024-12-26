import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import ConsoleOutput from '@/components/ConsoleOutput';
import MemoryViewer from '@/components/MemoryViewer';
import RegistersViewer from '@/components/RegistersViewer';
import Toolbar from '@/components/Toolbar';

const initialCode = `.data
    hello: .asciiz "Hello, world! This string is from MIPS!\\n"
    space: .asciiz " "

.text
    # Print the string
    addi $v0, $zero, 4
    la $a0, hello
    syscall

    # Print numbers 0 to 4
    addi $s0, $zero, 0
loop:
    sltiu $t0, $s0, 10
    beq $t0, $zero, end`;

const Index = () => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('Hello, world! This string is from MIPS!\n0 1 2 3 4');

  const handleAssemble = () => {
    console.log('Assembling code:', code);
  };

  const handleReset = () => {
    console.log('Resetting simulator');
    setCode(initialCode);
    setOutput('');
  };

  const handleStep = () => {
    console.log('Stepping through code');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="h-16 border-b flex items-center justify-between px-4">
        <h1 className="text-xl font-semibold">MIPS Code Editor</h1>
      </nav>

      <Toolbar 
        onAssemble={handleAssemble}
        onReset={handleReset}
        onStep={handleStep}
        onCodeChange={setCode}
      />

      <div className="grid grid-cols-[2fr,1fr] gap-4 h-[calc(100vh-8rem)]">
        <div className="flex flex-col">
          <CodeEditor code={code} onChange={setCode} />
          <ConsoleOutput output={output} />
        </div>
        <div className="flex flex-col">
          <div className="flex-1 overflow-auto">
            <RegistersViewer />
          </div>
          <MemoryViewer />
        </div>
      </div>
    </div>
  );
};

export default Index;