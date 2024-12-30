import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Upload, Play, RotateCcw } from "lucide-react"

interface ToolbarProps {
  onExecute: () => Promise<void>;
  onReset?: () => void;
  onCodeChange?: (code: string) => void;
  isLoading?: boolean;
}

const Toolbar = (props: ToolbarProps) => {
  // Log props on component mount and updates
  useEffect(() => {
    console.log('Toolbar props:', props);
  }, [props]);

  const [isLoading, setIsLoading] = useState(props.isLoading || false);

  useEffect(() => {
    console.log('Toolbar rendered with isLoading:', isLoading);
  }, [isLoading]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== File Upload Started ===');
    const file = event.target.files?.[0]
    if (file) {
      console.log('File selected:', file.name);
      const reader = new FileReader()
      reader.onload = (e) => {
        console.log('File read complete');
        const text = e.target?.result as string
        console.log('File contents length:', text.length);
        if (props.onCodeChange) {
          props.onCodeChange(text)
          console.log('Code change handler called with new code');
        } else {
          console.warn('No onCodeChange handler provided');
        }
      }
      reader.onerror = (e) => {
        console.error('File read error:', e);
      }
      reader.readAsText(file)
    } else {
      console.warn('No file selected');
    }
  }

  const handleRunClick = async () => {
    console.log('=== Run Button Clicked ===');
    console.log('Props at click time:', props);
    setIsLoading(true);
    console.log('Calling execute handler');
    try {
      console.log('Before await onExecute()');
      if (typeof props.onExecute === 'function') {
        await props.onExecute();
        console.log('After await onExecute()');
      } else {
        console.error('onExecute is not a function. Props:', props);
      }
    } catch (error) {
      console.error('Error during execution:', error);
    } finally {
      console.log('Setting loading state to false');
      setIsLoading(false);
    }
  }
  
  const handleResetClick = () => {
    console.log('=== Reset Button Clicked ===');
    if (props.onReset) {
      console.log('Calling reset handler');
      props.onReset();
    } else {
      console.warn('No reset handler provided');
    }
  }

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center space-x-2">
      <div className="relative">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".txt,.asm"
          onChange={handleFileUpload}
        />
        <Button 
          variant="ghost" 
          className="text-gray-300 hover:text-blue-400 hover:bg-gray-700"
          onClick={() => {
            console.log('=== Upload Button Clicked ===');
            document.getElementById('file-upload')?.click()
          }}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      <Button 
        variant="secondary" 
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleRunClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="animate-spin mr-2">⌛</span>
            Running...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Run
          </>
        )}
      </Button>

      <Button 
        variant="secondary" 
        className="bg-gray-700 hover:bg-gray-600 text-white"
        onClick={handleResetClick}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset
      </Button>
    </div>
  );
};

export default Toolbar;