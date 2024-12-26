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
  const frameRef = useRef<number>();

  useEffect(() => {
    const editorContainer = document.querySelector('.editor-container');
    if (!editorContainer) return;

    const resizeObserver = new ResizeObserver((entries) => {
      // Cancel any pending animation frame
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }

      // Schedule a new layout update
      frameRef.current = requestAnimationFrame(() => {
        entries.forEach(() => {
          if (editorRef.current?.layout) {
            console.log('Updating editor layout');
            editorRef.current.layout();
          }
        });
      });
    });

    resizeObserver.observe(editorContainer);

    return () => {
      resizeObserver.disconnect();
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
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
        <RegistersPanel />
      </div>
    </div>
  );
};

export default CodeEditor;