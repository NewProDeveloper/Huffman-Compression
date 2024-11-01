from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import huffman_coding

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

@app.post("/compress")
async def compress(file: UploadFile = File(...)):
    try:
        filename = file.filename
        path = f"temp/{filename}"
        
        os.makedirs("temp", exist_ok = True)
        
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        huffman = huffman_coding.HuffmanCode(path)
        output_path = huffman.compression()
        
        with open(output_path, "rb") as f:
            compressed_data = f.read()
            
        original_size = os.path.getsize(path)
        compressed_size = os.path.getsize(output_path)
        
        os.remove(path)
        os.remove(output_path)
        
        return JSONResponse({
            "compressed_data": list(compressed_data),
            "original_size": original_size,
            "compressed_size": compressed_size
        })
        
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))

@app.get("/download/{file_path}")
async def download(file_path: str):
    return FileResponse(file_path)