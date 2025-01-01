from flask import Flask, request, jsonify, session
from flask_cors import CORS  # Add CORS support
import re
from io import StringIO
import sys
import uuid

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register mapping from names to numbers (same as original)
reg_map = {
    'zero': 0, 'at': 1,
    'v0': 2,  'v1': 3,
    'a0': 4,  'a1': 5,  'a2': 6,  'a3': 7,
    't0': 8,  't1': 9,  't2': 10, 't3': 11, 't4': 12,
    't5': 13, 't6': 14, 't7': 15,
    's0': 16, 's1':17,  's2':18,  's3':19,
    's4':20,  's5':21,  's6':22,  's7':23,
    't8':24,  't9':25,  'k0':26,  'k1':27,
    'gp':28,  'sp':29,  'fp':30,  'ra':31
}

# Add a dictionary to store execution states
execution_states = {}

# Original helper functions remain the same
def get_register_number(reg_name):
    reg_name = reg_name.strip().lstrip('$')
    if reg_name.isdigit():
        return int(reg_name)
    elif reg_name in reg_map:
        return reg_map[reg_name]
    else:
        raise ValueError(f"Unknown register name {reg_name}")

def get_register_name(num):
    for name, n in reg_map.items():
        if n == num:
            return name
    raise ValueError(f"Unknown register number {num}")

# Modified to accept string content instead of file
def read_asm_content(content):
    # Normalize line endings
    content = content.replace('\r\n', '\n')
    lines = content.split('\n')
    instructions = []
    for line in lines:
        # Remove comments and whitespace
        line = re.sub(r'#.*', '', line).strip()
        if line:
            instructions.append(line)
    return instructions

def parse_labels_and_instructions(instructions):
    labels = {}
    parsed_instructions = []
    pc = 0
    data_mode = False
    memory = {}
    current_address = 0x10010000  # Starting address for data section

    for line in instructions:
        if line.startswith(".data"):
            data_mode = True
            continue
        elif line.startswith(".text"):
            data_mode = False
            pc = 0
            continue

        if data_mode:
            if ':' in line:
                label, line_part = line.split(':', 1)
                labels[label.strip()] = current_address
                line = line_part.strip()
            if line.startswith('.asciiz'):
                # Extract the string content between quotes
                match = re.search(r'\.asciiz\s*"([^"]*)"', line)
                if match:
                    string_data = match.group(1)
                    # Process the string character by character
                    i = 0
                    while i < len(string_data):
                        if string_data[i:i+2] == '\\n':
                            # Store actual newline character
                            memory[current_address] = ord('\n')
                            i += 2
                        else:
                            memory[current_address] = ord(string_data[i])
                            i += 1
                        current_address += 1
                    # Null terminate the string
                    memory[current_address] = 0
                    current_address += 1
            elif line.startswith('.word'):
                line = line.replace('.word', '').strip()
                values = line.split(',')
                for value in values:
                    memory[current_address] = int(value)
                    current_address += 4
        else:
            if ':' in line:
                label, line_part = line.split(':', 1)
                labels[label.strip()] = pc
                line = line_part.strip()
            if line:
                parsed_instructions.append(line)
                pc += 4

    return parsed_instructions, labels, memory

