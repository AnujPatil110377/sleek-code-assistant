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

    // Cleanup
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
    <div className="editor-container h-full">
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
    </div>
  );
};

export default CodeEditor;