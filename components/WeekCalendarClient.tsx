'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function WeekCalendarClient() {
  useEffect(() => {
    const today = new Date().getDay()
    document.querySelectorAll<HTMLElement>('.wday[data-day]').forEach(col => {
      if (parseInt(col.dataset.day!) === today) {
        col.classList.add('wday--today')
      }
    })
  }, [])

  return (
    <div className="week-cal">

      <div className="wday" data-day="1" data-class="twerk">
        <div className="wday-header">
          <span className="wday-name">Mon</span>
          <span className="wday-label">Monday</span>
        </div>
        <div className="wday-body">
          <div>
            <p className="wday-class-tag">Beginner · Int.</p>
            <p className="wday-class-name">Twerk</p>
            <p className="wday-time">4:00 – 5:00 PM</p>
            <p className="wday-dur">60 min</p>
          </div>
          <Link href="/book?class=twerk" className="btn-wday">Book</Link>
        </div>
      </div>

      <div className="wday" data-day="2" data-class="highheels">
        <div className="wday-header">
          <span className="wday-name">Tue</span>
          <span className="wday-label">Tuesday</span>
        </div>
        <div className="wday-body">
          <div>
            <p className="wday-class-tag">Beginner · Int.</p>
            <p className="wday-class-name">High Heels</p>
            <p className="wday-time">7:00 – 8:00 PM</p>
            <p className="wday-dur">60 min</p>
          </div>
          <Link href="/book?class=highheels" className="btn-wday">Book</Link>
        </div>
      </div>

      <div className="wday wday--rest" data-day="3">
        <div className="wday-header">
          <span className="wday-name">Wed</span>
          <span className="wday-label">Wednesday</span>
        </div>
        <div className="wday-body"><div className="wday-rest-line" /></div>
      </div>

      <div className="wday wday--rest" data-day="4">
        <div className="wday-header">
          <span className="wday-name">Thu</span>
          <span className="wday-label">Thursday</span>
        </div>
        <div className="wday-body"><div className="wday-rest-line" /></div>
      </div>

      <div className="wday wday--rest" data-day="5">
        <div className="wday-header">
          <span className="wday-name">Fri</span>
          <span className="wday-label">Friday</span>
        </div>
        <div className="wday-body"><div className="wday-rest-line" /></div>
      </div>

      <div className="wday" data-day="6" data-class="stretching">
        <div className="wday-header">
          <span className="wday-name">Sat</span>
          <span className="wday-label">Saturday</span>
        </div>
        <div className="wday-body">
          <div>
            <p className="wday-class-tag">All Levels</p>
            <p className="wday-class-name">Stretching</p>
            <p className="wday-time">11:00 AM – 12:20 PM</p>
            <p className="wday-dur">80 min</p>
          </div>
          <Link href="/book?class=stretching" className="btn-wday">Book</Link>
        </div>
      </div>

      <div className="wday wday--rest" data-day="0">
        <div className="wday-header">
          <span className="wday-name">Sun</span>
          <span className="wday-label">Sunday</span>
        </div>
        <div className="wday-body"><div className="wday-rest-line" /></div>
      </div>

    </div>
  )
}
