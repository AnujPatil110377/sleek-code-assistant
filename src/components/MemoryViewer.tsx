const MemoryViewer = () => {
  const memoryData = [
    { address: '10000000', data: '48 65 6c 6c 6f 2c 20 77 6f 72 6c 64 21 20 54 68', ascii: 'Hello, world! Th' },
    { address: '10000010', data: '69 73 20 73 74 72 69 6e 67 20 69 73 20 66 72 6f', ascii: 'is string is fro' },
    { address: '10000020', data: '6d 20 4d 49 50 53 21 0a 00 00 00 00 20 00 00 00', ascii: 'm MIPS!....    .' },
    { address: '10000030', data: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00', ascii: '................' },
    { address: '10000040', data: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00', ascii: '................' },
    { address: '10000050', data: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00', ascii: '................' },
    { address: '10000060', data: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00', ascii: '................' },
    { address: '10000070', data: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00', ascii: '................' },
    { address: '10000080', data: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00', ascii: '................' },
  ]

  return (
    <div className="h-64 p-4">
      <div className="bg-gray-800 rounded-lg p-2 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-blue-400">Memory</h2>
          <div className="flex space-x-2">
            <button className="text-xs text-gray-400 hover:text-blue-400 transition-colors">Previous</button>
            <button className="text-xs text-gray-400 hover:text-blue-400 transition-colors">Next</button>
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className="overflow-auto h-full custom-scrollbar">
            <table className="w-full text-xs font-mono relative">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-700">
                  <th className="text-left p-1 border-r border-gray-600">Addr</th>
                  <th className="text-left p-1 border-r border-gray-600">Data</th>
                  <th className="text-left p-1">Ascii</th>
                </tr>
              </thead>
              <tbody>
                {memoryData.map((row, index) => (
                  <tr 
                    key={row.address} 
                    className={`border-b border-gray-700 hover:bg-gray-700 transition-colors ${
                      index % 2 === 0 ? 'bg-gray-750' : ''
                    }`}
                  >
                    <td className="p-1 text-blue-400 border-r border-gray-600">{row.address}</td>
                    <td className="p-1 border-r border-gray-600 whitespace-nowrap">{row.data}</td>
                    <td className="p-1 text-gray-400">{row.ascii}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Vertical scrollbar */}
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gray-700">
            <div className="w-full h-1/3 bg-gray-600 rounded hover:bg-blue-500 transition-colors cursor-pointer" />
          </div>
          {/* Horizontal scrollbar */}
          <div className="absolute left-0 right-2 bottom-0 h-2 bg-gray-700">
            <div className="h-full w-1/3 bg-gray-600 rounded hover:bg-blue-500 transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemoryViewer