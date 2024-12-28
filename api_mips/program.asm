.data
    message: .asciiz "Hello, MIPS World!\n"
    number: .word 42
    array: .word 1, 2, 3, 4, 5

.text
main:
    # Print string
    li $v0, 4           # syscall code for print_string
    la $a0, message     # load address of message
    syscall

    # Load number from memory and print it
    lw $t0, number      # load 42 into $t0
    li $v0, 1           # syscall code for print_int
    move $a0, $t0       # move number to $a0 for printing
    syscall

    # Do some arithmetic
    li $t1, 10          # load immediate value 10
    li $t2, 5           # load immediate value 5
    add $t3, $t1, $t2   # t3 = t1 + t2 (15)
    sub $t4, $t1, $t2   # t4 = t1 - t2 (5)
    mul $t5, $t1, $t2   # t5 = t1 * t2 (50)

    # Store result in memory
    sw $t3, array       # store sum at first position of array

    # Exit program
    li $v0, 10          # syscall code for exit
    syscall