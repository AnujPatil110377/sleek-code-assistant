'use client'

const ConsoleOutput = ({ output }: { output: string }) => {
  return (
    <div className="h-60 p-4">
      <div className="bg-gray-800 rounded-lg h-full flex flex-col overflow-hidden border border-gray-700">
        <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
          <span className="text-xs font-medium text-blue-400">Console Output</span>
        </div>
        <div className="flex-1 p-4 font-mono text-xs overflow-auto whitespace-pre-wrap">
          {output || 'Run code to see output...'}
        </div>
      </div>
    </div>
  );
};

export default ConsoleOutput;