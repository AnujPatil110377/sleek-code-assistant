interface OutputPanelProps {
  output: string;
}

const OutputPanel = ({ output }: OutputPanelProps) => {
  return (
    <div className="output-panel">
      <h2 className="text-lg font-medium mb-4">Output & Registers</h2>
      <div className="mb-4 p-4 bg-secondary rounded-lg">
        <h3 className="text-sm font-medium mb-2">Program Output</h3>
        <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Registers</h3>
        <div className="overflow-x-auto">
          <table className="registers-table">
            <thead>
              <tr>
                <th>Register</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>$zero</td>
                <td>0x00000000</td>
              </tr>
              <tr>
                <td>$v0</td>
                <td>0x00000004</td>
              </tr>
              <tr>
                <td>$a0</td>
                <td>0x10000000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;