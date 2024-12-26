import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

interface ToolbarProps {
  onAssemble: () => void;
  onReset: () => void;
  onStep: () => void;
  onCodeChange: (code: string) => void;
  isRunning: boolean;
}

const Toolbar = ({ 
  onAssemble, 
  onReset, 
  onStep,
  onCodeChange,
  isRunning 
}: ToolbarProps) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        if (onCodeChange) {
          onCodeChange(text)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".txt"
            onChange={handleFileUpload}
          />
          <Button 
            variant="ghost" 
            className="text-gray-300 hover:text-blue-400 hover:bg-gray-700 flex items-center gap-2"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload size={16} />
            Upload File
          </Button>
        </div>
        <div className="h-4 w-px bg-gray-700" />
        <button
          onClick={onAssemble}
          disabled={isRunning}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
        <button
          onClick={onStep}
          disabled={isRunning}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Step
        </button>
        <button
          onClick={onReset}
          disabled={isRunning}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Reset
        </button>
      </div>
      <div className="flex items-center space-x-2" />
    </div>
  )
}

export default Toolbar