def convert_to_binary(instruction, labels, current_pc):
    opcodes = {
        "addi": "001000",
        "andi": "001100",
        "ori": "001101",
        "beq": "000100",
        "bne": "000101",
        "j": "000010",
        "jal": "000011",
        "lw": "100011",
        "sw": "101011",
        "lui": "001111",
        "and": "000000",
        "or": "000000",
        "slt": "000000",
        "add": "000000",
        "sub": "000000",
        "mul": "011100",  # Special MIPS opcode for multiplication
        "sll": "000000",
        "srl": "000000",
        "jr": "000000",
        "xor": "000000",
        "nor": "000000",
        "syscall": "000000",
    }
    functs = {
        "and": "100100",
        "or": "100101",
        "slt": "101010",
        "add": "100000",
        "sub": "100010",
        "mul": "000010",    # Function code for mul
        "sll": "000000",
        "srl": "000010",
        "jr": "001000",
        "xor": "100110",
        "nor": "100111",
        "syscall": "001100"
    }

    parts = re.split(r'[,\s()]+', instruction)
    parts = [p for p in parts if p]  # Remove empty strings
    op = parts[0]

    try:
        if op == "la":  # Handle load address instruction
            rt_num = get_register_number(parts[1])
            label = parts[2].strip()  # Remove any whitespace
            if label not in labels:
                raise ValueError(f"Label {label} not found")
                
            label_address = labels[label]
            # Split into lui and ori instructions
            upper = (label_address >> 16) & 0xFFFF
            lower = label_address & 0xFFFF
            
            # Create lui instruction for upper bits
            lui_inst = f"{opcodes['lui']}00000{format(rt_num, '05b')}{format(upper, '016b')}"
            # Create ori instruction for lower bits
            ori_inst = f"{opcodes['ori']}{format(rt_num, '05b')}{format(rt_num, '05b')}{format(lower, '016b')}"
            
            return [lui_inst, ori_inst]
            
        elif op == "li":
            rd_num = get_register_number(parts[1])
            imm_value = int(parts[2])
            if -32768 <= imm_value <= 65535:
                # Use addi with $zero
                rs = format(0, '05b')  # $zero register
                rd = format(rd_num, '05b')
                imm = format(imm_value & 0xFFFF, '016b')
                return f"{opcodes['addi']}{rs}{rd}{imm}"
            else:
                # For larger immediates, need lui and ori
                # First instruction: lui rd, upper 16 bits
                upper = (imm_value >> 16) & 0xFFFF
                lower = imm_value & 0xFFFF
                rd = format(rd_num, '05b')
                rs = format(0, '05b')
                lui_inst = f"{opcodes['lui']}{rs}{rd}{format(upper, '016b')}"
                # Second instruction: ori rd, rd, lower 16 bits
            ori_inst = f"{opcodes['ori']}{rd}{rd}{format(lower, '016b')}"
            return [lui_inst, ori_inst]
        elif op == "syscall":
            return f"{opcodes[op]}00000000000000000000{functs[op]}"
        elif op in ["addi", "andi", "ori"]:
            rt_num = get_register_number(parts[1])
            rs_num = get_register_number(parts[2])
            imm = int(parts[3])
            rs = format(rs_num, '05b')
            rt = format(rt_num, '05b')
            imm = format(imm & 0xFFFF, '016b')
            return f"{opcodes[op]}{rs}{rt}{imm}"
        elif op in ["lw", "sw"]:
            rt_num = get_register_number(parts[1])
            if len(parts) == 4:
                # Format: lw $rt, offset($rs)
                offset = int(parts[2])
                base_num = get_register_number(parts[3])
                rs = format(base_num, '05b')
                rt = format(rt_num, '05b')
                imm = format(offset & 0xFFFF, '016b')
                return f"{opcodes[op]}{rs}{rt}{imm}"
            elif len(parts) == 3:
                # Format: lw $rt, label
                address = labels.get(parts[2])
                if address is None:
                    raise ValueError(f"Label {parts[2]} not found")
                rs = format(0, '05b')  # Using $zero as base
                rt = format(rt_num, '05b')
                imm = format(address & 0xFFFF, '016b')
                return f"{opcodes[op]}{rs}{rt}{imm}"
            else:
                raise ValueError("Invalid lw/sw instruction format")
        elif op in ["beq", "bne"]:
            rs_num = get_register_number(parts[1])
            rt_num = get_register_number(parts[2])
            label = parts[3]
            if label in labels:
                offset = ((labels[label] - (current_pc + 4)) >> 2)
                imm = format(offset & 0xFFFF, '016b')
            else:
                imm = "0000000000000000"
            rs = format(rs_num, '05b')
            rt = format(rt_num, '05b')
            return f"{opcodes[op]}{rs}{rt}{imm}"
        elif op == "j" or op == "jal":
            label = parts[1]
            if label in labels:
                address = labels[label] >> 2
                return f"{opcodes[op]}{format(address, '026b')}"
            else:
                return None
        elif op in ["sll", "srl"]:
            rd_num = get_register_number(parts[1])
            rt_num = get_register_number(parts[2])
            shamt = int(parts[3])
            rs = format(0, '05b')
            rt = format(rt_num, '05b')
            rd = format(rd_num, '05b')
            shamt = format(shamt & 0x1F, '05b')
            funct = functs[op]
            return f"{opcodes[op]}{rs}{rt}{rd}{shamt}{funct}"
        elif op == "jr":
            rs_num = get_register_number(parts[1])
            rs = format(rs_num, '05b')
            rt = "00000"
            rd = "00000"
            shamt = "00000"
            funct = functs[op]
            return f"{opcodes[op]}{rs}{rt}{rd}{shamt}{funct}"
        elif op == "mul":
            rd_num = get_register_number(parts[1])
            rs_num = get_register_number(parts[2])
            rt_num = get_register_number(parts[3])
            rs = format(rs_num, '05b')
            rt = format(rt_num, '05b')
            rd = format(rd_num, '05b')
            shamt = "00000"
            funct = functs[op]
            return f"{opcodes[op]}{rs}{rt}{rd}{shamt}{funct}"
        else:
            # R-type instructions (add, sub, and, or, slt, etc.)
            rd_num = get_register_number(parts[1])
            rs_num = get_register_number(parts[2])
            rt_num = get_register_number(parts[3])
            rs = format(rs_num, '05b')
            rt = format(rt_num, '05b')
            rd = format(rd_num, '05b')
            shamt = "00000"
            funct = functs[op]
            return f"{opcodes[op]}{rs}{rt}{rd}{shamt}{funct}"
    except Exception as e:
        print(f"Error converting instruction: {instruction} -> {e}")
        return None

