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
  /** 'both' = comparison guide; the page CTA then offers both classes. */
  classSlug: 'twerk' | 'high-heels' | 'both'
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
  {
    slug: 'first-twerk-class-what-to-expect',
    title: 'Your First Twerk Class: What to Expect',
    metaTitle: 'First Twerk Class? What to Expect as a Beginner (Portland)',
    description: 'Nervous about your first twerk class? How a beginner class works step by step, what you will learn, how sore you will be and how to feel comfortable — from a Portland twerk studio.',
    classSlug: 'twerk',
    published: '2026-11-16',
    intro: "Thinking about trying twerk but not sure what actually happens in class? Here's an honest walkthrough of a beginner twerk class at our Portland studio — from the moment you walk in to how your legs feel the next day.",
    blocks: [
      {
        h2: 'Before class: arrive a little early',
        p: [
          "Come 5–10 minutes early. You'll have time to change, put your things away and tell the instructor it's your first class — so she knows to give you extra cues and easier options.",
          "You don't need to know anything in advance. No dance background, no flexibility, no \"twerk skills\" — beginners are exactly who the class is built for.",
        ],
      },
      {
        h2: 'How a beginner twerk class works',
        list: [
          'Warm-up: hips, knees, lower back and glutes — twerk is a real workout, so we prepare properly.',
          'Technique: hip isolations, pelvic tilts and the basic bounce, broken down slowly with options for every level.',
          'Choreography: a short combination that puts the technique to music, so you leave with something you can actually dance.',
          'Cool-down and stretch for the hips and glutes.',
        ],
      },
      {
        h2: "\"I can't twerk at all\" — that's normal",
        p: [
          "Most people can't isolate their hips on day one. The movement looks simple, but it's a coordination skill: your brain is learning to move the pelvis separately from the rest of the body. It clicks for most students within a few classes.",
          "Nobody is watching you — everyone is busy with their own reflection in the mirror. Laugh at the wobbly moments; everyone in the room had them.",
        ],
      },
      {
        h2: 'Will I be sore the next day?',
        p: [
          'Probably — mostly in the glutes, thighs and sometimes the lower back. That is normal after a new type of training and usually fades in a day or two. Drink water, stretch your hips in the evening and come back: the second class is always easier.',
          'If you have knee or back issues, tell the instructor before class — every movement has a gentler version.',
        ],
      },
      {
        h2: 'What to bring',
        list: [
          'Shorts, leggings or loose pants that let your glutes move (no shapewear).',
          'Sneakers, socks or bare feet.',
          'Water, a hair tie and optional knee pads for floor work.',
        ],
      },
      {
        h2: 'After your first class',
        p: ['Most students decide after the first class whether twerk is for them — and most come back. Consistency is what makes the movement click, so try to come weekly for a month before judging your progress.'],
      },
    ],
  },
  {
    slug: 'heels-dance-for-beginners-portland',
    title: 'Heels Dance for Beginners: A Guide for Your First Class in Portland',
    metaTitle: 'Heels Dance for Beginners in Portland — First Class Guide',
    description: 'Never danced in heels? What a beginner heels dance class looks like, whether you need heels to start, how to protect your ankles and how fast you will progress. Portland heels studio guide.',
    classSlug: 'high-heels',
    published: '2026-11-16',
    intro: "Heels dance looks intimidating on Instagram — high heels, floor work, hair flips. The reality of a beginner class is much friendlier. Here's what to know before your first heels dance class in Portland.",
    blocks: [
      {
        h2: 'What is heels dance?',
        p: [
          'Heels dance (also called high heels choreography or stiletto dance) is a dance style performed in heels that mixes choreography, runway-style walks, poses and floor work. It is less about tricks and more about control, posture and confidence.',
          "You don't need a dance background. Many of our students had never danced before — some had barely worn heels.",
        ],
      },
      {
        h2: 'Do I need heels for my first class?',
        p: ["No. You're welcome to start in socks or flats while you learn the choreography and build ankle strength. When you're ready, a stable heel of about 5–8 cm (2–3 in) with an ankle strap is the easiest place to start."],
      },
      {
        h2: 'What a beginner class looks like',
        list: [
          'Ankle, calf and core warm-up for stability in heels.',
          'Technique: posture, heel walks, turns, hair and hand work.',
          'Choreography: a short, confident combination set to music.',
          'Cool-down and stretch for the feet, calves and hips.',
        ],
      },
      {
        h2: 'Keeping your ankles safe',
        p: ['Start in lower or block heels, build up your time in heels gradually and switch to flats whenever your feet need a break. Strong ankles come from consistent practice, not from forcing it on day one.'],
      },
      {
        h2: 'How fast will I progress?',
        p: [
          'Most beginners feel noticeably more stable in heels within 3–4 weekly classes. The bigger change is often outside the studio: students tell us they walk taller and feel more confident, in heels and out of them.',
          'Choreography gets easier too — the more classes you take, the faster your brain picks up new combinations.',
        ],
      },
      {
        h2: 'What to wear',
        list: [
          'Leggings, shorts or a bodysuit you can move in.',
          'Heels with a stable heel and an ankle strap — or socks/flats to start.',
          'Optional knee pads for floor choreography.',
          'Water and a hair tie.',
        ],
      },
    ],
  },
  {
    slug: 'twerk-vs-heels-dance-which-class',
    title: 'Twerk vs Heels Dance: Which Class Should You Try First?',
    metaTitle: 'Twerk vs Heels Dance Class — Which Is Right for You?',
    description: 'Twerk or heels dance? How the two classes differ in movement, workout, shoes and vibe, and how to choose your first one. A simple comparison from a Portland studio that teaches both.',
    classSlug: 'both',
    published: '2026-11-16',
    intro: "We teach both twerk and high heels dance at bounce lab in Portland, and one of the most common questions we get is: \"Which one should I start with?\" Here's how they compare — and the honest answer is that both are beginner-friendly.",
    blocks: [
      {
        h2: 'The short version',
        list: [
          'Twerk: high-energy, hip and glute focused, sneakers or bare feet, a serious lower-body workout.',
          'Heels: choreography in heels (or socks to start), focused on posture, walks, turns and confident, sensual movement.',
          'Both: no experience needed, small supportive groups, every move broken down step by step.',
        ],
      },
      {
        h2: 'Movement',
        p: [
          'Twerk is built on isolations — moving the hips and pelvis separately from the upper body — plus bounces, shakes and floor work. It is rhythmic and playful.',
          'Heels dance is built on lines and control: walks, turns, poses, hair and hand work, and smooth transitions to the floor. It feels closer to a choreography class with a runway attitude.',
        ],
      },
      {
        h2: 'Workout',
        p: ['Twerk is the more intense cardio and leg workout — expect to feel your glutes and thighs the next day. Heels builds balance, ankle stability, core strength and posture. Both are real training disguised as a dance class.'],
      },
      {
        h2: 'Shoes and outfit',
        p: ['Twerk: sneakers, socks or bare feet, with shorts or leggings that let your hips move. Heels: a stable heel with an ankle strap — or socks or flats for your first classes — with leggings, shorts or a bodysuit.'],
      },
      {
        h2: 'Which one should you choose?',
        list: [
          'Pick twerk if you want to sweat, laugh, loosen up your hips and get a strong lower-body workout.',
          'Pick heels if you want to feel more confident and feminine, improve your posture and learn full choreography.',
          'Can’t decide? Try both — many students take twerk and heels in the same week, and the skills feed each other: twerk teaches hip control, heels teaches lines and presence.',
        ],
      },
    ],
  },
]

export const GUIDE_BY_SLUG: Record<string, Guide> = Object.fromEntries(GUIDES.map(g => [g.slug, g]))
