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
        <div className="grid grid-cols-2 gap-4 h-[calc(100%-2rem)] overflow-auto custom-scrollbar">
          {registers.map((column, colIndex) => (
            <div key={colIndex} className="space-y-1">
              {column.map((reg) => (
                <div 
                  key={reg.name} 
                  className="flex justify-between items-center p-1 text-xs font-mono hover:bg-gray-700 rounded transition-colors"
                >
                  <span className="text-gray-300">{reg.name}</span>
                  <span className="text-blue-400">{reg.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RegistersViewer