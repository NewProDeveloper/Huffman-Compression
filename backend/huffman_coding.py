from collections import Counter
import heapq, os

class BinaryTree:
    def __init__(self, value, freq):
        self.value = value
        self.freq = freq
        self.left = None
        self.right = None

    def __lt__(self, other):
        return self.freq < other.freq

    def __eq__(self, other):
        return self.freq == other.freq

class HuffmanCode:

    def __init__(self, path):
        self.path = path
        self.__heap = []
        self.__dt = dict()
        self.__reverse_dt = dict()

    def __frequency_of_text(self, text):
        return Counter(text)
    
    def __create_heap(self, freq_dict):
        for key, freq in freq_dict.items():
            TreeNode = BinaryTree(key, freq)
            heapq.heappush(self.__heap, TreeNode)
    
    def __build_binary_tree(self):
        while len(self.__heap) > 1:
            node1 = heapq.heappop(self.__heap)
            node2 = heapq.heappop(self.__heap)

            new_node = BinaryTree(None, node1.freq + node2.freq)
            new_node.left = node1
            new_node.right = node2
            heapq.heappush(self.__heap, new_node)
        
        return
    
    def __binary_string(self, root, cur_str):
        if not root:
            return
        
        if root.value:
            self.__dt[root.value] = cur_str
            self.__reverse_dt[cur_str] = root.value
            return

        self.__binary_string(root.left, cur_str + '0')
        self.__binary_string(root.right, cur_str + '1')
    
    def __tree_code(self):
        root_node = heapq.heappop(self.__heap)
        self.__binary_string(root_node, "")

    def __encoded_text(self, text):
        encoded_text = "".join([self.__dt[char] for char in text])
        
        return encoded_text
    
    def __padding_text(self, encoded_text):
        padding = 8 - len(encoded_text) % 8
        for i in range(padding):
            encoded_text += '0'
        
        padding_info = "{0:08b}".format(padding)
        padded_encoded_text = padding_info + encoded_text

        return padded_encoded_text
    
    def __byte_array(self, padded_text):
        bytes_array = []
        for i in range(0, len(padded_text), 8):
            byte = padded_text[i:i+8]
            bytes_array.append(int(byte, 2))
        
        return bytes_array
    
    def __remove_padding(self, text):
        padding_info = text[:8]
        padding = int(padding_info, 2)

        text = text[8:]
        text = text[:-1*padding]

        return text
    
    def __decoded_text(self, text):
        cur_str = ''
        decoded_text = ''
        for bit in text:
            cur_str += bit
            if cur_str in self.__reverse_dt:
                decoded_text += self.__reverse_dt[cur_str]
                cur_str = ''
        
        return decoded_text
    
    def compression(self):
        if not isinstance(self.path, str):
            raise ValueError("Path must be a string")

        filename, file_extension = os.path.splitext(self.path)
        output_path = filename + ".bin"

        with open(self.path, 'r+') as file, open(output_path, 'wb') as output:
            text = file.read()
            text = text.rstrip()

            freq_dict = self.__frequency_of_text(text)
            self.__create_heap(freq_dict)

            self.__build_binary_tree()
            
            self.__tree_code()

            encoded_text = self.__encoded_text(text)

            padded_text = self.__padding_text(encoded_text)

            bytes_array = self.__byte_array(padded_text)
            final_bytes = bytes(bytes_array)

            output.write(final_bytes)

        print("Compressed Successfully")
        return output_path
    
    # def decompression(self, path):
    #     filename, file_extension = os.path.splitext(path)
    #     output_path = filename + "_decompressed" + ".txt"

    #     with open(path, 'rb') as file, open(output_path, 'w') as output:
    #         bit_string = ""
    #         byte = file.read(1)
    #         while byte:
    #             byte = ord(byte)
    #             bits = bin(byte)[2:].rjust(8, '0')
    #             bit_string += bits
    #             byte = file.read(1)
            
    #         bit_string = self.__remove_padding(bit_string)

    #         decoded_text = self.__decoded_text(bit_string)
            
    #         output.write(decoded_text)
        
    #     return output_path

# path = input("Enter the path of the file: ")
# h = HuffmanCode(path)
# compressed_file = h.compression()
# print(compressed_file)
# h.decompression(compressed_file)