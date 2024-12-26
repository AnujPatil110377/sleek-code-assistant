'use client'

const CodeEditor = ({ code, onChange }: { code: string; onChange: (value: string) => void }) => {
  return (
    <div className="flex-1 min-h-0 p-4">
      <div className="bg-[#1e1e1e] rounded-lg h-full flex flex-col overflow-hidden border border-gray-700">
        <div className="bg-[#252526] px-4 py-2 border-b border-gray-700 flex items-center">
          <span className="text-xs font-medium text-gray-400">Solution.cpp</span>
        </div>
        <textarea
          className="w-full h-full bg-[#1e1e1e] text-gray-100 font-mono text-sm p-4 border-none focus:outline-none resize-none [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-[#1e1e1e]"
          style={{
            lineHeight: '1.5',
            paddingLeft: '2rem'
          }}
          value={code}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export default CodeEditor