'use client'

interface RegisterViewerProps {
  registers: { [key: string]: number };
  previousRegisters: { [key: string]: number };
}

const RegisterViewer = ({ registers, previousRegisters }: RegisterViewerProps) => {
  const hasChanged = (name: string) => {
    return previousRegisters[name] !== undefined && 
           previousRegisters[name] !== registers[name];
  };

  return (
    <div className="h-[40vh] p-4">
      <div className="bg-gray-800 rounded-lg p-2 h-full w-[500px]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Registers</h2>
        </div>
        <div className="overflow-y-auto overflow-x-auto h-[calc(100%-2rem)]">
          <table className="w-full text-xs font-mono whitespace-nowrap">
            <thead>
              <tr className="bg-gray-700">
                <th className="text-left p-1 sticky left-0 bg-gray-700 w-[100px]">Register</th>
                <th className="text-left p-1 w-[100px]">Dec</th>
                <th className="text-left p-1 w-[100px]">Hex</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(registers).map(([name, value]) => (
                <tr 
                  key={name} 
                  className={`border-b border-gray-700 ${
                    hasChanged(name) ? 'bg-blue-900 bg-opacity-30' : ''
                  }`}
                >
                  <td className="p-1 text-blue-400 sticky left-0 bg-gray-800">
                    ${name}
                  </td>
                  <td className="p-1">
                    {value}
                  </td>
                  <td className="p-1 text-gray-400">
                    {value.toString(16).padStart(8, '0')}
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

export default RegisterViewer; 