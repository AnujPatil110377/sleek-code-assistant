'use client'

import React, { useState } from 'react'
import Toolbar from '@/components/Toolbar'
import CodeEditor from '@/components/CodeEditor'
import ConsoleOutput from '@/components/ConsoleOutput'
import RegistersViewer from '@/components/RegistersViewer'
import MemoryViewer from '@/components/MemoryViewer'
import { ResizableBox, ResizableHandle } from '@/components/ui/resizable'

const Page = () => {
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')

  const handleAssemble = () => {
    console.log('Assembling code:', code)
    setOutput('Program output will appear here...')
  }

  const handleReset = () => {
    console.log('Resetting simulator')
    setCode('')
    setOutput('')
  }

  const handleStep = () => {
    console.log('Stepping through code')
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col max-h-screen">
      <Toolbar 
        onAssemble={handleAssemble}
        onReset={handleReset}
        onStep={handleStep}
        onCodeChange={setCode}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <ResizableBox
            defaultSize={{ height: '40%' }}
            minHeight={100}
            maxHeight="60%"
            className="w-full"
            handle={
              <ResizableHandle className="h-1 w-full cursor-row-resize bg-gray-700 hover:bg-blue-500 transition-colors" />
            }
          >
            <CodeEditor code={code} onChange={setCode} />
          </ResizableBox>
          <ConsoleOutput output={output} />
        </div>
        <div className="w-[400px] border-l border-gray-700 flex flex-col">
          <div className="h-1/2">
            <RegistersViewer />
          </div>
          <div className="h-1/2 border-t border-gray-700">
            <MemoryViewer />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page