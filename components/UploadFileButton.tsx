"use client"

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Accept, useDropzone } from 'react-dropzone'
import { X, Upload, Pencil, Check, AlertCircle } from 'lucide-react'
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { cn } from '@/lib/utils'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

interface FileWithPreview extends File {
  preview: string;
}

const acceptedMessages: Accept = {
    'image/*': [],
    'text/csv': ['.csv'],
    'application/pdf': ['.pdf'],
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav'],
}

export const UploadFile: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newFileName, setNewFileName] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onGenerateUploadUrl = useMutation(api.files.onGenerateUploadUrl)
  const onUploadImage = useMutation(api.files.onCreateFile)

  const onUpload = async (files: FileWithPreview[]) => {
    const postUrl = await onGenerateUploadUrl()
    files.forEach(async (file) => {
        const result = await fetch(postUrl, {
            method: 'POST',
            headers: { "Content-Type": file!.type },
            body: file
        })

        const { storageId } = await result.json() as { storageId: Id<"_storage"> };

        await onUploadImage({ 
            fileId: storageId, 
            name: file.name, 
            type: 'image', 
            orgId: ''
        });
    })
    
  }

 
  const onDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })))
    setErrorMessage(null)
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({ 
        onDrop, 
        accept: acceptedMessages,
        onDropRejected: () => {
            setErrorMessage("Some files were rejected. Please only upload images, CSV, PDF, MP3, or WAV files.")
        }
    })

  const removeFile = (index: number) => {
    setFiles(files => files.filter((_, i) => i !== index))
  }

  const startEditing = (index: number) => {
    setEditingIndex(index)
    setNewFileName(files[index].name)
  }

  const finishEditing = () => {
    if (editingIndex !== null) {
      setFiles(files => files.map((file, index) => 
        index === editingIndex
          ? Object.assign(
              new File([file], newFileName, { type: file.type }),
              { preview: file.preview }
            )
          : file
      ))
      setEditingIndex(null)
    }
  }

  const dropzoneStyle = useMemo(() => 
    cn(
      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
      isDragActive && !isDragReject && "border-primary",
      isDragReject && "border-destructive bg-destructive/10",
      !isDragActive && !isDragReject && "border-gray-300 hover:border-primary"
    ),
    [isDragActive, isDragReject]
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Upload Files</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <AnimatePresence mode="wait">
            {files.length === 0 ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  {...getRootProps()}
                  className={dropzoneStyle}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Drag and drop files here, or click to select files.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    (Only images, CSV, PDF, MP3, and WAV files are allowed)
                  </p>
                </div>
                {errorMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="text-destructive text-sm mt-2 flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errorMessage}
                  </motion.p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="file-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {files.map((file, index) => (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-2 border rounded mb-2"
                  >
                    <div className="flex-1 mr-2">
                      {editingIndex === index ? (
                        <Input
                          value={newFileName}
                          onChange={(e) => setNewFileName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                        />
                      ) : (
                        <p className="text-sm font-medium">{file.name}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {editingIndex === index ? (
                        <Button size="icon" variant="ghost" onClick={finishEditing}>
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="icon" variant="ghost" onClick={() => startEditing(index)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => removeFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                <div className='flex items-center justify-between mt-8'>
                    <Button onClick={() => setFiles([])} variant="destructive">Clear All</Button>
                    <DialogClose asChild>
                        <Button onClick={() => onUpload(files)} >Upload File</Button>
                    </DialogClose>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}