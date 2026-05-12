'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const INSTA_SVG = (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const classes = [
  {
    id: 'twerk',
    tag: 'Monday · 4:00–5:00 PM',
    title: 'Twerk',
    desc: 'Empowering, body-positive, and full of energy. Learn rhythm, isolation, and confidence in every move. You\'ll leave feeling stronger than you walked in.',
    bookUrl: '/book?class=twerk',
    photo: '/class-twerk.jpg',
    modalEyebrow: 'Class 01 — Beginner Friendly',
    modalTexts: [
      'Twerk is a high-energy, body-positive dance style rooted in Southern hip-hop and Afro-diasporic movement traditions. At its core, it\'s about unlocking the hips, discovering rhythm, and building a deep connection with your own body.',
      'In our classes you\'ll start from scratch — no prior dance experience required. We work through isolations, muscle control, and layered combinations at a pace that feels good. Every class ends with a short choreo piece you can actually take home.',
      'Beyond the moves, twerk is about confidence. Women leave our classes standing taller, laughing more, and feeling at home in their bodies in a way they didn\'t before.',
    ],
    meta: [
      { k: 'Day', v: 'Monday' }, { k: 'Time', v: '4:00–5:00 PM' },
      { k: 'Level', v: 'Beginner / Int.' }, { k: 'Duration', v: '60 min' },
    ],
  },
  {
    id: 'highheels',
    tag: 'Tuesday · 7:00–8:00 PM',
    title: 'High Heels',
    desc: 'Feminine, fierce, and fabulous. Walk, dance, and own every room. We\'ll teach you to move in heels like they were made for you — because they were.',
    bookUrl: '/book?class=highheels',
    photo: '/class-highheels.jpg',
    modalEyebrow: 'Class 02 — Beginner Friendly',
    modalTexts: [
      'High Heels dance is where fashion meets choreography. Born from the stages of burlesque and the runways of vogue, it\'s a style that celebrates femininity in every form — powerful, playful, and unapologetically bold.',
      'We teach you how to walk, turn, and move in heels safely and gracefully. You\'ll build leg strength, body awareness, and the kind of floor presence that turns heads. Heels are optional — you\'re welcome to train in socks or flats while you build confidence.',
      'This class is for every woman who\'s ever wanted to own a room. You don\'t need to be a dancer. You just need to show up.',
    ],
    meta: [
      { k: 'Day', v: 'Tuesday' }, { k: 'Time', v: '7:00–8:00 PM' },
      { k: 'Level', v: 'Beginner / Int.' }, { k: 'Duration', v: '60 min' },
    ],
  },
  {
    id: 'stretching',
    tag: 'Saturday · 11:00 AM–12:20 PM',
    title: 'Stretching',
    desc: 'Flexibility, mobility, and a moment of peace. This class slows you down just enough to reconnect with your body and release the tension of the week.',
    bookUrl: '/book?class=stretching',
    photo: '/class-stretching.jpg',
    modalEyebrow: 'Class 03 — All Levels',
    modalTexts: [
      'Our stretching class is a slow, intentional hour dedicated to flexibility, mobility, and recovery. Think of it as the reset your body has been asking for — deep stretches, breathing work, and guided movement that undoes the tension of the week.',
      'We work through the full body: spine, hips, hamstrings, shoulders. Each session builds on the last, so over time you\'ll notice real, lasting improvements in your range of motion — whether you\'re a dancer or someone who just sits at a desk all day.',
      'No flexibility required to join. Seriously. This class is for every body, exactly as it is right now.',
    ],
    meta: [
      { k: 'Day', v: 'Saturday' }, { k: 'Time', v: '11:00 AM–12:20 PM' },
      { k: 'Level', v: 'All Levels' }, { k: 'Duration', v: '80 min' },
    ],
  },
]

export default function ClassesWithModals() {
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

  return (
    <>
      <div className="mk-classes-grid">
        {classes.map(cls => (
          <div key={cls.id} className="mk-class-card">
            <div className="mk-class-video">
              <img src={cls.photo} alt={cls.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
              <img src={cls.photo} alt={cls.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
