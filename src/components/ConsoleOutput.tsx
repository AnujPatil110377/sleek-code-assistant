'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const ConsoleOutput = ({ output }: { output: string }) => {
  const [activeTab, setActiveTab] = useState<'testcases' | 'result'>('result')
  
  return (
    <div className="h-48 p-4">
      <div className="bg-[#1e1e1e] rounded-lg h-full flex flex-col overflow-hidden border border-gray-700">
        <div className="flex border-b border-gray-700 bg-[#252526]">
          <Button
            variant="ghost"
            className={`px-4 py-2 text-xs rounded-none hover:bg-[#2d2d2d] ${
              activeTab === 'testcases' ? 'bg-[#2d2d2d] text-white' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('testcases')}
          >
            Testcases
          </Button>
          <Button
            variant="ghost"
            className={`px-4 py-2 text-xs rounded-none hover:bg-[#2d2d2d] ${
              activeTab === 'result' ? 'bg-[#2d2d2d] text-white' : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('result')}
          >
            Result
          </Button>
        </div>
        <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-[#1e1e1e]">
          {activeTab === 'result' ? (
            <div className="text-green-400">
              ✓ Accepted
              <br />Runtime: 4 ms
              <br />Memory: 8.2 MB
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-2 bg-[#252526] rounded">
                <div className="text-gray-400 mb-1">Input:</div>
                <div className="text-white">{output}</div>
              </div>
              <div className="p-2 bg-[#252526] rounded">
                <div className="text-gray-400 mb-1">Expected:</div>
                <div className="text-white">[2, 7]</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConsoleOutput