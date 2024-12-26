const RegistersViewer = () => {
  const registers = [
    { name: '$zero', value: 0 },
    { name: '$at', value: 0 },
    { name: '$v0', value: 0 },
    { name: '$v1', value: 0 },
    { name: '$a0', value: 0 },
    { name: '$a1', value: 0 },
    { name: '$a2', value: 0 },
    { name: '$a3', value: 0 },
    { name: '$t0', value: 0 },
    { name: '$t1', value: 0 },
    { name: '$t2', value: 0 },
    { name: '$t3', value: 0 },
    { name: '$t4', value: 0 },
    { name: '$t5', value: 0 },
    { name: '$t6', value: 0 },
    { name: '$t7', value: 0 },
    { name: '$s0', value: 0 },
    { name: '$s1', value: 0 },
    { name: '$s2', value: 0 },
    { name: '$s3', value: 0 },
    { name: '$s4', value: 0 },
    { name: '$s5', value: 0 },
    { name: '$s6', value: 0 },
    { name: '$s7', value: 0 },
    { name: '$t8', value: 0 },
    { name: '$t9', value: 0 },
    { name: '$k0', value: 0 },
    { name: '$k1', value: 0 },
    { name: '$gp', value: 0 },
    { name: '$sp', value: 0 },
    { name: '$fp', value: 0 },
    { name: '$ra', value: 0 },
  ]

  return (
    <div className="h-full p-4">
      <h2 className="text-sm font-semibold mb-2">Registers</h2>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-800">
            <th className="text-left p-1">Register</th>
            <th className="text-left p-1">Value</th>
          </tr>
        </thead>
        <tbody>
          {registers.map((reg) => (
            <tr key={reg.name} className="border-b border-gray-800">
              <td className="p-1 font-mono">{reg.name}</td>
              <td className="p-1 font-mono text-teal-400">{reg.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RegistersViewer;