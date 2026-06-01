import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import useAuthStore from '../../stores/useAuthStore'

/**
 * ImageUpload — drag & drop image uploader to Supabase Storage.
 * Uploads to: product-images/{userId}/{timestamp}-{filename}
 *
 * @param {string}   value       - Current image URL
 * @param {Function} onChange    - Called with the new public URL after upload
 * @param {string}   label       - Field label
 */
export default function ImageUpload({ value, onChange, label = 'Product Image' }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const user = useAuthStore((s) => s.user)

  const upload = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (jpg, png, webp, etc.)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5 MB.')
      return
    }

    setError('')
    setUploading(true)

    const ext = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    onChange(data.publicUrl)
    setUploading(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    upload(file)
  }

  const handleChange = (e) => {
    const file = e.target.files[0]
    upload(file)
  }

  const handleRemove = () => {
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      {value ? (
        /* Preview */
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-800">
          <img
            src={value}
            alt="Preview"
            className="w-full h-52 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 size={12} />
            Uploaded
          </div>
        </div>
      ) : (
        /* Drop Zone */
        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer
            ${dragging
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]'
              : 'border-gray-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'}
          `}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="text-indigo-500 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                {dragging ? <Upload size={26} className="text-indigo-500" /> : <ImageIcon size={26} className="text-indigo-400" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {dragging ? 'Drop to upload' : 'Click or drag & drop'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  PNG, JPG, WebP — max 5 MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}
    </div>
  )
}
