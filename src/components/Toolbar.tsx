import { Button } from "@/components/ui/button"
import { Upload, Play, RotateCcw } from "lucide-react"

interface ToolbarProps {
  onExecute: () => void;
  onReset: () => void;
  onCodeChange: (code: string) => void;
  isAssembled?: boolean;
}

const Toolbar = ({ onExecute, onReset, onCodeChange, isAssembled = false }: ToolbarProps) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== File Upload Started ===');
    const file = event.target.files?.[0]
    if (file) {
      console.log('File selected:', file.name);
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        console.log('File contents loaded:', text.substring(0, 100) + '...');
        onCodeChange(text);
      }
      reader.readAsText(file)
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
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload
        </Button>
      </div>

      <Button 
        variant="secondary" 
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => {
          console.log('Run button clicked');
          alert('Run button clicked');
          if (onExecute) {
            console.log('Calling onExecute function');
            onExecute();
          } else {
            console.error('onExecute function is not defined!');
            alert('Error: Execute function not found!');
          }
        }}
      >
        <Play className="w-4 h-4 mr-2" />
        Run
      </Button>

      <Button 
        variant="secondary" 
        className="bg-gray-700 hover:bg-gray-600 text-white"
        onClick={onReset}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset
      </Button>
    </div>
  );
};

export default Toolbar;