'use client'

import { Button } from "@/components/ui/button";

const CodeEditor = ({ code, onChange }: { code: string; onChange: (value: string) => void }) => {
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    console.log('Code changed:', newCode);
    onChange(newCode);
  };

  const testContent = () => {
    console.log('=== CURRENT EDITOR CONTENT ===');
    console.log('Content:');
    console.log(code);
    console.log('Length:', code?.length);
    console.log('Lines:', code?.split('\n').length);
    alert('Current content logged to console!');
  };

  return (
    <div className="flex-1 min-h-0 p-4">
      <div className="bg-gray-800 rounded-lg h-full flex flex-col overflow-hidden border border-gray-700">
        <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between">
          <span className="text-xs font-medium text-blue-400">MIPS Assembly</span>
          <Button
            onClick={testContent}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2 py-1"
          >
            Test Content
          </Button>
        </div>
        <textarea
          className="w-full h-full bg-gray-800 text-gray-100 font-mono text-sm p-4 border-none focus:outline-none resize-none"
          value={code}
          onChange={handleCodeChange}
          spellCheck={false}
          placeholder="Enter your MIPS assembly code here..."
        />
      </div>
    </div>
  );
};

export default CodeEditor;