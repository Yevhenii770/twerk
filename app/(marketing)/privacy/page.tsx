import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for bounce lab Dance Studio in Portland, Oregon. How we collect, use, and protect your personal information.',
  alternates: { canonical: 'https://bounce-lab.com/privacy' },
}

export default function PrivacyPage() {
  return (
    <section className="legal-page">
      <div className="legal-header">
        <p className="mk-eyebrow">Legal</p>
        <h1 className="mk-section-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: June 18, 2026</p>
      </div>
      <div className="legal-content">
        <p>bounce lab Dance Studio (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the website bounce-lab.com. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website or book a class.</p>

        <h2>Information We Collect</h2>
        <p>We collect information you provide directly when booking a class or contacting us:</p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Class preferences and booking history</li>
        </ul>
        <p>We also automatically collect certain technical information when you visit our website, including your IP address, browser type, and pages visited.</p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To process and confirm your class bookings</li>
          <li>To communicate with you about your reservations (via phone, email, or text)</li>
          <li>To send class updates, schedule changes, or studio announcements</li>
          <li>To improve our website and services</li>
        </ul>

        <h2>Information Sharing</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only with:</p>
        <ul>
          <li>Service providers who help us operate our website and process bookings (e.g., hosting, database services)</li>
          <li>Law enforcement, if required by law</li>
        </ul>

        <h2>Data Security</h2>
        <p>We use industry-standard security measures to protect your personal information, including HTTPS encryption, secure database storage, and access controls. However, no method of transmission over the Internet is 100% secure.</p>

        <h2>Cookies</h2>
        <p>Our website uses essential cookies to maintain your session and preferences. We do not use third-party tracking cookies.</p>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Request access to your personal data</li>
          <li>Request correction or deletion of your data</li>
          <li>Opt out of marketing communications at any time</li>
        </ul>

        <h2>Contact Us</h2>
        <p>If you have questions about this Privacy Policy or your personal data, contact us at:</p>
        <ul>
          <li>Phone: <a href="tel:+15034220858">(503) 422-0858</a></li>
          <li>Studio: 1107 NE 9th Ave, Portland, OR 97232</li>
        </ul>
      </div>
    </section>
  )
}
