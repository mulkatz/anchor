import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { AppStoreBadges } from '@/components/ui/AppStoreBadges';
import { GlowOrb } from '@/components/effects/GlowOrb';
import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/constants';

type Platform = 'ios' | 'android' | 'web';

/**
 * Invite/Download page
 * Auto-redirects mobile users to the appropriate app store
 * Shows download options for desktop users
 */
export function InvitePage() {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<Platform>('web');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;

    // Detect platform
    let detectedPlatform: Platform = 'web';
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      detectedPlatform = 'ios';
    } else if (/android/i.test(userAgent)) {
      detectedPlatform = 'android';
    }

    setPlatform(detectedPlatform);

    // Auto-redirect on mobile
    if (detectedPlatform !== 'web') {
      setRedirecting(true);
      const url = detectedPlatform === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;

      setTimeout(() => {
        window.location.href = url;
      }, 1500);
    }
  }, []);

  const viscousEase = [0.22, 1, 0.36, 1] as const;
  const storeName = platform === 'ios' ? t('invite.appStore') : t('invite.playStore');

  // Redirecting state for mobile users
  if (redirecting) {
    return (
      <>
        <SEO
          title={t('meta.inviteTitle')}
          description={t('meta.inviteDescription')}
          url="https://getanchor.app/invite"
          noindex
        />
        <PageWrapper showFooter={false}>
          <div className="flex min-h-screen items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: viscousEase }}
              className="text-center"
            >
              {/* Pulsing Glow Orb */}
              <motion.div
                className="mx-auto mb-8"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <GlowOrb size="lg" />
              </motion.div>

              {/* App Name */}
              <h1 className="text-3xl font-bold text-mist-white">{t('invite.heading')}</h1>
              <p className="mt-2 text-lg text-biolum-cyan">{t('invite.tagline')}</p>

              {/* Loading Spinner */}
              <motion.div
                className="mt-8 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Loader2 className="h-8 w-8 animate-spin text-biolum-cyan" />
              </motion.div>

              {/* Redirecting Text */}
              <motion.p
                className="mt-4 text-mist-white/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {t('invite.redirecting', { store: storeName })}
              </motion.p>

              {/* Manual Link */}
              <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <a
                  href={platform === 'ios' ? APP_STORE_URL : PLAY_STORE_URL}
                  className="text-sm text-mist-white/50 underline transition-colors hover:text-mist-white/70"
                >
                  {t('invite.manualLink')}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </PageWrapper>
      </>
    );
  }

  // Desktop/Web view with download options
  return (
    <>
      <SEO
        title={t('meta.inviteTitle')}
        description={t('meta.inviteDescription')}
        url="https://getanchor.app/invite"
        noindex
      />
      <PageWrapper showFooter={false}>
        <div className="flex min-h-screen items-center justify-center px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: viscousEase }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 text-center">
              {/* Glow Orb */}
              <div className="mx-auto mb-6 flex justify-center">
                <GlowOrb size="md" />
              </div>

              {/* App Name */}
              <h1 className="text-3xl font-bold text-mist-white">{t('invite.heading')}</h1>
              <p className="mt-2 text-biolum-cyan">{t('invite.tagline')}</p>

              {/* Description */}
              <p className="mt-6 text-mist-white/70">
                {t('invite.description')}
                <br />
                {t('invite.subDescription')}
              </p>

              {/* App Store Badges */}
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: viscousEase }}
              >
                <AppStoreBadges layout="vertical" size="lg" className="justify-center" />
              </motion.div>

              {/* Divider */}
              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-glass-border" />
                <span className="text-xs text-mist-white/40">{t('invite.or')}</span>
                <div className="h-px flex-1 bg-glass-border" />
              </div>

              {/* Back to Website */}
              <Link to="/">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  {t('invite.visitWebsite')}
                </Button>
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </PageWrapper>
    </>
  );
}
