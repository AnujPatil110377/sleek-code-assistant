const RegistersViewer = () => {
  const registers = [
    { name: '$zero', num: '0', value: '0x00000000' },
    { name: '$at', num: '1', value: '0x00000000' },
    { name: '$v0', num: '2', value: '0x00000004' },
    { name: '$v1', num: '3', value: '0x00000000' },
    { name: '$a0', num: '4', value: '0x1000002c' },
    { name: '$a1', num: '5', value: '0x00000000' },
    { name: '$a2', num: '6', value: '0x00000000' },
    { name: '$a3', num: '7', value: '0x00000000' },
    { name: '$t0', num: '8', value: '0x00000001' },
    { name: '$t1', num: '9', value: '0x00000000' },
    { name: '$t2', num: '10', value: '0x00000000' },
    { name: '$t3', num: '11', value: '0x00000000' },
    { name: '$t4', num: '12', value: '0x00000000' },
    { name: '$t5', num: '13', value: '0x00000000' },
    { name: '$t6', num: '14', value: '0x00000000' },
    { name: '$t7', num: '15', value: '0x00000000' },
    { name: '$s0', num: '16', value: '0x00000005' },
    { name: '$s1', num: '17', value: '0x00000000' },
    { name: '$s2', num: '18', value: '0x00000000' },
    { name: '$s3', num: '19', value: '0x00000000' },
    { name: '$s4', num: '20', value: '0x00000000' },
    { name: '$s5', num: '21', value: '0x00000000' },
    { name: '$s6', num: '22', value: '0x00000000' },
    { name: '$s7', num: '23', value: '0x00000000' },
    { name: '$t8', num: '24', value: '0x00000000' },
    { name: '$t9', num: '25', value: '0x00000000' },
    { name: '$k0', num: '26', value: '0x00000000' },
    { name: '$k1', num: '27', value: '0x00000000' },
    { name: '$gp', num: '28', value: '0x10008000' },
    { name: '$sp', num: '29', value: '0x80000000' },
    { name: '$fp', num: '30', value: '0x00000000' },
    { name: '$ra', num: '31', value: '0x00000000' },
  ]

  return (
    <div className="h-full p-4">
      <h2 className="text-sm font-semibold mb-2">Registers</h2>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-800">
            <th className="text-left p-1">Register</th>
            <th className="text-left p-1">Num.</th>
            <th className="text-left p-1">Value</th>
          </tr>
        </thead>
        <tbody>
          {registers.map((reg) => (
            <tr key={reg.name} className="border-b border-gray-800">
              <td className="p-1 font-mono">{reg.name}</td>
              <td className="p-1 font-mono">{reg.num}</td>
              <td className="p-1 font-mono text-teal-400">{reg.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RegistersViewer;