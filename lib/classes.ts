export type ClassId = 'twerk' | 'highheels' | 'stretching'

export type ClassSchedule = {
  classType: string
  dayOfWeek: number
  timeDisplay: string
  duration: string
}

export const CLASS_IDS: ClassId[] = ['twerk', 'highheels', 'stretching']

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const DAY_SHORT  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function parseTimeDisplay(timeDisplay: string): { opens: string; closes: string } {
  const parts = timeDisplay.split(/[–—]/)
  const endPart = parts[1].trim()
  const startPart = parts[0].trim()
  const endMatch = endPart.match(/(\d+):(\d+)\s*(AM|PM)/i)
  const startMatch = startPart.match(/(\d+):(\d+)(?:\s*(AM|PM))?/i)
  if (!endMatch || !startMatch) return { opens: '00:00', closes: '00:00' }
  const endPeriod = endMatch[3].toUpperCase() as 'AM' | 'PM'
  const startPeriod = (startMatch[3]?.toUpperCase() ?? endPeriod) as 'AM' | 'PM'
  const to24 = (h: string, m: string, p: 'AM' | 'PM') => {
    let hour = parseInt(h)
    if (p === 'PM' && hour !== 12) hour += 12
    if (p === 'AM' && hour === 12) hour = 0
    return `${hour.toString().padStart(2, '0')}:${m}`
  }
  return { opens: to24(startMatch[1], startMatch[2], startPeriod), closes: to24(endMatch[1], endMatch[2], endPeriod) }
}

export const DEFAULT_SCHEDULES: ClassSchedule[] = [
  { classType: 'twerk',      dayOfWeek: 6, timeDisplay: '11:00 AM–12:20 PM', duration: '80 min' },
  { classType: 'highheels',  dayOfWeek: 5, timeDisplay: '7:00–8:00 PM',      duration: '60 min' },
  { classType: 'stretching', dayOfWeek: 4, timeDisplay: '7:00–8:00 PM',      duration: '60 min' },
]

export const CLASS_STATIC: Record<ClassId, {
  label: string
  photo: string
  bookUrl: string
  level: string
  modalEyebrow: string
  desc: string
  modalTexts: string[]
  dropin: number
  monthly: number | null
}> = {
  twerk: {
    label: 'Twerk',
    photo: '/class-twerk.jpg',
    bookUrl: '/book?class=twerk',
    level: 'Beginner / Int.',
    modalEyebrow: 'Class 01 — Beginner Friendly',
    desc: "A dance style focused on hip movement, pelvic mobility, and rhythm — combining technique and choreography to feel more free and confident in your body.",
    modalTexts: [
      "Twerk is a dynamic dance style focused on hip movement, pelvic mobility, rhythm, and body awareness. These classes combine twerk technique and choreography: sometimes focusing on foundational hip and pelvic movements, and other times learning choreographies with twerk elements, musicality, and expression.",
      "This style is deeply connected to pelvic mobility and body awareness. Through movement, you can release tension, improve coordination, feel more free in your body, and become more connected to yourself. Twerk is energetic, expressive, playful, and sensual in a way that encourages confidence, freedom, self-expression, and deeper connection with your body.",
      "A lot of tension and stress can build up in the hips and pelvis over time, especially from emotional stress or a sedentary lifestyle. Movement in this area can feel incredibly freeing both physically and emotionally. These classes are not only about learning how to dance, but also about enjoying movement, improving mobility, boosting energy, and feeling more confident in your body.",
      "This style may be perfect for you if you want to: feel more confident and free in your body · improve hip mobility and body coordination · release stress and emotional tension through movement · reconnect with your femininity and sensuality · try something empowering and outside of your comfort zone.",
      "No dance experience is needed — the most important thing is being open to movement and enjoying the process.",
    ],
    dropin: 25,
    monthly: 80,
  },
  highheels: {
    label: 'High Heels',
    photo: '/class-highheels.jpg',
    bookUrl: '/book?class=highheels',
    level: 'Beginner / Int.',
    modalEyebrow: 'Class 02 — Beginner Friendly',
    desc: "A dance style that combines confidence, femininity, and self-expression through movement in heels — focused on choreography, posture, and body awareness.",
    modalTexts: [
      "High Heels dance is where fashion meets choreography. Born from the stages of burlesque and the runways of vogue, it's a style that celebrates femininity in every form — powerful, playful, and unapologetically bold.",
      "We teach you how to walk, turn, and move in heels safely and gracefully. You'll build leg strength, body awareness, and the kind of floor presence that turns heads. Heels are optional — you're welcome to train in socks or flats while you build confidence.",
      "This class is for every woman who's ever wanted to own a room. You don't need to be a dancer. You just need to show up.",
    ],
    dropin: 30,
    monthly: 100,
  },
  stretching: {
    label: 'Stretching',
    photo: '/class-stretching.jpg',
    bookUrl: '/book?class=stretching',
    level: 'All Levels',
    modalEyebrow: 'Class 03 — All Levels',
    desc: "A movement-based class focused on flexibility, mobility, and posture — helping release tension, reduce stress, and deepen your connection with your body.",
    modalTexts: [
      "Stretching classes focus on improving flexibility, mobility, posture, and overall body awareness through mindful movement and controlled exercises. These sessions help release muscle tension, improve recovery, increase range of motion, and create a stronger connection with your body.",
      "Stretching is not only beneficial for physical health, but also helps reduce stress, improve relaxation, and make the body feel lighter and more free in everyday life. Classes are beginner-friendly and designed to help you move safely, comfortably, and at your own pace.",
      "Stretching may be perfect for you if you want to: improve flexibility and mobility · release tension and stiffness in the body · improve posture and body awareness · support recovery from workouts or dancing · feel more relaxed, balanced, and connected to your body.",
      "No flexibility level is required — the goal is progress, consistency, and feeling better in your body over time.",
    ],
    dropin: 20,
    monthly: null,
  },
}
