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
  {
    slug: 'how-to-twerk-for-beginners',
    title: 'How to Twerk for Beginners: 5 Basic Moves to Practice at Home',
    metaTitle: 'How to Twerk for Beginners — 5 Basic Moves (Step by Step)',
    description: 'Learn to twerk from zero: the stance, the basic hip pop, the bounce, the wine and a simple combo, plus the most common beginner mistakes. Step-by-step guide from a Portland twerk studio.',
    classSlug: 'twerk',
    published: '2026-11-27',
    intro: "Twerking looks like it's all in the booty, but the secret is your stance, your knees and your lower back. Here are the five basic moves we start every beginner with at bounce lab in Portland. Put on a song, stand in front of a mirror and try them slowly first.",
    blocks: [
      {
        h2: '1. The stance (everything starts here)',
        list: [
          'Feet a little wider than your hips, toes turned slightly out.',
          'Bend your knees and sit back like you are about to sit on a high chair.',
          'Lean your chest a little forward and put your hands on your thighs or knees.',
          'Keep your weight in your heels and your knees tracking over your toes.',
          'If your thighs are working, you are doing it right. Most beginners stand too straight — sit lower than you think.',
        ],
        p: ['Get the stance right and every other move gets easier.'],
      },
      {
        h2: '2. The hip pop (arch and tuck)',
        p: [
          'From the stance, push your hips back and arch your lower back (pop), then tuck your pelvis under and round the lower back (drop). Arch, tuck, arch, tuck.',
          'Start slowly on every second beat of the music, then speed up. Only the hips and lower back move — keep your shoulders and chest still.',
        ],
      },
      {
        h2: '3. The bounce',
        p: ['Keep the same stance and bounce gently through the knees while you keep popping. The movement comes from your legs and hips working together, not from shaking your whole body. Small and controlled looks better than big and messy.'],
      },
      {
        h2: '4. The wine (hip circles)',
        p: ['Stand a little taller, knees soft, and draw slow circles with your hips: forward, side, back, side. Then make them smaller and faster. Winding teaches you to isolate your hips from your upper body, which makes every other twerk move look cleaner.'],
      },
      {
        h2: '5. Put it together: a mini combo',
        list: [
          '4 slow hip pops in the stance.',
          '4 fast hip pops.',
          '2 slow hip circles, standing taller.',
          'Sit back into the stance and finish with 8 bounces.',
          'Repeat it to a song you love. When it feels easy, try it facing away from the mirror, looking over your shoulder.',
        ],
        p: ['Try this short combination once each move feels comfortable on its own:'],
      },
      {
        h2: 'Common beginner mistakes',
        list: [
          'Standing too straight — sit back and bend your knees more.',
          'Moving the shoulders instead of the hips — keep the chest still and let the lower back do the work.',
          'Knees caving in — push them out over your toes to protect them.',
          'Holding your breath — breathe out on every pop.',
          'Going full speed on day one — slow and clean first, speed comes with practice.',
        ],
      },
      {
        h2: 'Learning at home vs in a class',
        p: [
          'You can practice these basics at home, but most people learn much faster with an instructor who can see what your hips are actually doing and fix it in a second. In class we break every move down step by step, add music and simple choreography, and there is no pressure to be good on day one.',
          'If you want to learn twerk properly, practice these five moves, then come to a beginner class and we will take it from there.',
        ],
      },
    ],
  },
  {
    slug: 'start-dancing-as-an-adult-beginner',
    title: "Never Danced Before? How to Start Dancing as an Adult",
    metaTitle: 'Dance Classes for Adult Beginners — How to Start (Portland)',
    description: "Never danced and feel too old, stiff or shy to start? How adult beginners pick a first dance style, what a beginner class is really like and how to keep it affordable. Honest guide from a Portland dance studio.",
    classSlug: 'both',
    published: '2026-11-27',
    intro: "Most adults who walk into their first dance class say the same thing: \"I have zero rhythm and I've never done this.\" That's normal — and it's exactly who beginner classes are for. Here's how to start dancing as an adult without feeling lost.",
    blocks: [
      {
        h2: "It's not too late (and you're not too stiff)",
        p: [
          'Adults learn dance differently from kids, not worse. You understand instructions, you notice details in the mirror and you show up because you want to. Flexibility and rhythm both improve with practice — nobody is born with them.',
          'Many of our students at bounce lab had never taken a dance class before their first one with us.',
        ],
      },
      {
        h2: 'How to choose your first style',
        list: [
          'Want a fun workout and to loosen up? Try twerk — high energy, hip and glute focused, done in sneakers.',
          'Want to feel more confident and work on posture? Try heels dance — choreography, walks and poses, and you can start in socks or flats.',
          'Not sure? Pick the class whose day and time you can actually make every week. Consistency matters more than the style.',
        ],
      },
      {
        h2: 'What a beginner class is really like',
        p: [
          'A warm-up, a few basic moves broken down slowly, then a short combination set to music. The instructor repeats things more than once and shows easier versions. Nobody is watching you — everyone is busy looking at themselves in the mirror.',
          'Come 5–10 minutes early, tell the instructor it is your first class and stand wherever you feel comfortable. The back row is a perfectly good place to start.',
        ],
      },
      {
        h2: 'How to keep it affordable',
        list: [
          'Start with a single drop-in class instead of a long contract.',
          'Once you know you like it, a monthly pass usually costs less per class than paying each time.',
          'Look for studios with free cancellation, so a busy week does not cost you a class.',
          'Prices change, so always check the current price on the booking page.',
        ],
      },
      {
        h2: 'Your first month',
        p: [
          'Plan on one class a week for a month. The first class is about getting through it, the second feels familiar, and by the third or fourth the moves start to stick and you can enjoy the music instead of counting.',
          "Expect sore legs after the first couple of classes — that's your body learning something new.",
        ],
      },
      {
        h2: 'What to bring',
        list: [
          'Comfortable clothes you can move and sweat in.',
          'Sneakers for twerk; socks, flats or stable heels for heels dance.',
          'A water bottle and a hair tie.',
          'An open mind — the first class is the hardest one, and it is still fun.',
        ],
      },
    ],
  },
  {
    slug: 'is-twerking-a-good-workout',
    title: 'Is Twerking a Good Workout? What It Trains and What to Expect',
    metaTitle: 'Is Twerking a Good Workout? Muscles, Cardio & Benefits',
    description: 'Is twerk real exercise? Which muscles twerking works, how it compares to a gym leg day, how sore you will be and how often to train. Straight answers from a Portland twerk studio.',
    classSlug: 'twerk',
    published: '2026-11-27',
    intro: "People come to twerk class for the fun and are surprised by how hard it is. Yes, twerking is a real workout. Here's what it actually trains, how it feels and how to get the most out of it.",
    blocks: [
      {
        h2: 'Which muscles twerking works',
        list: [
          'Glutes — every pop, bounce and squat-based move.',
          'Quads and hamstrings — you spend most of the class in a low, bent-knee stance.',
          'Core and lower back — they control the arch and tuck of the hips.',
          'Calves and ankles — bounces and changes of level.',
          'Hip mobility — isolations and circles move the hips in every direction.',
        ],
      },
      {
        h2: 'Cardio, too',
        p: ['A twerk class keeps you moving to music for most of the hour, with short breaks to learn the next move. Your heart rate goes up, you sweat, and because you are focused on the choreography, the time goes faster than on a treadmill.'],
      },
      {
        h2: 'Twerk vs a gym leg day',
        p: [
          'Heavy squats build strength faster, so twerk will not replace lifting if strength is your main goal. What twerk adds is endurance in a low stance, coordination, hip mobility and rhythm — and many people stick with it longer because it is fun.',
          'Lots of students do both: gym for strength, twerk for cardio, mobility and confidence.',
        ],
      },
      {
        h2: 'How sore will I be?',
        p: ['Expect to feel your glutes and thighs for a day or two after your first classes. That fades as your body adapts. Drink water, stretch your hips and quads after class, and keep moving lightly the next day.'],
      },
      {
        h2: 'How often should I twerk?',
        p: ['Once a week is enough to see progress in your technique and stamina. Twice a week speeds things up. Give your knees and lower back a rest day between sessions, especially at the start.'],
      },
      {
        h2: 'Keep it safe',
        list: [
          'Warm up your hips, knees and lower back before you start.',
          'Keep your knees over your toes — never let them cave in.',
          'Move from your hips and legs, not by jerking your lower back.',
          'Tell your instructor about any knee or back injuries so they can give you easier options.',
        ],
      },
      {
        h2: 'The part nobody expects',
        p: ["Most students say the biggest change isn't in their legs — it's in their confidence. You learn to move your body without overthinking it, and that carries over outside the studio."],
      },
    ],
  },
]

export const GUIDE_BY_SLUG: Record<string, Guide> = Object.fromEntries(GUIDES.map(g => [g.slug, g]))
