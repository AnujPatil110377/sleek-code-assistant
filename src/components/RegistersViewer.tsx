const RegistersViewer = () => {
  const registers = [
    // First column
    [
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
    ],
    // Second column
    [
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
  ]

  return (
    <div className="h-full p-4">
      <div className="bg-gray-800 rounded-lg p-2 h-full">
        <h2 className="text-sm font-semibold text-blue-400 mb-2">Registers</h2>
        <div className="h-[calc(100%-2rem)] overflow-auto custom-scrollbar">
          <table className="w-full text-xs font-mono">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-700">
                <th className="text-left p-1 border-r border-gray-600">Register</th>
                <th className="text-left p-1 border-r border-gray-600">Value</th>
                <th className="text-left p-1 border-r border-gray-600">Register</th>
                <th className="text-left p-1">Value</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 16 }).map((_, index) => (
                <tr 
                  key={index}
                  className={`border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                    index % 2 === 0 ? 'bg-gray-750' : ''
                  }`}
                >
                  <td className="p-1 text-gray-300 border-r border-gray-600">{registers[0][index].name}</td>
                  <td className="p-1 text-blue-400 border-r border-gray-600">{registers[0][index].value}</td>
                  <td className="p-1 text-gray-300 border-r border-gray-600">{registers[1][index].name}</td>
                  <td className="p-1 text-blue-400">{registers[1][index].value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default RegistersViewer