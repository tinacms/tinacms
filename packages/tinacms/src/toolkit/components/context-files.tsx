import React, { createContext, ReactNode, useContext, useState } from 'react'

// Define a type for the file context (optional but recommended)
type FileContextType = {
  files: File[]
  setFiles: any
  fileRejections: any
  setFileRejections: any
  directory: string
  setDirectory: any
}

// Create the context with default values
const FileContext = createContext<FileContextType | undefined>(undefined)

type FileProviderProps = {
  children: ReactNode
}

// Create a provider component
export const FileProvider = ({ children }: FileProviderProps) => {
  const [files, setFiles] = useState<File[]>([])
  const [directory, setDirectory] = useState<string>('/')
  const [fileRejections, setFileRejections] = useState<any>([])

  return (
    <FileContext.Provider
      value={{
        files,
        setFiles,
        setDirectory,
        directory,
        setFileRejections,
        fileRejections,
      }}
    >
      {children}
    </FileContext.Provider>
  )
}

// Create a custom hook to use the FileContext
export const useFiles = () => {
  const context = useContext(FileContext)

  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider')
  }

  return context
}
