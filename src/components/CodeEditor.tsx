import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
}

const CodeEditor = ({ code, onChange }: CodeEditorProps) => {
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      if (editorRef.current?.layout) {
        requestAnimationFrame(() => {
          editorRef.current.layout();
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    requestAnimationFrame(() => {
      editor.layout();
    });
  };

  return (
    <Editor
      height="calc(100% - 3rem)"
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
      }}
      onMount={handleEditorDidMount}
    />
  );
};

export default CodeEditor;