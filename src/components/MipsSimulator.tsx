import { useState } from 'react';
import { useMipsSimulator } from '../hooks/useMipsSimulator';
import { ConsoleOutput } from './ConsoleOutput';
import { RegistersViewer } from './RegistersViewer';
import { MemoryViewer } from './MemoryViewer';

export function MipsSimulator() {
  const { runProgram, isRunning, error } = useMipsSimulator();
  const [code, setCode] = useState('');

  const handleRun = () => {
    runProgram(code);
  };

  return (
    <div className="mips-simulator">
      <div className="code-editor">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your MIPS assembly code here..."
        />
        <button 
          onClick={handleRun}
          disabled={isRunning}
        >
          {isRunning ? 'Running...' : 'Run Program'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="simulator-output">
        <ConsoleOutput />
        <RegistersViewer />
        <MemoryViewer />
      </div>
    </div>
  );
} 