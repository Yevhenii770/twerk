import { CLASS_STATIC, describeSchedule, formatSlot, type ClassId, type ClassSchedule } from '@/lib/classes'

/**
 * Long-form copy for the marketing pages. Anything that mentions a day, time or price is a
 * function of the live schedule / admin prices — never hardcode "every Saturday" or "$30" here,
 * so an admin schedule change shows up in the visible text AND the FAQ structured data at once.
 */

export type Faq = { q: string; a: string }
export type Prices = { dropin: number; monthly: number | null }

export const STUDIO_ADDRESS = '2648 E Burnside St, Portland, OR 97214'
export const MAPS_URL = 'https://www.google.com/maps/place/Bounce+Lab/@45.5308718,-122.6595633,17z'

export function faqSchema(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

function priceSentence(p: Prices): string {
  return p.monthly != null
    ? `A drop-in class is $${p.dropin}, and a Monthly Pass is $${p.monthly}`
    : `A drop-in class is $${p.dropin}`
}

export function homeFaqs(schedule: ClassSchedule[], prices: Prices): Faq[] {
  return [
    { q: 'Do I need dance experience to join?', a: 'No experience needed. All classes at bounce lab are beginner-friendly — the most important thing is showing up and enjoying the movement. Many students come with zero dance background.' },
    { q: 'What if I feel self-conscious or nervous?', a: "That's completely normal — most of our students felt the same way before their first class. bounce lab is a judgment-free space where everyone supports each other. You'll feel comfortable from the very first minute." },
    { q: 'What should I wear to a twerk or high heels class?', a: 'Wear comfortable clothes you can move in. For Twerk classes, wear shorts or pants that allow your glutes to move freely — avoid tight compression or shaping clothing that restricts movement. For High Heels, bring a pair of heels (5–8 cm recommended) or train in socks while you build confidence.' },
    { q: 'How much does a drop-in class cost in Portland?', a: `${priceSentence(prices)}.${prices.monthly != null ? ' The Monthly Pass is valid for 5 weeks from your purchase date and can be used for any classes on the schedule — Twerk or High Heels.' : ''}` },
    { q: 'Can I cancel or reschedule my booking?', a: 'Yes! You can reschedule or cancel your booking up to 24 hours before the class at no charge. Just reach out to us by phone or email.' },
    { q: 'Where do bounce lab classes take place in Portland?', a: `Classes are held at ${STUDIO_ADDRESS}, United States. Whole Foods is located nearby and may be a convenient nearby option for parking.` },
    { q: 'Do I need to book in advance?', a: 'We recommend booking online to reserve your spot — classes can fill up quickly. Walk-ins are welcome based on availability.' },
    { q: 'What dance styles does bounce lab offer?', a: `bounce lab offers weekly classes in Portland: ${describeSchedule(schedule)}. Both styles are beginner-friendly.` },
  ]
}

type Section = { heading: string; paragraphs: string[]; bullets?: string[] }

type ClassSeo = {
  /** H2 sections shown under "About this class" on /classes/[slug]. */
  sections: (sched: ClassSchedule | undefined) => Section[]
  faqs: (sched: ClassSchedule | undefined, prices: Prices) => Faq[]
}

const whenText = (id: ClassId, sched: ClassSchedule | undefined) =>
  sched ? `${CLASS_STATIC[id].label} runs every ${formatSlot(sched)} (${sched.duration})` : `${CLASS_STATIC[id].label} runs weekly`

export const CLASS_SEO: Record<ClassId, ClassSeo> = {
  twerk: {
    sections: () => [
      {
        heading: 'Twerk Dance Classes in Portland for Beginners',
        paragraphs: [
          "Most women who walk into our twerk class have never twerked in front of anyone — and that's exactly who this class is built for. We start from the foundations: how to isolate the hips, how to find the bounce without straining your lower back, and how to move with the music instead of chasing it.",
          'Every class mixes technique and choreography. Some weeks we go deep on the basics — hip isolations, pelvic tilts, the classic bounce and its variations. Other weeks we put it together into a short routine with twerk elements, floor work and musicality, so you leave with something you can actually dance.',
        ],
      },
      {
        heading: 'What to Expect in Your First Twerk Class',
        paragraphs: ['Come 5–10 minutes early so we can say hi and show you where to put your things. A typical class looks like this:'],
        bullets: [
          'Warm-up for the hips, knees and lower back — twerk is a full-body workout, so we prepare properly.',
          'Technique: isolations and bounce drills, broken down slowly with options for every level.',
          'Choreography: a short combination that puts the technique to music.',
          'Cool-down and stretch for the hips and glutes.',
        ],
      },
      {
        heading: 'What to Wear to Twerk Class',
        paragraphs: [
          'Wear shorts, leggings or loose pants that let your glutes move freely — avoid shapewear or very tight compression. Sneakers or bare feet/socks both work. Bring water and, if you like, knee pads for the floor work.',
        ],
      },
      {
        heading: 'Why Twerk?',
        paragraphs: [
          'Beyond the fun, twerk builds strength in the glutes, legs and core, improves hip mobility and coordination, and releases tension that builds up in the hips from long days of sitting. Many of our students say it is the one hour a week they fully stop thinking and just feel their body.',
        ],
      },
    ],
    faqs: (sched, prices) => [
      { q: 'Is the twerk class good for complete beginners?', a: 'Yes. The class is beginner-friendly: every move is broken down step by step, with easier and harder options. No dance background is needed.' },
      { q: 'When is the twerk class in Portland?', a: `${whenText('twerk', sched)} at bounce lab, ${STUDIO_ADDRESS}.` },
      { q: 'How much is a twerk class?', a: `${priceSentence(prices)}. You can book and pay online.` },
      { q: 'What should I wear to my first twerk class?', a: 'Shorts, leggings or loose pants that let your glutes move freely, plus sneakers or socks. Avoid shapewear. Knee pads are optional for floor work.' },
      { q: 'Is twerking a good workout?', a: 'Yes — twerk works the glutes, legs and core, gets your heart rate up and improves hip mobility. It feels like a dance class, but your legs will know you trained.' },
      { q: 'Do I need to bring a friend?', a: 'Not at all — most students come on their own. The group is small, supportive and judgment-free, so you will feel at home quickly.' },
    ],
  },
  highheels: {
    sections: () => [
      {
        heading: 'High Heels Dance Classes in Portland',
        paragraphs: [
          'Heels dance combines choreography with the confidence of a runway walk. In our high heels class you learn to walk, turn, pose and move to the music in heels — safely, with control, and with a lot of attitude.',
          'Each class has a technique part (posture, balance, walks, turns and transitions) and a choreography part where we put everything together into a short routine. It is beginner-friendly: we show every step slowly and give options if you are just getting comfortable in heels.',
        ],
      },
      {
        heading: 'What to Expect in Your First Heels Class',
        paragraphs: ['Arrive 5–10 minutes early to change shoes and warm up your ankles. A typical class:'],
        bullets: [
          'Warm-up focused on ankles, calves and core for stability in heels.',
          'Technique: posture, heel walks, turns, hair and hand work.',
          'Choreography: a sensual, confident combination set to music.',
          'Cool-down and stretch for the feet, calves and hips.',
        ],
      },
      {
        heading: 'Do I Need Heels for a Beginner Heels Class?',
        paragraphs: [
          'Heels are welcome but not required. For your first classes you can dance in socks or flats while you learn the movement. When you are ready, a stable heel of about 5–8 cm (2–3 inches) with an ankle strap is the easiest place to start — a block or thicker heel is more forgiving than a thin stiletto.',
        ],
      },
      {
        heading: 'Why Women Love Heels Class',
        paragraphs: [
          'Heels dance builds leg and core strength, balance and posture — and, most of all, presence. Students tell us they walk differently after a few weeks: taller, slower, more confident, in heels and out of them.',
        ],
      },
    ],
    faqs: (sched, prices) => [
      { q: 'Can I take a heels dance class with no experience?', a: 'Yes. The class is beginner-friendly and you can start in socks or flats. Every step is broken down slowly.' },
      { q: 'When is the high heels class in Portland?', a: `${whenText('highheels', sched)} at bounce lab, ${STUDIO_ADDRESS}.` },
      { q: 'How much is a heels dance class?', a: `${priceSentence(prices)}. You can book and pay online.` },
      { q: 'What heels should I wear to a heels dance class?', a: 'Start with a stable heel of about 5–8 cm (2–3 in), ideally with an ankle strap. Block heels are easier than thin stilettos. You can also start in socks or flats.' },
      { q: 'What should I wear for high heels class?', a: 'Anything you feel good in and can move in — leggings, shorts or a bodysuit work well. Knee pads are handy for floor choreography.' },
      { q: 'Is heels dance safe for my ankles?', a: 'We warm up the ankles and calves at the start of every class and build up gradually, with options to dance in flats. Listen to your body and take breaks whenever you need.' },
    ],
  },
}
