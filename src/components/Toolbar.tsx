import { Button } from "@/components/ui/button"

const Toolbar = ({ onAssemble, onReset, onStep }: { 
  onAssemble: () => void;
  onReset: () => void;
  onStep: () => void;
}) => {
  return (
    <div className="bg-[#1e1e1e] border-b border-gray-700 p-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-[#2d2d2d]">
          File
        </Button>
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
      <div className="flex items-center space-x-2">
        <span className="text-xs text-gray-400">Time Limit: 1000 ms</span>
      </div>
    </div>
  )
}

export default Toolbar