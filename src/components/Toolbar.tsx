import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

const Toolbar = ({ 
  onAssemble, 
  onReset, 
  onStep,
  onCodeChange 
}: { 
  onAssemble: () => void;
  onReset: () => void;
  onStep: () => void;
  onCodeChange: (code: string) => void;
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        // Update the editor content with the file text
        onCodeChange(text)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="bg-[#1e1e1e] border-b border-gray-700 p-2 flex items-center justify-between">
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
            className="text-gray-300 hover:text-white hover:bg-[#2d2d2d] flex items-center gap-2"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload size={16} />
            Upload File
          </Button>
        </div>
        <div className="h-4 w-px bg-gray-700" />
        <Button 
          variant="secondary" 
          className="bg-[#3e8e41] hover:bg-[#4caf50] text-white"
          onClick={onAssemble}
        >
          Run
        </Button>
        <Button 
          variant="secondary" 
          className="bg-gray-700 hover:bg-gray-600 text-white"
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
      <div className="flex items-center space-x-2" />
    </div>
  )
}

export default Toolbar