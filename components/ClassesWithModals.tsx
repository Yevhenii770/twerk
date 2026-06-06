'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { CLASS_STATIC, CLASS_IDS, DAY_NAMES, type ClassId, type ClassSchedule } from '@/lib/classes'

export default function ClassesWithModals({ schedule, photoPositions }: { schedule: ClassSchedule[], photoPositions?: Record<string, { photoPosition: string; photoUrl: string | null; desc: string | null; modalTexts: string[] | null }> }) {
  const [openId, setOpenId] = useState<string | null>(null)

  const close = useCallback(() => {
    setOpenId(null)
    document.body.style.overflow = ''
  }, [])

  const open = useCallback((id: string) => {
    setOpenId(id)
    document.body.style.overflow = 'hidden'
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const scheduleMap = Object.fromEntries(schedule.map(s => [s.classType, s]))

  const classes = CLASS_IDS.map(id => {
    const cls = CLASS_STATIC[id]
    const sched = scheduleMap[id]
    const dayName = sched ? DAY_NAMES[sched.dayOfWeek] : ''
    return {
      id,
      tag: sched ? `${dayName} · ${sched.timeDisplay}` : '',
      title: cls.label,
      desc: photoPositions?.[id]?.desc ?? cls.desc,
      bookUrl: cls.bookUrl,
      photo: photoPositions?.[id]?.photoUrl ?? cls.photo,
      defaultPhoto: cls.photo,
      photoPosition: photoPositions?.[id]?.photoPosition ?? '50% 50%',
      modalEyebrow: cls.modalEyebrow,
      modalTexts: photoPositions?.[id]?.modalTexts ?? cls.modalTexts,
      meta: [
        { k: 'Day',      v: dayName },
        { k: 'Time',     v: sched?.timeDisplay ?? '' },
        { k: 'Level',    v: cls.level },
        { k: 'Duration', v: sched?.duration ?? '' },
      ],
    }
  })

  return (
    <>
      <div className="mk-classes-grid">
        {classes.map(cls => (
          <div key={cls.id} className="mk-class-card">
            <div className="mk-class-video">
              <img src={cls.photo} alt={cls.title} style={{ objectPosition: cls.photoPosition }} onError={e => { const img = e.target as HTMLImageElement; if (img.src !== window.location.origin + cls.defaultPhoto) img.src = cls.defaultPhoto }} />
            </div>
            <div className="mk-class-body">
              <p className="mk-class-tag">{cls.tag}</p>
              <h2 className="mk-class-title">{cls.title}</h2>
              <p className="mk-class-desc">{cls.desc}</p>
              <Link href={cls.bookUrl} className="btn-join">Join Class</Link>
              <button className="btn-learn" onClick={() => open(cls.id)}>Learn more?</button>
            </div>
          </div>
        ))}
      </div>

      {classes.map(cls => (
        <div
          key={cls.id}
          className={`modal-backdrop${openId === cls.id ? ' open' : ''}`}
          onClick={e => { if (!(e.target as Element).closest('.modal-box')) close() }}
        >
          <div className="modal-box">
            <button className="modal-close" onClick={close}>&#215;</button>
            <div className="modal-cover">
              <img src={cls.photo} alt={cls.title} style={{ objectPosition: cls.photoPosition }} />
            </div>
            <div className="modal-body">
              <p className="modal-eyebrow">{cls.modalEyebrow}</p>
              <h2 className="modal-title">{cls.title}</h2>
              {cls.modalTexts.map((t, i) => <p key={i} className="modal-text">{t}</p>)}
              <div className="modal-meta">
                {cls.meta.map(m => (
                  <div key={m.k} className="modal-meta-cell">
                    <p className="modal-meta-k">{m.k}</p>
                    <p className="modal-meta-v">{m.v}</p>
                  </div>
                ))}
              </div>
              <Link href={cls.bookUrl} className="btn-cta" style={{ fontSize: '11px', padding: '16px 48px' }} onClick={close}>
                Book This Class
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
