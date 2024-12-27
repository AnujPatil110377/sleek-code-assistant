import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface MemoryViewerProps {
  memory: { [address: string]: number };
  onMemoryChange?: (address: string, value: number) => void;
}

const MemoryViewer = ({ memory, onMemoryChange }: MemoryViewerProps) => {
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [startAddress, setStartAddress] = useState(0x10010000);

  const toHexAddress = (addr: number): string => {
    return '0x' + addr.toString(16).toUpperCase().padStart(8, '0');
  };

  const fromHexAddress = (addr: string): number => {
    return parseInt(addr.replace('0x', ''), 16);
  };

  const addresses = Object.keys(memory)
    .sort((a, b) => fromHexAddress(a) - fromHexAddress(b));

  const displayableAddresses = addresses
    .filter(addr => {
      const decAddr = fromHexAddress(addr);
      return decAddr >= startAddress && decAddr < startAddress + 256;
    });

  return (
    <div className="h-[40vh] p-4">
      <div className="bg-gray-800 rounded-lg p-2 h-full w-[500px]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Memory</h2>
          <div className="flex space-x-2">
            <button
              className="text-xs text-gray-400 hover:text-white"
              onClick={() => setStartAddress(Math.max(0, startAddress - 64))}
            >
              Previous
            </button>
            <button
              className="text-xs text-gray-400 hover:text-white"
              onClick={() => setStartAddress(startAddress + 64)}
            >
              Next
            </button>
          </div>
        </div>
        <div className="overflow-y-auto overflow-x-auto h-[calc(100%-2rem)]">
          <table className="w-full text-xs font-mono whitespace-nowrap">
            <thead>
              <tr className="bg-gray-700">
                <th className="text-left p-1 sticky left-0 bg-gray-700 w-[100px]">Address</th>
                <th className="text-left p-1 w-[250px]">Value</th>
                <th className="text-left p-1 w-[150px]">ASCII</th>
              </tr>
            </thead>
            <tbody>
              {displayableAddresses.map((address) => (
                <tr key={address} className="border-b border-gray-700">
                  <td className="p-1 text-blue-400 sticky left-0 bg-gray-800">
                    {address}
                  </td>
                  <td className="p-1">
                    {editingAddress === address ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 h-6 py-0 px-1"
                        />
                        <button
                          onClick={() => {
                            if (onMemoryChange) {
                              const newValue = parseInt(editValue, 16);
                              if (!isNaN(newValue)) {
                                onMemoryChange(address, newValue);
                              }
                            }
                            setEditingAddress(null);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer hover:text-blue-300"
                        onClick={() => {
                          setEditingAddress(address);
                          setEditValue(memory[address].toString(16).padStart(2, '0'));
                        }}
                      >
                        {memory[address].toString(16).padStart(2, '0').toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="p-1 text-gray-400">
                    {memory[address] >= 32 && memory[address] <= 126
                      ? String.fromCharCode(memory[address])
                      : '.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemoryViewer;