"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import {InputFile}  from "@/components/ui/meta-components/input-file";

interface Receipt {
  m:string
}
interface MyButtonComponentProps {
  onClick: () => void;
}
type ContentType = 'text/plain' | 'text/html' | 'text/csv' | 'application/json' | 'application/pdf' | string;


// OCR
let receipt = async ():Promise<string> => {
  const { createWorker } = require('tesseract.js');

const worker = await createWorker('eng', 1, {
  logger: (m:Receipt) => console.log(m.m), // Add logger here
});

 try {
  const { data: { text } } = await worker.recognize('https://miro.medium.com/v2/resize:fit:640/format:webp/1*MLRlL9W69PMWAcTF-rV36Q.jpeg');
  console.log(text);
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
  return response.json()
}
// Button
const MyButtonComponent: React.FC<MyButtonComponentProps> = ({ onClick }) => (
  <button onClick={onClick} className="p-4 m-4 text-white bg-blue-500 rounded-lg">
    Click me
  </button>
);

// Pass OCR to OpenAI
const handleProcess = async (setDownloadFunction: (fn: () => void) => void) => {
  try {
    const receiptText = await receipt();
    const openaiResponse = await openai(receiptText);
    const downloadFunction = () => downloadFile(openaiResponse.message.content, 'test.csv', 'text/csv');
    setDownloadFunction(() => downloadFunction);
    // Handle the OpenAI response as needed
    console.log("response",openaiResponse.message.content);
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
  const [downloadFunction, setDownloadFunction] = useState<() => void>(() => {});
  const handleButtonClick = () => {
    handleProcess(setDownloadFunction);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <MyButtonComponent onClick={handleButtonClick} />
      {/* <MyButtonComponent onClick={openai} /> */}
      <Button onClick={downloadFunction}>Download</Button>
    <InputFile/>
    </main>
  );
}
