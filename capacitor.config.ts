import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.naman.pocketfinance',
  appName: 'Pocket Finance',
  webDir: 'out',
  backgroundColor: '#f3f4ef',
  server: { androidScheme: 'https' },
  plugins: {
    CapacitorSQLite: {
      androidIsEncryption: false,
    },
  },
  android: {
    backgroundColor: '#f3f4ef',
  },
};

export default config;
