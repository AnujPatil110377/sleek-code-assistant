.data
msg: .asciiz "Factorial of 5 = "
.text
main:
    
    # Calculate factorial of 5
    li $t0, 5      # n = 5
    li $t1, 1      # result = 1
    
factorial_loop:

    beq $t0, $zero, done
    mul $t1, $t1, $t0
    addi $t0, $t0, -1
    j factorial_loop
    
done:
    # Print result
    li $v0, 1
    add $a0, $t1, $zero
    syscall