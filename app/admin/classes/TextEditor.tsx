'use client'

import { useState, useTransition } from 'react'
import { updateClassText } from '@/app/actions/classSettings'

interface Props {
  classId: string
  label: string
  initialDesc: string
  initialModalTexts: string[]
}

export default function TextEditor({ classId, label, initialDesc, initialModalTexts }: Props) {
  const [desc, setDesc] = useState(initialDesc)
  const [modalTexts, setModalTexts] = useState(initialModalTexts)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const updateParagraph = (i: number, val: string) => {
    setSaved(false)
    setModalTexts(prev => prev.map((t, idx) => idx === i ? val : t))
  }

  const addParagraph = () => setModalTexts(prev => [...prev, ''])
  const removeParagraph = (i: number) => setModalTexts(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = () => {
    startTransition(async () => {
      await updateClassText(classId, desc, modalTexts.filter(t => t.trim()))
      setSaved(true)
    })
  }

  const btn: React.CSSProperties = {
    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
  }

  return (
    <div style={{ borderTop: '1px solid #E0E0E0', marginTop: 16, paddingTop: 16 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>
        Text — {label}
      </p>

      {/* Card description */}
      <p style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Card description</p>
      <textarea
        value={desc}
        onChange={e => { setDesc(e.target.value); setSaved(false) }}
        rows={3}
        style={{
          width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #DDD',
          fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', marginBottom: 16,
        }}
      />

      {/* Modal paragraphs */}
      <p style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>Modal paragraphs</p>
      {modalTexts.map((text, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <textarea
            value={text}
            onChange={e => updateParagraph(i, e.target.value)}
            rows={3}
            style={{
              flex: 1, padding: '8px 10px', fontSize: 13, border: '1px solid #DDD',
              fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
            }}
          />
          <button
            onClick={() => removeParagraph(i)}
            style={{ ...btn, background: 'none', color: '#AAA', padding: '4px 8px', alignSelf: 'flex-start', fontSize: 16 }}
          >
            ×
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={addParagraph}
          style={{ ...btn, background: '#F5F5F5', color: '#555', padding: '8px 16px' }}
        >
          + Add paragraph
        </button>
        <button
          onClick={handleSave}
          disabled={pending}
          style={{
            ...btn,
            background: saved ? '#2E7D32' : '#111',
            color: '#fff',
            padding: '8px 24px',
            transition: 'background 0.2s',
            cursor: pending ? 'wait' : 'pointer',
          }}
        >
          {pending ? 'Saving…' : saved ? '✓ Saved' : 'Save Text'}
        </button>
      </div>
    </div>
  )
}
