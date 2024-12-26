import { FC } from 'react';
import { 
  FileText, 
  Save, 
  Folder, 
  Play, 
  Pause, 
  StepForward, 
  Settings, 
  ArrowRight
} from 'lucide-react';

interface ToolbarProps {
  onRun: () => void;
}

const Toolbar: FC<ToolbarProps> = ({ onRun }) => {
  return (
    <div className="bg-muted border-b border-border p-2 flex items-center gap-2">
      <button className="p-1 hover:bg-background rounded" title="New File">
        <FileText size={16} />
      </button>
      <button className="p-1 hover:bg-background rounded" title="Open File">
        <Folder size={16} />
      </button>
      <button className="p-1 hover:bg-background rounded" title="Save">
        <Save size={16} />
      </button>
      <div className="w-px h-4 bg-border mx-2" />
      <button className="p-1 hover:bg-background rounded" title="Run" onClick={onRun}>
        <Play size={16} />
      </button>
      <button className="p-1 hover:bg-background rounded" title="Pause">
        <Pause size={16} />
      </button>
      <button className="p-1 hover:bg-background rounded" title="Step">
        <StepForward size={16} />
      </button>
      <div className="w-px h-4 bg-border mx-2" />
      <button className="p-1 hover:bg-background rounded" title="Settings">
        <Settings size={16} />
      </button>
      <button className="p-1 hover:bg-background rounded" title="Tools">
        <ArrowRight size={16} />
      </button>
      
      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm">Run speed at max (no interaction)</span>
        <input 
          type="range" 
          className="w-32 h-2 bg-background rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Toolbar;