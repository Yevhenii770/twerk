'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CLASS_STATIC, DAY_SHORT, DAY_NAMES, ID_TO_SLUG, type ClassId, type ClassSchedule } from '@/lib/classes'

export default function WeekCalendarClient({ schedule }: { schedule: ClassSchedule[] }) {
  useEffect(() => {
    const today = new Date().getDay()
    document.querySelectorAll<HTMLElement>('.wday[data-day]').forEach(col => {
      if (parseInt(col.dataset.day!) === today) col.classList.add('wday--today')
    })
  }, [])

  return (
    <div className="week-cal">
      {([1, 2, 3, 4, 5, 6, 0] as number[]).map(day => {
        const sched = schedule.find(s => s.dayOfWeek === day)
        if (!sched) {
          return (
            <div key={day} className="wday wday--rest" data-day={day}>
              <div className="wday-header">
                <span className="wday-name">{DAY_SHORT[day]}</span>
                <span className="wday-label">{DAY_NAMES[day]}</span>
              </div>
              <div className="wday-body"><div className="wday-rest-line" /></div>
            </div>
          )
        }
        const cls = CLASS_STATIC[sched.classType as ClassId]
        return (
          <div key={day} className="wday" data-day={day} data-class={sched.classType}>
            <div className="wday-header">
              <span className="wday-name">{DAY_SHORT[day]}</span>
              <span className="wday-label">{DAY_NAMES[day]}</span>
            </div>
            <div className="wday-body">
              <div>
                <p className="wday-class-tag">{cls.level}</p>
                <p className="wday-class-name">{cls.label}</p>
                <p className="wday-time">{sched.timeDisplay.replace('–', ' – ')}</p>
                <p className="wday-dur">{sched.duration}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <Link href={cls.bookUrl} className="btn-wday">Book</Link>
                <Link href={`/classes/${ID_TO_SLUG[sched.classType as ClassId]}`} className="btn-wday" style={{ fontSize: '9px', opacity: 0.7 }}>Details</Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
