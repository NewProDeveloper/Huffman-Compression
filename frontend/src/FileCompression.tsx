import React, { useState, useCallback } from "react";
import { FileIcon } from "react-file-icon";
import { useDropzone } from "react-dropzone";
import { Upload, Download, FileText, ArrowRight, Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "./api";

const FileCompressionApp = () => {
  interface Stats {
    originalSize: any;
    processedSize: any;
    ratio: any;
    savedSize: any;
  }

  const [file, setFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setProcessedFile(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleProcess = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    setError("");

    try {
      // Send the file to the backend for compression
      const formData = new FormData();
      formData.append("file", file);

      // const config = {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      //   responseType: "json",
      // };

      console.log(`Sending request to /compress`);

      const response = await api.post("/compress", formData);

      console.log("Response received:", response);

      let processedData;
      const compressedContent = new Uint8Array(response.data.compressed_data);
      processedData = new Blob([compressedContent], {
        type: "application/octet-stream",
      });
      setProcessedFile(processedData);

      // Update stats using the sizes from backend
      const originalSize = response.data.original_size;
      const processedSize = response.data.compressed_size;
      setStats({
        originalSize: (originalSize / 1024).toFixed(2),
        processedSize: (processedSize / 1024).toFixed(2),
        ratio: ((processedSize / originalSize) * 100).toFixed(1),
        savedSize: ((originalSize - processedSize) / 1024).toFixed(2),
      });
    } catch (err: any) {
      setError("Processing failed. Please try again.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, [file]);

  const handleUploadNew = () => {
    setFile(null);
    setProcessedFile(null);
    setStats(null);
    setError("");
  };

  const downloadFile = useCallback(
    (blob: Blob) => {
      if (!processedFile || !file) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(".txt", ".bin");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [file]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Huffman Coding File Compression
          </h1>
          <p className="text-gray-600">
            Compress your text files efficiently using Huffman coding
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Text File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div {...getRootProps()}
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-500 transition-colors"
                onClick={() => document.getElementById("fileInput")?.click()}>
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="text-gray-600">Drop the file here ...</p>
                ) : (
                <div className="upload-section items-center">
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16">
                        <FileIcon
                          color="#2C5898"
                          labelColor="#2C5898"
                          labelUppercase
                          type="document"
                          glyphColor="rgba(255,255,255,0.4)"
                          extension="TXT"
                        />
                      </div>
                      <p className="mt-2 text-gray-700">{file.name}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Text files only (.txt)
                      </p>
                      <input
                        id="fileInput"
                        type="file"
                        accept=".txt"
                        className="hidden"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setFile(e.target.files[0]);
                            setProcessedFile(null);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                )}
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Results of Compression
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Original Size:</span>
                    <span className="font-mono">{stats.originalSize} KB</span>
                  </div>
                  {stats.ratio && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span>Processed Size:</span>
                        <span className="font-mono">
                          {stats.processedSize} KB
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Compression Ratio:</span>
                        <span className="font-mono">{stats.ratio}%</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span>Saved Space:</span>
                        <span className="font-mono">{stats.savedSize} KB</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No file uploaded yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <div className="action-buttons justify-normal gap-4">
            {processedFile ? (
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => downloadFile(processedFile)}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Download Processed File
                  <Download className="h-4 w-4 ml-2" />
                </button>
                <button
                  onClick={handleUploadNew}
                  className="flex items-center justify-center gap-2 px-2 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  Upload New
                  <Upload className="h-4 w-4 ml-2" />
                </button>
              </div>
            ) : (
              // Compress File button
              <button
                onClick={handleProcess}
                disabled={!file || isProcessing}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg ${
                  !file || isProcessing
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white transition-colors`}
              >
                {isProcessing ? (
                  <>
                    Processing...
                    <Loader className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Compress File
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileCompressionApp;
