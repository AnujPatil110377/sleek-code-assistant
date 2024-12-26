import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
}

const CodeEditor = ({ code, onChange }: CodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleResize = () => {
      // Clear any existing timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      // Debounce the layout update
      resizeTimeoutRef.current = setTimeout(() => {
        if (editorRef.current?.layout) {
          console.log('Updating editor layout');
          editorRef.current.layout();
        }
      }, 100);
    };

    // Create ResizeObserver with debounced handler
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    // Observe the editor container
    const editorContainer = document.querySelector('.editor-container');
    if (editorContainer) {
      resizeObserver.observe(editorContainer);
      console.log('Started observing editor container');
    }

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeObserver.disconnect();
      console.log('Cleaned up resize observer');
    };
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.layout();
    console.log('Editor mounted successfully');
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