def generate_control_signals(op_code):
    signals = {
        'RegWrite': False,
        'RegDst': False,
        'ALUSrc': False,
        'Branch': False,
        'MemRead': False,
        'MemWrite': False,
        'MemToReg': False,
        'ALUOp': '00',
        'Jump': False,
        'LoadAddress': False,
        'Syscall': False,
        'Move': False  # New control signal for move instruction
    }

    if op_code == 'move':
        signals['RegWrite'] = True
        signals['Move'] = True
    elif op_code == 'la':
        signals['RegWrite'] = 1
        signals['LoadAddress'] = 1  # Special signal for la
    elif op_code == 'syscall':
        signals['Syscall'] = 1
    elif op_code in ['add', 'sub', 'and', 'or', 'slt', 'mul', 'xor', 'nor', 'sll', 'srl']:
        signals['RegDst'] = 1
        signals['RegWrite'] = 1
        signals['ALUOp'] = '10'
    elif op_code in ['addi', 'andi', 'ori', 'li', 'lui']:
        signals['ALUSrc'] = 1
        signals['RegWrite'] = 1
        signals['ALUOp'] = '00'
    elif op_code == 'lw':
        signals['ALUSrc'] = 1
        signals['MemtoReg'] = 1
        signals['RegWrite'] = 1
        signals['MemRead'] = 1
        signals['ALUOp'] = '00'
    elif op_code == 'sw':
        signals['ALUSrc'] = 1
        signals['MemWrite'] = 1
        signals['ALUOp'] = '00'
    elif op_code == 'beq':
        signals['Branch'] = 1
        signals['ALUOp'] = '01'
    elif op_code == 'bne':
        signals['Branch'] = 1
        signals['ALUOp'] = '01'
    elif op_code == 'j':
        signals['Jump'] = 1
    elif op_code == 'jal':
        signals['Jump'] = 1
        signals['RegWrite'] = 1
    elif op_code == 'jr':
        signals['Jump'] = 1
    else:
        # Unknown operation
        raise ValueError(f"Unsupported operation {op_code}")
    return signals

