"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import {InputFile}  from "@/components/ui/meta-components/input-file";
import { parseCSV } from "./hooks/parse-csv";
import { DataTable } from "./payments/data-table";
import { Payment, columns } from "./payments/columns";
interface Receipt {
  m:string
}
interface MyButtonComponentProps {
  onClick: () => void;
}
type ContentType = 'text/plain' | 'text/html' | 'text/csv' | 'application/json' | 'application/pdf' | string;



// OCR
let receipt = async (file: File): Promise<string> => {
  const { createWorker } = require('tesseract.js');

  const worker = await createWorker('eng', 1, {
    logger: (m: any) => console.log('m',m),
  });

  try {
    const { data: { text } } = await worker.recognize(file);
    console.log("text",text);
    return text;
  } finally {
    await worker.terminate();
  }
};
  
// OpenAI
const openai = async (text:string) => {
  const response = await fetch('/api',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  }) 
  if (!response.ok){
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  console.log("response", response);
  return response.json()
}
// Button
const MyButtonComponent: React.FC<MyButtonComponentProps> = ({ onClick }) => (
  <button onClick={onClick} className="p-4 m-4 text-white bg-blue-500 rounded-lg">
    Click me
  </button>
);

// Pass OCR to OpenAI
const handleProcess = async (file: File | null, setOpenaiResponse: (response: string) => void,setDownloadFunction: (fn: () => void) => void) => {
  if (!file) {
    console.error('No file selected');
    return;
  }

  try {
    const receiptText = await receipt(file);
    const openaiResponse = await openai(receiptText)
    setOpenaiResponse(openaiResponse.message.content);
    const downloadFunction = () => downloadFile(openaiResponse.message.content, `${__filename}.csv`, 'text/csv');
    setDownloadFunction(() => downloadFunction);
    console.log("response", openaiResponse.message.content);
  } catch (error) {
    console.error('Error processing receipt:', error);
  }
};
//Download
const  downloadFile = async (content:string, filename:string, contentType:ContentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}


// Usage
export default function Home() {
  const [openaiResponse, setOpenaiResponse] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadFunction, setDownloadFunction] = useState<() => void>(() => {});
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Payment[]>([]);
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };
  const extractCSVFromResponse = (openaiResponse: string): string | null => {
    const contentRegex = /```[\s\S]*?```/;
    const match = openaiResponse.match(contentRegex);
    
    if (match && match[0]) {
      let csvContent = match[0].replace(/```/g, '').trim();
      csvContent = csvContent.replace(/^csv\n/, '');
      return csvContent;
    } else {
      return null;
    }
  };
  const handleParseCSV = () => {
    console.log('parsing started')
    setLoading(true);
    if (openaiResponse) {
      console.log('parsing:', openaiResponse);
      const csvContent = extractCSVFromResponse(openaiResponse);
      if (csvContent) {
        console.log('csvContent:', csvContent);
        setData(parseCSV(csvContent));
        
      } else {
        console.log("No CSV content found in the response");
      }
    } else {
      console.log("No response to parse");
    }
    setLoading(false);
  };
  const handleButtonClick = () => {
    handleProcess(selectedFile,setOpenaiResponse, setDownloadFunction);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <section className="flex flex-col items-center justify-center">
        <h2>Data Table </h2>
        { loading ? (
          <div> Loading...</div>
        ) : data.length > 0 ? (
          <DataTable columns={columns} data={data}/>
        ): (
          <div> No data to display</div>
        
        )}
        </section>
      <section/>
       <DataTable columns={columns} data={data}/>
      <MyButtonComponent onClick={handleButtonClick} />
      <Button onClick={downloadFunction}>Download</Button>
      <Button onClick={handleParseCSV}>CsvToString</Button>
      <InputFile onFileSelect={handleFileSelect}/>
      {selectedFile && (
        <div>
          <p>Selected file: {selectedFile.name}</p>
        </div>
      )}
    </main>
  );
}
