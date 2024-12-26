import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import Toolbar from './Toolbar';
import RegistersPanel from './RegistersPanel';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  onRun: () => void;
}

const CodeEditor = ({ code, onChange, onRun }: CodeEditorProps) => {
  const editorRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const editorContainer = document.querySelector('.editor-container');
    if (!editorContainer) return;

    const resizeObserver = new ResizeObserver(() => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Debounce the layout update
      timeoutRef.current = setTimeout(() => {
        if (editorRef.current?.layout) {
          console.log('Updating editor layout');
          editorRef.current.layout();
        }
      }, 100);
    });

    resizeObserver.observe(editorContainer);

    return () => {
      resizeObserver.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.layout();
  };

  return (
    <div className="flex flex-col h-full">
      <Toolbar onRun={onRun} />
      <div className="flex flex-1">
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
        <RegistersPanel registers={[]} />
      </div>
    </div>
  );
};

export default CodeEditor;