'use client'

import React, { useState } from 'react'
import Toolbar from '@/components/Toolbar'
import CodeEditor from '@/components/CodeEditor'
import ConsoleOutput from '@/components/ConsoleOutput'
import RegistersViewer from '@/components/RegistersViewer'
import MemoryViewer from '@/components/MemoryViewer'
import { ResizableBox, ResizableHandle } from '@/components/ui/resizable'
import { useMipsSimulator } from '@/hooks/useMipsSimulator'

const Page = () => {
  const [code, setCode] = useState('')
  const { runProgram, resetSimulator, registers, memory, outputs, isRunning, error } = useMipsSimulator()

  const handleAssemble = () => {
    runProgram(code, false)
  }

  const handleReset = () => {
    setCode('')
    resetSimulator()
  }

  const handleStep = () => {
    runProgram(code, true) // Run in single-step mode
  }

  // Join all outputs into a single string for ConsoleOutput
  const consoleOutput = outputs
    .map(out => 
      out.type === 'int' 
        ? `Output (int): ${out.value}` 
        : `Output (string): ${out.value}`
    )
    .join('\n')

  return (
    <div className="h-screen flex flex-col">
      <Toolbar 
        onAssemble={handleAssemble}
        onReset={handleReset}
        onStep={handleStep}
        onCodeChange={setCode}
        isRunning={isRunning}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: Code Editor and Console */}
        <div className="flex-1 flex flex-col">
          <ResizableBox
            defaultSize={{ height: '60%' }}
            minHeight={200}
            maxHeight="80%"
            className="w-full"
            handle={
              <ResizableHandle className="h-2 w-full cursor-row-resize bg-gray-700 hover:bg-blue-500 transition-colors" />
            }
          >
            <CodeEditor code={code} onChange={setCode} />
          </ResizableBox>
          <ConsoleOutput output={consoleOutput} />
        </div>

        {/* Right panel: Registers and Memory */}
        <div className="w-[500px] flex flex-col border-l border-gray-700">
          <RegistersViewer 
            registers={registers}
            onRegisterChange={(name, value) => {
              // Handle register changes if needed
            }}
          />
          <MemoryViewer 
            memory={memory}
            onMemoryChange={(address, value) => {
              // Handle memory changes if needed
            }}
          />
        </div>
      </div>

      {error && (
        <div className="absolute bottom-4 right-4 bg-red-900 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
}

export default Page
