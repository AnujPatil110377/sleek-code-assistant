import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface RegistersViewerProps {
  registers: { [key: string]: number };
  previousRegisters: { [key: string]: number };
  changedRegisters?: { [key: string]: number };
  onRegisterChange?: (name: string, value: number) => void;
  showChanges?: boolean;
}

const RegistersViewer = ({ 
  registers, 
  previousRegisters, 
  changedRegisters,
  onRegisterChange,
  showChanges = true 
}: RegistersViewerProps) => {
  const [editingRegister, setEditingRegister] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = (name: string) => {
    setEditingRegister(name);
    setEditValue(registers[name].toString());
  };

  const handleSave = (name: string) => {
    if (onRegisterChange) {
      const newValue = parseInt(editValue);
      if (!isNaN(newValue)) {
        onRegisterChange(name, newValue);
      }
    }
    setEditingRegister(null);
  };

  const hasChanged = (name: string) => {
    if (!showChanges) return false;
    if (name === 'sp') return false;
    return changedRegisters ? name in changedRegisters : 
           (previousRegisters[name] !== undefined && 
            previousRegisters[name] !== registers[name]);
  };

  const getRegisterDisplay = (name: string, value: number) => {
    if (hasChanged(name)) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 line-through">{previousRegisters[name]}</span>
          <span className="text-teal-400">{value}</span>
        </div>
      );
    }
    return <span className="text-teal-400">{value}</span>;
  };

  const registersList = Object.entries(registers);
  const midPoint = Math.ceil(registersList.length / 2);
  const leftRegisters = registersList.slice(0, midPoint);
  const rightRegisters = registersList.slice(midPoint);

  return (
    <div className="h-full p-4">
      <h2 className="text-sm font-semibold mb-2">Registers</h2>
      <div className="flex gap-4">
        {/* Left half */}
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-800">
              <th className="text-left p-1">Register</th>
              <th className="text-left p-1">Value</th>
            </tr>
          </thead>
          <tbody>
            {leftRegisters.map(([name, value]) => (
              <tr 
                key={name} 
                className={`border-b border-gray-800 transition-colors duration-500 ${
                  hasChanged(name) ? 'bg-blue-900 bg-opacity-30 animate-pulse' : ''
                }`}
              >
                <td className="p-1 font-mono">${name}</td>
                <td className="p-1 font-mono">
                  {editingRegister === name ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 h-6 py-0 px-1"
                      />
                      <button
                        onClick={() => handleSave(name)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    getRegisterDisplay(name, value)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Right half */}
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-800">
              <th className="text-left p-1">Register</th>
              <th className="text-left p-1">Value</th>
            </tr>
          </thead>
          <tbody>
            {rightRegisters.map(([name, value]) => (
              <tr 
                key={name} 
                className={`border-b border-gray-800 transition-colors duration-500 ${
                  hasChanged(name) ? 'bg-blue-900 bg-opacity-30 animate-pulse' : ''
                }`}
              >
                <td className="p-1 font-mono">${name}</td>
                <td className="p-1 font-mono">
                  {editingRegister === name ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 h-6 py-0 px-1"
                      />
                      <button
                        onClick={() => handleSave(name)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    getRegisterDisplay(name, value)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistersViewer;