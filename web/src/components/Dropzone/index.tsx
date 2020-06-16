import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload } from 'react-icons/fi'
import './styles.css'

interface Props {
  onFileSelectedUpload: (file: File) => void
}

const Dropzone: React.FC<Props> = ({ onFileSelectedUpload }) => {
  const [selectedFileUrl, setSelectedFileUrl] = useState('')

  const onDrop = useCallback(
    acceptedFiles => {
      // Do something with the files 1 e 5
      const file = acceptedFiles[0]
      const fileUrl = URL.createObjectURL(file)
      setSelectedFileUrl(fileUrl)
      onFileSelectedUpload(file)
    },
    [onFileSelectedUpload]
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'image/*'
  })

  return (
    <div {...getRootProps()} className='dropzone'>
      <input {...getInputProps()} accept='image/*' />
      {selectedFileUrl ? (
        <img src={selectedFileUrl} alt='Point image' />
      ) : (
        <p>
          <FiUpload /> Imagem do estabelecimento
        </p>
      )}
    </div>
  )
}

export default Dropzone
