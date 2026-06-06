'use client'

import { useState, useTransition, useRef } from 'react'
import { updatePhotoPosition, updatePhotoUrl } from '@/app/actions/classSettings'

interface Props {
  classId: string
  label: string
  photo: string
  initial: string
}

export default function FocalPointPicker({ classId, label, photo, initial }: Props) {
  const [position, setPosition] = useState(initial)
  const [currentPhoto, setCurrentPhoto] = useState(photo)
  const [savedPos, setSavedPos] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [pending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    setPosition(`${x}% ${y}%`)
    setSavedPos(false)
  }

  const handleSavePosition = () => {
    startTransition(async () => {
      await updatePhotoPosition(classId, position)
      setSavedPos(true)
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')

    const form = new FormData()
    form.append('file', file)
    form.append('classType', classId)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const { url } = await res.json()
      await updatePhotoUrl(classId, url)
      setCurrentPhoto(url + '?t=' + Date.now())
      setUploadDone(true)
    } catch {
      setUploadError('Upload failed. Check BLOB_READ_WRITE_TOKEN.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const [px, py] = position.split(' ').map(v => parseFloat(v))

  return (
    <div style={{ background: '#fff', border: '1px solid #E0E0E0', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', margin: 0 }}>
          {label}
        </p>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            background: uploading ? '#888' : '#C9A96E',
            color: '#fff',
            border: 'none',
            padding: '7px 16px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: uploading ? 'wait' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {uploading ? 'Uploading…' : uploadDone ? '✓ Uploaded' : '↑ Upload Photo'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleUpload}
        />
      </div>

      {uploadError && (
        <p style={{ fontSize: 11, color: '#c00', marginBottom: 8 }}>{uploadError}</p>
      )}

      {/* Focal point picker */}
      <div
        onClick={handleClick}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          overflow: 'hidden',
          cursor: 'crosshair',
          background: '#111',
        }}
      >
        <img
          src={currentPhoto}
          alt={label}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: position,
            display: 'block',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${px}%`,
            top: `${py}%`,
            transform: 'translate(-50%, -50%)',
            width: 20,
            height: 20,
            pointerEvents: 'none',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, border: '2px solid #fff', borderRadius: '50%', boxShadow: '0 0 0 1px rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#fff', transform: 'translateY(-50%)', boxShadow: '0 1px 0 rgba(0,0,0,0.4)' }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: '#fff', transform: 'translateX(-50%)', boxShadow: '1px 0 0 rgba(0,0,0,0.4)' }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <span style={{ fontSize: 12, color: '#666', fontFamily: 'monospace', flex: 1 }}>
          {position}
        </span>
        <button
          onClick={handleSavePosition}
          disabled={pending}
          style={{
            background: savedPos ? '#2E7D32' : '#111',
            color: '#fff',
            border: 'none',
            padding: '8px 20px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: pending ? 'wait' : 'pointer',
            fontFamily: 'inherit',
            transition: 'background 0.2s',
          }}
        >
          {pending ? 'Saving…' : savedPos ? '✓ Saved' : 'Save Position'}
        </button>
      </div>
      <p style={{ fontSize: 11, color: '#AAA', marginTop: 6 }}>Click on the image to set the focal point</p>
    </div>
  )
}
