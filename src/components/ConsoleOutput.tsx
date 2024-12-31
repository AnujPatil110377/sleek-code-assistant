'use client'

const ConsoleOutput = ({ output }: { output: string }) => {
  return (
    <div className="h-60 p-4 resize-y overflow-auto min-h-[40vh] max-h-[50vh]">
      <div className="bg-gray-800 rounded-lg h-full flex flex-col overflow-hidden border border-gray-700 transition-all duration-300 hover:border-blue-500">
        <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center">
          <div className="flex gap-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-xs font-medium text-blue-400">Output</span>
        </div>
        <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-gray-800">
          <pre className="text-blue-400 whitespace-pre-wrap">
            {output || '> Ready for execution...\n> Type your MIPS code and click Execute to run.'}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default ConsoleOutput