def display_registers(reg):
    print("Registers:")
    for i in range(0, 32, 4):
        reg_names = []
        for num in range(i, i+4):
            name = get_register_name(num)
            reg_names.append(name)
        print(f"${reg_names[0]:<3}: {reg[reg_names[0]]:10} | "
              f"${reg_names[1]:<3}: {reg[reg_names[1]]:10} | "
              f"${reg_names[2]:<3}: {reg[reg_names[2]]:10} | "
              f"${reg_names[3]:<3}: {reg[reg_names[3]]:10}")
    print()

def display_memory(memory):
    print("Memory:")
    addresses = sorted(memory.keys())
    for addr in addresses:
        value = memory[addr]
        if 32 <= value <= 126:
            display_value = f"{value} ('{chr(value)}')"
        else:
            display_value = str(value)
        print(f"Address {addr:08x}: {display_value}")
    print()

def syscall(reg, memory, output_capture):
    syscall_num = reg['v0']
    if syscall_num == 1:  # print integer
        output_capture.write(str(reg['a0']))
    elif syscall_num == 4:  # print string
        string_address = reg['a0']
        # Read and output the string directly from memory
        while memory.get(string_address, 0) != 0:
            char_code = int(memory[string_address])
            output_capture.write(chr(char_code))
            string_address += 1
    elif syscall_num == 10:  # exit
        output_capture.write("Program exit\n")
        return False
    else:
        output_capture.write(f"Unknown syscall: {syscall_num}\n")
    return True

# Modified syscall to capture output
class OutputCapture:
    def __init__(self):
        self.outputs = []

    def write(self, text):
        self.outputs.append(text)

    def get_output(self):
        return ''.join(self.outputs)

def syscall(reg, memory, output_capture):
    syscall_num = reg['v0']
    if syscall_num == 1:  # print integer
        output_capture.write(str(reg['a0']))
    elif syscall_num == 4:  # print string
        string_address = reg['a0']
        # Read and output the string directly from memory
        while memory.get(string_address, 0) != 0:
            char_code = int(memory[string_address])
            output_capture.write(chr(char_code))
            string_address += 1
    elif syscall_num == 10:  # exit
        output_capture.write("Program exit\n")
        return False
    else:
        output_capture.write(f"Unknown syscall: {syscall_num}\n")
    return True

