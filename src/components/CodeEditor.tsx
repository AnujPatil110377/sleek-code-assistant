'use client'

const CodeEditor = ({ code, onChange }: { code: string; onChange: (value: string) => void }) => {
  return (
    <div className="flex-1 min-h-0 p-4">
      <div className="bg-gray-800 rounded-lg h-full flex flex-col overflow-hidden">
        <textarea
          className="w-full h-full bg-gray-900 text-gray-100 font-mono text-sm p-4 border-none focus:outline-none resize-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] rounded-sm [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-gray-800"
          style={{
            lineHeight: '1.5',
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '3ch 1px',
            paddingLeft: '6ch'
          }}
          placeholder="; Enter your MIPS assembly code here"
          value={code}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export default CodeEditor;