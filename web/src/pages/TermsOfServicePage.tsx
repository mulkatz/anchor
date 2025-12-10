import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { SUPPORT_EMAIL, LEGAL_EMAIL, CRISIS_HOTLINE, EMERGENCY_NUMBER } from '@/lib/constants';

/**
 * Terms of Service page
 * Comprehensive terms for Anchor app
 * Includes critical mental health disclaimers
 */
export function TermsOfServicePage() {
  const lastUpdated = 'December 10, 2024';
  const effectiveDate = 'December 10, 2024';

  return (
    <>
      <SEO
        title="Terms of Service - Anchor"
        description="Terms of Service for Anchor app. Important mental health disclaimers, acceptable use policy, and user rights."
        url="https://getanchor.app/terms"
      />
      <PageWrapper showBubbles={false}>
        <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <ScrollReveal>
            <GlassCard className="p-6 sm:p-10">
              {/* Header */}
              <div className="border-b border-glass-border pb-6">
                <h1 className="text-3xl font-bold text-mist-white sm:text-4xl">Terms of Service</h1>
                <p className="mt-2 text-mist-white/60">Last Updated: {lastUpdated}</p>
                <p className="text-mist-white/60">Effective Date: {effectiveDate}</p>
              </div>

              {/* Critical Disclaimer Banner */}
              <div className="mt-8 rounded-2xl border-2 border-danger/50 bg-danger/10 p-6">
                <h2 className="text-lg font-bold text-danger">
                  Important Mental Health Disclaimer
                </h2>
                <p className="mt-3 leading-relaxed text-mist-white/90">
                  <strong>Anchor is NOT a substitute for professional mental health care.</strong>{' '}
                  This app provides educational and supportive content based on cognitive-behavioral
                  and grounding techniques. It is not intended to diagnose, treat, cure, or prevent
                  any mental health condition.
                </p>
                <p className="mt-3 leading-relaxed text-mist-white/90">
                  <strong>
                    If you are in crisis or experiencing thoughts of suicide or self-harm:
                  </strong>
                </p>
                <ul className="mt-2 space-y-1 text-mist-white/90">
                  <li>
                    • Call the <strong>988 Suicide & Crisis Lifeline</strong>:{' '}
                    <a href={`tel:${CRISIS_HOTLINE}`} className="text-biolum-cyan underline">
                      {CRISIS_HOTLINE}
                    </a>
                  </li>
                  <li>
                    • Call <strong>Emergency Services</strong>:{' '}
                    <a href={`tel:${EMERGENCY_NUMBER}`} className="text-biolum-cyan underline">
                      {EMERGENCY_NUMBER}
                    </a>
                  </li>
                  <li>• Go to your nearest emergency room</li>
                  <li>• Contact a mental health professional immediately</li>
                </ul>
              </div>

              {/* Table of Contents */}
              <nav className="mt-8 rounded-2xl border border-glass-border bg-glass-bg p-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-biolum-cyan">
                  Table of Contents
                </h2>
                <ol className="space-y-2 text-sm text-mist-white/70">
                  <li>
                    <a href="#acceptance" className="hover:text-biolum-cyan">
                      1. Acceptance of Terms
                    </a>
                  </li>
                  <li>
                    <a href="#eligibility" className="hover:text-biolum-cyan">
                      2. Eligibility
                    </a>
                  </li>
                  <li>
                    <a href="#account" className="hover:text-biolum-cyan">
                      3. Account & Data
                    </a>
                  </li>
                  <li>
                    <a href="#service" className="hover:text-biolum-cyan">
                      4. Description of Service
                    </a>
                  </li>
                  <li>
                    <a href="#disclaimer" className="hover:text-biolum-cyan">
                      5. Mental Health Disclaimer
                    </a>
                  </li>
                  <li>
                    <a href="#acceptable-use" className="hover:text-biolum-cyan">
                      6. Acceptable Use
                    </a>
                  </li>
                  <li>
                    <a href="#intellectual-property" className="hover:text-biolum-cyan">
                      7. Intellectual Property
                    </a>
                  </li>
                  <li>
                    <a href="#user-content" className="hover:text-biolum-cyan">
                      8. User Content
                    </a>
                  </li>
                  <li>
                    <a href="#liability" className="hover:text-biolum-cyan">
                      9. Limitation of Liability
                    </a>
                  </li>
                  <li>
                    <a href="#indemnification" className="hover:text-biolum-cyan">
                      10. Indemnification
                    </a>
                  </li>
                  <li>
                    <a href="#termination" className="hover:text-biolum-cyan">
                      11. Termination
                    </a>
                  </li>
                  <li>
                    <a href="#governing-law" className="hover:text-biolum-cyan">
                      12. Governing Law
                    </a>
                  </li>
                  <li>
                    <a href="#changes" className="hover:text-biolum-cyan">
                      13. Changes to Terms
                    </a>
                  </li>
                  <li>
                    <a href="#contact" className="hover:text-biolum-cyan">
                      14. Contact Information
                    </a>
                  </li>
                </ol>
              </nav>

              {/* Content */}
              <div className="prose prose-invert mt-8 max-w-none">
                <section id="acceptance" className="mt-8">
                  <h2 className="text-xl font-semibold text-mist-white">1. Acceptance of Terms</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    By downloading, installing, or using Anchor ("the App"), you agree to be bound
                    by these Terms of Service ("Terms"). If you do not agree to these Terms, do not
                    use the App.
                  </p>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    These Terms constitute a legally binding agreement between you and Anchor ("we,"
                    "us," or "our"). Please read them carefully before using our services.
                  </p>
                </section>

                <section id="eligibility" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">2. Eligibility</h2>

                  <div className="mt-4 rounded-xl border border-biolum-cyan/30 bg-biolum-cyan/10 p-4">
                    <h3 className="font-semibold text-biolum-cyan">Age Requirement</h3>
                    <p className="mt-2 text-mist-white/90">
                      You must be at least <strong>13 years of age</strong> to use Anchor. By using
                      the App, you represent and warrant that you meet this age requirement.
                    </p>
                  </div>

                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    If you are between 13 and 18 years of age, we strongly encourage you to review
                    these Terms with a parent or guardian. By using the App, you represent that you
                    have obtained permission from your parent or guardian to do so, if required by
                    applicable law.
                  </p>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    If you are a parent or guardian and believe your child under 13 is using Anchor,
                    please contact us at{' '}
                    <a href={`mailto:${LEGAL_EMAIL}`} className="text-biolum-cyan hover:underline">
                      {LEGAL_EMAIL}
                    </a>
                    .
                  </p>
                </section>

                <section id="account" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">3. Account & Data</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    Anchor uses{' '}
                    <strong className="text-biolum-cyan">anonymous authentication</strong>. You do
                    not need to provide any personal information (email, name, etc.) to use the App.
                    A unique anonymous identifier is automatically created for you.
                  </p>
                  <p className="mt-4 leading-relaxed text-mist-white/70">You agree to:</p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Maintain the security of your device and app access</li>
                    <li>Accept responsibility for all activities from your device</li>
                    <li>Notify us if you believe your account has been compromised</li>
                  </ul>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    <strong className="text-warm-ember">Important:</strong> Since accounts are
                    anonymous and tied to your device, if you uninstall the app or switch devices,
                    your data cannot be recovered. We recommend using the export feature to back up
                    your data.
                  </p>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    We reserve the right to suspend or terminate accounts that violate these Terms
                    or are used for fraudulent or illegal purposes.
                  </p>
                </section>

                <section id="service" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">
                    4. Description of Service
                  </h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">Anchor provides:</p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>
                      <strong>SOS Flow:</strong> A guided 7-step de-escalation experience for panic
                      and anxiety episodes
                    </li>
                    <li>
                      <strong>AI Chat:</strong> Conversational support using artificial intelligence
                      trained on therapeutic frameworks
                    </li>
                    <li>
                      <strong>Voice Messaging:</strong> Voice-to-text functionality for easier
                      communication during distress
                    </li>
                    <li>
                      <strong>Crisis Resources:</strong> Quick access to emergency helplines and
                      resources
                    </li>
                  </ul>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    We may modify, suspend, or discontinue any aspect of the Service at any time. We
                    will make reasonable efforts to notify users of material changes.
                  </p>
                </section>

                <section id="disclaimer" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">
                    5. Mental Health Disclaimer
                  </h2>

                  <div className="mt-4 rounded-xl border border-warm-ember/30 bg-warm-ember/10 p-4">
                    <p className="font-semibold text-warm-ember">READ THIS SECTION CAREFULLY</p>
                  </div>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">
                    5.1 Not Medical or Professional Advice
                  </h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    The content and features provided by Anchor are for{' '}
                    <strong>educational and informational purposes only</strong>. The App is not
                    intended to be, and should not be used as, a substitute for:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Professional medical advice</li>
                    <li>Diagnosis of any mental health condition</li>
                    <li>Treatment or therapy from a licensed mental health professional</li>
                    <li>Emergency or crisis intervention services</li>
                  </ul>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">5.2 AI Limitations</h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    Our AI assistant is powered by machine learning and has significant limitations:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>It cannot diagnose or treat mental health conditions</li>
                    <li>It may provide inaccurate or inappropriate responses</li>
                    <li>It cannot understand the full context of your situation</li>
                    <li>It is not a replacement for human professional care</li>
                    <li>It may not recognize all crisis situations</li>
                  </ul>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">
                    5.3 No Therapeutic Relationship
                  </h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    Use of Anchor does not create a therapist-client, doctor-patient, or any other
                    healthcare provider relationship between you and us. The information and
                    interactions within the App should not be relied upon as professional mental
                    health advice.
                  </p>

                  <h3 className="mt-6 text-lg font-medium text-mist-white">
                    5.4 Seek Professional Help
                  </h3>
                  <p className="mt-3 leading-relaxed text-mist-white/70">
                    We strongly encourage all users to work with qualified mental health
                    professionals. If you are experiencing a mental health crisis, please contact
                    emergency services or a crisis hotline immediately.
                  </p>
                </section>

                <section id="acceptable-use" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">6. Acceptable Use</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    You agree NOT to use Anchor to:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Harass, abuse, or harm yourself or others</li>
                    <li>Share content that is illegal, harmful, threatening, or offensive</li>
                    <li>Impersonate any person or entity</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with or disrupt the Service</li>
                    <li>Use the AI to generate harmful, illegal, or inappropriate content</li>
                    <li>Circumvent any security measures or access restrictions</li>
                    <li>Use automated systems (bots, scrapers) without permission</li>
                  </ul>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    Violation of these rules may result in immediate termination of your account.
                  </p>
                </section>

                <section id="intellectual-property" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">
                    7. Intellectual Property
                  </h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    The Anchor app, including its design, features, content, logos, and code, is
                    owned by us and protected by intellectual property laws. You are granted a
                    limited, non-exclusive, non-transferable license to use the App for personal,
                    non-commercial purposes.
                  </p>
                  <p className="mt-4 leading-relaxed text-mist-white/70">You may not:</p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Copy, modify, or distribute the App or its content</li>
                    <li>Reverse engineer or decompile the App</li>
                    <li>Remove any copyright or proprietary notices</li>
                    <li>Use the Anchor name or logo without written permission</li>
                  </ul>
                </section>

                <section id="user-content" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">8. User Content</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    You retain ownership of content you create within the App (messages, voice
                    recordings). By using the Service, you grant us a limited license to process
                    this content solely to provide the Service (e.g., AI processing, transcription).
                  </p>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    We do not claim ownership of your content, and we do not use your personal
                    conversations to train AI models or for any purpose other than providing the
                    Service to you.
                  </p>
                </section>

                <section id="liability" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">
                    9. Limitation of Liability
                  </h2>

                  <div className="mt-4 rounded-xl border border-mist-white/20 bg-glass-bg p-4">
                    <p className="text-sm uppercase tracking-wider text-mist-white/60">
                      Legal Notice
                    </p>
                  </div>

                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>
                      THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY
                      KIND, EXPRESS OR IMPLIED.
                    </li>
                    <li>
                      WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A
                      PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                    </li>
                    <li>
                      WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
                      PUNITIVE DAMAGES.
                    </li>
                    <li>
                      OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12
                      MONTHS (OR $100 IF YOU HAVE NOT MADE ANY PAYMENTS).
                    </li>
                    <li>
                      WE ARE NOT LIABLE FOR ANY DECISIONS OR ACTIONS YOU TAKE BASED ON AI RESPONSES
                      OR APP CONTENT.
                    </li>
                  </ul>

                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    Some jurisdictions do not allow limitation of liability for certain damages. In
                    such cases, the above limitations may not apply to you to the extent prohibited
                    by law.
                  </p>
                </section>

                <section id="indemnification" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">10. Indemnification</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    You agree to indemnify and hold harmless Anchor, its affiliates, and their
                    respective officers, directors, employees, and agents from any claims, damages,
                    losses, liabilities, and expenses (including legal fees) arising from:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Your use of the Service</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any third-party rights</li>
                    <li>Any content you submit through the Service</li>
                  </ul>
                </section>

                <section id="termination" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">11. Termination</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    You may terminate your account at any time through the app settings. Upon
                    termination:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>Your access to the Service will be revoked</li>
                    <li>Your data will be deleted according to our Privacy Policy</li>
                    <li>Any licenses granted to you will terminate</li>
                  </ul>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    We may suspend or terminate your account at any time for violation of these
                    Terms or for any other reason at our sole discretion, with or without notice.
                  </p>
                </section>

                <section id="governing-law" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">12. Governing Law</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    These Terms shall be governed by and construed in accordance with the laws of
                    the jurisdiction in which our company is registered, without regard to conflict
                    of law principles.
                  </p>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    Any disputes arising from these Terms or your use of the Service shall be
                    resolved through binding arbitration, except where prohibited by law. You agree
                    to waive any right to participate in a class action lawsuit or class-wide
                    arbitration.
                  </p>
                </section>

                <section id="changes" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">13. Changes to Terms</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    We reserve the right to modify these Terms at any time. We will notify you of
                    material changes through:
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-6 text-mist-white/70">
                    <li>In-app notifications</li>
                    <li>Announcements on our website</li>
                    <li>Updates to the "Last Updated" date on this page</li>
                  </ul>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    Since we use anonymous authentication, we cannot contact you directly. We
                    encourage you to review these Terms periodically. Your continued use of the
                    Service after changes become effective constitutes acceptance of the revised
                    Terms.
                  </p>
                </section>

                <section id="contact" className="mt-10">
                  <h2 className="text-xl font-semibold text-mist-white">14. Contact Information</h2>
                  <p className="mt-4 leading-relaxed text-mist-white/70">
                    If you have questions about these Terms, please contact us:
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
                      <strong>Legal Inquiries:</strong>{' '}
                      <a
                        href={`mailto:${LEGAL_EMAIL}`}
                        className="text-biolum-cyan hover:underline"
                      >
                        {LEGAL_EMAIL}
                      </a>
                    </li>
                  </ul>
                </section>

                {/* Acknowledgment */}
                <section className="mt-12 rounded-xl border border-glass-border bg-glass-bg p-6">
                  <p className="text-center text-mist-white/70">
                    By using Anchor, you acknowledge that you have read, understood, and agree to be
                    bound by these Terms of Service and our{' '}
                    <Link to="/privacy" className="text-biolum-cyan hover:underline">
                      Privacy Policy
                    </Link>
                    .
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
