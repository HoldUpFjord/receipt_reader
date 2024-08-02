import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRef } from "react"

interface InputFileProps {
  onFileSelect: (file:File) => void;
}
 
export function InputFile({ onFileSelect}:InputFileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = () => {
    if(fileInputRef.current && fileInputRef.current.files) {
      const file = fileInputRef.current.files[0];
      console.log(file)
      onFileSelect(file);
    }
  }
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" ref={fileInputRef} onChange={handleFileChange}/>
    </div>
  )
}