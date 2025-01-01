# 🚀 MIPS Assembly Simulator

An interactive web-based MIPS assembly simulator with real-time execution, step-by-step debugging, and AI-powered assistance.

## ✨ Features

- **Interactive Code Editor**: Write and edit MIPS assembly code with syntax highlighting
- **Real-time Simulation**: Execute MIPS assembly code instantly
- **Step-by-Step Debugging**: Walk through your code instruction by instruction
- **Register & Memory Visualization**: See how registers and memory change in real-time
- **AI Assistant**: Get help with MIPS programming through an integrated AI chat interface
- **Console Output**: View program output and execution results
- **Fullscreen Mode**: Toggle between compact and fullscreen views

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Build Tool**: Vite
- **API Integration**: Groq AI API for intelligent assistance
- **Backend**: Python-based MIPS simulation server

## 🚀 Getting Started

1. **Clone the repository**
```sh
git clone <your-repo-url>
cd mips-simulator
```

2. **Install dependencies**
```sh
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```sh
VITE_GROQ_API_KEY=your_groq_api_key
```

4. **Start the development server**
```sh
npm run dev
```

## 💡 Usage

1. Write your MIPS assembly code in the editor
2. Click "Execute" to run the entire program
3. Use "Step" to execute one instruction at a time
4. Monitor registers and memory changes in real-time
5. Use the AI assistant for help with MIPS programming
6. View program output in the console window

## 🔧 Available MIPS Instructions

- Basic arithmetic: `add`, `sub`, `addi`, `mul`
- Logical operations: `and`, `or`, `andi`, `ori`, `xor`, `nor`, `sll`, `srl`
- Memory access: `lw`, `sw`
- Control flow: `beq`, `bne`, `j`, `jal`, `jr`
- Special instructions: `la`, `li`, `lui`
- System calls: print integer, print string, exit program

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MIPS Architecture Documentation
- React and TypeScript communities
- Contributors and maintainers

## 📞 Support

If you encounter any issues or have questions, please open an issue in the repository.
