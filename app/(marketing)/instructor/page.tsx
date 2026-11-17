import Link from 'next/link'
import type { Metadata } from 'next'
import InstagramLink from '@/components/InstagramLink'

const URL = 'https://bounce-lab.com/instructor'
const TITLE = 'Iryna Pytska — Twerk & Heels Dance Instructor in Portland'
const DESCRIPTION = 'Meet Iryna, founder of bounce lab: 20 years of dancing, professional contracts abroad, teaching Twerk and Heels since 2022. Beginner-friendly classes in Portland, OR.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'profile', images: [{ url: '/og-image-v2.jpg', width: 1200, height: 630, alt: TITLE }] },
}

// Iryna's own words (sent by her, 2026-11-16) — keep the voice, don't "polish" it.
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Iryna Pytska',
  jobTitle: 'Dance Instructor, Founder of bounce lab',
  description: 'Twerk and Heels dance instructor in Portland, Oregon. Dancing for 20 years, former professional dancer on international contracts, teaching since 2022.',
  url: URL,
  sameAs: ['https://www.instagram.com/iryna.pytska'],
  worksFor: { '@id': 'https://bounce-lab.com/#business' },
  knowsAbout: ['Twerk', 'High heels dance', 'Contemporary dance', 'Choreography'],
  address: { '@type': 'PostalAddress', addressLocality: 'Portland', addressRegion: 'OR', addressCountry: 'US' },
}

export default function InstructorPage() {
  return (
    <article className="legal-page" style={{ paddingTop: 40 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <div className="legal-header">
        <p className="mk-eyebrow">Meet your instructor</p>
        <h1 className="mk-section-title">Hi, I&apos;m Iryna — Founder of bounce lab</h1>
        <p className="legal-updated">Twerk &amp; Heels instructor · Portland, OR</p>
      </div>
      <div className="legal-content">
        <p>
          Dance has been a huge part of my life for as long as I can remember. My journey began at the age of 6 in Ukraine,
          where I spent nine years dancing with my school dance team. We performed at numerous events, took part in dance
          competitions, and won multiple awards and top placements.
        </p>
        <p>
          At 17, I decided to take my passion to a professional level. I joined a training program that prepared dancers for
          international performances, where I studied contemporary dance, acrobatics, flexibility and performance technique.
        </p>
        <p>
          At 18, I traveled to China for my first professional dance contract. Over the next year and a half I completed two
          international contracts as a professional dancer. It helped me grow as a performer and showed me how many
          opportunities dance could bring into my life.
        </p>
        <p>
          After returning to Ukraine, I discovered Twerk — and completely fell in love with it. I spent three years training,
          exploring the style and developing my technique. In 2022, I began teaching Twerk and Heels, helping students build
          confidence, improve body awareness and find their own way of moving.
        </p>

        <h2>Always learning, always growing</h2>
        <p>
          Even after 20 years of dancing, I still consider myself a student. I regularly go to workshops, take classes with
          different choreographers and explore new styles — Hip-Hop, Salsa, Bachata and contemporary choreography.
        </p>
        <p>
          One of my recent highlights was training Heels with Yanis Marshall at the Millennium Dance Complex in Los Angeles.
          Every new style and teacher brings something fresh into my own classes.
        </p>

        <h2>Dance beyond borders</h2>
        <p>
          I&apos;ve lived in China, the Netherlands, Canada and the United States, and I&apos;ve taken classes with teachers
          from different countries — sometimes without understanding a single word they were saying. It never stopped me from
          learning or connecting with people. Those moments taught me that dance is a universal language.
        </p>
        <p>
          When we step into the studio, it doesn&apos;t matter where we come from, what language we speak or what our
          background is. That&apos;s why a welcoming, supportive, judgment-free space matters so much to me — I want everyone
          who walks into bounce lab to feel comfortable and free to be themselves.
        </p>

        <h2>My teaching philosophy</h2>
        <p>
          For me, dance is about much more than choreography or technique. It&apos;s about discovering what your body can do,
          building confidence and enjoying movement without fear of judgment.
        </p>
        <p>
          I believe everyone can dance. You don&apos;t need experience, perfect flexibility or a certain body type to start —
          just curiosity and a willingness to try something new. Whether it&apos;s your first time in a dance studio or
          you&apos;re ready to level up, I&apos;m here to support you.
        </p>
        <p>
          Because you don&apos;t need to speak the same language to dance together. You just need to feel the music.
        </p>
        <p><em>Can&apos;t wait to dance with you! — Iryna</em></p>

        <h2>Dance with me</h2>
        <ul>
          <li><Link href="/classes/twerk">Twerk classes in Portland</Link></li>
          <li><Link href="/classes/high-heels">High Heels classes in Portland</Link></li>
          <li><Link href="/private-lessons">Private lessons</Link></li>
          <li><Link href="/bachelorette-dance-class-portland">Bachelorette &amp; girls&apos; night dance parties</Link></li>
        </ul>
        <p>
          See what we dance in class on <InstagramLink href="https://www.instagram.com/iryna.pytska">Instagram</InstagramLink>.
        </p>
        <p style={{ marginTop: 28 }}>
          <Link href="/book" className="btn-price" style={{ display: 'inline-block', width: 'auto', padding: '16px 40px', color: 'white' }}>Book a Class</Link>
        </p>
      </div>
    </article>
  )
}
