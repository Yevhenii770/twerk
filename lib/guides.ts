/**
 * Evergreen beginner guides (/guides/[slug]). They answer the questions people search before
 * their first class and link into the class pages. Keep schedule/price facts OUT of this copy —
 * the guide page renders those from live data in its CTA block.
 */

export type GuideBlock = { h2: string; p?: string[]; list?: string[] }

export type Guide = {
  slug: string
  title: string
  metaTitle: string
  description: string
  classSlug: 'twerk' | 'high-heels'
  published: string
  intro: string
  blocks: GuideBlock[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'what-to-wear-to-twerk-class',
    title: 'What to Wear to Your First Twerk Class',
    metaTitle: 'What to Wear to Twerk Class — Beginner Guide (Portland)',
    description: 'What to wear to a twerk class as a beginner: shorts vs leggings, shoes, knee pads and what to bring. A simple checklist from a Portland twerk studio.',
    classSlug: 'twerk',
    published: '2026-11-11',
    intro: "Booked your first twerk class and wondering what to put on? Here's the short, practical answer from our studio in Portland — so you can stop overthinking it and just come move.",
    blocks: [
      {
        h2: 'Bottoms: let your glutes move',
        p: [
          'Twerk is all about hip and glute movement, so choose bottoms that move with you: bike shorts, booty shorts, leggings or loose joggers all work. What to avoid: shapewear, very tight compression leggings and jeans — they restrict the movement you came to learn.',
          'Many students like shorts because it is easier to see what the hips and glutes are doing in the mirror. Wear what you feel comfortable in — there is no dress code.',
        ],
      },
      {
        h2: 'Top: anything you can sweat in',
        p: ['A fitted tank, sports bra or T-shirt is perfect. Tie up long tops so they do not cover the hips — you want to see the movement.'],
      },
      {
        h2: 'Shoes: sneakers, socks or bare feet',
        p: ['Clean sneakers give you support for squats and bounces. Socks or bare feet work too and make floor transitions easier. Platform heels are not needed for a beginner twerk class.'],
      },
      {
        h2: 'What to bring',
        list: [
          'A water bottle — twerk is a real workout.',
          'Knee pads (optional) if you want to be comfortable during floor work.',
          'A hair tie.',
          'A towel if you sweat a lot.',
        ],
      },
      {
        h2: 'Most important: come as you are',
        p: ["Nobody in class is judging your outfit or your moves — most students were beginners not long ago. Come 5–10 minutes early, tell the instructor it's your first class, and enjoy it."],
      },
    ],
  },
  {
    slug: 'shoes-for-heels-dance-class',
    title: 'What Shoes to Wear to a Heels Dance Class (Beginner Guide)',
    metaTitle: 'Best Shoes for a Beginner Heels Dance Class — Heel Height & Tips',
    description: 'Which heels to wear to your first heels dance class: heel height, block vs stiletto, ankle straps, and how to start in socks. Tips from a Portland heels dance studio.',
    classSlug: 'high-heels',
    published: '2026-11-11',
    intro: "The number one question before a first heels dance class: \"What heels should I buy?\" The good news — you don't need special shoes to start. Here's how to choose.",
    blocks: [
      {
        h2: 'You can start without heels',
        p: ['In a beginner heels class you are welcome to dance in socks or flats while you learn the choreography and build ankle strength. Many students take a few classes before bringing heels.'],
      },
      {
        h2: 'Heel height: start at 5–8 cm (2–3 in)',
        p: ['A moderate heel is the sweet spot for learning: high enough to change your posture and walk, low enough to stay stable through turns and floor work. Go higher only once you feel in control.'],
      },
      {
        h2: 'Block heel vs stiletto',
        p: ['A block or thicker heel gives you a bigger base and is far more forgiving when you are learning to turn and balance. Thin stilettos look great but demand more ankle strength — save them for later.'],
      },
      {
        h2: 'Look for an ankle strap',
        p: ['Straps keep the shoe on your foot during kicks and floor work and support the ankle. Avoid slip-on mules and anything that slides off your heel.'],
      },
      {
        h2: 'Checklist for your first class',
        list: [
          'Heels with a stable heel and an ankle strap — or just socks/flats.',
          'Leggings, shorts or a bodysuit you can move in.',
          'Knee pads (optional) for floor choreography.',
          'Water and a hair tie.',
        ],
      },
      {
        h2: 'Protect your ankles',
        p: ['Warm up your ankles and calves before dancing (we do this at the start of every class), build up time in heels gradually, and switch to flats whenever you need a break.'],
      },
    ],
  },
]

export const GUIDE_BY_SLUG: Record<string, Guide> = Object.fromEntries(GUIDES.map(g => [g.slug, g]))
