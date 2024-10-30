# Huffman Coding (Compression) 

## Introduction
Huffman coding is a lossless data compression algorithm. The idea is to assign variable-length codes to input characters, lengths of the assigned codes are based on the frequencies of corresponding characters. The most frequent character gets the smallest code and the least frequent character gets the largest code.

## Requirements
1. react-file-icon:  ```npm install react-file-icon```
2. react-dropzone:   ```npm install react-dropzone```
3. lucide-react:     ```npm install lucide-react```
4. shadcn library: Download the library ```https://ui.shadcn.com/docs/installation```
5. axios:            ```npm install axios```
6. fastapi:          ```pip install fastapi```

## How to run
1. Clone the repository
2. Run the following command in the terminal\
    a) For frontend: ```bun run dev```\
    b) For backend: ```uvicorn main:app --reload```
3. Drop or Select the file you want to compress
4. The compressed file is ready to download

## How it works
1. Count the frequency of each character in the input string
2. Create a priority queue (heapq) and insert all characters in it
3. Pop two nodes from the priority queue and create a new node with a frequency equal to the sum of the frequencies of the two nodes. Insert the new node back into the priority queue
4. Repeat step 3 until there is only one node left in the priority queue
5. Traverse the tree and assign codes to characters
