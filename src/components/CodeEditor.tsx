import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
}

const CodeEditor = ({ code, onChange }: CodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    
    resizeObserverRef.current = new ResizeObserver((entries) => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        entries.forEach(() => {
          if (editorRef.current?.layout) {
            editorRef.current.layout();
          }
        });
      }, 100);
    });

    const editorContainer = document.querySelector('.editor-container');
    if (editorContainer) {
      resizeObserverRef.current.observe(editorContainer);
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      clearTimeout(resizeTimeout);
    };
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.layout();
  };

  return (
    <div className="flex h-full">
      <div className="editor-container flex-1 h-full bg-background">
        <Editor
          height="100%"
          width="100%"
          defaultLanguage="mips"
          value={code}
          onChange={onChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            padding: { top: 10, bottom: 10 },
          }}
          onMount={handleEditorDidMount}
        />
      </div>
      
      <div className="w-64 bg-muted p-4 border-l border-border">
        <h3 className="font-semibold mb-4">Registers</h3>
        <div className="space-y-2">
          {Array.from({ length: 32 }, (_, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm font-mono">${i}</span>
              <span className="text-sm font-mono text-muted-foreground">0x00000000</span>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono">PC</span>
              <span className="text-sm font-mono text-muted-foreground">0x00000000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;