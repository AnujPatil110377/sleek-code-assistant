import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Upload, Play, RotateCcw, StepForward } from "lucide-react"

interface ToolbarProps {
  onExecute?: () => Promise<void>;
  onReset?: () => void;
  onCodeChange?: (code: string) => void;
  onStep?: () => void;
  onAssemble?: () => void;  // Added this prop
  isLoading?: boolean;
  pc?: number;
}

const Toolbar = (props: ToolbarProps) => {
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
    if (props.onExecute) {
      try {
        console.log('Before await onExecute()');
        await props.onExecute();
        console.log('After await onExecute()');
      } catch (error) {
        console.error('Error during execution:', error);
      }
    } else {
      console.warn('No onExecute handler provided');
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

  const handleStepClick = () => {
    console.log('=== Step Button Clicked ===');
    if (props.onStep) {
      console.log('Calling step handler');
      props.onStep();
    } else {
      console.warn('No step handler provided');
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
          disabled={props.isLoading}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      <Button 
        variant="secondary" 
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleRunClick}
        disabled={props.isLoading}
      >
        {props.isLoading ? (
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
        disabled={props.isLoading}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset
      </Button>

      <Button
        variant="secondary"
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={handleStepClick}
        disabled={props.isLoading}
      >
        <StepForward className="w-4 h-4 mr-2" />
        Step
      </Button>

      <div className="ml-4 px-3 py-1 bg-gray-700 rounded-md flex items-center">
        <span className="text-sm text-gray-300 mr-2">PC:</span>
        <span className="font-mono text-blue-400">{props.pc || 0}</span>
      </div>
    </div>
  );
};

export default Toolbar;
