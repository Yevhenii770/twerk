import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for bounce lab Dance Studio in Portland, Oregon. Booking policies, cancellation, and studio rules.',
  alternates: { canonical: 'https://bounce-lab.com/terms' },
}

export default function TermsPage() {
  return (
    <section className="legal-page">
      <div className="legal-header">
        <p className="mk-eyebrow">Legal</p>
        <h1 className="mk-section-title">Terms of Service</h1>
        <p className="legal-updated">Last updated: June 18, 2026</p>
      </div>
      <div className="legal-content">
        <p>Welcome to bounce lab Dance Studio. By using our website (bounce-lab.com) and booking classes, you agree to the following terms.</p>

        <h2>Class Bookings</h2>
        <ul>
          <li>All bookings are subject to availability.</li>
          <li>We recommend booking in advance online to secure your spot.</li>
          <li>Walk-ins are welcome based on availability.</li>
        </ul>

        <h2>Cancellation &amp; Refund Policy</h2>
        <ul>
          <li>You may cancel or reschedule a class up to <strong>24 hours</strong> before the scheduled time at no charge.</li>
          <li>Cancellations made less than 24 hours before class are non-refundable.</li>
          <li>Monthly passes are non-refundable but classes can be rescheduled within the same month.</li>
          <li>No-shows forfeit the class fee.</li>
        </ul>

        <h2>Studio Rules</h2>
        <ul>
          <li>Arrive 5&ndash;10 minutes before class starts.</li>
          <li>Wear appropriate dancewear and footwear for your class.</li>
          <li>Photography and video recording during class require instructor permission.</li>
          <li>bounce lab is a judgment-free zone &mdash; respect all students and staff.</li>
        </ul>

        <h2>Health &amp; Safety</h2>
        <ul>
          <li>You participate in classes at your own risk. Dance involves physical activity that may result in injury.</li>
          <li>Please inform the instructor of any medical conditions or injuries before class.</li>
          <li>If you feel unwell during class, stop and notify the instructor immediately.</li>
        </ul>

        <h2>Intellectual Property</h2>
        <p>All content on bounce-lab.com &mdash; including text, images, videos, logos, and choreography &mdash; is the property of bounce lab Dance Studio and may not be reproduced without written permission.</p>

        <h2>Changes to These Terms</h2>
        <p>We may update these terms from time to time. The most current version will always be available on this page.</p>

        <h2>Contact</h2>
        <p>Questions about these terms? Reach out:</p>
        <ul>
          <li>Phone: <a href="tel:+15034220858">(503) 422-0858</a></li>
          <li>Studio: 1107 NE 9th Ave, Portland, OR 97232</li>
        </ul>
      </div>
    </section>
  )
}
