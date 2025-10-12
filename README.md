# AWR_Connect

A React Native application for real-time vehicle tracking and route visualization. This project provides turn-by-turn navigation, live ETA updates, and seamless fallback to mock routes for development and testing.

## Features

- 🚗 Real-time vehicle tracking with smooth animations
- 🗺️ Google Maps integration with custom route visualization
- 📍 Turn-by-turn navigation instructions
- ⏱️ Live ETA and distance calculations
- 🔄 Automatic fallback to mock routes for testing
- 📱 Cross-platform support (iOS & Android)
- 🎨 Customizable route styling with polylines
- 📊 Speed and street name display

## Tech Stack

- React Native
- TypeScript
- Google Maps (react-native-maps)
- React Native Vector Icons
- Mapbox Polyline Decoder

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Project Structure

```
AWR_Connect/
├── src/
│   ├── screens/           # Screen components
│   │   └── Dashboard/     # Main tracking screen
│   ├── services/         # API and business logic
│   ├── types/           # TypeScript definitions
│   ├── utils/           # Utility functions
│   └── config/          # Configuration files
├── ios/                 # iOS native code
├── android/            # Android native code
└── __tests__/         # Test files
```

## Features in Detail

### Route Tracking
- Real-time vehicle position updates with smooth animations
- Automatic route progress visualization
- Dynamic ETA calculations based on current speed and distance

### Map Features
- Custom styled route polylines
- Distinct start and end markers
- Animated vehicle position marker
- Optional traffic layer display

### Navigation
- Clear turn-by-turn instructions
- Current street name display
- Real-time speed information
- Accurate remaining distance updates

## Development

### Mock Route System
The application includes a sophisticated mock route system for development and testing:
- Predefined route through San Francisco
- Automatic fallback when API is unavailable
- Realistic speed variations and street names
- Turn-by-turn instructions included

### API Integration
The route service (`src/services/route.service.ts`) handles:
- Real route fetching from backend API
- Smooth fallback to mock data
- Route processing and optimization
- Distance and time calculations

# Troubleshooting

If you're having issues with the application, check these common solutions:

### Map Not Displaying
- Ensure you've added your Google Maps API key
- Check the Google Maps console for quota/billing status
- Verify the device/emulator has Google Play Services

### Route Not Updating
- Check network connectivity
- Verify API endpoint configuration
- Look for console warnings about fallback to mock route

For more general React Native issues, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Additional Resources

- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
