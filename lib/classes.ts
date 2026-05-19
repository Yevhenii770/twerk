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
    desc: "Empowering, body-positive, and full of energy. Learn rhythm, isolation, and confidence in every move. You'll leave feeling stronger than you walked in.",
    modalTexts: [
      "Twerk is a high-energy, body-positive dance style rooted in Southern hip-hop and Afro-diasporic movement traditions. At its core, it's about unlocking the hips, discovering rhythm, and building a deep connection with your own body.",
      "In our classes you'll start from scratch — no prior dance experience required. We work through isolations, muscle control, and layered combinations at a pace that feels good. Every class ends with a short choreo piece you can actually take home.",
      "Beyond the moves, twerk is about confidence. Women leave our classes standing taller, laughing more, and feeling at home in their bodies in a way they didn't before.",
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
    desc: "Feminine, fierce, and fabulous. Walk, dance, and own every room. We'll teach you to move in heels like they were made for you — because they were.",
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
    desc: "Flexibility, mobility, and a moment of peace. This class slows you down just enough to reconnect with your body and release the tension of the week.",
    modalTexts: [
      "Our stretching class is a slow, intentional hour dedicated to flexibility, mobility, and recovery. Think of it as the reset your body has been asking for — deep stretches, breathing work, and guided movement that undoes the tension of the week.",
      "We work through the full body: spine, hips, hamstrings, shoulders. Each session builds on the last, so over time you'll notice real, lasting improvements in your range of motion — whether you're a dancer or someone who just sits at a desk all day.",
      "No flexibility required to join. Seriously. This class is for every body, exactly as it is right now.",
    ],
    dropin: 20,
    monthly: null,
  },
}
