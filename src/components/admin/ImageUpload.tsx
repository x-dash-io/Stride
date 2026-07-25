"use client"

import { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, X, CheckCircle } from 'lucide-react'

interface ImageUploadProps {
  existingImages?: Array<{ id: string; url: string; isPrimary: boolean; sortOrder: number }>
  maxFiles?: number
  productId?: string
  variantId?: string
  onUploadComplete?: (urls: string[]) => void
  onDelete?: (id: string) => void
  onSetPrimary?: (id: string) => void
  onReorder?: (images: string[]) => void
  disabled?: boolean
}

export function ImageUpload({
  existingImages = [],
  maxFiles = 10,
  productId,
  variantId,
  onUploadComplete,
  onDelete,
  onSetPrimary,
  onReorder,
  disabled = false,
}: ImageUploadProps) {
  const [localImages, setLocalImages] = useState<File[]>([])
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const abortControllersRef = useRef<Record<string, AbortController>>({})

  const handleUpload = useCallback(async (file: File) => {
    const tempId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setUploading(prev => ({ ...prev, [tempId]: true }))
    setUploadProgress(prev => ({ ...prev, [tempId]: 0 }))

    try {
      const controller = new AbortController()
      abortControllersRef.current[tempId] = controller

      const formData = new FormData()
      formData.append('file', file)
      if (productId) formData.append('productId', productId)
      if (variantId) formData.append('variantId', variantId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Upload failed')

      const uploadResponse = await fetch(data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
        signal: controller.signal,
      })

      if (!uploadResponse.ok) throw new Error('R2 upload failed')

      setUploadProgress(prev => ({ ...prev, [tempId]: 100 }))
      onUploadComplete?.([data.publicUrl])

      return data.publicUrl
    } catch (error) {
      if ((error as Error).name === 'AbortError') return
      console.error('Upload error:', error)
      throw error
    } finally {
      setUploading(prev => ({ ...prev, [tempId]: false }))
      setUploadProgress(prev => ({ ...prev, [tempId]: 0 }))
      delete abortControllersRef.current[tempId]
    }
  }, [productId, variantId, onUploadComplete])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const remainingSlots = maxFiles - existingImages.length - localImages.length
    const filesToUpload = acceptedFiles.slice(0, remainingSlots)

    for (const file of filesToUpload) {
      setLocalImages(prev => [...prev, file])
      try {
        await handleUpload(file)
      } catch {
        setLocalImages(prev => prev.filter(f => f !== file))
      }
    }
  }, [existingImages.length, localImages.length, maxFiles, handleUpload])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/avif': ['.avif'],
    },
    maxFiles,
    maxSize: 10 * 1024 * 1024,
    disabled,
  })

  const handleDelete = (image: { id: string; url: string }) => {
    if (image.url.startsWith('blob:')) {
      setLocalImages(prev => prev.filter(f => f.name !== image.url))
    } else {
      onDelete?.(image.id)
    }
  }

  const allImages = [
    ...existingImages.map(img => ({ ...img, type: 'existing' as const })),
    ...localImages.map((file, idx) => ({
      id: `local-${idx}`,
      url: URL.createObjectURL(file),
      isPrimary: idx === 0 && existingImages.length === 0,
      sortOrder: existingImages.length + idx,
      type: 'local' as const,
      file,
    })),
  ]

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-colors',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop images here' : 'Drag & drop images, or click to select'}
            </p>
            <p className="text-sm text-muted-foreground">
              JPEG, PNG, WebP, AVIF up to 10MB each. Max {maxFiles} images.
            </p>
          </div>
        </div>
      </div>

      {allImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allImages.map((image, index) => (
            <div
              key={image.id}
              className="relative group aspect-square bg-muted rounded-lg overflow-hidden border border-border"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {image.url.startsWith('blob:') ? (
                  <img src={image.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
              </div>

              {uploading[image.id] && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="text-center text-white">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm mt-1">Uploading...</p>
                    <div className="mt-2 w-32 mx-auto bg-white/20 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress[image.id] || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 justify-center">
                {!image.isPrimary && (
                  <button
                    onClick={() => onSetPrimary?.(image.id)}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs"
                    title="Set as primary"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(image)}
                  disabled={uploading[image.id]}
                  className="p-1.5 bg-white/10 hover:bg-red-500/20 rounded text-white text-xs"
                  title="Delete"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {image.isPrimary && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground px-1.5 py-0.5 text-xs font-medium rounded">
                  Primary
                </div>
              )}

              {image.type === 'local' && (
                <div className="absolute top-1 right-1 bg-yellow-500/90 text-white px-1.5 py-0.5 text-xs font-medium rounded">
                  Pending
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(existingImages.length + localImages.length) >= maxFiles && (
        <p className="text-xs text-muted-foreground text-center">
          Maximum of {maxFiles} images reached
        </p>
      )}

      {allImages.length > 1 && onReorder && (
        <div className="text-center text-sm text-muted-foreground">
          Drag to reorder images (primary image stays first)
        </div>
      )}
    </div>
  )
}