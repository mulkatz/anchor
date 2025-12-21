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
  },
  ios: {
    path: './native/ios',
  },
};

export default config;
