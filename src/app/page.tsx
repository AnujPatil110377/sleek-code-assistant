'use client'

import React, { useState } from 'react'
import Toolbar from '@/components/Toolbar'
import CodeEditor from '@/components/CodeEditor'
import ConsoleOutput from '@/components/ConsoleOutput'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable'

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
    <div className="h-screen flex flex-col">
      <Toolbar 
        onAssemble={handleAssemble}
        onReset={handleReset}
        onStep={handleStep}
        onCodeChange={setCode}
      />
      <ResizablePanelGroup
        direction="vertical"
        className="flex-1"
      >
        <ResizablePanel defaultSize={60} minSize={30}>
          <CodeEditor code={code} onChange={setCode} />
        </ResizablePanel>
        <ResizableHandle className="h-2 bg-gray-700 hover:bg-blue-500 transition-colors cursor-row-resize flex items-center justify-center">
          <div className="w-8 h-1 bg-gray-600 rounded-full" />
        </ResizableHandle>
        <ResizablePanel defaultSize={40}>
          <ConsoleOutput output={output} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default Page