import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { SUPPORT_EMAIL, LEGAL_EMAIL } from '@/lib/constants';

/**
 * Privacy Policy page
 * Comprehensive privacy policy for Anchor app
 * Addresses 13+ age requirement and data handling practices
 */
export function PrivacyPolicyPage() {
  const lastUpdated = 'December 10, 2024';

  return (
    <>
      <SEO
        title="Privacy Policy - Anchor"
        description="Learn how Anchor protects your privacy. We auto-delete voice recordings after 7 days, never sell your data, and give you full control over your information."
        url="https://getanchor.app/privacy"
      />
      <PageWrapper showBubbles={false}>
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <ScrollReveal>
            <GlassCard className="p-6 sm:p-10">
              {/* Header */}
              <div className="border-b border-glass-border pb-6">
                <h1 className="text-3xl font-bold text-mist-white sm:text-4xl">Privacy Policy</h1>
                <p className="mt-2 text-mist-white/60">Last Updated: {lastUpdated}</p>
              </div>

              {/* Table of Contents */}
              <nav className="mt-8 rounded-2xl border border-glass-border bg-glass-bg p-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-biolum-cyan">
                  Table of Contents
                </h2>
                <ol className="space-y-2 text-sm text-mist-white/70">
                  <li>
                    <a href="#introduction" className="hover:text-biolum-cyan">
                      1. Introduction
                    </a>
                  </li>
                  <li>
                    <a href="#information-collected" className="hover:text-biolum-cyan">
                      2. Information We Collect
                    </a>
                  </li>
                  <li>
                    <a href="#how-we-use" className="hover:text-biolum-cyan">
                      3. How We Use Your Information
                    </a>
                  </li>
                  <li>
                    <a href="#third-party" className="hover:text-biolum-cyan">
                      4. Third-Party Services
                    </a>
                  </li>
                  <li>
                    <a href="#data-retention" className="hover:text-biolum-cyan">
                      5. Data Retention
                    </a>
                  </li>
                  <li>
                    <a href="#your-rights" className="hover:text-biolum-cyan">
                      6. Your Rights
                    </a>
                  </li>
                  <li>
                    <a href="#children" className="hover:text-biolum-cyan">
                      7. Children's Privacy
                    </a>
                  </li>
                  <li>
                    <a href="#security" className="hover:text-biolum-cyan">
                      8. Security Measures
                    </a>
                  </li>
                  <li>
                    <a href="#international" className="hover:text-biolum-cyan">
                      9. International Data Transfers
                    </a>
                  </li>
                  <li>
                    <a href="#changes" className="hover:text-biolum-cyan">
                      10. Changes to This Policy
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="hover:text-biolum-cyan">
                      11. Contact Us
                    </a>
                  </li>
                </ol>
              </nav>

              {/* Content */}
              <div className="prose prose-invert mt-8 max-w-none">
                <section id="introduction" className="mt-8">
                  <h2 className="text-xl font-semibold text-mist-white">1. Introduction</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    Welcome to Anchor ("we," "our," or "us"). We are committed to protecting your
                    privacy and ensuring the security of your personal information. This Privacy
                    Policy explains how we collect, use, disclose, and safeguard your information
                    when you use our mobile application and related services (collectively, the
                    "Service").
                  </p>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    Anchor is designed to provide immediate relief during anxiety and panic attacks.
                    We understand the sensitive nature of mental health data and have built our
                    Service with privacy as a core principle.
                  </p>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    By using Anchor, you agree to the collection and use of information in
                    accordance with this policy. If you do not agree with our practices, please do
                    not use the Service.
                  </p>
                </section>

                <section id="information-collected" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">
                    2. Information We Collect
                  </h2>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">
                    2.1 Account Information
                  </h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    Anchor uses{' '}
                    <strong className="text-biolum-cyan">anonymous authentication</strong>. We do
                    not require you to provide an email address, name, or any personal identifying
                    information to use the app.
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Anonymous user identifier (randomly generated by Firebase)</li>
                    <li>Authentication tokens (managed by Firebase Authentication)</li>
                  </ul>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    <strong className="text-warm-ember">We do not collect:</strong> email addresses,
                    names, profile photos, phone numbers, or any other personally identifying
                    information.
                  </p>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">
                    2.2 Conversation Data
                  </h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    To provide AI-powered therapeutic support, we collect:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Text messages you send to our AI assistant</li>
                    <li>AI responses generated for you</li>
                    <li>Timestamps of conversations</li>
                  </ul>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">2.3 Voice Recordings</h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    When you use voice messaging:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Audio recordings are temporarily stored for transcription</li>
                    <li>Transcribed text becomes part of your conversation history</li>
                    <li>
                      <strong className="text-warm-ember">
                        Audio files are automatically deleted after 7 days
                      </strong>
                    </li>
                  </ul>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">
                    2.4 Usage Analytics (Optional)
                  </h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    With your explicit consent, we may collect anonymous usage data:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Feature usage patterns (anonymized)</li>
                    <li>App performance metrics</li>
                    <li>Crash reports (no personal data included)</li>
                  </ul>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    You can opt out of analytics at any time in app settings. We respect "Do Not
                    Track" browser signals.
                  </p>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">
                    2.5 Device Information
                  </h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    We automatically collect limited device information:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Device type and operating system version</li>
                    <li>App version</li>
                    <li>Language preferences</li>
                  </ul>
                </section>

                <section id="how-we-use" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">
                    3. How We Use Your Information
                  </h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    We use your information solely for the following purposes:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>
                      <strong>Provide the Service:</strong> Power AI conversations, transcribe voice
                      messages, and deliver therapeutic support features
                    </li>
                    <li>
                      <strong>Maintain Your Account:</strong> Authenticate you and preserve your
                      conversation history
                    </li>
                    <li>
                      <strong>Improve the Service:</strong> Analyze anonymized patterns to enhance
                      features (with consent)
                    </li>
                    <li>
                      <strong>Ensure Safety:</strong> Detect crisis keywords and provide emergency
                      resources
                    </li>
                    <li>
                      <strong>Communicate:</strong> Send essential service notifications (not
                      marketing)
                    </li>
                  </ul>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    <strong className="text-biolum-cyan">
                      We never sell your personal information to third parties.
                    </strong>
                  </p>
                </section>

                <section id="third-party" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">4. Third-Party Services</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    We use the following third-party services to operate Anchor:
                  </p>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">4.1 Google Firebase</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>
                      <strong>Firebase Authentication:</strong> Secure account management
                    </li>
                    <li>
                      <strong>Cloud Firestore:</strong> Encrypted database for conversation storage
                    </li>
                    <li>
                      <strong>Cloud Storage:</strong> Temporary storage for voice recordings
                    </li>
                    <li>
                      <strong>Cloud Functions:</strong> Secure backend processing
                    </li>
                  </ul>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    <a
                      href="https://firebase.google.com/support/privacy"
                      className="text-biolum-cyan hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Firebase Privacy Policy
                    </a>
                  </p>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">
                    4.2 Google Vertex AI (Gemini)
                  </h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    We use Google's Gemini AI model for therapeutic conversations. Your messages are
                    processed by Google's AI systems subject to their data processing terms. Google
                    does not use customer data to train their AI models.
                  </p>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    <a
                      href="https://cloud.google.com/vertex-ai/docs/generative-ai/data-governance"
                      className="text-biolum-cyan hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Vertex AI Data Governance
                    </a>
                  </p>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">
                    4.3 Google Cloud Speech-to-Text
                  </h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    Voice recordings are processed for transcription. Audio data is processed
                    ephemerally and not retained by Google after transcription is complete.
                  </p>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    <a
                      href="https://cloud.google.com/speech-to-text/docs/data-logging"
                      className="text-biolum-cyan hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Speech-to-Text Data Logging
                    </a>
                  </p>
                </section>

                <section id="data-retention" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">5. Data Retention</h2>

                  <div className="mt-4 rounded-xl border border-warm-ember/30 bg-warm-ember/10 p-4">
                    <h3 className="font-semibold text-warm-ember">
                      Voice Recordings: 7-Day Automatic Deletion
                    </h3>
                    <p className="mt-2 text-mist-white/70">
                      All voice recordings are automatically and permanently deleted from our
                      servers 7 days after upload. This is enforced at the infrastructure level and
                      cannot be overridden.
                    </p>
                  </div>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">Retention Periods</h3>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>
                      <strong>Voice Recordings:</strong> 7 days (then auto-deleted)
                    </li>
                    <li>
                      <strong>Conversation Text:</strong> Retained until you delete it or your
                      account
                    </li>
                    <li>
                      <strong>Account Data:</strong> Retained until you delete your account
                    </li>
                    <li>
                      <strong>Analytics Data:</strong> Anonymized after 90 days
                    </li>
                  </ul>
                </section>

                <section id="your-rights" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">6. Your Rights</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    You have full control over your data. Through the app settings, you can:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>
                      <strong>Export Your Data:</strong> Download all your conversations in JSON
                      format
                    </li>
                    <li>
                      <strong>Delete Conversations:</strong> Remove specific conversations or all
                      history
                    </li>
                    <li>
                      <strong>Delete Your Account:</strong> Permanently remove all data associated
                      with your account
                    </li>
                    <li>
                      <strong>Opt-Out of Analytics:</strong> Disable anonymous usage tracking at any
                      time
                    </li>
                    <li>
                      <strong>Access Your Data:</strong> View all information we hold about you
                    </li>
                  </ul>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    For data requests that cannot be completed through the app, contact us at{' '}
                    <a href={`mailto:${LEGAL_EMAIL}`} className="text-biolum-cyan hover:underline">
                      {LEGAL_EMAIL}
                    </a>
                    .
                  </p>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">
                    Additional Rights (EU/EEA/UK/California Residents)
                  </h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    If you are located in the European Union, European Economic Area, United
                    Kingdom, or California, you may have additional rights including:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Right to rectification of inaccurate data</li>
                    <li>Right to restriction of processing</li>
                    <li>Right to data portability</li>
                    <li>Right to object to processing</li>
                    <li>Right to lodge a complaint with a supervisory authority</li>
                  </ul>
                </section>

                <section id="children" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">7. Children's Privacy</h2>

                  <div className="mt-4 rounded-xl border border-biolum-cyan/30 bg-biolum-cyan/10 p-4">
                    <h3 className="font-semibold text-biolum-cyan">
                      Age Requirement: 13 Years or Older
                    </h3>
                    <p className="mt-2 text-mist-white/70">
                      Anchor is designed for users who are 13 years of age or older. We do not
                      knowingly collect personal information from children under 13.
                    </p>
                  </div>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">For Users Ages 13-17</h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    If you are between 13 and 17 years old, we encourage you to discuss your use of
                    Anchor with a parent or guardian. While we don't require parental consent for
                    users 13 and older, we recommend that teens involve trusted adults in their
                    mental health journey.
                  </p>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">Parental Rights</h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    Parents or guardians who believe their child under 13 has provided us with
                    personal information may contact us at{' '}
                    <a href={`mailto:${LEGAL_EMAIL}`} className="text-biolum-cyan hover:underline">
                      {LEGAL_EMAIL}
                    </a>
                    . We will promptly delete such information.
                  </p>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">COPPA Compliance</h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    We comply with the Children's Online Privacy Protection Act (COPPA). We do not
                    target our Service to children under 13, and we do not knowingly collect
                    personal information from children under 13 without verifiable parental consent.
                  </p>
                </section>

                <section id="security" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">8. Security Measures</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    We implement industry-standard security measures to protect your data:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>
                      <strong>Encryption in Transit:</strong> All data is encrypted using TLS 1.3
                      during transmission
                    </li>
                    <li>
                      <strong>Encryption at Rest:</strong> Data stored in Firebase is encrypted at
                      rest
                    </li>
                    <li>
                      <strong>Access Controls:</strong> Strict Firebase Security Rules limit data
                      access to authenticated users
                    </li>
                    <li>
                      <strong>No Plaintext Storage:</strong> Sensitive data is never stored in
                      plaintext
                    </li>
                    <li>
                      <strong>Regular Audits:</strong> We regularly review our security practices
                    </li>
                  </ul>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    While we strive to protect your information, no method of electronic
                    transmission or storage is 100% secure. We cannot guarantee absolute security.
                  </p>
                </section>

                <section id="international" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">
                    9. International Data Transfers
                  </h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    Your information may be transferred to and processed in countries other than
                    your own. Our third-party providers (Google/Firebase) operate globally. By using
                    Anchor, you consent to this transfer.
                  </p>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    Where required by law, we ensure appropriate safeguards are in place for
                    international transfers, including Standard Contractual Clauses approved by
                    relevant authorities.
                  </p>
                </section>

                <section id="changes" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">
                    10. Changes to This Policy
                  </h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    We may update this Privacy Policy from time to time. We will notify you of any
                    material changes by:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Updating the "Last Updated" date at the top of this policy</li>
                    <li>Sending an in-app notification for significant changes</li>
                    <li>Posting announcements on our website</li>
                  </ul>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    Since we use anonymous authentication, we cannot contact you directly. We
                    encourage you to review this policy periodically. Your continued use of Anchor
                    after changes become effective constitutes acceptance of the revised policy.
                  </p>
                </section>

                <section id="contact" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">11. Contact Us</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    If you have questions about this Privacy Policy or our data practices, please
                    contact us:
                  </p>
                  <ul className="mt-4 space-y-2 text-mist-white/70">
                    <li>
                      <strong>General Support:</strong>{' '}
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="text-biolum-cyan hover:underline"
                      >
                        {SUPPORT_EMAIL}
                      </a>
                    </li>
                    <li>
                      <strong>Privacy & Legal:</strong>{' '}
                      <a
                        href={`mailto:${LEGAL_EMAIL}`}
                        className="text-biolum-cyan hover:underline"
                      >
                        {LEGAL_EMAIL}
                      </a>
                    </li>
                  </ul>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    We aim to respond to all inquiries within 30 days.
                  </p>
                </section>
              </div>

              {/* Back Link */}
              <div className="mt-12 border-t border-glass-border pt-6">
                <Link to="/" className="text-biolum-cyan hover:underline">
                  ← Back to Home
                </Link>
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </PageWrapper>
    </>
  );
}
