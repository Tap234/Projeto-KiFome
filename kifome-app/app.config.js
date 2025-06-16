module.exports = {
  expo: {
    name: 'KiFome',
    slug: 'kifome-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'kifome',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.kifome.app'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.kifome.app'
    },
    web: {
      bundler: 'metro',
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router'
    ],
    extra: {
      // Substitua este valor pelo seu token real do Wit.ai
      witToken: process.env.WIT_TOKEN || 'YOUR_WIT_TOKEN_HERE',
    }
  }
}; 