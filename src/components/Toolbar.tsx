import { Button } from "@/components/ui/button"

const Toolbar = ({ onAssemble, onReset, onStep }: { 
  onAssemble: () => void;
  onReset: () => void;
  onStep: () => void;
}) => {
  return (
    <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center space-x-2">
      <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700">
        File
      </Button>
      <div className="h-4 w-px bg-gray-700" />
      <Button 
        variant="secondary" 
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={onAssemble}
      >
        Assemble
      </Button>
      <Button 
        variant="secondary" 
        className="bg-red-600 hover:bg-red-700 text-white"
        onClick={onReset}
      >
        Reset
      </Button>
      <Button 
        variant="secondary" 
        className="bg-yellow-600 hover:bg-yellow-700 text-white"
        onClick={onStep}
      >
        Step
      </Button>
    </div>
  )
}

export default Toolbar;