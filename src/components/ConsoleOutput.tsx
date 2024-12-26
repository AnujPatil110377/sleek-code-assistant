'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const ConsoleOutput = ({ output }: { output: string }) => {
  const [activeTab, setActiveTab] = useState<'log' | 'io'>('io')
  
  return (
    <div className="h-48 p-4">
      <div className="bg-gray-800 rounded-lg h-full flex flex-col overflow-hidden">
        <div className="flex border-b border-gray-700">
          <Button
            variant="ghost"
            className={`px-4 py-1 text-xs rounded-none ${
              activeTab === 'log' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setActiveTab('log')}
          >
            Log
          </Button>
          <Button
            variant="ghost"
            className={`px-4 py-1 text-xs rounded-none ${
              activeTab === 'io' ? 'bg-gray-700' : ''
            }`}
            onClick={() => setActiveTab('io')}
          >
            Program I/O
          </Button>
        </div>
        <div className="flex-1 p-2 font-mono text-xs overflow-auto">
          {activeTab === 'io' ? (
            <div className="text-green-400">
              {output}
            </div>
          ) : (
            <div className="text-gray-400">
              [info] Program loaded successfully
              <br />[info] Starting execution at 0x00400000
              <br />[debug] Syscall 4: print_string
              <br />[info] Program completed normally
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConsoleOutput;