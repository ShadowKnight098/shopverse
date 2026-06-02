import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, CheckCircle2, Loader2, Star, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import useAuthStore from '../../stores/useAuthStore'

/**
 * MultiImageUpload — drag & drop uploader for multiple images to Supabase Storage.
 *
 * @param {Array}    images             - Array of current image URLs
 * @param {string}   coverImage         - Current cover/main image URL
 * @param {Function} onImagesChange     - Called with the updated array of image URLs
 * @param {Function} onCoverImageChange - Called with the new cover image URL
 * @param {string}   label              - Field label
 */
export default function MultiImageUpload({
  images = [],
  coverImage = '',
  onImagesChange,
  onCoverImageChange,
  label = 'Product Gallery (Upload multiple images)'
}) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const user = useAuthStore((s) => s.user)

  // Ensure images is always an array
  const imageList = Array.isArray(images) ? images : (images ? [images] : [])

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return

    setError('')
    setUploading(true)

    const uploadedUrls = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) {
          toast.error(`Skipped "${file.name}": not an image.`)
          continue
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Skipped "${file.name}": must be under 5 MB.`)
          continue
        }

        const ext = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, { upsert: true, contentType: file.type })

        if (uploadError) {
          throw uploadError
        }

        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
        uploadedUrls.push(data.publicUrl)
      }

      if (uploadedUrls.length > 0) {
        const updatedImages = [...imageList, ...uploadedUrls]
        onImagesChange(updatedImages)

        // If no cover image was set, set the first uploaded one as cover
        if (!coverImage && uploadedUrls.length > 0) {
          onCoverImageChange(uploadedUrls[0])
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload one or more images.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    uploadFiles(e.dataTransfer.files)
  }

  const handleChange = (e) => {
    uploadFiles(e.target.files)
  }

  const handleRemove = (urlToRemove) => {
    const updatedImages = imageList.filter((url) => url !== urlToRemove)
    onImagesChange(updatedImages)

    // If the cover image was removed, pick the next available image or clear it
    if (coverImage === urlToRemove) {
      onCoverImageChange(updatedImages.length > 0 ? updatedImages[0] : '')
    }
  }

  const handleSetCover = (url) => {
    onCoverImageChange(url)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Uploaded images side-by-side (flex row) */}
      <div className="flex flex-wrap gap-3 items-center">
        {imageList.map((url, index) => {
          const isCover = url === coverImage
          return (
            <div
              key={url}
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border bg-gray-50 dark:bg-slate-800 transition-all shrink-0 ${
                isCover ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200 dark:border-slate-700'
              }`}
            >
              <img
                src={url}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex flex-col justify-between p-2 opacity-0 hover:opacity-100">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemove(url)}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors cursor-pointer"
                    title="Delete Image"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {!isCover && (
                  <button
                    type="button"
                    onClick={() => handleSetCover(url)}
                    className="w-full bg-white/95 text-gray-800 text-[10px] py-1 rounded hover:bg-white font-bold transition-all cursor-pointer flex items-center justify-center gap-0.5 shadow-sm"
                  >
                    Set Cover
                  </button>
                )}
              </div>

              {/* Cover badge */}
              {isCover && (
                <div className="absolute top-1.5 left-1.5 bg-indigo-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5 shadow-sm">
                  <Star size={8} className="fill-white" />
                  Cover
                </div>
              )}
            </div>
          )
        })}

        {/* Upload box */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`
            relative w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 shrink-0 p-2
            ${dragging
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-800/30'}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleChange}
          />

          {uploading ? (
            <div className="flex flex-col items-center justify-center gap-1">
              <Loader2 size={18} className="text-indigo-500 animate-spin" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-indigo-500 transition-colors">
              <Upload size={18} />
              <span className="text-[11px] font-medium">Add Image</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}
    </div>
  )
}
