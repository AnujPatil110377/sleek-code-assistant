import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface MemoryViewerProps {
  memory: { [address: string]: number };
}

const MemoryViewer = ({ memory }: MemoryViewerProps) => {
  const [startAddress, setStartAddress] = useState(0x10010000);

  const displayableAddresses = Object.keys(memory)
    .filter(addr => {
      const numAddr = parseInt(addr, 16);
      return numAddr >= startAddress && numAddr < startAddress + 256;
    })
    .sort((a, b) => parseInt(a, 16) - parseInt(b, 16));

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
                <th className="text-left p-1 sticky left-0 bg-gray-700 w-[100px]">Addr</th>
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
                    {memory[address]?.toString(16).padStart(2, '0') || '00'}
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