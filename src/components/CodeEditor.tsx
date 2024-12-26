'use client'

const CodeEditor = ({ code, onChange }: { code: string; onChange: (value: string) => void }) => {
  console.log('CodeEditor rendering with code:', code?.substring(0, 100) + '...'); // Show first 100 chars
  
  return (
    <div className="flex-1 min-h-0 p-4">
      <div className="bg-gray-800 rounded-lg h-full flex flex-col overflow-hidden border border-gray-700">
        <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center">
          <span className="text-xs font-medium text-blue-400">MIPS Assembly</span>
        </div>
        <textarea
          className="w-full h-full bg-gray-800 text-gray-100 font-mono text-sm p-4 border-none focus:outline-none resize-none"
          value={code}
          onChange={(e) => {
            console.log('CodeEditor change event:', e.target.value?.substring(0, 100) + '...');
            onChange(e.target.value);
          }}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

export default CodeEditor;