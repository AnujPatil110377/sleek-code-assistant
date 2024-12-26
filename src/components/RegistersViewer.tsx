import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface RegistersViewerProps {
  registers: { [key: string]: number };
  onRegisterChange?: (name: string, value: number) => void;
}

const RegistersViewer = ({ registers, onRegisterChange }: RegistersViewerProps) => {
  console.log('RegistersViewer received registers:', registers);

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
              <tr key={name} className="border-b border-gray-800">
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
                    <span
                      className="text-teal-400 cursor-pointer hover:text-teal-300"
                      onClick={() => handleEdit(name)}
                    >
                      {value}
                    </span>
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
              <tr key={name} className="border-b border-gray-800">
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
                    <span
                      className="text-teal-400 cursor-pointer hover:text-teal-300"
                      onClick={() => handleEdit(name)}
                    >
                      {value}
                    </span>
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