# Modified simulation function to return results including PC value
def run_simulation(parsed_instructions, labels, memory):
    output_capture = OutputCapture()
    reg = {name: 0 for name in reg_map}
    reg['zero'] = 0
    reg['sp'] = 0x7FFFFFFC
    pc = 0

    instructions_list = []
    pc_counter = 0
    for inst in parsed_instructions:
            instructions_list.append((inst, None, pc_counter))
            pc_counter += 4

    inD = {pc: (inst, mc) for inst, mc, pc in instructions_list}

    while pc in inD:
        current_instruction, _ = inD[pc]
        parts = re.split(r'[,\s()]+', current_instruction)
        parts = [p for p in parts if p]
        op_code = parts[0]

        try:
            control_signals = generate_control_signals(op_code)

            if control_signals['Move']:  # Handle move instruction
                rd_name = get_register_name(get_register_number(parts[1]))
                rs_name = get_register_name(get_register_number(parts[2]))
                reg[rd_name] = reg[rs_name]
            elif control_signals['LoadAddress']:  # Handle la instruction
                rt_name = get_register_name(get_register_number(parts[1]))
                label = parts[2].strip()
                if label not in labels:
                    raise ValueError(f"Label {label} not found")
                reg[rt_name] = labels[label]
            elif control_signals['Syscall']:
                if not syscall(reg, memory, output_capture):
                    break
            elif control_signals['Jump']:
                if op_code == 'j' or op_code == 'jal':
                    label = parts[1]
                    if label in labels:
                        if op_code == 'jal':
                            reg['ra'] = pc + 4
                        pc = labels[label]
                        continue
                    else:
                        raise ValueError(f"Label {label} not found")
                elif op_code == 'jr':
                    rs_name = get_register_name(get_register_number(parts[1]))
                    pc = reg[rs_name]
                    continue
            elif control_signals['Branch']:
                rs_name = get_register_name(get_register_number(parts[1]))
                rt_name = get_register_name(get_register_number(parts[2]))
                label = parts[3]
                if op_code == 'beq' and reg[rs_name] == reg[rt_name]:
                    pc = labels[label]
                    continue
                elif op_code == 'bne' and reg[rs_name] != reg[rt_name]:
                    pc = labels[label]
                    continue
            else:
                ALU_result = 0
                if control_signals['ALUSrc']:
                    if op_code in ['addi', 'andi', 'ori']:
                        rt_name = get_register_name(get_register_number(parts[1]))
                        rs_name = get_register_name(get_register_number(parts[2]))
                        imm = int(parts[3])
                        if op_code == 'addi':
                            ALU_result = reg[rs_name] + imm
                        elif op_code == 'andi':
                            ALU_result = reg[rs_name] & imm
                        elif op_code == 'ori':
                            ALU_result = reg[rs_name] | imm
                        if control_signals['RegWrite']:
                            reg[rt_name] = ALU_result
                    elif op_code == 'lui':
                        rt_name = get_register_name(get_register_number(parts[1]))
                        imm = int(parts[2])
                        if control_signals['RegWrite']:
                            reg[rt_name] = imm << 16
                    elif op_code == 'li':
                        rd_name = get_register_name(get_register_number(parts[1]))
                        imm = int(parts[2])
                        if control_signals['RegWrite']:
                            reg[rd_name] = imm
                    elif op_code == 'lw':
                        rt_name = get_register_name(get_register_number(parts[1]))
                        if len(parts) == 4:
                            offset = int(parts[2])
                            base_name = get_register_name(get_register_number(parts[3]))
                            address = reg[base_name] + offset
                        elif len(parts) == 3:
                            label = parts[2]
                            address = labels.get(label)
                            if address is None:
                                raise ValueError(f"Label {label} not found")
                        else:
                            raise ValueError("Invalid lw instruction format")
                        if control_signals['MemRead']:
                            data = memory.get(address, 0)
                            if control_signals['RegWrite']:
                                reg[rt_name] = data
                    elif op_code == 'sw':
                        rt_name = get_register_name(get_register_number(parts[1]))
                        if len(parts) == 4:
                            offset = int(parts[2])
                            base_name = get_register_name(get_register_number(parts[3]))
                            address = reg[base_name] + offset
                        elif len(parts) == 3:
                            label = parts[2]
                            address = labels.get(label)
                            if address is None:
                                raise ValueError(f"Label {label} not found")
                        else:
                            raise ValueError("Invalid sw instruction format")
                        if control_signals['MemWrite']:
                            memory[address] = reg[rt_name]
                else:
                    rd_name = get_register_name(get_register_number(parts[1]))
                    rs_name = get_register_name(get_register_number(parts[2]))
                    rt_name = get_register_name(get_register_number(parts[3]))
                    if op_code == 'add':
                        ALU_result = reg[rs_name] + reg[rt_name]
                    elif op_code == 'sub':
                        ALU_result = reg[rs_name] - reg[rt_name]
                    elif op_code == 'and':
                        ALU_result = reg[rs_name] & reg[rt_name]
                    elif op_code == 'or':
                        ALU_result = reg[rs_name] | reg[rt_name]
                    elif op_code == 'slt':
                        ALU_result = 1 if reg[rs_name] < reg[rt_name] else 0
                    elif op_code == 'mul':
                        ALU_result = reg[rs_name] * reg[rt_name]
                    elif op_code == 'xor':
                        ALU_result = reg[rs_name] ^ reg[rt_name]
                    elif op_code == 'nor':
                        ALU_result = ~(reg[rs_name] | reg[rt_name])
                    elif op_code == 'sll':
                        rt_name = get_register_name(get_register_number(parts[2]))
                        shamt = int(parts[3])
                        ALU_result = reg[rt_name] << shamt
                    elif op_code == 'srl':
                        rt_name = get_register_name(get_register_number(parts[2]))
                        shamt = int(parts[3])
                        ALU_result = reg[rt_name] >> shamt
                    else:
                        raise ValueError(f"Unsupported ALU operation {op_code}")
                    if control_signals['RegWrite']:
                        reg[rd_name] = ALU_result

        except Exception as e:
            output_capture.write(f"Error executing instruction: {current_instruction} -> {e}\n")
            break

        pc += 4

    memory_output = {hex(addr): str(value) for addr, value in memory.items()}
    
    return {
        'registers': reg,
        'memory': memory_output,
        'console_output': output_capture.get_output(),
        'pc': pc
    }

