import { runMIPSProgram } from '../index';

describe('MIPS Simulator Tests', () => {
  test('Basic Arithmetic', () => {
    const program = `
      .text
      main:
        li $t0, 5        # Load 5 into $t0
        li $t1, 3        # Load 3 into $t1
        add $t2, $t0, $t1  # $t2 = $t0 + $t1
        li $v0, 1        # syscall 1 (print_int)
        move $a0, $t2    # move result to $a0
        syscall          # Should print 8
        li $v0, 10       # Exit
        syscall
    `;
    
    const outputs = [];
    const originalLog = console.log;
    console.log = (msg) => outputs.push(msg);
    
    runMIPSProgram(program, false);  // Set singleStep to false
    
    console.log = originalLog;
    
    expect(outputs).toContain('Output (int): 8');
  });
}); 