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
        <RegistersPanel />
      </div>
    </div>
  );
};

export default CodeEditor;