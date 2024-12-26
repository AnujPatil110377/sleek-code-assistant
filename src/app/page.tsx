'use client'

import React, { useState } from 'react'
import Toolbar from '@/components/Toolbar'
import CodeEditor from '@/components/CodeEditor'
import ConsoleOutput from '@/components/ConsoleOutput'
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
    <div className="h-screen flex flex-col">
      <Toolbar 
        onAssemble={handleAssemble}
        onReset={handleReset}
        onStep={handleStep}
        onCodeChange={setCode}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
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
        <ConsoleOutput output={output} />
      </div>
    </div>
  )
}

export default Page