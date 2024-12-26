import React, { useState } from 'react'
import Toolbar from '@/components/Toolbar'
import CodeEditor from '@/components/CodeEditor'

const Page = () => {
  const [code, setCode] = useState('')

  const handleAssemble = () => {
    console.log('Assembling code:', code)
  }

  const handleReset = () => {
    console.log('Resetting simulator')
    setCode('')
  }

  const handleStep = () => {
    console.log('Stepping through code')
  }

  return (
    <div>
      <Toolbar 
        onAssemble={handleAssemble}
        onReset={handleReset}
        onStep={handleStep}
        onCodeChange={setCode}
      />
      <CodeEditor 
        code={code}
        onChange={setCode}
      />
    </div>
  )
}

export default Page