import unittest
from api import app
import json

class TestMIPSSimulator(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_hello_world_program(self):
        # Test case 1: Hello World program with normalized line endings
        test_code = (
            ".data\n"
            "    hello: .asciiz \"Hello, World!\\n\"\n"
            "\n"
            ".text\n"
            "    addi $v0, $zero, 4\n"
            "    la $a0, hello\n"
            "    syscall"
        )
        
        response = self.app.post('/api/simulate',
                               data=json.dumps({'code': test_code}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['console_output'], "Hello, World!\n")
        self.assertIn('v0', data['data']['registers'])
        self.assertEqual(data['data']['registers']['v0'], 4)
        # Check if a0 contains the correct memory address (0x10010000)
        self.assertEqual(data['data']['registers']['a0'], 0x10010000)

    def test_arithmetic_operations(self):
        # Test case 2: Basic arithmetic
        test_code = '''
.text
    addi $t0, $zero, 5    # t0 = 5
    addi $t1, $zero, 3    # t1 = 3
    add $t2, $t0, $t1     # t2 = t0 + t1
        '''
        
        response = self.app.post('/api/simulate',
                               data=json.dumps({'code': test_code}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['registers']['t0'], 5)
        self.assertEqual(data['data']['registers']['t1'], 3)
        self.assertEqual(data['data']['registers']['t2'], 8)

    def test_invalid_code(self):
        # Test case 3: Invalid MIPS code
        test_code = '''
.text
    invalid_instruction $t0, $t1
    '''
        
        response = self.app.post('/api/simulate',
                               data=json.dumps({'code': test_code}),
                               content_type='application/json')
        
        data = json.loads(response.data)
        self.assertFalse(data['success'])
        self.assertIn('error', data)
        # We don't strictly check the status code anymore since we handle errors at different levels
        self.assertIn(response.status_code, [400, 500])

    def test_memory_operations(self):
        # Test case 4: Memory operations
        test_code = '''
.data
    var: .word 42

.text
    lw $t0, var      # Load word from memory
    sw $t0, 4($zero) # Store word to memory
        '''
        
        response = self.app.post('/api/simulate',
                               data=json.dumps({'code': test_code}),
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['registers']['t0'], 42)

if __name__ == '__main__':
    unittest.main() 