@app.route('/api/simulate', methods=['POST'])
def simulate_mips():
    try:
        if not request.is_json:
            return jsonify({'success': False, 'error': 'Request must be JSON'}), 400

        data = request.get_json()
        if 'code' not in data:
            return jsonify({'success': False, 'error': 'No code provided'}), 400

        # Parse the assembly code
        content = data['code']
        instructions = read_asm_content(content)
        
        try:
            parsed_instructions, labels, memory = parse_labels_and_instructions(instructions)
            
            # Validate instructions before execution
            for instruction in parsed_instructions:
                parts = re.split(r'[,\s()]+', instruction)
                parts = [p for p in parts if p]
                if not parts:
                    return jsonify({
                        'success': False,
                        'error': 'Empty instruction found'
                    }), 400
                    
                op_code = parts[0]
                try:
                    control_signals = generate_control_signals(op_code)
                except ValueError as e:
                    return jsonify({
                        'success': False,
                        'error': f"Invalid instruction: {str(e)}"
                    }), 400
            
            results = run_simulation(parsed_instructions, labels, memory)
            
            return jsonify({
                'success': True,
                'data': results
            }), 200
            
        except ValueError as e:
            # Handle specific validation errors
            return jsonify({
                'success': False,
                'error': str(e)
            }), 400

    except Exception as e:
        # Handle unexpected errors
        return jsonify({
            'success': False,
            'error': f"Internal server error: {str(e)}"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0'
    })

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/init-step', methods=['POST'])
def init_step():
    """Initialize stepping execution"""
    try:
        data = request.get_json()
        if 'code' not in data:
            return jsonify({'success': False, 'error': 'No code provided'}), 400

        # Parse the code and prepare initial state
        content = data['code']
        instructions = read_asm_content(content)
        parsed_instructions, labels, memory = parse_labels_and_instructions(instructions)
        
        # Create initial state
        session_state = {
            'instructions': parsed_instructions,
            'labels': labels,
            'memory': memory,
            'pc': 0,
            'registers': {name: 0 for name in reg_map},
            'output_buffer': '',
            'instruction_index': 0
        }
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        execution_states[session_id] = session_state
        
        return jsonify({
            'success': True,
            'session_id': session_id,
            'total_instructions': len(parsed_instructions)
        }), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/step', methods=['POST'])
