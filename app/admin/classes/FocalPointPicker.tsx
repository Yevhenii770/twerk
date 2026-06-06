'use client'

import { useState, useTransition } from 'react'
import { updatePhotoPosition } from '@/app/actions/classSettings'

interface Props {
  classId: string
  label: string
  photo: string
  initial: string
}

export default function FocalPointPicker({ classId, label, photo, initial }: Props) {
  const [position, setPosition] = useState(initial)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    setPosition(`${x}% ${y}%`)
    setSaved(false)
  }

  const handleSave = () => {
    startTransition(async () => {
      await updatePhotoPosition(classId, position)
      setSaved(true)
    })
  }

  const [px, py] = position.split(' ').map(v => parseFloat(v))

  return (
    <div style={{ background: '#fff', border: '1px solid #E0E0E0', padding: 20 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>
        {label}
      </p>

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
          src={photo}
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
        {/* Focal point marker */}
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
          onClick={handleSave}
          disabled={pending}
          style={{
            background: saved ? '#2E7D32' : '#111',
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
          {pending ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <p style={{ fontSize: 11, color: '#AAA', marginTop: 6 }}>Click on the image to set the focal point</p>
    </div>
  )
}
