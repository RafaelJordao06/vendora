"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, Trash, UploadCloud } from "lucide-react"
import Image from "next/image"
import { CldUploadWidget } from "next-cloudinary"

interface ImageUploadProps {
  disabled?: boolean
  onChange: (value: string) => void
  onRemove: (value: string) => void
  value: string[]
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value
}) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onUpload = (result: any) => {
    onChange(result.info.secure_url)
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {value.map((url) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden group">
              <div className="z-10 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  type="button" 
                  onClick={() => onRemove(url)} 
                  variant="destructive" 
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              <Image
                fill
                className="object-cover"
                alt="Imagem do produto"
                src={url}
              />
            </div>
          ))}
        </div>
      )}
      
      <CldUploadWidget onUpload={onUpload} uploadPreset="vendora_preset">
        {({ open }) => {
          const onClick = () => {
            open()
          }

          return (
            <Button 
              type="button" 
              disabled={disabled} 
              variant="outline" 
              onClick={onClick}
              className="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">Clique para fazer upload</span>
              </div>
            </Button>
          )
        }}
      </CldUploadWidget>
      
      <p className="text-xs text-gray-400 text-center">
        Formatos aceitos: JPG, PNG, WEBP
      </p>
    </div>
  )
}

export default ImageUpload
