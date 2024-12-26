'use client'

const ConsoleOutput = ({ output }: { output: string }) => {
  return (
    <div className="h-full p-2">
      <div className="bg-gray-800 rounded-lg h-full flex flex-col overflow-hidden border border-gray-700 transition-all duration-300 hover:border-blue-500">
        <div className="bg-gray-700 px-4 py-1 border-b border-gray-600 flex items-center">
          <span className="text-xs font-medium text-blue-400">Output</span>
        </div>
        <div className="flex-1 p-2 font-mono text-xs overflow-auto bg-gray-800 custom-scrollbar">
          <div className="text-blue-400">
            {output || 'Run code to see output...'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsoleOutput