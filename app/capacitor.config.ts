import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cx.franz.anxietybuddy',
  appName: 'Anchor',
  webDir: 'dist',
  // Uncomment for local development with live reload
  // server: {
  //   url: 'http://192.168.1.XXX:9000',
  //   cleartext: true,
  // },
  android: {
    path: './native/android',
    backgroundColor: '#0A1128',
  },
  ios: {
    path: './native/ios',
    backgroundColor: '#0A1128',
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#0A1128',
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