def step_instruction():
    """Execute next instruction in the stepping sequence"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        if not session_id or session_id not in execution_states:
            return jsonify({'success': False, 'error': 'Invalid session'}), 400
            
        state = execution_states[session_id]
        
        if state['instruction_index'] >= len(state['instructions']):
            return jsonify({
                'success': True,
                'completed': True,
                'message': 'Program execution completed'
            }), 200
            
        # Get current instruction
        current_instruction = state['instructions'][state['instruction_index']]
        
        # Execute single instruction
        output_capture = OutputCapture()
        
        # Parse instruction
        parts = re.split(r'[,\s()]+', current_instruction)
        parts = [p for p in parts if p]
        
        if not parts:
            return jsonify({
                'success': False,
                'error': 'Empty instruction'
            }), 400

        op_code = parts[0]
        
        try:
            control_signals = generate_control_signals(op_code)
            
            # Initialize registers if not present
            if 'registers' not in state:
                state['registers'] = {name: 0 for name in reg_map}
                state['registers']['sp'] = 0x7FFFFFFC
            
            # Execute instruction
            if control_signals['Move']:  # Handle move instruction
                rd_name = get_register_name(get_register_number(parts[1]))
                rs_name = get_register_name(get_register_number(parts[2]))
                state['registers'][rd_name] = state['registers'][rs_name]
            elif control_signals['LoadAddress']:  # Handle la instruction
                rt_name = get_register_name(get_register_number(parts[1]))
                label = parts[2].strip()
                if label not in state['labels']:
                    raise ValueError(f"Label {label} not found")
                state['registers'][rt_name] = state['labels'][label]
            elif control_signals['Syscall']:
                if not syscall(state['registers'], state['memory'], output_capture):
                    state['completed'] = True
            elif control_signals['Jump']:
                if op_code == 'j' or op_code == 'jal':
                    label = parts[1]
                    if label in state['labels']:
                        if op_code == 'jal':
                            state['registers']['ra'] = state['pc'] + 4
                        state['pc'] = state['labels'][label]
                        state['instruction_index'] = state['pc'] // 4
                        return jsonify({
                            'success': True,
                            'completed': False,
                            'data': {
                                'registers': state['registers'],
                                'memory': state['memory'],
                                'pc': state['pc'],
                                'console_output': output_capture.get_output(),
                                'current_instruction': current_instruction
                            }
                        }), 200
                elif op_code == 'jr':
                    rs_name = get_register_name(get_register_number(parts[1]))
                    state['pc'] = state['registers'][rs_name]
                    state['instruction_index'] = state['pc'] // 4
                    return jsonify({
                        'success': True,
                        'completed': False,
                        'data': {
                            'registers': state['registers'],
                            'memory': state['memory'],
                            'pc': state['pc'],
                            'console_output': output_capture.get_output(),
                            'current_instruction': current_instruction
                        }
                    }), 200
            elif control_signals['Branch']:
                rs_name = get_register_name(get_register_number(parts[1]))
                rt_name = get_register_name(get_register_number(parts[2]))
                label = parts[3]
                if op_code == 'beq' and state['registers'][rs_name] == state['registers'][rt_name]:
                    state['pc'] = state['labels'][label]
                    state['instruction_index'] = state['pc'] // 4
                    return jsonify({
                        'success': True,
                        'completed': False,
                        'data': {
                            'registers': state['registers'],
                            'memory': state['memory'],
                            'pc': state['pc'],
                            'console_output': output_capture.get_output(),
                            'current_instruction': current_instruction
                        }
                    }), 200
                elif op_code == 'bne' and state['registers'][rs_name] != state['registers'][rt_name]:
                    state['pc'] = state['labels'][label]
                    state['instruction_index'] = state['pc'] // 4
                    return jsonify({
                        'success': True,
                        'completed': False,
                        'data': {
                            'registers': state['registers'],
                            'memory': state['memory'],
                            'pc': state['pc'],
                            'console_output': output_capture.get_output(),
                            'current_instruction': current_instruction
                        }
                    }), 200
            else:
                ALU_result = 0
                if control_signals['ALUSrc']:
                    if op_code in ['addi', 'andi', 'ori']:
                        rt_name = get_register_name(get_register_number(parts[1]))
                        rs_name = get_register_name(get_register_number(parts[2]))
                        imm = int(parts[3])
                        if op_code == 'addi':
                            ALU_result = state['registers'][rs_name] + imm
                        elif op_code == 'andi':
                            ALU_result = state['registers'][rs_name] & imm
                        elif op_code == 'ori':
                            ALU_result = state['registers'][rs_name] | imm
                        if control_signals['RegWrite']:
                            state['registers'][rt_name] = ALU_result
                    elif op_code == 'lui':
                        rt_name = get_register_name(get_register_number(parts[1]))
                        imm = int(parts[2])
                        if control_signals['RegWrite']:
                            state['registers'][rt_name] = imm << 16
                    elif op_code == 'li':
                        rd_name = get_register_name(get_register_number(parts[1]))
                        imm = int(parts[2])
                        if control_signals['RegWrite']:
                            state['registers'][rd_name] = imm
                    elif op_code == 'lw':
                        rt_name = get_register_name(get_register_number(parts[1]))
                        if len(parts) == 4:
                            offset = int(parts[2])
                            base_name = get_register_name(get_register_number(parts[3]))
                            address = state['registers'][base_name] + offset
                        elif len(parts) == 3:
                            label = parts[2]
                            address = state['labels'].get(label)
                            if address is None:
                                raise ValueError(f"Label {label} not found")
                        else:
                            raise ValueError("Invalid lw instruction format")
                        if control_signals['MemRead']:
                            data = state['memory'].get(address, 0)
                            if control_signals['RegWrite']:
                                state['registers'][rt_name] = data
                    elif op_code == 'sw':
                        rt_name = get_register_name(get_register_number(parts[1]))
                        if len(parts) == 4:
                            offset = int(parts[2])
                            base_name = get_register_name(get_register_number(parts[3]))
                            address = state['registers'][base_name] + offset
                        elif len(parts) == 3:
                            label = parts[2]
                            address = state['labels'].get(label)
                            if address is None:
                                raise ValueError(f"Label {label} not found")
                        else:
                            raise ValueError("Invalid sw instruction format")
                        if control_signals['MemWrite']:
                            state['memory'][address] = state['registers'][rt_name]
                else:
                    rd_name = get_register_name(get_register_number(parts[1]))
                    rs_name = get_register_name(get_register_number(parts[2]))
                    rt_name = get_register_name(get_register_number(parts[3]))
                    if op_code == 'add':
                        ALU_result = state['registers'][rs_name] + state['registers'][rt_name]
                    elif op_code == 'sub':
                        ALU_result = state['registers'][rs_name] - state['registers'][rt_name]
                    elif op_code == 'and':
                        ALU_result = state['registers'][rs_name] & state['registers'][rt_name]
                    elif op_code == 'or':
                        ALU_result = state['registers'][rs_name] | state['registers'][rt_name]
                    elif op_code == 'slt':
                        ALU_result = 1 if state['registers'][rs_name] < state['registers'][rt_name] else 0
                    elif op_code == 'mul':
                        ALU_result = state['registers'][rs_name] * state['registers'][rt_name]
                    elif op_code == 'xor':
                        ALU_result = state['registers'][rs_name] ^ state['registers'][rt_name]
                    elif op_code == 'nor':
                        ALU_result = ~(state['registers'][rs_name] | state['registers'][rt_name])
                    elif op_code == 'sll':
                        rt_name = get_register_name(get_register_number(parts[2]))
                        shamt = int(parts[3])
                        ALU_result = state['registers'][rt_name] << shamt
                    elif op_code == 'srl':
                        rt_name = get_register_name(get_register_number(parts[2]))
                        shamt = int(parts[3])
                        ALU_result = state['registers'][rt_name] >> shamt
                    else:
                        raise ValueError(f"Unsupported ALU operation {op_code}")
                    if control_signals['RegWrite']:
                        state['registers'][rd_name] = ALU_result

            # Update PC and instruction index
            state['pc'] += 4
            state['instruction_index'] += 1
            
            return jsonify({
                'success': True,
                'completed': False,
                'data': {
                    'registers': state['registers'],
                    'memory': state['memory'],
                    'pc': state['pc'],
                    'console_output': output_capture.get_output(),
                    'current_instruction': current_instruction
                }
            }), 200

        except Exception as e:
            return jsonify({
                'success': False,
                'error': f"Error executing instruction: {str(e)}"
            }), 500

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Internal server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
