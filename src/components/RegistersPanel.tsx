import { FC } from 'react';

interface Register {
  name: string;
  number: number;
  value: string;
}

interface RegistersPanelProps {
  registers: Register[];
}

const RegistersPanel: FC<RegistersPanelProps> = () => {
  const registers = Array.from({ length: 32 }, (_, i) => ({
    name: i === 0 ? '$zero' : `$${i}`,
    number: i,
    value: '0x00000000'
  }));

  // Special registers
  const specialRegisters = [
    { name: 'pc', value: '0x00400000' },
    { name: 'hi', value: '0x00000000' },
    { name: 'lo', value: '0x00000000' }
  ];

  return (
    <div className="w-80 bg-muted border-l border-border">
      <div className="flex border-b border-border">
        <button className="flex-1 px-4 py-2 text-sm hover:bg-background">Registers</button>
        <button className="flex-1 px-4 py-2 text-sm hover:bg-background">Coproc 1</button>
        <button className="flex-1 px-4 py-2 text-sm hover:bg-background">Coproc 0</button>
      </div>
      <div className="p-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-1">Name</th>
              <th className="p-1">Number</th>
              <th className="p-1">Value</th>
            </tr>
          </thead>
          <tbody>
            {registers.map((reg) => (
              <tr key={reg.name} className="hover:bg-background">
                <td className="p-1 font-mono">{reg.name}</td>
                <td className="p-1 font-mono">{reg.number}</td>
                <td className="p-1 font-mono">{reg.value}</td>
              </tr>
            ))}
            {specialRegisters.map((reg) => (
              <tr key={reg.name} className="border-t border-border hover:bg-background">
                <td className="p-1 font-mono">{reg.name}</td>
                <td className="p-1 font-mono">-</td>
                <td className="p-1 font-mono">{reg.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistersPanel; 