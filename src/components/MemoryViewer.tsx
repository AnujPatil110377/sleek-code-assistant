const MemoryViewer = () => {
  const memoryData = [
    { address: '10000000', data: '48 65 6c 6c 6f 2c 20 77 6f 72 6c 64 21 20 54 68', ascii: 'Hello, world! ThE PUSSY OF THE WORLD' },
    { address: '10000010', data: '69 73 20 73 74 72 69 6e 67 20 69 73 20 66 72 6f', ascii: 'is string is fro' },
    { address: '10000020', data: '6d 20 4d 49 50 53 21 0a 00 00 00 00 20 00 00 00', ascii: 'm MIPS!....    .' },
    { address: '10000030', data: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00', ascii: '................' },
    { address: '10000040', data: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00', ascii: '................' },
    { address: '10000050', data: '00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00', ascii: '................' },
  ]

  return (
    <div className="h-[40vh] p-4">
      <div className="bg-gray-800 rounded-lg p-2 h-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">Memory</h2>
          <div className="flex space-x-2">
            <button className="text-xs text-gray-400 hover:text-white">Previous</button>
            <button className="text-xs text-gray-400 hover:text-white">Next</button>
          </div>
        </div>
        <div className="overflow-y-auto overflow-x-auto h-[calc(100%-2rem)]">
          <table className="w-full text-xs font-mono whitespace-nowrap">
            <thead>
              <tr className="bg-gray-700">
                <th className="text-left p-1 sticky left-0 bg-gray-700">Addr</th>
                <th className="text-left p-1 min-w-[400px]">Data</th>
                <th className="text-left p-1">Ascii</th>
              </tr>
            </thead>
            <tbody>
              {memoryData.map((row) => (
                <tr key={row.address} className="border-b border-gray-700">
                  <td className="p-1 text-blue-400 sticky left-0 bg-gray-800">{row.address}</td>
                  <td className="p-1">{row.data}</td>
                  <td className="p-1 text-gray-400">{row.ascii}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MemoryViewer;