'use client'

const ConsoleOutput = ({ output }: { output: string }) => {
  return (
    <div className="h-48 p-4 min-h-[150px] max-h-[60vh]">
      <div className="bg-gray-800 rounded-lg h-full flex flex-col overflow-hidden border border-gray-700 transition-all duration-300 hover:border-blue-500 relative">
        <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between">
          <span className="text-xs font-medium text-blue-400">Output</span>
          <div className="cursor-row-resize text-gray-400 hover:text-blue-400">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12L4 8H12L8 12Z" fill="currentColor"/>
              <path d="M8 4L12 8H4L8 4Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-gray-800 custom-scrollbar">
          <div className="text-blue-400">
            {output || 'Run code to see output...'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsoleOutput